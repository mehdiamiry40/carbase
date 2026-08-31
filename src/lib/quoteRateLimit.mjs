import { checkRateLimit } from "@vercel/firewall";
import { logQuoteOperationalEvent, runWithTimeout } from "./quoteBackup.mjs";

export const QUOTE_RATE_LIMIT_ID = "quote-submit";
export const QUOTE_RATE_LIMIT_RETRY_SECONDS = 600;
export const QUOTE_RATE_LIMIT_TIMEOUT_MS = 1_500;

export function resolveQuoteRateLimitMode(env = process.env) {
  const configured = env.QUOTE_RATE_LIMIT_MODE?.trim().toLowerCase();
  if (configured === "off" || configured === "observe" || configured === "enforce") {
    return configured;
  }
  return env.NODE_ENV === "production" ? "enforce" : "off";
}

export function createQuoteRateLimiter({
  env = process.env,
  check = checkRateLimit,
  timeout = runWithTimeout,
  timeoutMs = QUOTE_RATE_LIMIT_TIMEOUT_MS,
  logger = console,
} = {}) {
  const mode = resolveQuoteRateLimitMode(env);

  return {
    mode,
    async consume(request) {
      if (mode === "off") return { allowed: true, mode };

      try {
        const result = await timeout(
          () => check(QUOTE_RATE_LIMIT_ID, { request }),
          timeoutMs,
        );
        if (result.rateLimited) {
          logQuoteOperationalEvent(
            "quote.rate_limit.exceeded",
            { mode },
            { logger },
          );
          return mode === "enforce"
            ? {
                allowed: false,
                rateLimited: true,
                retryAfter: QUOTE_RATE_LIMIT_RETRY_SECONDS,
                mode,
              }
            : { allowed: true, rateLimited: true, mode };
        }

        if (result.error === "not-found") {
          logQuoteOperationalEvent(
            "quote.rate_limit.unavailable",
            { mode, reason: "not_found" },
            { level: "error", logger },
          );
          return mode === "enforce"
            ? { allowed: false, unavailable: true, mode }
            : { allowed: true, mode };
        }

        return { allowed: true, mode };
      } catch {
        logQuoteOperationalEvent(
          "quote.rate_limit.unavailable",
          { mode, reason: "request_failed" },
          { level: "error", logger },
        );
        return mode === "enforce"
          ? { allowed: false, unavailable: true, mode }
          : { allowed: true, mode };
      }
    },
  };
}
