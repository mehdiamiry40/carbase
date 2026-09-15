# Carbase — Brisbane Car Buyers

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
| `/service-areas` | Brisbane suburb coverage hub |
| `/service-areas/brisbane` | Permanent redirect to the canonical coverage hub |
| `/cash-for-cars-brisbane` | Dedicated cash-for-cars Brisbane landing page |
| `/car-removal-brisbane` | Dedicated car-removal Brisbane landing page |
| `/cash-for-cars-toowoomba`, `/car-removal-toowoomba`, `/service-areas/toowoomba` | Permanent redirects from the retired Toowoomba Region URLs (`next.config.ts`) |
| `/privacy` | Privacy and retention policy |
| `/api/quote` | Receives quote form submissions (incl. photos) through a private outbox, then emails them |
| `/api/cron/quote-outbox` | Authenticated recovery, cleanup and retention worker invoked by Vercel Cron |

Also included: sitemap (`/sitemap.xml`), robots rules, Organization and service structured data, Open Graph share image, sticky mobile call/quote bar.

## Configuration checklist

1. **`src/config/site.ts`** — verified operator name, Brisbane operating base, ABN, public phone and hours live here. No street address is configured for the service-area business. Update this single source if the business changes them.
2. **`src/data/testimonials.ts`** — intentionally empty. Add only reviews supplied by real customers with permission.
3. **`src/data/faqs.ts`** — read through the answers and make sure they match how you actually operate (payment method, finance payouts, areas, etc.).
4. **`src/data/areas.ts`** — keep the Brisbane suburb list aligned with the locations you genuinely collect from.
5. **Email delivery** — copy `.env.example` to `.env`, sign up at [resend.com](https://resend.com), and set:
   - `RESEND_API_KEY` — your API key
   - `QUOTE_TO_EMAIL` — optional; defaults to the verified server-side quote inbox
   - `QUOTE_FROM_EMAIL` — optional; keep the testing sender until you have a verified domain
   - `BLOB_READ_WRITE_TOKEN` — connect a **private** Vercel Blob store for the delivery outbox
   - `CRON_SECRET` — at least 32 random bytes for the outbox cron bearer token
   - `QUOTE_RATE_LIMIT_MODE` — use `enforce` only after publishing the Vercel Firewall rule with rate-limit ID `quote-submit`

   The browser creates one UUIDv4 per logical form attempt. It waits for selected photos to finish processing and locks the submitted details while sending. The server verifies and re-encodes every accepted photo to a controlled JPEG, then atomically creates one private, non-overwriting outbox envelope under `quote-lead-backups/v2/`. Resend is unreachable until that stage succeeds. Blob state changes and deletion use ETag preconditions, and the same submission ID becomes the Resend idempotency key. Confirmed provider acceptance creates a short-lived, non-PII receipt before the full payload is deleted. Provider failure, ambiguity or insufficient request time after staging retains the private payload and returns `202` with `delivered: false` and `safelyStored: true`. Missing or failed mandatory staging returns `503` and does not call Resend. One request deadline reserves time for outcome persistence and response; attempt identities prevent a late result from overwriting another attempt. Customer, vehicle, photo, provider-error and secret values are never written to application logs.

   `vercel.json` invokes the authenticated outbox worker every ten minutes. Recovery defaults to `observe`; switch `QUOTE_OUTBOX_RECOVERY_MODE` to `live` after isolated preview tests and idempotency verification. Observe mode still performs expiry deletion, accepted-payload cleanup, expired-lease transitions and checkpoint writes; it only disables automatic sending. Payload deletion is scheduled after `QUOTE_OUTBOX_RETENTION_DAYS` (30 by default) and happens on a subsequent successful cleanup run, not through a storage TTL. Ambiguous deliveries and dead letters remain explicit manual-review items. Failed provider/storage work makes the cron response `503`; retained manual-review work is separately reported in error-level operational events. Alert on `quote.backup.*`, `quote.outbox.*`, `quote.delivery.*`, and `quote.rate_limit.*` events. Events contain only fixed operational fields and non-personal submission IDs. See [the quote operations runbook](docs/quote-operations.md).

   The Rate Limiting SDK requires a published Vercel Firewall rule whose `@vercel/firewall` Rate Limit ID is exactly `quote-submit`. Roll it out in log mode, enforce it in preview, review traffic, then publish production enforcement before setting `QUOTE_RATE_LIMIT_MODE=enforce`.
6. **`NEXT_PUBLIC_SITE_URL`** — set to your real domain when you connect one (used for SEO tags and the sitemap).
7. **Analytics** — set `NEXT_PUBLIC_GA_MEASUREMENT_ID` to the GA4 web stream ID. The site records page views, successful quote requests as `generate_lead`, and phone-link clicks as `phone_click`; quote and vehicle details are never included in analytics events.
8. **`/privacy`** — keep the policy aligned with actual provider, mailbox and retention practices. Operational cleanup is scheduled and may be delayed by outages; do not describe it as a guaranteed storage TTL.

## Develop

```bash
npm install
npm test
npm run typecheck
npm run dev     # http://localhost:3000
npm run build   # production build
```

## Deploy

Vercel runs `npm run verify:deployment` before it can publish an artifact. This executes the unit tests, type check, lint, normal production build and mocked browser tests. Any failure stops publication, independently of GitHub branch-protection entitlement. GitHub CI continues to run its own checks. The Linux build uses a pinned Chromium package only for verification; it is not imported by application functions. The browser test server has delivery/storage credentials cleared.

Connect a private Blob store, add the environment variables from `.env.example`, and deploy. Keep preview storage isolated from production. Configure `RESEND_API_KEY`, `BLOB_READ_WRITE_TOKEN`, `CRON_SECRET`, the quote outbox settings, `QUOTE_TO_EMAIL`, `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_GA_MEASUREMENT_ID` in the appropriate Vercel environment. The quote and cron functions are pinned to `syd1`. Follow [the quote operations runbook](docs/quote-operations.md) for verified rollout and rollback. Do not bypass the gate with an unverified prebuilt artifact.
