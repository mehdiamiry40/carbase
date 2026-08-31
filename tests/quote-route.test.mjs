import assert from "node:assert/strict";
import test from "node:test";
import {
  OTHER_SUBMISSION_ID,
  SUBMISSION_ID,
  createMemoryQuoteStore,
  createQuoteHarness,
  quoteRequest,
} from "./helpers/quote-harness.mjs";

async function body(response) {
  return response.json();
}

test("rate limiting stops parsing and every provider side effect", async () => {
  const { calls, handler } = createQuoteHarness({
    limitResult: {
      allowed: false,
      rateLimited: true,
      retryAfter: 600,
      mode: "enforce",
    },
  });
  const response = await handler(quoteRequest());

  assert.equal(response.status, 429);
  assert.equal(response.headers.get("retry-after"), "600");
  assert.deepEqual(calls, ["rate.consume"]);
});

test("invalid submission IDs fail before image and provider work", async () => {
  const { calls, handler } = createQuoteHarness();
  const response = await handler(quoteRequest({ submissionId: "not-a-uuid" }));

  assert.equal(response.status, 400);
  assert.deepEqual(await body(response), {
    ok: false,
    error: "Invalid quote submission ID.",
  });
  assert.deepEqual(calls, ["rate.consume"]);
});

test("legacy callers with the six required fields receive a server identity", async () => {
  const { calls, handler } = createQuoteHarness();
  const response = await handler(quoteRequest({ includeSubmissionId: false }));

  assert.equal(response.status, 200);
  assert.ok(calls.includes(`mailer.send:${OTHER_SUBMISSION_ID}`));
});

test("honeypot remains a decoy and performs no durable or email work", async () => {
  const { calls, handler } = createQuoteHarness();
  const response = await handler(quoteRequest({ website: "bot" }));

  assert.equal(response.status, 200);
  assert.deepEqual(await body(response), { ok: true });
  assert.deepEqual(calls, ["rate.consume"]);
});

test("more than five photos is rejected instead of silently truncated", async () => {
  const photos = Array.from(
    { length: 6 },
    (_, index) => new File([Buffer.from([index])], `photo-${index}.jpg`, { type: "image/jpeg" }),
  );
  const { calls, handler } = createQuoteHarness();
  const response = await handler(quoteRequest({ photos }));

  assert.equal(response.status, 400);
  assert.match((await body(response)).error, /no more than 5 photos/i);
  assert.deepEqual(calls, ["rate.consume"]);
});

test("aggregate raw photo bytes are rejected before image decoding", async () => {
  const photos = Array.from(
    { length: 5 },
    (_, index) =>
      new File([Buffer.alloc(900_000)], `photo-${index}.jpg`, {
        type: "image/jpeg",
      }),
  );
  const { calls, handler } = createQuoteHarness();
  const response = await handler(quoteRequest({ photos }));

  assert.equal(response.status, 413);
  assert.equal(calls.some((entry) => entry.startsWith("images.normalize")), false);
});

test("undeclared oversized multipart fields are rejected by the streamed byte cap", async () => {
  const { calls, handler } = createQuoteHarness();
  const response = await handler(
    quoteRequest({ overrides: { ignored: "x".repeat(4_200_001) } }),
  );

  assert.equal(response.status, 413);
  assert.deepEqual(calls, ["rate.consume"]);
});

test("missing mandatory outbox fails closed before mail delivery", async () => {
  const { calls, handler } = createQuoteHarness({ store: null });
  const response = await handler(quoteRequest());

  assert.equal(response.status, 503);
  assert.equal((await body(response)).ok, false);
  assert.deepEqual(calls, ["rate.consume", "images.normalize:0"]);
});

test("failed mandatory stage returns 503 and never calls the mailer", async () => {
  const calls = [];
  const store = createMemoryQuoteStore(calls);
  store.create = async () => {
    calls.push("outbox.create:failed");
    throw new Error("blob unavailable");
  };
  const { handler } = createQuoteHarness({ store });
  const response = await handler(quoteRequest());

  assert.equal(response.status, 503);
  assert.equal(calls.some((entry) => entry.startsWith("mailer.send")), false);
});

test("outbox staging is confirmed before Resend and accepted payload is removed", async () => {
  const { calls, handler, store } = createQuoteHarness();
  const response = await handler(quoteRequest());

  assert.equal(response.status, 200);
  assert.deepEqual(await body(response), { ok: true, delivered: true });
  assert.ok(
    calls.indexOf(`outbox.create:${SUBMISSION_ID}`) <
      calls.indexOf(`mailer.send:${SUBMISSION_ID}`),
  );
  assert.deepEqual(calls.slice(-2), [
    `receipt.write:${SUBMISSION_ID}`,
    `outbox.remove:${SUBMISSION_ID}`,
  ]);
  assert.equal(store.outbox.has(SUBMISSION_ID), false);
  assert.equal(store.receipts.has(SUBMISSION_ID), true);
});

test("provider rejection is durably retained and returns safely stored", async () => {
  const { handler, store } = createQuoteHarness({
    mailOutcome: { status: "rejected" },
  });
  const response = await handler(quoteRequest());

  assert.equal(response.status, 202);
  assert.deepEqual(await body(response), {
    ok: true,
    delivered: false,
    safelyStored: true,
    message: "Your quote request was safely received and will be reviewed.",
  });
  assert.equal(store.outbox.get(SUBMISSION_ID).record.state, "delivery_rejected");
});

test("unknown provider result is retained without deletion", async () => {
  const { calls, handler, store } = createQuoteHarness({
    mailOutcome: new Error("network ambiguity"),
  });
  const response = await handler(quoteRequest());

  assert.equal(response.status, 202);
  assert.equal(store.outbox.get(SUBMISSION_ID).record.state, "delivery_unknown");
  assert.equal(calls.some((entry) => entry.startsWith("outbox.remove")), false);
});

test("same submission and payload reuses the non-PII receipt without another send", async () => {
  const harness = createQuoteHarness();
  assert.equal((await harness.handler(quoteRequest())).status, 200);
  assert.equal((await harness.handler(quoteRequest())).status, 200);

  assert.equal(
    harness.calls.filter((entry) => entry === `mailer.send:${SUBMISSION_ID}`).length,
    1,
  );
});

test("same submission ID with different payload is rejected without another send", async () => {
  const harness = createQuoteHarness();
  assert.equal((await harness.handler(quoteRequest())).status, 200);
  const response = await harness.handler(
    quoteRequest({ overrides: { model: "Different" } }),
  );

  assert.equal(response.status, 409);
  assert.equal(
    harness.calls.filter((entry) => entry === `mailer.send:${SUBMISSION_ID}`).length,
    1,
  );
});

test("different logical submissions use distinct durable identities", async () => {
  const harness = createQuoteHarness();
  assert.equal((await harness.handler(quoteRequest())).status, 200);
  assert.equal(
    (await harness.handler(quoteRequest({ submissionId: OTHER_SUBMISSION_ID }))).status,
    200,
  );
  assert.equal(
    harness.calls.filter((entry) => entry.startsWith("mailer.send:")).length,
    2,
  );
});
