import { createHash } from "node:crypto";
import { del, get, list, put } from "@vercel/blob";
import { isQuoteSubmissionId } from "./quoteReceipt.mjs";

export const QUOTE_OUTBOX_PREFIX = "quote-lead-backups/v2";
export const QUOTE_RECEIPT_PREFIX = "quote-lead-receipts/v1";
export const QUOTE_RECOVERY_CHECKPOINT_PATH =
  "quote-outbox-control/v1/recovery-checkpoint.json";
export const QUOTE_OUTBOX_SCHEMA_VERSION = 2;
export const QUOTE_RECEIPT_SCHEMA_VERSION = 1;
export const DEFAULT_RETENTION_DAYS = 30;
export const DEFAULT_RECEIPT_DAYS = 7;
export const MAX_RETENTION_DAYS = 30;

const MAX_OUTBOX_OBJECT_BYTES = 8_000_000;

export function quoteOutboxPath(submissionId) {
  if (!isQuoteSubmissionId(submissionId)) {
    throw new TypeError("A UUIDv4 submission ID is required.");
  }
  return `${QUOTE_OUTBOX_PREFIX}/lead-${submissionId}.json`;
}

export function quoteReceiptPath(submissionId) {
  if (!isQuoteSubmissionId(submissionId)) {
    throw new TypeError("A UUIDv4 submission ID is required.");
  }
  return `${QUOTE_RECEIPT_PREFIX}/lead-${submissionId}.json`;
}

function sortObject(value) {
  return Object.fromEntries(
    Object.entries(value).sort(([left], [right]) => left.localeCompare(right)),
  );
}

export function quotePayloadDigest(lead, photos) {
  const canonical = JSON.stringify({
    lead: sortObject(lead),
    photos: photos.map((photo) => ({
      contentSha256: createHash("sha256").update(photo.content).digest("hex"),
      contentType: photo.contentType,
      filename: photo.filename,
      size: photo.size,
    })),
  });
  return createHash("sha256").update(canonical).digest("hex");
}

function addDays(date, days) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

export function createQuoteOutboxRecord({
  lead,
  photos,
  submissionId,
  receivedAt = new Date(),
  retentionDays = DEFAULT_RETENTION_DAYS,
}) {
  if (!isQuoteSubmissionId(submissionId)) {
    throw new TypeError("A UUIDv4 submission ID is required.");
  }

  const boundedRetentionDays =
    Number.isInteger(retentionDays) &&
    retentionDays >= 1 &&
    retentionDays <= MAX_RETENTION_DAYS
      ? retentionDays
      : DEFAULT_RETENTION_DAYS;

  return {
    schemaVersion: QUOTE_OUTBOX_SCHEMA_VERSION,
    kind: "carbase.quote-outbox",
    submissionId,
    receivedAt: receivedAt.toISOString(),
    expiresAt: addDays(receivedAt, boundedRetentionDays).toISOString(),
    payloadDigest: quotePayloadDigest(lead, photos),
    state: "staged",
    attemptCount: 0,
    nextAttemptAt: null,
    leaseExpiresAt: null,
    providerMessageId: null,
    lastOutcome: null,
    lastTransitionAt: receivedAt.toISOString(),
    lead,
    photos: photos.map((photo) => ({
      filename: photo.filename,
      contentType: photo.contentType,
      size: photo.size,
      contentBase64: photo.content.toString("base64"),
    })),
  };
}

export function createQuoteReceipt({
  record,
  providerMessageId,
  deliveredAt = new Date(),
  receiptDays = DEFAULT_RECEIPT_DAYS,
}) {
  return {
    schemaVersion: QUOTE_RECEIPT_SCHEMA_VERSION,
    kind: "carbase.quote-receipt",
    submissionId: record.submissionId,
    payloadDigest: record.payloadDigest,
    deliveredAt: deliveredAt.toISOString(),
    expiresAt: addDays(deliveredAt, receiptDays).toISOString(),
    providerMessageId,
  };
}

export function isQuoteOutboxRecord(value) {
  return Boolean(
    value &&
      value.schemaVersion === QUOTE_OUTBOX_SCHEMA_VERSION &&
      value.kind === "carbase.quote-outbox" &&
      isQuoteSubmissionId(value.submissionId) &&
      typeof value.payloadDigest === "string" &&
      typeof value.state === "string" &&
      value.lead &&
      Array.isArray(value.photos),
  );
}

export function isQuoteReceipt(value) {
  return Boolean(
    value &&
      value.schemaVersion === QUOTE_RECEIPT_SCHEMA_VERSION &&
      value.kind === "carbase.quote-receipt" &&
      isQuoteSubmissionId(value.submissionId) &&
      typeof value.payloadDigest === "string" &&
      typeof value.deliveredAt === "string" &&
      typeof value.expiresAt === "string",
  );
}

async function parsePrivateJson(result) {
  if (!result || result.statusCode !== 200 || !result.stream) return null;
  if ((result.blob.size ?? 0) > MAX_OUTBOX_OBJECT_BYTES) {
    throw new Error("Quote outbox object exceeds the safe read limit.");
  }
  const body = await new Response(result.stream).text();
  return {
    value: JSON.parse(body),
    pathname: result.blob.pathname,
    etag: result.blob.etag,
    uploadedAt: result.blob.uploadedAt,
  };
}

/** @param {any} options */
export function createVercelQuoteStore(options = {}) {
  const {
    token,
    putBlob = put,
    getBlob = get,
    listBlobs = list,
    deleteBlob = del,
  } = options;
  if (!token) return null;

  async function readPath(pathname, abortSignal) {
    const result = await getBlob(pathname, {
      access: "private",
      useCache: false,
      token,
      abortSignal,
    });
    return parsePrivateJson(result);
  }

  async function readOutbox(submissionId, abortSignal) {
    const stored = await readPath(quoteOutboxPath(submissionId), abortSignal);
    if (!stored || !isQuoteOutboxRecord(stored.value)) return stored;
    return { ...stored, record: stored.value };
  }

  return {
    async read(submissionId, abortSignal) {
      return readOutbox(submissionId, abortSignal);
    },

    async readReceipt(submissionId, abortSignal) {
      const stored = await readPath(quoteReceiptPath(submissionId), abortSignal);
      if (!stored || !isQuoteReceipt(stored.value)) return stored;
      return { ...stored, receipt: stored.value };
    },

    async create(record, abortSignal) {
      const pathname = quoteOutboxPath(record.submissionId);
      try {
        const result = await putBlob(pathname, JSON.stringify(record), {
          access: "private",
          addRandomSuffix: false,
          allowOverwrite: false,
          abortSignal,
          cacheControlMaxAge: 60,
          contentType: "application/json",
          maximumSizeInBytes: MAX_OUTBOX_OBJECT_BYTES,
          token,
        });
        return {
          created: true,
          stored: { record, pathname: result.pathname, etag: result.etag },
        };
      } catch (error) {
        const existing = await readOutbox(record.submissionId, abortSignal).catch(
          () => null,
        );
        if (existing?.record) return { created: false, stored: existing };
        throw error;
      }
    },

    async update(stored, patch, now = new Date(), abortSignal) {
      const record = {
        ...stored.record,
        ...patch,
        lastTransitionAt: now.toISOString(),
      };
      const result = await putBlob(stored.pathname, JSON.stringify(record), {
        access: "private",
        addRandomSuffix: false,
        allowOverwrite: true,
        ifMatch: stored.etag,
        abortSignal,
        cacheControlMaxAge: 60,
        contentType: "application/json",
        maximumSizeInBytes: MAX_OUTBOX_OBJECT_BYTES,
        token,
      });
      return { record, pathname: result.pathname, etag: result.etag };
    },

    async remove(stored, abortSignal) {
      await deleteBlob(stored.pathname, {
        ifMatch: stored.etag,
        token,
        abortSignal,
      });
    },

    async writeReceipt(receipt, abortSignal) {
      const pathname = quoteReceiptPath(receipt.submissionId);
      const result = await putBlob(pathname, JSON.stringify(receipt), {
        access: "private",
        addRandomSuffix: false,
        allowOverwrite: true,
        abortSignal,
        cacheControlMaxAge: 60,
        contentType: "application/json",
        maximumSizeInBytes: 16_384,
        token,
      });
      return { receipt, pathname: result.pathname, etag: result.etag };
    },

    async removeReceipt(stored, abortSignal) {
      await deleteBlob(stored.pathname, {
        ifMatch: stored.etag,
        token,
        abortSignal,
      });
    },

    async listOutbox({ cursor, limit = 20, abortSignal } = {}) {
      return listBlobs({
        prefix: QUOTE_OUTBOX_PREFIX,
        cursor,
        limit,
        token,
        abortSignal,
      });
    },

    async listReceipts({ cursor, limit = 100, abortSignal } = {}) {
      return listBlobs({
        prefix: QUOTE_RECEIPT_PREFIX,
        cursor,
        limit,
        token,
        abortSignal,
      });
    },

    async readPath(pathname, abortSignal) {
      return readPath(pathname, abortSignal);
    },

    async readRecoveryCheckpoint(abortSignal) {
      const stored = await readPath(QUOTE_RECOVERY_CHECKPOINT_PATH, abortSignal);
      if (
        !stored?.value ||
        stored.value.kind !== "carbase.quote-recovery-checkpoint" ||
        stored.value.schemaVersion !== 1
      ) {
        return { outboxCursor: null, receiptCursor: null };
      }
      return {
        outboxCursor:
          typeof stored.value.outboxCursor === "string"
            ? stored.value.outboxCursor
            : null,
        receiptCursor:
          typeof stored.value.receiptCursor === "string"
            ? stored.value.receiptCursor
            : null,
      };
    },

    async writeRecoveryCheckpoint(checkpoint, abortSignal) {
      await putBlob(
        QUOTE_RECOVERY_CHECKPOINT_PATH,
        JSON.stringify({
          schemaVersion: 1,
          kind: "carbase.quote-recovery-checkpoint",
          outboxCursor:
            typeof checkpoint.outboxCursor === "string"
              ? checkpoint.outboxCursor
              : null,
          receiptCursor:
            typeof checkpoint.receiptCursor === "string"
              ? checkpoint.receiptCursor
              : null,
        }),
        {
          access: "private",
          addRandomSuffix: false,
          allowOverwrite: true,
          abortSignal,
          cacheControlMaxAge: 60,
          contentType: "application/json",
          maximumSizeInBytes: 16_384,
          token,
        },
      );
    },
  };
}
