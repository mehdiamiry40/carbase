import { site } from "@/config/site";
import { isAuthorizedCronRequest } from "@/lib/cronAuth.mjs";
import { resolveQuoteBackup } from "@/lib/quoteBackup.mjs";
import { resolveQuoteDelivery } from "@/lib/quoteDelivery.mjs";
import { createResendQuoteMailer } from "@/lib/quoteMailer.mjs";
import { createVercelQuoteStore } from "@/lib/quoteOutbox.mjs";
import { createQuoteOutboxProcessor } from "@/lib/quoteRecovery.mjs";

export const runtime = "nodejs";
export const maxDuration = 60;

const DEFAULT_QUOTE_TO_EMAIL = "mehdiamiry40@gmail.com";

function enumValue<T extends string>(
  value: string | undefined,
  allowed: readonly T[],
  fallback: T,
): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

function boundedInteger(
  value: string | undefined,
  fallback: number,
  minimum: number,
  maximum: number,
) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= minimum && parsed <= maximum
    ? parsed
    : fallback;
}

export async function GET(request: Request) {
  if (!isAuthorizedCronRequest(request, process.env.CRON_SECRET)) {
    return Response.json(
      { ok: false, error: "Unauthorized." },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  const backup = resolveQuoteBackup(process.env);
  const store = createVercelQuoteStore({ token: backup?.token });
  if (!store) {
    return Response.json(
      { ok: false, error: "Quote outbox is unavailable." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  const delivery = resolveQuoteDelivery(process.env, DEFAULT_QUOTE_TO_EMAIL);
  const mailer = delivery
    ? createResendQuoteMailer({ ...delivery, siteName: site.name })
    : null;
  const processor = createQuoteOutboxProcessor({
    store,
    mailer,
    mode: enumValue(
      process.env.QUOTE_OUTBOX_RECOVERY_MODE,
      ["observe", "live"] as const,
      "observe",
    ),
    batchSize: boundedInteger(process.env.QUOTE_OUTBOX_BATCH_SIZE, 5, 1, 25),
    maxAttempts: boundedInteger(
      process.env.QUOTE_OUTBOX_MAX_ATTEMPTS,
      5,
      1,
      10,
    ),
  });

  const result = await processor();
  return Response.json(
    { ok: true, ...result },
    { headers: { "Cache-Control": "no-store" } },
  );
}
