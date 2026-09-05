import { randomUUID } from "node:crypto";
import { runWithTimeout } from "./quoteBackup.mjs";

export const QUOTE_OPERATION_TIMEOUT_MS = 8_000;
export const QUOTE_POST_MAX_RUN_MS = 29_000;
const RESPONSE_RESERVE_MS = 1_000;
const ATTEMPT_SLACK_MS = 250;
const ATTEMPT_WINDOW_MS = 3 * QUOTE_OPERATION_TIMEOUT_MS + ATTEMPT_SLACK_MS;

export class QuoteBudgetExceededError extends Error {}

/** A single deadline includes parsing, provider work, cleanup and response slack. */
export function createQuoteDeadline({
  clockMs = () => performance.now(),
  maxRunMs,
  providerTimeout = runWithTimeout,
}) {
  const deadlineAt = clockMs() + maxRunMs - RESPONSE_RESERVE_MS;
  const remainingMs = () => deadlineAt - clockMs();
  const hasBudget = () => remainingMs() > ATTEMPT_SLACK_MS;
  const bounded = (operation, reserveMs = 0) => {
    const timeoutMs = Math.min(
      QUOTE_OPERATION_TIMEOUT_MS,
      remainingMs() - reserveMs,
    );
    if (timeoutMs <= ATTEMPT_SLACK_MS) throw new QuoteBudgetExceededError();
    return providerTimeout(operation, timeoutMs);
  };
  return {
    remainingMs,
    hasBudget,
    bounded,
    canStartAttempt: () => remainingMs() >= ATTEMPT_WINDOW_MS,
    claim: (operation) =>
      bounded(operation, 2 * QUOTE_OPERATION_TIMEOUT_MS + ATTEMPT_SLACK_MS),
    send: (operation) => {
      if (remainingMs() < 2 * QUOTE_OPERATION_TIMEOUT_MS + ATTEMPT_SLACK_MS) {
        throw new QuoteBudgetExceededError();
      }
      return bounded(operation, QUOTE_OPERATION_TIMEOUT_MS + ATTEMPT_SLACK_MS);
    },
  };
}

/** Call immediately before the conditional claim, never at request receipt time. */
export function createQuoteAttempt(stored, now) {
  return {
    state: "sending",
    attemptId: randomUUID(),
    attemptCount: stored.record.attemptCount + 1,
    leaseExpiresAt: new Date(now.getTime() + ATTEMPT_WINDOW_MS).toISOString(),
    lastOutcome: null,
  };
}

/**
 * A cron may expire a lease while a result is arriving. Reconcile only the
 * original attempt, with a fresh ETag, and never send again in this path.
 */
export async function saveQuoteAttemptOutcome({ store, stored, patch, now, bounded }) {
  try {
    return await bounded((signal) => store.update(stored, patch, now(), signal));
  } catch (error) {
    if (
      patch.state !== "accepted_cleanup_pending" &&
      patch.state !== "delivery_rejected" &&
      !(patch.state === "delivery_unavailable" && patch.lastOutcome === "request_budget")
    ) {
      throw error;
    }
    const current = await bounded((signal) => store.read(stored.record.submissionId, signal));
    const sameAttempt =
      current?.record &&
      stored.record.attemptId &&
      current.record.submissionId === stored.record.submissionId &&
      current.record.attemptId === stored.record.attemptId &&
      current.record.attemptCount === stored.record.attemptCount &&
      current.record.payloadDigest === stored.record.payloadDigest;
    if (!sameAttempt) throw error;
    // The first write may have committed but its acknowledgement was lost.
    if (
      current.record.state === patch.state &&
      current.record.lastOutcome === patch.lastOutcome &&
      (patch.state !== "accepted_cleanup_pending" ||
        current.record.providerMessageId === patch.providerMessageId)
    ) {
      return current;
    }
    const ownExpiredLease =
      current.record.state === "delivery_unknown" &&
      current.record.lastOutcome === "lease_expired";
    if (current.record.state !== "sending" && !ownExpiredLease) throw error;
    return bounded((signal) => store.update(current, patch, now(), signal));
  }
}
