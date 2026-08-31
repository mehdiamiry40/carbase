import assert from "node:assert/strict";
import test from "node:test";
import { isAuthorizedCronRequest } from "../src/lib/cronAuth.mjs";
import {
  createQuoteOutboxRecord,
  createQuoteReceipt,
} from "../src/lib/quoteOutbox.mjs";
import { createQuoteOutboxProcessor } from "../src/lib/quoteRecovery.mjs";
import {
  NOW,
  SUBMISSION_ID,
  createMemoryQuoteStore,
} from "./helpers/quote-harness.mjs";

function record(overrides = {}) {
  return {
    ...createQuoteOutboxRecord({
      lead: { make: "Toyota", model: "Corolla", year: "2015" },
      photos: [],
      submissionId: SUBMISSION_ID,
      receivedAt: new Date("2026-08-30T00:00:00.000Z"),
      retentionDays: 30,
    }),
    ...overrides,
  };
}

async function stage(store, value) {
  return (await store.create(value)).stored;
}

function processor(options) {
  return createQuoteOutboxProcessor({
    batchSize: 5,
    maxRunMs: 40_000,
    clockMs: () => NOW.getTime(),
    now: () => new Date(NOW),
    providerTimeout: (operation) => operation(new AbortController().signal),
    logger: { error() {}, warn() {} },
    ...options,
  });
}

function submissionId(index) {
  return `${index.toString(16).padStart(8, "0")}-1111-4111-8111-${index
    .toString(16)
    .padStart(12, "0")}`;
}

test("cron authentication fails closed and uses an exact bearer value", () => {
  assert.equal(
    isAuthorizedCronRequest(
      new Request("https://carbase.au/api/cron/quote-outbox", {
        headers: { authorization: "Bearer correct" },
      }),
      "correct",
    ),
    true,
  );
  assert.equal(
    isAuthorizedCronRequest(
      new Request("https://carbase.au/api/cron/quote-outbox", {
        headers: { authorization: "Bearer wrong" },
      }),
      "correct",
    ),
    false,
  );
  assert.equal(
    isAuthorizedCronRequest(
      new Request("https://carbase.au/api/cron/quote-outbox"),
      undefined,
    ),
    false,
  );
});

test("observe mode leaves retryable records untouched", async () => {
  const calls = [];
  const store = createMemoryQuoteStore(calls);
  await stage(
    store,
    record({
      state: "delivery_rejected",
      attemptCount: 1,
      nextAttemptAt: "2026-08-31T01:00:00.000Z",
    }),
  );
  let sent = 0;
  const result = await processor({
    store,
    mode: "observe",
    mailer: { async send() { sent += 1; } },
  })();

  assert.equal(sent, 0);
  assert.equal(result.observed, 1);
  assert.equal(store.outbox.has(SUBMISSION_ID), true);
});

test("live recovery reuses the submission and cleans accepted payload", async () => {
  const calls = [];
  const store = createMemoryQuoteStore(calls);
  await stage(
    store,
    record({
      state: "delivery_rejected",
      attemptCount: 1,
      nextAttemptAt: "2026-08-31T01:00:00.000Z",
    }),
  );
  const sent = [];
  const result = await processor({
    store,
    mode: "live",
    mailer: {
      async send(value) {
        sent.push(value.submissionId);
        return { status: "accepted", providerMessageId: "email_123" };
      },
    },
  })();

  assert.deepEqual(sent, [SUBMISSION_ID]);
  assert.equal(result.accepted, 1);
  assert.equal(store.outbox.has(SUBMISSION_ID), false);
  assert.equal(store.receipts.has(SUBMISSION_ID), true);
});

test("ambiguous delivery is never automatically resent", async () => {
  const store = createMemoryQuoteStore([]);
  await stage(store, record({ state: "delivery_unknown", nextAttemptAt: null }));
  let sent = 0;
  const result = await processor({
    store,
    mode: "live",
    mailer: { async send() { sent += 1; } },
  })();

  assert.equal(sent, 0);
  assert.equal(result.retained, 1);
  assert.equal(store.outbox.has(SUBMISSION_ID), true);
});

test("expired private payload is conditionally deleted", async () => {
  const calls = [];
  const store = createMemoryQuoteStore(calls);
  await stage(
    store,
    record({
      state: "dead_letter",
      expiresAt: "2026-08-31T01:00:00.000Z",
    }),
  );
  const result = await processor({
    store,
    mode: "observe",
    retentionMode: "delete",
    mailer: null,
  })();

  assert.equal(result.deleted, 1);
  assert.equal(store.outbox.has(SUBMISSION_ID), false);
  assert.ok(calls.includes(`outbox.remove:${SUBMISSION_ID}`));
});

test("accepted cleanup record is never resent and is removed", async () => {
  const store = createMemoryQuoteStore([]);
  await stage(
    store,
    record({
      state: "accepted_cleanup_pending",
      providerMessageId: "email_123",
    }),
  );
  let sent = 0;
  const result = await processor({
    store,
    mode: "live",
    mailer: { async send() { sent += 1; } },
  })();

  assert.equal(sent, 0);
  assert.equal(result.deleted, 1);
  assert.equal(store.outbox.has(SUBMISSION_ID), false);
  assert.equal(store.receipts.has(SUBMISSION_ID), true);
});

test("persistent cursors prevent manual-review records from starving later work", async () => {
  const store = createMemoryQuoteStore([]);
  for (let index = 1; index <= 3; index += 1) {
    await stage(
      store,
      record({ submissionId: submissionId(index), state: "delivery_unknown" }),
    );
  }
  const recoverableId = submissionId(4);
  await stage(
    store,
    record({
      submissionId: recoverableId,
      state: "delivery_rejected",
      attemptCount: 1,
      nextAttemptAt: "2026-08-31T01:00:00.000Z",
    }),
  );

  const sent = [];
  const run = processor({
    store,
    mode: "live",
    batchSize: 1,
    maxScanRecords: 2,
    mailer: {
      async send(value) {
        sent.push(value.submissionId);
        return { status: "accepted", providerMessageId: "email_123" };
      },
    },
  });

  await run();
  await run();
  assert.deepEqual(sent, [recoverableId]);
});

test("receipt cleanup paginates past newer receipts", async () => {
  const store = createMemoryQuoteStore([]);
  for (let index = 1; index <= 3; index += 1) {
    const value = record({ submissionId: submissionId(index) });
    await store.writeReceipt(
      createQuoteReceipt({
        record: value,
        providerMessageId: `email_${index}`,
        deliveredAt: new Date(NOW),
      }),
    );
  }
  const expiredId = submissionId(4);
  await store.writeReceipt(
    createQuoteReceipt({
      record: record({ submissionId: expiredId }),
      providerMessageId: "email_expired",
      deliveredAt: new Date("2026-08-20T00:00:00.000Z"),
    }),
  );

  const run = processor({
    store,
    batchSize: 1,
    maxReceiptScanRecords: 2,
  });
  await run();
  await run();
  assert.equal(store.receipts.has(expiredId), false);
});

test("provider list failures are contained without exposing provider errors", async () => {
  const sentinel = "SECRET_PROVIDER_SENTINEL";
  const logs = [];
  const store = createMemoryQuoteStore([]);
  store.listOutbox = async () => {
    throw new Error(sentinel);
  };
  const result = await createQuoteOutboxProcessor({
    store,
    now: () => new Date(NOW),
    clockMs: () => NOW.getTime(),
    providerTimeout: (operation) => operation(new AbortController().signal),
    logger: {
      error(value) {
        logs.push(value);
      },
      warn(value) {
        logs.push(value);
      },
    },
  })();

  assert.equal(result.failed >= 1, true);
  assert.equal(logs.join("\n").includes(sentinel), false);
});

test("the worker caps each operation to its remaining soft-run budget", async () => {
  let elapsed = 0;
  const requestedTimeouts = [];
  const store = createMemoryQuoteStore([]);
  await createQuoteOutboxProcessor({
    store,
    maxRunMs: 1_000,
    clockMs: () => elapsed,
    now: () => new Date(NOW),
    providerTimeout: async (operation, timeoutMs) => {
      requestedTimeouts.push(timeoutMs);
      assert.ok(timeoutMs <= 1_000 - elapsed);
      elapsed += 200;
      return operation(new AbortController().signal);
    },
    logger: { error() {}, warn() {} },
  })();

  assert.ok(requestedTimeouts.length > 0);
  assert.ok(elapsed <= 1_000);
});
