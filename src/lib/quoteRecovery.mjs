import { ProviderTimeoutError, logQuoteOperationalEvent, runWithTimeout } from "./quoteBackup.mjs";
import { createQuoteReceipt, isQuoteOutboxRecord, isQuoteReceipt } from "./quoteOutbox.mjs";

const OPERATION_TIMEOUT_MS = 8_000;
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
    clockMs = Date.now,
    maxRunMs = 40_000,
    maxScanRecords = Math.max(100, batchSize * 10),
    maxReceiptScanRecords = Math.max(100, batchSize * 10),
  } = options;
  return async function processQuoteOutbox() {
    const startedAt = clockMs();
    const deadlineAt = startedAt + maxRunMs;
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

    class RunBudgetExceededError extends Error {}
    const remainingMs = () => deadlineAt - clockMs();
    const hasBudget = () => remainingMs() > 250;
    const bounded = (operation) => {
      const timeoutMs = Math.min(OPERATION_TIMEOUT_MS, remainingMs());
      if (timeoutMs <= 250) throw new RunBudgetExceededError();
      return providerTimeout(operation, timeoutMs);
    };

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
          if (error instanceof RunBudgetExceededError) {
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
            if (error instanceof RunBudgetExceededError) {
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
            if (error instanceof RunBudgetExceededError) {
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
              if (error instanceof RunBudgetExceededError) {
                completedPage = false;
                break;
              }
              continue;
            }
          }
          counts.retained += 1;
          continue;
        }

        if (stored.record.state === "delivery_unknown") {
          counts.retained += 1;
          logQuoteOperationalEvent(
            "quote.outbox.manual_review",
            { state: stored.record.state, submissionId: stored.record.submissionId },
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
          } catch (error) {
            counts.failed += 1;
            if (error instanceof RunBudgetExceededError) {
              completedPage = false;
              break;
            }
          }
          counts.retained += 1;
          continue;
        }

        counts.processed += 1;
        try {
          stored = await bounded(
            (signal) =>
              store.update(
                stored,
                {
                  state: "sending",
                  attemptCount: stored.record.attemptCount + 1,
                  leaseExpiresAt: new Date(
                    currentTime.getTime() + OPERATION_TIMEOUT_MS + 2_000,
                  ).toISOString(),
                  lastOutcome: null,
                },
                currentTime,
                signal,
              ),
          );
        } catch (error) {
          counts.failed += 1;
          if (error instanceof RunBudgetExceededError) {
            completedPage = false;
            break;
          }
          continue;
        }

        let outcome;
        try {
          outcome = await bounded(() => mailer.send(stored.record));
        } catch (error) {
          outcome = {
            status: "unknown",
            reason:
              error instanceof ProviderTimeoutError
                ? "provider_timeout"
                : "provider_error",
          };
        }

        if (outcome.status === "accepted") {
          try {
            stored = await bounded(
              (signal) =>
                store.update(
                  stored,
                  {
                    state: "accepted_cleanup_pending",
                    leaseExpiresAt: null,
                    lastOutcome: "accepted",
                    nextAttemptAt: null,
                    providerMessageId: outcome.providerMessageId,
                  },
                  now(),
                  signal,
                ),
            );
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
            if (error instanceof RunBudgetExceededError) {
              completedPage = false;
              break;
            }
          }
          continue;
        }

        const state = outcome.status === "rejected" ? "delivery_rejected" : "delivery_unknown";
        try {
          await bounded(
            (signal) =>
              store.update(
                stored,
                {
                  state,
                  leaseExpiresAt: null,
                  lastOutcome: outcome.reason ?? outcome.status,
                  nextAttemptAt:
                    state === "delivery_rejected"
                      ? nextAttemptAt(currentTime, stored.record.attemptCount)
                      : null,
                },
                now(),
                signal,
              ),
          );
        } catch (error) {
          counts.failed += 1;
          if (error instanceof RunBudgetExceededError) {
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
          if (error instanceof RunBudgetExceededError) {
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
            if (error instanceof RunBudgetExceededError) {
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
