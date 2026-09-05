import { randomUUID } from "node:crypto";
import { ProviderTimeoutError, logQuoteOperationalEvent, quoteBackupReceived, runWithTimeout } from "./quoteBackup.mjs";
import { createQuoteOutboxRecord, createQuoteReceipt } from "./quoteOutbox.mjs";
import {
  MAX_PHOTOS,
  MAX_RAW_PHOTO_TOTAL_BYTES,
  QuoteImageValidationError,
} from "./quoteImages.mjs";
import { isQuoteSubmissionId } from "./quoteReceipt.mjs";
import { quoteDeliveryUnavailable } from "./quoteDelivery.mjs";
import {
  QUOTE_POST_MAX_RUN_MS,
  QuoteBudgetExceededError,
  createQuoteAttempt,
  createQuoteDeadline,
  saveQuoteAttemptOutcome,
} from "./quoteTiming.mjs";

const MAX_DECLARED_REQUEST_BYTES = 4_400_000;
const MAX_FORM_ENTRIES = 64;
const MAX_PARSED_REQUEST_BYTES = 4_200_000;
const REQUIRED_FIELDS = ["make", "model", "year", "name", "phone", "suburb"];
const OPTIONAL_FIELDS = [
  "kilometres",
  "transmission",
  "condition",
  "email",
  "message",
];

const quoteConflict = Object.freeze({
  ok: false,
  error: "This quote attempt no longer matches the original request. Please refresh and try again.",
});

const quoteTooLarge = Object.freeze({
  ok: false,
  error: "The quote request is too large. Please remove some photos and retry.",
});

class QuoteRequestTooLargeError extends Error {}

function json(body, status, headers) {
  return Response.json(body, { status, headers });
}

function field(form, key) {
  const value = form.get(key);
  return typeof value === "string" ? value.trim().slice(0, 2_000) : "";
}

function parsedFormIsTooLarge(form) {
  let bytes = 0;
  let entries = 0;
  for (const [key, value] of form.entries()) {
    entries += 1;
    if (entries > MAX_FORM_ENTRIES) return true;
    bytes += Buffer.byteLength(key);
    bytes += typeof value === "string" ? Buffer.byteLength(value) : value.size;
    if (bytes > MAX_PARSED_REQUEST_BYTES) return true;
  }
  return false;
}

async function readBoundedFormData(request, signal) {
  if (!request.body) return request.formData();

  const reader = request.body.getReader();
  const chunks = [];
  let totalBytes = 0;
  while (true) {
    const { done, value } = await reader.read();
    signal.throwIfAborted();
    if (done) break;
    totalBytes += value.byteLength;
    if (totalBytes > MAX_DECLARED_REQUEST_BYTES) {
      // Stop pulling immediately. Node 24's multipart producer can emit a late
      // ERR_INVALID_STATE if this generated stream is cancelled after closing.
      reader.releaseLock();
      throw new QuoteRequestTooLargeError();
    }
    chunks.push(Buffer.from(value));
  }

  const headers = new Headers(request.headers);
  headers.delete("content-length");
  const boundedRequest = new Request(request.url, {
    method: request.method,
    headers,
    body: Buffer.concat(chunks, totalBytes),
  });
  return boundedRequest.formData();
}

function nextAttemptAt(now, attemptCount) {
  const minutes = Math.min(60, 2 ** Math.max(0, attemptCount - 1) * 5);
  return new Date(now.getTime() + minutes * 60 * 1_000).toISOString();
}

function acceptedResponse() {
  return json({ ok: true, delivered: true }, 200);
}

function storedResponse() {
  return json(quoteBackupReceived.body, quoteBackupReceived.status);
}

/** @param {any} options */
export function createQuotePostHandler(options = {}) {
  const {
    rateLimiter,
    store = null,
    mailer = null,
    normalizePhotos,
    now = () => new Date(),
    logger = console,
    retentionDays = 30,
    providerTimeout = runWithTimeout,
    createSubmissionId = randomUUID,
    clockMs = () => performance.now(),
  } = options;
  if (!rateLimiter?.consume || typeof normalizePhotos !== "function") {
    throw new TypeError("Quote handler dependencies are incomplete.");
  }
  return async function post(request) {
    const budget = createQuoteDeadline({ clockMs, maxRunMs: QUOTE_POST_MAX_RUN_MS, providerTimeout });
    const { bounded } = budget;
    let limit;
    try {
      limit = await bounded(() => rateLimiter.consume(request));
    } catch {
      return json(quoteDeliveryUnavailable.body, quoteDeliveryUnavailable.status);
    }
    if (!limit.allowed) {
      if (limit.rateLimited) {
        return json(
          { ok: false, error: "Too many quote requests. Please wait and try again." },
          429,
          { "Retry-After": String(limit.retryAfter ?? 600) },
        );
      }
      return json(quoteDeliveryUnavailable.body, quoteDeliveryUnavailable.status);
    }

    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.toLowerCase().startsWith("multipart/form-data")) {
      return json({ ok: false, error: "Invalid form submission." }, 400);
    }
    const declaredLengthHeader = request.headers.get("content-length");
    const declaredLength = declaredLengthHeader
      ? Number(declaredLengthHeader)
      : Number.NaN;
    if (
      Number.isFinite(declaredLength) &&
      declaredLength > MAX_DECLARED_REQUEST_BYTES
    ) {
      return json(quoteTooLarge, 413);
    }

    let form;
    try {
      form = await bounded((signal) => readBoundedFormData(request, signal));
    } catch (error) {
      if (error instanceof ProviderTimeoutError || error instanceof QuoteBudgetExceededError) {
        return json(quoteDeliveryUnavailable.body, quoteDeliveryUnavailable.status);
      }
      if (error instanceof QuoteRequestTooLargeError) {
        return json(quoteTooLarge, 413);
      }
      return json({ ok: false, error: "Invalid form submission." }, 400);
    }

    if (parsedFormIsTooLarge(form)) return json(quoteTooLarge, 413);

    // Deliberately deceive basic form-filling bots without claiming a real receipt.
    if (field(form, "website")) return json({ ok: true }, 200);

    const suppliedSubmissionId = field(form, "submissionId");
    if (suppliedSubmissionId && !isQuoteSubmissionId(suppliedSubmissionId)) {
      return json({ ok: false, error: "Invalid quote submission ID." }, 400);
    }
    // Current clients provide a stable retry identity. Generate one for older
    // callers so the original six-field API contract remains compatible.
    const submissionId = suppliedSubmissionId || createSubmissionId();
    if (!isQuoteSubmissionId(submissionId)) {
      throw new TypeError("The quote submission ID generator returned an invalid value.");
    }

    const lead = {};
    for (const key of [...REQUIRED_FIELDS, ...OPTIONAL_FIELDS]) {
      lead[key] = field(form, key);
    }

    const missing = REQUIRED_FIELDS.filter((key) => !lead[key]);
    if (missing.length) {
      return json(
        { ok: false, error: `Missing required fields: ${missing.join(", ")}.` },
        400,
      );
    }
    if (lead.phone.replace(/\D/g, "").length < 8) {
      return json({ ok: false, error: "Please provide a valid phone number." }, 400);
    }
    if (lead.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) {
      return json(
        {
          ok: false,
          error: "Please provide a valid email address, or leave it blank.",
        },
        400,
      );
    }

    const photoEntries = form
      .getAll("photos")
      .filter((entry) => entry instanceof File && entry.size > 0);
    if (photoEntries.length > MAX_PHOTOS) {
      return json(
        { ok: false, error: `Please attach no more than ${MAX_PHOTOS} photos.` },
        400,
      );
    }
    const rawPhotoBytes = photoEntries.reduce(
      (total, photo) => total + photo.size,
      0,
    );
    if (rawPhotoBytes > MAX_RAW_PHOTO_TOTAL_BYTES) {
      return json(quoteTooLarge, 413);
    }

    let photos;
    try {
      photos = await bounded(() => normalizePhotos(photoEntries));
    } catch (error) {
      if (error instanceof ProviderTimeoutError || error instanceof QuoteBudgetExceededError) {
        return json(quoteDeliveryUnavailable.body, quoteDeliveryUnavailable.status);
      }
      if (error instanceof QuoteImageValidationError) {
        return json({ ok: false, error: error.message }, 400);
      }
      return json({ ok: false, error: "One or more photos could not be read." }, 400);
    }

    if (!store) {
      logQuoteOperationalEvent(
        "quote.backup.unavailable",
        { phase: "pre_delivery" },
        { level: "error", logger },
      );
      return json(quoteDeliveryUnavailable.body, quoteDeliveryUnavailable.status);
    }

    const receivedAt = now();
    const record = createQuoteOutboxRecord({
      lead,
      photos,
      submissionId,
      receivedAt,
      retentionDays,
    });

    try {
      const receipt = await bounded(
        (signal) => store.readReceipt(submissionId, signal),
      );
      if (receipt?.receipt) {
        return receipt.receipt.payloadDigest === record.payloadDigest
          ? acceptedResponse()
          : json(quoteConflict, 409);
      }
    } catch {
      logQuoteOperationalEvent(
        "quote.receipt.lookup_failed",
        { submissionId },
        { level: "error", logger },
      );
      return json(quoteDeliveryUnavailable.body, quoteDeliveryUnavailable.status);
    }

    let staged;
    try {
      staged = await bounded(
        (signal) => store.create(record, signal),
      );
    } catch {
      logQuoteOperationalEvent(
        "quote.backup.failed",
        { phase: "pre_delivery", submissionId },
        { level: "error", logger },
      );
      return json(quoteDeliveryUnavailable.body, quoteDeliveryUnavailable.status);
    }

    if (!staged.created) {
      if (staged.stored.record.payloadDigest !== record.payloadDigest) {
        return json(quoteConflict, 409);
      }
      if (staged.stored.record.state === "accepted_cleanup_pending") {
        return acceptedResponse();
      }
      return storedResponse();
    }

    let stored = staged.stored;

    if (!mailer) {
      try {
        stored = await bounded(
          (signal) =>
            store.update(
              stored,
              {
                state: "delivery_unavailable",
                lastOutcome: "provider_unavailable",
                nextAttemptAt: nextAttemptAt(receivedAt, 1),
              },
              receivedAt,
              signal,
            ),
        );
      } catch {
        logQuoteOperationalEvent(
          "quote.backup.state_update_failed",
          { state: "delivery_unavailable", submissionId },
          { level: "error", logger },
        );
      }
      logQuoteOperationalEvent(
        "quote.backup.stored",
        { state: "delivery_unavailable", submissionId },
        { logger },
      );
      return storedResponse();
    }

    // Staging is already durable. Leave it to recovery if all three remaining
    // operations (claim, send and outcome) cannot finish before this deadline.
    if (!budget.canStartAttempt()) {
      logQuoteOperationalEvent(
        "quote.backup.stored",
        { state: "staged", reason: "request_budget", submissionId },
        { logger },
      );
      return storedResponse();
    }

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
    } catch {
      logQuoteOperationalEvent(
        "quote.backup.state_update_failed",
        { state: "sending", submissionId },
        { level: "error", logger },
      );
      return storedResponse();
    }

    let outcome;
    try {
      outcome = await budget.send((signal) => mailer.send(stored.record, { signal }));
    } catch (error) {
      outcome = {
        status: error instanceof QuoteBudgetExceededError ? "not_sent" : "unknown",
        reason:
          error instanceof QuoteBudgetExceededError ? "request_budget" :
            error instanceof ProviderTimeoutError ? "provider_timeout" : "provider_error",
      };
    }

    if (outcome.status !== "accepted") {
      const state = outcome.status === "rejected" ? "delivery_rejected" :
        outcome.status === "not_sent" ? "delivery_unavailable" : "delivery_unknown";
      try {
        stored = await saveQuoteAttemptOutcome({
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
      } catch {
        logQuoteOperationalEvent(
          "quote.backup.state_update_failed",
          { state, submissionId },
          { level: "error", logger },
        );
      }
      logQuoteOperationalEvent(
        "quote.backup.stored",
        { state, submissionId },
        { logger },
      );
      return storedResponse();
    }

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
      await bounded(
        (signal) => store.remove(stored, signal),
      );
    } catch {
      logQuoteOperationalEvent(
        "quote.backup.cleanup_failed",
        { state: "accepted_cleanup_pending", submissionId },
        { level: "error", logger },
      );
    }

    return acceptedResponse();
  };
}
