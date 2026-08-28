import { Buffer } from "node:buffer";
import { del, put } from "@vercel/blob";

const BACKUP_PREFIX = "quote-lead-backups";
const MAX_STORED_FILENAME_LENGTH = 180;
const SUBMISSION_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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
 * Keep customer-supplied filenames inside the private payload, never in its
 * pathname, while removing path separators and control characters.
 *
 * @param {string} filename
 * @param {number} index
 */
export function safePhotoFilename(filename, index) {
  const cleaned = filename
    .trim()
    .replace(/[\u0000-\u001f\u007f/\\]/g, "_")
    .slice(0, MAX_STORED_FILENAME_LENGTH);

  return cleaned || `photo-${index + 1}.jpg`;
}

/**
 * Build one atomic recovery envelope. Photos are embedded rather than written
 * as separate blobs so a successful put always means the complete request is
 * recoverable.
 *
 * @param {{
 *   lead: Record<string, string>,
 *   photos: File[],
 *   reason: "resend_pending" | "resend_unavailable" | "resend_failed",
 *   submissionId: string,
 *   receivedAt?: Date,
 * }} input
 */
export async function createQuoteBackupPayload({
  lead,
  photos,
  reason,
  submissionId,
  receivedAt = new Date(),
}) {
  const storedPhotos = await Promise.all(
    photos.map(async (photo, index) => ({
      filename: safePhotoFilename(photo.name, index),
      contentType: photo.type,
      size: photo.size,
      contentBase64: Buffer.from(await photo.arrayBuffer()).toString("base64"),
    })),
  );

  return JSON.stringify({
    schemaVersion: 1,
    kind: "carbase.quote-backup",
    submissionId,
    receivedAt: receivedAt.toISOString(),
    delivery: {
      provider: "resend",
      outcome: reason,
    },
    lead,
    photos: storedPhotos,
  });
}

/**
 * Persist a complete quote envelope to an access-controlled Vercel Blob.
 * `upload` is injectable so the privacy and atomicity contract can be tested
 * without contacting an external service.
 *
 * @param {{
 *   lead: Record<string, string>,
 *   photos: File[],
 *   reason: "resend_pending" | "resend_unavailable" | "resend_failed",
 *   submissionId: string,
 *   token: string,
 *   receivedAt?: Date,
 *   abortSignal?: AbortSignal,
 *   upload?: typeof put,
 * }} input
 */
export async function persistQuoteBackup({
  lead,
  photos,
  reason,
  submissionId,
  token,
  receivedAt = new Date(),
  abortSignal,
  upload = put,
}) {
  if (!SUBMISSION_ID_PATTERN.test(submissionId)) {
    throw new TypeError("A UUID submission ID is required for quote backup storage.");
  }

  const payload = await createQuoteBackupPayload({
    lead,
    photos,
    reason,
    submissionId,
    receivedAt,
  });
  const day = receivedAt.toISOString().slice(0, 10);

  return upload(`${BACKUP_PREFIX}/${day}/lead-${submissionId}.json`, payload, {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    abortSignal,
    cacheControlMaxAge: 60,
    contentType: "application/json",
    token,
  });
}

/**
 * Remove a staged outbox object only after Resend confirms delivery.
 *
 * @param {{ pathname: string, token: string, abortSignal?: AbortSignal, remove?: typeof del }} input
 */
export async function removeQuoteBackup({
  pathname,
  token,
  abortSignal,
  remove = del,
}) {
  return remove(pathname, { token, abortSignal });
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
export async function runWithTimeout(operation, timeoutMs) {
  const controller = new AbortController();
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new Error("Provider operation timed out."));
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

/** @param {"resend_unavailable" | "resend_failed"} reason @param {string} submissionId @param {Pick<Console, "warn">} logger */
export function logQuoteBackupStored(reason, submissionId, logger = console) {
  structuredQuoteLog(logger, "warn", "quote.backup.stored", {
    reason,
    submissionId,
  });
}

/** @param {Pick<Console, "error">} logger */
export function logQuoteBackupUnavailable(logger = console) {
  structuredQuoteLog(logger, "error", "quote.backup.unavailable");
}

/** @param {"pre_delivery" | "post_failure"} phase @param {Pick<Console, "error">} logger */
export function logQuoteBackupFailure(phase, logger = console) {
  structuredQuoteLog(logger, "error", "quote.backup.failed", { phase });
}

/** @param {string} submissionId @param {Pick<Console, "error">} logger */
export function logQuoteBackupCleanupFailure(submissionId, logger = console) {
  structuredQuoteLog(logger, "error", "quote.backup.cleanup_failed", {
    submissionId,
  });
}
