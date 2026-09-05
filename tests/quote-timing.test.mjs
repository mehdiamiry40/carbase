import assert from "node:assert/strict";
import test from "node:test";
import { createQuotePostHandler } from "../src/lib/quoteHandler.mjs";
import { createQuoteOutboxRecord } from "../src/lib/quoteOutbox.mjs";
import { createQuoteOutboxProcessor } from "../src/lib/quoteRecovery.mjs";
import { createQuoteAttempt, createQuoteDeadline, saveQuoteAttemptOutcome } from "../src/lib/quoteTiming.mjs";
import { NOW, OTHER_SUBMISSION_ID, SUBMISSION_ID, createMemoryQuoteStore, createVirtualQuoteClock, quoteRequest } from "./helpers/quote-harness.mjs";

const quiet = { error() {}, warn() {} };
const accepted = { status: "accepted", providerMessageId: "synthetic-email-id" };
const rejected = { status: "rejected", reason: "provider_rejected" };

function handler(clock, store, mailer, options = {}) {
  return createQuotePostHandler({
    rateLimiter: { async consume() { return { allowed: true }; } },
    normalizePhotos: async () => [],
    store, mailer,
    now: clock.now,
    clockMs: clock.clockMs,
    providerTimeout: clock.providerTimeout,
    logger: quiet,
    ...options,
  });
}

function processor(clock, store, mailer, options = {}) {
  return createQuoteOutboxProcessor({
    store, mailer, mode: "live",
    now: clock.now,
    clockMs: clock.clockMs,
    providerTimeout: clock.providerTimeout,
    logger: quiet,
    ...options,
  });
}

function delayStore(store, clock, delays) {
  for (const [name, duration] of Object.entries(delays)) {
    const original = store[name];
    store[name] = async (...args) => {
      const ms = typeof duration === "function" ? duration(...args) : duration;
      if (ms) await clock.delay(ms);
      const signal = args.at(-1);
      if (signal instanceof AbortSignal) signal.throwIfAborted();
      return original(...args);
    };
  }
}

async function seed(store, overrides = {}) {
  return (await store.create({
    ...createQuoteOutboxRecord({
      lead: { make: "Synthetic", model: "Fixture", year: "2015" },
      photos: [], submissionId: SUBMISSION_ID,
      receivedAt: new Date(NOW.getTime() - 86_400_000),
    }),
    ...overrides,
  })).stored;
}

test("the former 55.3-second provider timeline stops at durable staging before sending", async () => {
  const clock = createVirtualQuoteClock();
  const store = createMemoryQuoteStore();
  delayStore(store, clock, { readReceipt: 7_900, create: 7_900, update: 7_900, writeReceipt: 7_900, remove: 7_900 });
  let sends = 0;
  const response = await clock.run(handler(clock, store, {
    async send() { sends += 1; await clock.delay(7_900); return accepted; },
  })(quoteRequest()));

  assert.equal(7 * 7_900, 55_300); // The original six Blob calls plus one email.
  assert.equal(clock.clockMs(), 15_800);
  assert.equal(response.status, 202);
  assert.equal((await response.json()).safelyStored, true);
  assert.equal(store.outbox.get(SUBMISSION_ID).record.state, "staged");
  assert.equal(sends, 0);
});

test("rate limiting and photo work consume the same deadline as staging", async () => {
  const clock = createVirtualQuoteClock();
  const store = createMemoryQuoteStore();
  delayStore(store, clock, { readReceipt: 7_900, create: 7_900 });
  let sends = 0;
  const response = await clock.run(handler(clock, store, { async send() { sends += 1; } }, {
    rateLimiter: { async consume() { await clock.delay(7_900); return { allowed: true }; } },
    normalizePhotos: async () => { await clock.delay(7_900); return []; },
  })(quoteRequest()));

  assert.equal(clock.clockMs(), 28_000);
  assert.equal(response.status, 503);
  assert.equal((await response.json()).ok, false);
  assert.equal(store.outbox.size, 0);
  assert.equal(sends, 0);
});

test("an unfinished request body times out before provider work", async () => {
  const clock = createVirtualQuoteClock();
  const store = createMemoryQuoteStore();
  const request = new Request("https://carbase.au/api/quote", {
    method: "POST", duplex: "half",
    headers: { "content-type": "multipart/form-data; boundary=fixture" },
    body: new ReadableStream({ start() {} }),
  });
  const response = await clock.run(handler(clock, store, null)(request));
  assert.equal(response.status, 503);
  assert.equal(clock.clockMs(), 8_000);
  assert.equal(store.outbox.size, 0);
});

test("the result write is reserved, and slow accepted cleanup is deferred within 28 seconds", async () => {
  const clock = createVirtualQuoteClock();
  const store = createMemoryQuoteStore();
  const writeReceipt = store.writeReceipt;
  delayStore(store, clock, { readReceipt: 1_000, create: 1_000, update: 7_900, writeReceipt: 7_900 });
  let attempt;
  let sends = 0;
  const mailer = { async send(record) {
    sends += 1;
    attempt = structuredClone(record);
    await clock.delay(7_900);
    return accepted;
  } };
  const response = await clock.run(handler(clock, store, mailer)(quoteRequest()));
  assert.equal(response.status, 200);
  assert.equal(clock.clockMs(), 28_000);
  assert.equal(Date.parse(attempt.leaseExpiresAt) - NOW.getTime(), 26_250);
  const retained = store.outbox.get(SUBMISSION_ID).record;
  assert.equal(retained.state, "accepted_cleanup_pending");
  assert.equal(Date.parse(retained.lastTransitionAt) - NOW.getTime(), 17_800);
  store.writeReceipt = writeReceipt;
  await clock.run(processor(clock, store, mailer)());
  assert.equal(store.outbox.size, 0);
  assert.equal(store.receipts.size, 1);
  assert.equal(sends, 1);
});

for (const outcome of [accepted, rejected]) {
  test(`slow staging defers ${outcome.status} delivery to live recovery without an expired POST claim`, async () => {
    const clock = createVirtualQuoteClock();
    const store = createMemoryQuoteStore();
    delayStore(store, clock, { readReceipt: 5_500, create: 5_500 });
    let sends = 0;
    const mailer = { async send() { sends += 1; return outcome; } };
    const response = await clock.run(handler(clock, store, mailer)(quoteRequest()));
    assert.equal(response.status, 202);
    assert.equal(clock.clockMs(), 11_000);
    assert.equal(sends, 0);
    await clock.run(processor(clock, store, mailer, { mode: "observe" })());
    assert.equal(store.outbox.get(SUBMISSION_ID).record.state, "staged");
    clock.advance(15 * 60 * 1_000);
    await clock.run(processor(clock, store, mailer)());
    assert.equal(sends, 1);
    assert.equal(store.outbox.get(SUBMISSION_ID)?.record.state ?? "removed",
      outcome.status === "accepted" ? "removed" : "delivery_rejected");
  });

  test(`a slow POST claim plus overlapping cron preserves its ${outcome.status} result`, async () => {
    const clock = createVirtualQuoteClock();
    const store = createMemoryQuoteStore();
    delayStore(store, clock, { readReceipt: 1_000, create: 1_000, update: (_stored, patch) => patch.state === "sending" ? 5_500 : 0 });
    let sends = 0;
    const mailer = { async send(record) {
      sends += 1;
      assert.equal(clock.clockMs(), 7_500);
      await clock.delay(5_500);
      assert.ok(Date.parse(record.leaseExpiresAt) > clock.now().getTime());
      const overlap = await processor(clock, store, null, { mode: "observe" })();
      assert.equal(overlap.retained, 1);
      assert.equal(store.outbox.get(SUBMISSION_ID).record.state, "sending");
      return outcome;
    } };
    const response = await clock.run(handler(clock, store, mailer)(quoteRequest()));
    assert.equal(sends, 1);
    assert.equal(response.status, outcome.status === "accepted" ? 200 : 202);
    assert.equal(store.outbox.get(SUBMISSION_ID)?.record.state ?? "removed",
      outcome.status === "accepted" ? "removed" : "delivery_rejected");
  });

  test(`a slow recovery claim survives overlapping cron until its ${outcome.status} result is saved`, async () => {
    const clock = createVirtualQuoteClock();
    const store = createMemoryQuoteStore();
    await seed(store, { state: "delivery_rejected", attemptCount: 1 });
    delayStore(store, clock, { update: (_stored, patch) => patch.state === "sending" ? 7_900 : 0 });
    let sends = 0;
    const mailer = { async send(record) {
      sends += 1;
      await clock.delay(7_900);
      assert.ok(Date.parse(record.leaseExpiresAt) > clock.now().getTime());
      await processor(clock, store, null, { mode: "observe" })();
      assert.equal(store.outbox.get(SUBMISSION_ID).record.state, "sending");
      return outcome;
    } };
    await clock.run(processor(clock, store, mailer)());
    assert.equal(sends, 1);
    assert.equal(store.outbox.get(SUBMISSION_ID)?.record.state ?? "removed",
      outcome.status === "accepted" ? "removed" : "delivery_rejected");
  });

  test(`a late definite ${outcome.status} outcome reconciles only its own cron-expired attempt`, async () => {
    const clock = createVirtualQuoteClock();
    const store = createMemoryQuoteStore();
    let sending = await seed(store);
    sending = await store.update(sending, createQuoteAttempt(sending, clock.now()), clock.now());
    clock.advance(24_251);
    await clock.run(processor(clock, store, null, { mode: "observe" })());
    assert.equal(store.outbox.get(SUBMISSION_ID).record.lastOutcome, "lease_expired");
    const budget = createQuoteDeadline({ clockMs: clock.clockMs, maxRunMs: 29_000, providerTimeout: clock.providerTimeout });
    const patch = {
      state: outcome.status === "accepted" ? "accepted_cleanup_pending" : "delivery_rejected",
      lastOutcome: outcome.status,
      leaseExpiresAt: null,
    };
    const saved = await clock.run(saveQuoteAttemptOutcome({ store, stored: sending, patch, now: clock.now, bounded: budget.bounded }));
    assert.equal(saved.record.state, patch.state);
    assert.notEqual(saved.etag, sending.etag);
  });

  test(`POST saves a definite ${outcome.status} result after an overlapping cron expires its lease`, async () => {
    const clock = createVirtualQuoteClock();
    const store = createMemoryQuoteStore();
    let sends = 0;
    const mailer = { async send() {
      sends += 1;
      // Model clock skew/late result handling without bypassing request timers.
      // Cron's wall clock expires this same attempt while POST still has budget.
      await processor(clock, store, null, {
        mode: "observe", now: () => new Date(clock.now().getTime() + 30_000),
      })();
      assert.equal(store.outbox.get(SUBMISSION_ID).record.lastOutcome, "lease_expired");
      return outcome;
    } };
    const response = await clock.run(handler(clock, store, mailer)(quoteRequest()));
    assert.equal(sends, 1);
    assert.equal(response.status, outcome.status === "accepted" ? 200 : 202);
    assert.equal(store.outbox.get(SUBMISSION_ID)?.record.state ?? "removed",
      outcome.status === "accepted" ? "removed" : "delivery_rejected");
    if (outcome.status === "accepted") {
      const replay = await clock.run(handler(clock, store, mailer)(quoteRequest()));
      assert.equal(replay.status, 200);
      assert.equal(sends, 1);
    }
  });
}

test("recovery leaves a retryable record unclaimed when the full send/result window does not fit", async () => {
  const clock = createVirtualQuoteClock();
  const store = createMemoryQuoteStore();
  await seed(store, { state: "delivery_rejected", attemptCount: 1 });
  let sends = 0;
  const result = await clock.run(processor(clock, store, { async send() { sends += 1; } }, { maxRunMs: 20_000 })());
  assert.equal(result.retained, 1);
  assert.equal(sends, 0);
  assert.equal(store.outbox.get(SUBMISSION_ID).record.state, "delivery_rejected");
});

for (const source of ["POST", "worker"]) {
  test(`${source} keeps a known-not-started send retryable after claim continuation consumes its budget`, async () => {
    const clock = createVirtualQuoteClock();
    const store = createMemoryQuoteStore();
    if (source === "worker") {
      await seed(store, { state: "delivery_rejected", attemptCount: 1 });
    }
    let sends = 0;
    const mailer = { async send() { sends += 1; return accepted; } };
    let delayedClaim = false;
    const providerTimeout = async (operation, timeoutMs) => {
      const result = await clock.providerTimeout(operation, timeoutMs);
      if (!delayedClaim && result?.record?.state === "sending") {
        delayedClaim = true;
        // The claim has completed and its timer is cleared. Model a delayed
        // continuation before the caller can check the remaining send budget.
        clock.advance(source === "POST" ? 12_000 : 23_000);
      }
      return result;
    };
    if (source === "POST") {
      const response = await clock.run(handler(clock, store, mailer, { providerTimeout })(quoteRequest()));
      assert.equal(response.status, 202);
      assert.equal((await response.json()).safelyStored, true);
    } else {
      const result = await clock.run(processor(clock, store, mailer, { providerTimeout })());
      assert.equal(result.failed, 0);
      assert.equal(result.retained, 1);
    }
    assert.equal(delayedClaim, true);
    assert.equal(sends, 0);
    const pending = store.outbox.get(SUBMISSION_ID).record;
    assert.equal(pending.state, "delivery_unavailable");
    assert.equal(pending.lastOutcome, "request_budget");
    assert.equal(pending.leaseExpiresAt, null);

    clock.advance(Date.parse(pending.nextAttemptAt) - clock.now().getTime());
    const recovered = await clock.run(processor(clock, store, mailer)());
    assert.equal(recovered.accepted, 1);
    assert.equal(recovered.failed, 0);
    assert.equal(sends, 1);
    assert.equal(store.outbox.size, 0);
    assert.equal(store.receipts.size, 1);
  });
}

test("late result reconciliation cannot overwrite another attempt, changed payload or manual decision", async () => {
  for (const changed of [
    { attemptId: OTHER_SUBMISSION_ID },
    { payloadDigest: "changed" },
    { attemptCount: 999 },
    { state: "dead_letter", lastOutcome: "max_attempts" },
    { state: "delivery_unknown", lastOutcome: "provider_timeout" },
  ]) {
    const clock = createVirtualQuoteClock();
    const store = createMemoryQuoteStore();
    let sending = await seed(store);
    sending = await store.update(sending, createQuoteAttempt(sending, clock.now()), clock.now());
    const current = await store.update(sending, { state: "delivery_unknown", lastOutcome: "lease_expired", ...changed }, clock.now());
    const budget = createQuoteDeadline({ clockMs: clock.clockMs, maxRunMs: 29_000, providerTimeout: clock.providerTimeout });
    await assert.rejects(clock.run(saveQuoteAttemptOutcome({
      store, stored: sending, now: clock.now, bounded: budget.bounded,
      patch: { state: "accepted_cleanup_pending", lastOutcome: "accepted" },
    })));
    assert.equal(store.outbox.get(SUBMISSION_ID).etag, current.etag);
  }
});

test("a timed-out send retains ambiguity and a late provider response never triggers another send", async () => {
  const clock = createVirtualQuoteClock();
  const store = createMemoryQuoteStore();
  let signal;
  let sends = 0;
  const mailer = { async send(_record, options) {
    sends += 1;
    signal = options.signal;
    await clock.delay(9_000);
    return accepted;
  } };
  const response = await clock.run(handler(clock, store, mailer)(quoteRequest()));
  assert.equal(response.status, 202);
  assert.equal(signal.aborted, true);
  assert.equal(store.outbox.get(SUBMISSION_ID).record.state, "delivery_unknown");
  clock.advance(20 * 60 * 1_000);
  await clock.run(processor(clock, store, mailer)());
  assert.equal(sends, 1);
  assert.equal(store.outbox.get(SUBMISSION_ID).record.state, "delivery_unknown");
});
