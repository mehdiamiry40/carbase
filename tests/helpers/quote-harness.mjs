import { createQuotePostHandler } from "../../src/lib/quoteHandler.mjs";
import { ProviderTimeoutError } from "../../src/lib/quoteBackup.mjs";

export const SUBMISSION_ID = "11111111-1111-4111-8111-111111111111";
export const OTHER_SUBMISSION_ID = "22222222-2222-4222-8222-222222222222";
export const NOW = new Date("2026-08-31T02:00:00.000Z");

// Unlike the simple route harness, this clock actually expires operations and
// aborts their signals. Long provider timelines run without wall-clock sleeps.
export function createVirtualQuoteClock() {
  let elapsed = 0;
  const timers = new Set();
  const schedule = (callback, delay) => {
    const timer = { at: elapsed + delay, callback };
    timers.add(timer);
    return timer;
  };
  const advance = (duration) => {
    const target = elapsed + duration;
    while (true) {
      const next = [...timers].sort((left, right) => left.at - right.at)[0];
      if (!next || next.at > target) break;
      elapsed = next.at;
      timers.delete(next);
      next.callback();
    }
    elapsed = target;
  };
  const clock = {
    clockMs: () => elapsed,
    now: () => new Date(NOW.getTime() + elapsed),
    advance,
    delay: (duration) => new Promise((resolve) => schedule(resolve, duration)),
    async providerTimeout(operation, timeoutMs) {
      const controller = new AbortController();
      let timer;
      const expired = new Promise((_, reject) => {
        timer = schedule(() => {
          controller.abort();
          reject(new ProviderTimeoutError());
        }, timeoutMs);
      });
      try {
        return await Promise.race([operation(controller.signal), expired]);
      } finally {
        timers.delete(timer);
      }
    },
    async run(promise) {
      let settled = false;
      promise.finally(() => { settled = true; }).catch(() => {});
      for (let step = 0; step < 1_000 && !settled; step += 1) {
        await new Promise((resolve) => setImmediate(resolve));
        if (settled) break;
        const next = [...timers].sort((left, right) => left.at - right.at)[0];
        if (!next) throw new Error("Virtual quote operation is gated without a timer.");
        advance(next.at - elapsed);
      }
      if (!settled) throw new Error("Virtual quote operation did not settle.");
      return promise;
    },
  };
  return clock;
}

export function createMemoryQuoteStore(calls = []) {
  const outbox = new Map();
  const receipts = new Map();
  let revision = 0;
  let recoveryCheckpoint = { outboxCursor: null, receiptCursor: null };
  const etag = () => `etag-${++revision}`;

  return {
    outbox,
    receipts,
    async read(submissionId) {
      calls.push(`outbox.read:${submissionId}`);
      return outbox.get(submissionId) ?? null;
    },
    async readReceipt(submissionId) {
      calls.push(`receipt.read:${submissionId}`);
      return receipts.get(submissionId) ?? null;
    },
    async create(record) {
      calls.push(`outbox.create:${record.submissionId}`);
      const existing = outbox.get(record.submissionId);
      if (existing) return { created: false, stored: existing };
      const stored = {
        record: structuredClone(record),
        pathname: `quote-lead-backups/v2/lead-${record.submissionId}.json`,
        etag: etag(),
      };
      outbox.set(record.submissionId, stored);
      return { created: true, stored };
    },
    async update(stored, patch, now) {
      calls.push(`outbox.update:${patch.state}`);
      const current = outbox.get(stored.record.submissionId);
      if (!current || current.etag !== stored.etag) {
        throw new Error("stale etag");
      }
      const updated = {
        record: {
          ...structuredClone(current.record),
          ...structuredClone(patch),
          lastTransitionAt: now.toISOString(),
        },
        pathname: current.pathname,
        etag: etag(),
      };
      outbox.set(stored.record.submissionId, updated);
      return updated;
    },
    async remove(stored) {
      calls.push(`outbox.remove:${stored.record.submissionId}`);
      const current = outbox.get(stored.record.submissionId);
      if (!current || current.etag !== stored.etag) throw new Error("stale etag");
      outbox.delete(stored.record.submissionId);
    },
    async writeReceipt(receipt) {
      calls.push(`receipt.write:${receipt.submissionId}`);
      const stored = {
        receipt: structuredClone(receipt),
        pathname: `quote-lead-receipts/v1/lead-${receipt.submissionId}.json`,
        etag: etag(),
      };
      receipts.set(receipt.submissionId, stored);
      return stored;
    },
    async removeReceipt(stored) {
      calls.push(`receipt.remove:${stored.receipt.submissionId}`);
      receipts.delete(stored.receipt.submissionId);
    },
    async listOutbox({ cursor, limit = 20 } = {}) {
      const values = [...outbox.values()];
      const start = Number(cursor ?? 0);
      const end = Math.min(values.length, start + limit);
      return {
        blobs: values.slice(start, end).map((stored) => ({
          pathname: stored.pathname,
          uploadedAt: NOW,
        })),
        hasMore: end < values.length,
        cursor: end < values.length ? String(end) : undefined,
      };
    },
    async listReceipts({ cursor, limit = 100 } = {}) {
      const values = [...receipts.values()];
      const start = Number(cursor ?? 0);
      const end = Math.min(values.length, start + limit);
      return {
        blobs: values.slice(start, end).map((stored) => ({
          pathname: stored.pathname,
          uploadedAt: NOW,
        })),
        hasMore: end < values.length,
        cursor: end < values.length ? String(end) : undefined,
      };
    },
    async readRecoveryCheckpoint() {
      return structuredClone(recoveryCheckpoint);
    },
    async writeRecoveryCheckpoint(checkpoint) {
      recoveryCheckpoint = structuredClone(checkpoint);
    },
    async readPath(pathname) {
      const stored = [...outbox.values()].find((item) => item.pathname === pathname);
      if (stored) return { value: stored.record, ...stored };
      const receipt = [...receipts.values()].find((item) => item.pathname === pathname);
      return receipt ? { value: receipt.receipt, ...receipt } : null;
    },
  };
}

export function quoteFormData({
  submissionId = SUBMISSION_ID,
  includeSubmissionId = true,
  website = "",
  photos = [],
  overrides = {},
} = {}) {
  const form = new FormData();
  const values = {
    make: "Toyota",
    model: "Corolla",
    year: "2015",
    name: "Test User",
    phone: "0400000000",
    suburb: "Toowoomba",
    ...overrides,
  };
  for (const [key, value] of Object.entries(values)) form.append(key, value);
  if (includeSubmissionId) form.append("submissionId", submissionId);
  form.append("website", website);
  for (const photo of photos) form.append("photos", photo);
  return form;
}

export function quoteRequest(options = {}) {
  return new Request("https://carbase.au/api/quote", {
    method: "POST",
    body: quoteFormData(options),
  });
}

export function createQuoteHarness({
  limitResult = { allowed: true, mode: "enforce" },
  mailOutcome = { status: "accepted", providerMessageId: "email_123" },
  store = undefined,
  normalizePhotos = undefined,
  createSubmissionId = () => OTHER_SUBMISSION_ID,
} = {}) {
  const calls = [];
  const memoryStore = store === undefined ? createMemoryQuoteStore(calls) : store;
  const handler = createQuotePostHandler({
    rateLimiter: {
      async consume() {
        calls.push("rate.consume");
        return limitResult;
      },
    },
    store: memoryStore,
    mailer: mailOutcome
      ? {
          async send(record) {
            calls.push(`mailer.send:${record.submissionId}`);
            if (mailOutcome instanceof Error) throw mailOutcome;
            return mailOutcome;
          },
        }
      : null,
    normalizePhotos:
      normalizePhotos ??
      (async (photos) => {
        calls.push(`images.normalize:${photos.length}`);
        return photos.map((_, index) => ({
          filename: `photo-${index + 1}.jpg`,
          contentType: "image/jpeg",
          size: 3,
          content: Buffer.from([1, 2, 3]),
        }));
      }),
    now: () => new Date(NOW),
    providerTimeout: (operation) => operation(new AbortController().signal),
    createSubmissionId,
    logger: {
      error() {},
      warn() {},
    },
  });

  return { calls, handler, store: memoryStore };
}
