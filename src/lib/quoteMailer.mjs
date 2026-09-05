import { Resend } from "resend";
import { runWithTimeout } from "./quoteBackup.mjs";

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function headerText(value) {
  return String(value).replace(/[\u0000-\u001f\u007f]+/g, " ").trim();
}

const DEFINITE_REJECTION_ERRORS = new Set([
  "missing_required_field",
  "invalid_idempotency_key",
  "invalid_idempotent_request",
  "invalid_access",
  "invalid_parameter",
  "invalid_region",
  "missing_api_key",
  "invalid_api_Key",
  "invalid_from_address",
  "validation_error",
  "not_found",
  "method_not_allowed",
]);

export function classifyResendError(error) {
  return DEFINITE_REJECTION_ERRORS.has(error?.name)
    ? { status: "rejected", reason: "provider_rejected" }
    : { status: "unknown", reason: "provider_ambiguous" };
}

export function createQuoteEmail(record, siteName = "Carbase") {
  const { lead, photos } = record;
  const summary = headerText(`${lead.year} ${lead.make} ${lead.model}`);
  const rows = [
    ["Car", summary],
    ["Kilometres", lead.kilometres || "—"],
    ["Transmission", lead.transmission || "—"],
    ["Condition", lead.condition || "—"],
    ["Name", lead.name],
    ["Phone", lead.phone],
    ["Email", lead.email || "—"],
    ["Suburb", lead.suburb],
    ["Message", lead.message || "—"],
  ];

  const html = `
    <h2 style="font-family:sans-serif">New quote request — ${escapeHtml(summary)}</h2>
    <table style="font-family:sans-serif;border-collapse:collapse">
      ${rows
        .map(
          ([label, value]) =>
            `<tr>
              <td style="padding:6px 16px 6px 0;color:#64748b;vertical-align:top">${escapeHtml(label)}</td>
              <td style="padding:6px 0;font-weight:600;white-space:pre-wrap">${escapeHtml(value)}</td>
            </tr>`,
        )
        .join("")}
    </table>
    <p style="font-family:sans-serif;color:#64748b">${photos.length} photo(s) attached. Sent from the ${escapeHtml(siteName)} website quote form.</p>
  `;

  return {
    subject: `New quote request: ${summary} — ${headerText(lead.name)} (${headerText(lead.phone)})`,
    html,
    replyTo: lead.email || undefined,
    attachments: photos.map((photo) => ({
      filename: photo.filename,
      content: Buffer.from(photo.contentBase64, "base64"),
      contentType: photo.contentType,
    })),
  };
}

export function createResendQuoteMailer({
  apiKey,
  destination,
  sender,
  siteName = "Carbase",
  ResendClient = Resend,
  timeout = runWithTimeout,
  timeoutMs = 8_000,
}) {
  if (!apiKey || !destination || !sender) return null;

  return {
    async send(record, { signal: parentSignal } = {}) {
      parentSignal?.throwIfAborted();
      const resend = new ResendClient(apiKey);
      const message = createQuoteEmail(record, siteName);
      const result = await timeout(
        (signal) =>
          resend.emails.send(
            {
              from: sender,
              to: destination,
              replyTo: message.replyTo,
              subject: message.subject,
              html: message.html,
              attachments: message.attachments,
            },
            {
              idempotencyKey: `carbase-quote-${record.submissionId}`,
              signal: parentSignal ? AbortSignal.any([signal, parentSignal]) : signal,
            },
          ),
        timeoutMs,
      );

      // Resend represents network/abort and server failures as application_error.
      // Those results are ambiguous: the outbox must retain them without auto-resend.
      if (result?.error) return classifyResendError(result.error);
      if (result?.data?.id) {
        return { status: "accepted", providerMessageId: result.data.id };
      }
      return { status: "unknown" };
    },
  };
}
