import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { site } from "@/config/site";
import {
  logQuoteBackupCleanupFailure,
  logQuoteBackupFailure,
  logQuoteBackupStored,
  logQuoteBackupUnavailable,
  persistQuoteBackup,
  quoteBackupReceived,
  removeQuoteBackup,
  resolveQuoteBackup,
  runWithTimeout,
} from "@/lib/quoteBackup.mjs";
import {
  logQuoteDeliveryFailure,
  logQuoteDeliveryUnavailable,
  quoteDeliveryFailed,
  quoteDeliveryUnavailable,
  resolveQuoteDelivery,
} from "@/lib/quoteDelivery.mjs";

export const runtime = "nodejs";
export const maxDuration = 30;

// Verified private destination for quote leads. Keep this server-side: it is
// not a public NAP/contact email and must not be emitted into page metadata.
const DEFAULT_QUOTE_TO_EMAIL = "mehdiamiry40@gmail.com";

const MAX_PHOTOS = 5;
const MAX_PHOTO_BYTES = 3_000_000;
const MAX_TOTAL_BYTES = 4_200_000;
const BACKUP_TIMEOUT_MS = 8_000;
const RESEND_TIMEOUT_MS = 8_000;
const CLEANUP_TIMEOUT_MS = 3_000;

const REQUIRED_FIELDS = ["make", "model", "year", "name", "phone", "suburb"] as const;
const OPTIONAL_FIELDS = [
  "kilometres",
  "transmission",
  "condition",
  "email",
  "message",
] as const;

function field(form: FormData, key: string): string {
  const value = form.get(key);
  return typeof value === "string" ? value.trim().slice(0, 2000) : "";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid form submission." },
      { status: 400 },
    );
  }

  // Honeypot: bots fill every field. Pretend success and drop it.
  if (field(form, "website")) {
    return NextResponse.json({ ok: true });
  }

  const lead: Record<string, string> = {};
  for (const key of [...REQUIRED_FIELDS, ...OPTIONAL_FIELDS]) {
    lead[key] = field(form, key);
  }

  const missing = REQUIRED_FIELDS.filter((key) => !lead[key]);
  if (missing.length) {
    return NextResponse.json(
      { ok: false, error: `Missing required fields: ${missing.join(", ")}.` },
      { status: 400 },
    );
  }
  if (lead.phone.replace(/\D/g, "").length < 8) {
    return NextResponse.json(
      { ok: false, error: "Please provide a valid phone number." },
      { status: 400 },
    );
  }
  if (lead.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) {
    return NextResponse.json(
      { ok: false, error: "Please provide a valid email address, or leave it blank." },
      { status: 400 },
    );
  }

  const photos = form
    .getAll("photos")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0)
    .slice(0, MAX_PHOTOS);

  let totalBytes = 0;
  for (const photo of photos) {
    totalBytes += photo.size;
    if (!photo.type.startsWith("image/")) {
      return NextResponse.json(
        { ok: false, error: "Only image files can be attached." },
        { status: 400 },
      );
    }
    if (photo.size > MAX_PHOTO_BYTES || totalBytes > MAX_TOTAL_BYTES) {
      return NextResponse.json(
        { ok: false, error: "Photos are too large — please remove some and retry." },
        { status: 400 },
      );
    }
  }

  const summary = `${lead.year} ${lead.make} ${lead.model}`;
  const delivery = resolveQuoteDelivery(process.env, DEFAULT_QUOTE_TO_EMAIL);
  const backup = resolveQuoteBackup(process.env);
  const submissionId = randomUUID();
  const receivedAt = new Date();

  async function storeBackup(
    reason: "resend_pending" | "resend_unavailable" | "resend_failed",
    phase: "pre_delivery" | "post_failure",
  ) {
    if (!backup) return null;
    try {
      return await runWithTimeout(
        (abortSignal) =>
          persistQuoteBackup({
            lead,
            photos,
            reason,
            submissionId,
            token: backup.token,
            receivedAt,
            abortSignal,
          }),
        BACKUP_TIMEOUT_MS,
      );
    } catch {
      logQuoteBackupFailure(phase);
      return null;
    }
  }

  if (!backup) logQuoteBackupUnavailable();

  let storedBackup = await storeBackup(
    delivery ? "resend_pending" : "resend_unavailable",
    "pre_delivery",
  );

  if (!delivery) {
    logQuoteDeliveryUnavailable();
    if (storedBackup) {
      logQuoteBackupStored("resend_unavailable", submissionId);
      return NextResponse.json(quoteBackupReceived.body, {
        status: quoteBackupReceived.status,
      });
    }
    return NextResponse.json(quoteDeliveryUnavailable.body, {
      status: quoteDeliveryUnavailable.status,
    });
  }

  const { apiKey, destination, sender } = delivery;

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
    <p style="font-family:sans-serif;color:#64748b">${photos.length} photo(s) attached. Sent from the ${escapeHtml(site.name)} website quote form.</p>
  `;

  let delivered = false;
  try {
    const resend = new Resend(apiKey);
    const attachments = await Promise.all(
      photos.map(async (photo, i) => ({
        filename: photo.name || `photo-${i + 1}.jpg`,
        content: Buffer.from(await photo.arrayBuffer()),
      })),
    );

    const { error } = await runWithTimeout(
      (signal) => {
        // Resend forwards request options to fetch at runtime. Keep the race in
        // runWithTimeout as the hard bound if a future SDK stops forwarding it.
        const requestOptions = {
          idempotencyKey: `carbase-quote-${submissionId}`,
          signal,
        };
        return resend.emails.send(
          {
            from: sender,
            to: destination,
            replyTo: lead.email || undefined,
            subject: `New quote request: ${summary} — ${lead.name} (${lead.phone})`,
            html,
            attachments,
          },
          requestOptions,
        );
      },
      RESEND_TIMEOUT_MS,
    );
    delivered = !error;
  } catch {
    // The lead is already staged before this bounded provider request starts.
  }

  if (!delivered) {
    logQuoteDeliveryFailure();
    storedBackup ||= await storeBackup("resend_failed", "post_failure");
    if (storedBackup) {
      logQuoteBackupStored("resend_failed", submissionId);
      return NextResponse.json(quoteBackupReceived.body, {
        status: quoteBackupReceived.status,
      });
    }
    return NextResponse.json(quoteDeliveryFailed.body, {
      status: quoteDeliveryFailed.status,
    });
  }

  if (storedBackup && backup) {
    try {
      await runWithTimeout(
        (abortSignal) =>
          removeQuoteBackup({
            pathname: storedBackup.pathname,
            token: backup.token,
            abortSignal,
          }),
        CLEANUP_TIMEOUT_MS,
      );
    } catch {
      // Email is confirmed; retain the private copy and alert for cleanup.
      logQuoteBackupCleanupFailure(submissionId);
    }
  }

  return NextResponse.json({ ok: true, delivered: true });
}
