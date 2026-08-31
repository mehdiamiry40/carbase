# Carbase — Toowoomba Region Car Buyers

Marketing + lead-generation website for Carbase, built with [Next.js](https://nextjs.org) (App Router), TypeScript and Tailwind CSS v4.

## What's inside

| Route | Purpose |
| --- | --- |
| `/` | Home — hero with the quote form, benefits, how-it-works, areas and FAQ teaser |
| `/quote` | Full quote page (main call-to-action) |
| `/how-it-works` | The 4-step selling process + pickup checklist |
| `/about` | About the business |
| `/faq` | All FAQs, with `FAQPage` structured data for Google |
| `/blog` | Car selling guides and practical vehicle advice |
| `/blog/[slug]` | Statically generated guide pages with article structured data |
| `/service-areas` | Toowoomba Region suburb and town coverage hub |
| `/service-areas/toowoomba` | Permanent redirect to the canonical coverage hub |
| `/cash-for-cars-toowoomba` | Dedicated cash-for-cars Toowoomba landing page |
| `/car-removal-toowoomba` | Dedicated car-removal Toowoomba landing page |
| `/privacy` | Starter privacy policy |
| `/api/quote` | Receives quote form submissions (incl. photos) through a private outbox, then emails them |
| `/api/cron/quote-outbox` | Authenticated recovery, cleanup and retention worker invoked by Vercel Cron |

Also included: sitemap (`/sitemap.xml`), robots rules, Organization and service structured data, Open Graph share image, sticky mobile call/quote bar.

## Configuration checklist

1. **`src/config/site.ts`** — verified operator name, Toowoomba operating base, ABN, public phone and hours live here. No street address is configured for the service-area business. Update this single source if the business changes them.
2. **`src/data/testimonials.ts`** — intentionally empty. Add only reviews supplied by real customers with permission.
3. **`src/data/faqs.ts`** — read through the answers and make sure they match how you actually operate (payment method, finance payouts, areas, etc.).
4. **`src/data/areas.ts`** — keep the Toowoomba Region suburb and town list aligned with the locations you genuinely collect from.
5. **Email delivery** — copy `.env.example` to `.env`, sign up at [resend.com](https://resend.com), and set:
   - `RESEND_API_KEY` — your API key
   - `QUOTE_TO_EMAIL` — optional; defaults to the verified server-side quote inbox
   - `QUOTE_FROM_EMAIL` — optional; keep the testing sender until you have a verified domain
   - `BLOB_READ_WRITE_TOKEN` — connect a **private** Vercel Blob store for the delivery outbox
   - `CRON_SECRET` — at least 32 random bytes for the outbox cron bearer token
   - `QUOTE_RATE_LIMIT_MODE` — use `enforce` only after publishing the Vercel Firewall rule with rate-limit ID `quote-submit`

   The browser creates one UUIDv4 per logical form attempt. The server verifies and re-encodes every accepted photo to a controlled JPEG, then atomically creates one private, non-overwriting outbox envelope under `quote-lead-backups/v2/`. Resend is unreachable until that stage succeeds. Blob state changes and deletion use ETag preconditions, and the same submission ID becomes the Resend idempotency key. Confirmed delivery creates a short-lived, non-PII receipt before the full payload is deleted. Provider failure or ambiguity retains the private payload and returns `202` with `delivered: false` and `safelyStored: true`. Missing or failed mandatory staging returns `503` and does not call Resend. Customer, vehicle, photo, provider-error and secret values are never written to application logs.

   `vercel.json` invokes the authenticated outbox worker every ten minutes. Recovery defaults to `observe`; switch `QUOTE_OUTBOX_RECOVERY_MODE` to `live` only after isolated preview tests and Resend idempotency verification. Payloads expire after `QUOTE_OUTBOX_RETENTION_DAYS` (30 by default), accepted payload orphans are cleaned without resending, and ambiguous delivery states remain manual-review items. Alert on all `quote.backup.*`, `quote.outbox.*`, `quote.delivery.*`, and `quote.rate_limit.*` events. Events contain only fixed operational fields and non-personal submission IDs.

   The Rate Limiting SDK requires a published Vercel Firewall rule whose `@vercel/firewall` Rate Limit ID is exactly `quote-submit`. Roll it out in log mode, enforce it in preview, review traffic, then publish production enforcement before setting `QUOTE_RATE_LIMIT_MODE=enforce`.
6. **`NEXT_PUBLIC_SITE_URL`** — set to your real domain when you connect one (used for SEO tags and the sitemap).
7. **Analytics** — set `NEXT_PUBLIC_GA_MEASUREMENT_ID` to the GA4 web stream ID. The site records page views, successful quote requests as `generate_lead`, and phone-link clicks as `phone_click`; quote and vehicle details are never included in analytics events.
8. **`/privacy`** — starter text only, not legal advice; review before launch.

## Develop

```bash
npm install
npm test
npm run typecheck
npm run dev     # http://localhost:3000
npm run build   # production build
```

## Deploy

The site deploys cleanly to [Vercel](https://vercel.com) — import the repo, connect a private Blob store, add the environment variables from `.env.example`, and deploy. Remember to add `RESEND_API_KEY`, `BLOB_READ_WRITE_TOKEN`, `CRON_SECRET`, the quote outbox settings, `QUOTE_TO_EMAIL`, `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_GA_MEASUREMENT_ID` in the Vercel project settings. The quote and cron functions are pinned to `syd1` in `vercel.json`.
