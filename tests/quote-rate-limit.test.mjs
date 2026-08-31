import assert from "node:assert/strict";
import test from "node:test";
import { createQuoteRateLimiter } from "../src/lib/quoteRateLimit.mjs";

const request = new Request("https://carbase.au/api/quote", { method: "POST" });
const logger = { error() {}, warn() {} };

test("observe mode records an exceeded limit without blocking the quote", async () => {
  const limiter = createQuoteRateLimiter({
    env: { QUOTE_RATE_LIMIT_MODE: "observe" },
    check: async () => ({ rateLimited: true }),
    timeout: (operation) => operation(),
    logger,
  });

  assert.deepEqual(await limiter.consume(request), {
    allowed: true,
    rateLimited: true,
    mode: "observe",
  });
});

test("enforce mode blocks an exceeded limit", async () => {
  const limiter = createQuoteRateLimiter({
    env: { QUOTE_RATE_LIMIT_MODE: "enforce" },
    check: async () => ({ rateLimited: true }),
    timeout: (operation) => operation(),
    logger,
  });

  assert.equal((await limiter.consume(request)).allowed, false);
});

test("a stalled firewall lookup is bounded and fails closed in enforce mode", async () => {
  const limiter = createQuoteRateLimiter({
    env: { QUOTE_RATE_LIMIT_MODE: "enforce" },
    check: () => new Promise(() => {}),
    timeoutMs: 10,
    logger,
  });

  const result = await Promise.race([
    limiter.consume(request),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("rate limiter remained pending")), 250),
    ),
  ]);
  assert.equal(result.allowed, false);
  assert.equal(result.unavailable, true);
});
