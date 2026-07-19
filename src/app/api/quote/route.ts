import { NextResponse } from "next/server";
import { Resend } from "resend";
import { site } from "@/config/site";

export const runtime = "nodejs";

const MAX_PHOTOS = 5;
const MAX_PHOTO_BYTES = 3_000_000;
const MAX_TOTAL_BYTES = 4_200_000;

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

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Email delivery not configured yet — log the lead so it isn't lost,
    // and still show the visitor a success message.
    console.log("[quote lead — RESEND_API_KEY not set, not emailed]", {
      ...lead,
      photos: photos.map((p) => `${p.name} (${Math.round(p.size / 1024)} KB)`),
    });
    return NextResponse.json({ ok: true, delivered: false });
  }

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

  try {
    const resend = new Resend(apiKey);
    const attachments = await Promise.all(
      photos.map(async (photo, i) => ({
        filename: photo.name || `photo-${i + 1}.jpg`,
        content: Buffer.from(await photo.arrayBuffer()),
      })),
    );

    const { error } = await resend.emails.send({
      from: process.env.QUOTE_FROM_EMAIL ?? "Carbase Website <onboarding@resend.dev>",
      to: process.env.QUOTE_TO_EMAIL ?? site.email,
      replyTo: lead.email || undefined,
      subject: `New quote request: ${summary} — ${lead.name} (${lead.phone})`,
      html,
      attachments,
    });

    if (error) {
      console.error("[quote lead] Resend error:", error, { lead: { ...lead } });
      return NextResponse.json(
        { ok: false, error: "We couldn't send your request just now — please call us instead." },
        { status: 502 },
      );
    }
  } catch (err) {
    console.error("[quote lead] send failed:", err, { lead: { ...lead } });
    return NextResponse.json(
      { ok: false, error: "We couldn't send your request just now — please call us instead." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, delivered: true });
}
