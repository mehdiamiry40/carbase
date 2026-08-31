import { site } from "@/config/site";
import { resolveQuoteBackup } from "@/lib/quoteBackup.mjs";
import { createQuotePostHandler } from "@/lib/quoteHandler.mjs";
import { normalizeQuotePhotos } from "@/lib/quoteImages.mjs";
import { resolveQuoteDelivery } from "@/lib/quoteDelivery.mjs";
import { createResendQuoteMailer } from "@/lib/quoteMailer.mjs";
import { createVercelQuoteStore } from "@/lib/quoteOutbox.mjs";
import { createQuoteRateLimiter } from "@/lib/quoteRateLimit.mjs";

export const runtime = "nodejs";
export const maxDuration = 30;

// Verified private destination for quote leads. Keep this server-side: it is
// not a public NAP/contact email and must not be emitted into page metadata.
const DEFAULT_QUOTE_TO_EMAIL = "mehdiamiry40@gmail.com";

function retentionDays() {
  const value = Number(process.env.QUOTE_OUTBOX_RETENTION_DAYS ?? 30);
  return Number.isInteger(value) && value >= 1 && value <= 30 ? value : 30;
}

export async function POST(request: Request) {
  const backup = resolveQuoteBackup(process.env);
  const delivery = resolveQuoteDelivery(process.env, DEFAULT_QUOTE_TO_EMAIL);
  const store = createVercelQuoteStore({ token: backup?.token });
  const mailer = delivery
    ? createResendQuoteMailer({ ...delivery, siteName: site.name })
    : null;
  const handler = createQuotePostHandler({
    rateLimiter: createQuoteRateLimiter(),
    store,
    mailer,
    normalizePhotos: normalizeQuotePhotos,
    retentionDays: retentionDays(),
  });

  return handler(request);
}
