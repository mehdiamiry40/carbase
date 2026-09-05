import { ProviderTimeoutError, logQuoteOperationalEvent, runWithTimeout } from "./quoteBackup.mjs";
import { createQuoteReceipt, isQuoteOutboxRecord, isQuoteReceipt } from "./quoteOutbox.mjs";
import {
  QuoteBudgetExceededError,
  createQuoteAttempt,
  createQuoteDeadline,
  saveQuoteAttemptOutcome,
} from "./quoteTiming.mjs";

const STALE_STAGE_MS = 15 * 60 * 1_000;

function isExpired(value, now) {
  const time = Date.parse(value ?? "");
  return Number.isFinite(time) && time <= now.getTime();
}

function nextAttemptAt(now, attemptCount) {
  const minutes = Math.min(60, 2 ** Math.max(0, attemptCount - 1) * 5);
  return new Date(now.getTime() + minutes * 60 * 1_000).toISOString();
}

function outboxStored(raw) {
  return { record: raw.value, pathname: raw.pathname, etag: raw.etag };
}

/** @param {any} options */
export function createQuoteOutboxProcessor(options = {}) {
  const {
    store = null,
    mailer = null,
    mode = "observe",
    batchSize = 10,
    maxAttempts = 5,
    now = () => new Date(),
    logger = console,
    providerTimeout = runWithTimeout,
    clockMs = () => performance.now(),
    maxRunMs = 40_000,
    maxScanRecords = Math.max(100, batchSize * 10),
    maxReceiptScanRecords = Math.max(100, batchSize * 10),
  } = options;
  return async function processQuoteOutbox() {
    const budget = createQuoteDeadline({ clockMs, maxRunMs, providerTimeout });
    const counts = {
      accepted: 0,
      deleted: 0,
      failed: 0,
      invalid: 0,
      observed: 0,
      processed: 0,
      receiptScanned: 0,
      retained: 0,
      scanned: 0,
    };

    if (!store) return { ...counts, unavailable: true };

    const { hasBudget, bounded } = budget;

    let checkpoint = { outboxCursor: null, receiptCursor: null };
    if (typeof store.readRecoveryCheckpoint === "function" && hasBudget()) {
      try {
        checkpoint = {
          ...checkpoint,
          ...(await bounded((signal) => store.readRecoveryCheckpoint(signal))),
        };
      } catch {
        counts.failed += 1;
        logQuoteOperationalEvent(
          "quote.outbox.checkpoint_read_failed",
          {},
          { level: "error", logger },
        );
      }
    }

    let cursor = checkpoint.outboxCursor ?? undefined;
    let nextOutboxCursor = checkpoint.outboxCursor ?? null;
    for (
      let page = 0;
      page < 50 &&
      counts.processed < batchSize &&
      counts.scanned < maxScanRecords &&
      hasBudget();
      page += 1
    ) {
      let listed;
      try {
        listed = await bounded((signal) =>
          store.listOutbox({
            cursor,
            limit: Math.min(
              20,
              Math.max(1, batchSize - counts.processed),
              maxScanRecords - counts.scanned,
            ),
            abortSignal: signal,
          }),
        );
      } catch {
        counts.failed += 1;
        nextOutboxCursor = null;
        logQuoteOperationalEvent(
          "quote.outbox.list_failed",
          {},
          { level: "error", logger },
        );
        break;
      }

      let completedPage = true;

      for (const blob of listed.blobs) {
        counts.scanned += 1;

        let raw;
        try {
          raw = await bounded(
            (signal) => store.readPath(blob.pathname, signal),
          );
        } catch (error) {
          counts.failed += 1;
          if (error instanceof QuoteBudgetExceededError) {
            completedPage = false;
            break;
          }
          continue;
        }

        if (!raw || !isQuoteOutboxRecord(raw.value)) {
          counts.invalid += 1;
          logQuoteOperationalEvent(
            "quote.outbox.invalid",
            {},
            { level: "error", logger },
          );
          continue;
        }

        let stored = outboxStored(raw);
        const currentTime = now();

        if (isExpired(stored.record.expiresAt, currentTime)) {
          counts.processed += 1;
          try {
            await bounded((signal) => store.remove(stored, signal));
            counts.deleted += 1;
            logQuoteOperationalEvent(
              "quote.outbox.expired",
              { state: stored.record.state, submissionId: stored.record.submissionId },
              { logger },
            );
          } catch (error) {
            counts.failed += 1;
            if (error instanceof QuoteBudgetExceededError) {
              completedPage = false;
              break;
            }
          }
          continue;
        }

        if (stored.record.state === "accepted_cleanup_pending") {
          counts.processed += 1;
          try {
            const transitionedAt = Date.parse(stored.record.lastTransitionAt);
            const receipt = createQuoteReceipt({
              record: stored.record,
              providerMessageId: stored.record.providerMessageId,
              deliveredAt: Number.isFinite(transitionedAt)
                ? new Date(transitionedAt)
                : currentTime,
            });
            await bounded(
              (signal) => store.writeReceipt(receipt, signal),
            );
            await bounded((signal) => store.remove(stored, signal));
            counts.deleted += 1;
          } catch (error) {
            counts.failed += 1;
            if (error instanceof QuoteBudgetExceededError) {
              completedPage = false;
              break;
            }
          }
          continue;
        }

        if (stored.record.state === "sending") {
          if (isExpired(stored.record.leaseExpiresAt, currentTime)) {
            counts.processed += 1;
            try {
              stored = await bounded(
                (signal) =>
                  store.update(
                    stored,
                    {
                      state: "delivery_unknown",
                      leaseExpiresAt: null,
                      lastOutcome: "lease_expired",
                      nextAttemptAt: null,
                    },
                    currentTime,
                    signal,
                  ),
              );
            } catch (error) {
              counts.failed += 1;
              if (error instanceof QuoteBudgetExceededError) {
                completedPage = false;
                break;
              }
              continue;
            }
            logQuoteOperationalEvent(
              "quote.outbox.manual_review",
              { state: stored.record.state, reason: "lease_expired", submissionId: stored.record.submissionId },
              { level: "error", logger },
            );
          }
          counts.retained += 1;
          continue;
        }

        if (stored.record.state === "delivery_unknown" || stored.record.state === "dead_letter") {
          counts.retained += 1;
          logQuoteOperationalEvent(
            "quote.outbox.manual_review",
            {
              state: stored.record.state,
              reason: stored.record.state === "dead_letter" ? "max_attempts" : "delivery_unknown",
              submissionId: stored.record.submissionId,
            },
            { level: "error", logger },
          );
          continue;
        }

        const retryable = new Set([
          "staged",
          "delivery_rejected",
          "delivery_unavailable",
        ]);
        if (!retryable.has(stored.record.state)) {
          counts.invalid += 1;
          logQuoteOperationalEvent(
            "quote.outbox.invalid",
            { reason: "unknown_state", submissionId: stored.record.submissionId },
            { level: "error", logger },
          );
          continue;
        }

        const receivedAt = Date.parse(stored.record.receivedAt);
        const nextAttempt = Date.parse(stored.record.nextAttemptAt ?? "");
        const eligible =
          (stored.record.state !== "staged" ||
            currentTime.getTime() - receivedAt >= STALE_STAGE_MS) &&
          (!Number.isFinite(nextAttempt) || nextAttempt <= currentTime.getTime());

        if (!eligible || mode !== "live" || !mailer) {
          counts.observed += 1;
          continue;
        }

        if (stored.record.attemptCount >= maxAttempts) {
          counts.processed += 1;
          try {
            await bounded(
              (signal) =>
                store.update(
                  stored,
                  {
                    state: "dead_letter",
                    leaseExpiresAt: null,
                    lastOutcome: "max_attempts",
                    nextAttemptAt: null,
                  },
                  currentTime,
                  signal,
                ),
            );
            logQuoteOperationalEvent(
              "quote.outbox.manual_review",
              { state: "dead_letter", reason: "max_attempts", submissionId: stored.record.submissionId },
              { level: "error", logger },
            );
          } catch (error) {
            counts.failed += 1;
            if (error instanceof QuoteBudgetExceededError) {
              completedPage = false;
              break;
            }
          }
          counts.retained += 1;
          continue;
        }

        if (!budget.canStartAttempt()) {
          counts.retained += 1;
          completedPage = false;
          break;
        }

        counts.processed += 1;
        const attemptedAt = now();
        try {
          stored = await budget.claim(
            (signal) =>
              store.update(
                stored,
                createQuoteAttempt(stored, attemptedAt),
                attemptedAt,
                signal,
              ),
          );
        } catch (error) {
          counts.failed += 1;
          if (error instanceof QuoteBudgetExceededError) {
            completedPage = false;
            break;
          }
          continue;
        }

        let outcome;
        try {
          outcome = await budget.send((signal) => mailer.send(stored.record, { signal }));
        } catch (error) {
          outcome = {
            status: error instanceof QuoteBudgetExceededError ? "not_sent" : "unknown",
            reason:
              error instanceof QuoteBudgetExceededError
                ? "request_budget"
                : error instanceof ProviderTimeoutError
                ? "provider_timeout"
                : "provider_error",
          };
        }

        if (outcome.status === "accepted") {
          try {
            stored = await saveQuoteAttemptOutcome({
              store, stored, now, bounded,
              patch: {
                state: "accepted_cleanup_pending",
                leaseExpiresAt: null,
                lastOutcome: "accepted",
                nextAttemptAt: null,
                providerMessageId: outcome.providerMessageId,
              },
            });
            const receipt = createQuoteReceipt({
              record: stored.record,
              providerMessageId: outcome.providerMessageId,
              deliveredAt: now(),
            });
            await bounded(
              (signal) => store.writeReceipt(receipt, signal),
            );
            await bounded((signal) => store.remove(stored, signal));
            counts.accepted += 1;
          } catch (error) {
            counts.failed += 1;
            if (error instanceof QuoteBudgetExceededError) {
              completedPage = false;
              break;
            }
          }
          continue;
        }

        const state = outcome.status === "rejected" ? "delivery_rejected" :
          outcome.status === "not_sent" ? "delivery_unavailable" : "delivery_unknown";
        if (outcome.status !== "not_sent") {
          counts.failed += 1;
          logQuoteOperationalEvent(
            "quote.outbox.delivery_failed",
            {
              state,
              reason: outcome.status === "rejected" ? "provider_rejected" : "delivery_unknown",
              attemptCount: stored.record.attemptCount,
              submissionId: stored.record.submissionId,
            },
            { level: "error", logger },
          );
        }
        try {
          await saveQuoteAttemptOutcome({
            store, stored, now, bounded,
            patch: {
              state,
              leaseExpiresAt: null,
              lastOutcome: outcome.reason ?? outcome.status,
              nextAttemptAt: state !== "delivery_unknown"
                ? nextAttemptAt(now(), stored.record.attemptCount)
                : null,
            },
          });
        } catch (error) {
          counts.failed += 1;
          if (error instanceof QuoteBudgetExceededError) {
            completedPage = false;
            break;
          }
        }
        counts.retained += 1;
      }

      if (!completedPage) break;
      nextOutboxCursor = listed.hasMore && listed.cursor ? listed.cursor : null;
      if (!listed.hasMore || !listed.cursor) break;
      cursor = listed.cursor;
    }

    let receiptCursor = checkpoint.receiptCursor ?? undefined;
    let nextReceiptCursor = checkpoint.receiptCursor ?? null;
    let receiptDeletes = 0;
    for (
      let page = 0;
      page < 50 &&
      receiptDeletes < batchSize &&
      counts.receiptScanned < maxReceiptScanRecords &&
      hasBudget();
      page += 1
    ) {
      let receipts;
      try {
        receipts = await bounded((signal) =>
          store.listReceipts({
            cursor: receiptCursor,
            limit: Math.min(
              20,
              Math.max(1, batchSize - receiptDeletes),
              maxReceiptScanRecords - counts.receiptScanned,
            ),
            abortSignal: signal,
          }),
        );
      } catch {
        counts.failed += 1;
        nextReceiptCursor = null;
        logQuoteOperationalEvent(
          "quote.receipt.list_failed",
          {},
          { level: "error", logger },
        );
        break;
      }

      let completedPage = true;
      for (const blob of receipts.blobs) {
        counts.receiptScanned += 1;
        let raw;
        try {
          raw = await bounded((signal) => store.readPath(blob.pathname, signal));
        } catch (error) {
          counts.failed += 1;
          if (error instanceof QuoteBudgetExceededError) {
            completedPage = false;
            break;
          }
          continue;
        }
        if (!raw || !isQuoteReceipt(raw.value)) continue;
        if (isExpired(raw.value.expiresAt, now())) {
          receiptDeletes += 1;
          try {
            await bounded((signal) =>
              store.removeReceipt(
                { receipt: raw.value, pathname: raw.pathname, etag: raw.etag },
                signal,
              ),
            );
            counts.deleted += 1;
          } catch (error) {
            counts.failed += 1;
            if (error instanceof QuoteBudgetExceededError) {
              completedPage = false;
              break;
            }
          }
        }
      }

      if (!completedPage) break;
      nextReceiptCursor =
        receipts.hasMore && receipts.cursor ? receipts.cursor : null;
      if (!receipts.hasMore || !receipts.cursor) break;
      receiptCursor = receipts.cursor;
    }

    if (typeof store.writeRecoveryCheckpoint === "function" && hasBudget()) {
      try {
        await bounded((signal) =>
          store.writeRecoveryCheckpoint(
            {
              outboxCursor: nextOutboxCursor,
              receiptCursor: nextReceiptCursor,
            },
            signal,
          ),
        );
      } catch {
        counts.failed += 1;
        logQuoteOperationalEvent(
          "quote.outbox.checkpoint_write_failed",
          {},
          { level: "error", logger },
        );
      }
    }

    logQuoteOperationalEvent(
      "quote.outbox.processed",
      { mode, ...counts },
      { logger },
    );
    return counts;
  };
}
