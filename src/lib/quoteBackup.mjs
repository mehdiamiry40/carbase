export const quoteBackupReceived = Object.freeze({
  status: 202,
  body: Object.freeze({
    ok: true,
    delivered: false,
    safelyStored: true,
    message: "Your quote request was safely received and will be reviewed.",
  }),
});

/**
 * Resolve private backup storage without accepting or logging submission data.
 *
 * @param {Record<string, string | undefined>} env
 */
export function resolveQuoteBackup(env) {
  const token = env.BLOB_READ_WRITE_TOKEN?.trim();
  return token ? { token } : null;
}

/**
 * Bound a provider operation and abort it when supported. Promise.race keeps
 * this effective for SDKs that do not currently expose AbortSignal in types.
 *
 * @template T
 * @param {(signal: AbortSignal) => Promise<T>} operation
 * @param {number} timeoutMs
 * @returns {Promise<T>}
 */
export class ProviderTimeoutError extends Error {
  constructor() {
    super("Provider operation timed out.");
    this.name = "ProviderTimeoutError";
  }
}

export async function runWithTimeout(operation, timeoutMs) {
  const controller = new AbortController();
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new ProviderTimeoutError());
    }, timeoutMs);
  });

  try {
    return await Promise.race([operation(controller.signal), timeout]);
  } finally {
    clearTimeout(timer);
  }
}

function structuredQuoteLog(logger, method, event, details = {}) {
  logger[method](
    JSON.stringify({
      component: "quote-api",
      event,
      ...details,
    }),
  );
}

export function logQuoteOperationalEvent(
  event,
  details = {},
  { level = "warn", logger = console } = {},
) {
  const safeDetails = {};
  for (const key of [
    "accepted",
    "attemptCount",
    "deleted",
    "failed",
    "invalid",
    "mode",
    "observed",
    "phase",
    "processed",
    "reason",
    "receiptScanned",
    "retained",
    "scanned",
    "state",
    "submissionId",
  ]) {
    if (details[key] !== undefined) safeDetails[key] = details[key];
  }
  structuredQuoteLog(logger, level, event, safeDetails);
}
