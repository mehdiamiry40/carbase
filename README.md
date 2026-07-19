# Carbase — Cash for Cars, Brisbane & Gold Coast

Marketing + lead-generation website for Carbase, built with [Next.js](https://nextjs.org) (App Router), TypeScript and Tailwind CSS v4.

## What's inside

| Route | Purpose |
| --- | --- |
| `/` | Home — hero with the quote form, trust bar, how-it-works, testimonials, areas, FAQ teaser |
| `/quote` | Full quote page (main call-to-action) |
| `/how-it-works` | The 4-step selling process + pickup checklist |
| `/about` | About the business |
| `/faq` | All FAQs, with `FAQPage` structured data for Google |
| `/service-areas` | Index of covered regions |
| `/service-areas/[slug]` | Local SEO pages: Brisbane, Gold Coast, Logan, Ipswich, Redlands, Moreton Bay |
| `/privacy` | Starter privacy policy |
| `/api/quote` | Receives quote form submissions (incl. photos) and emails them to you |

Also included: sitemap (`/sitemap.xml`), robots rules, LocalBusiness structured data, Open Graph share image, sticky mobile call/quote bar.

## ✅ Before you launch — checklist

1. **`src/config/site.ts`** — replace every `PLACEHOLDER` value: phone number, email, hours, ABN, legal name. The whole site updates from this one file.
2. **`src/data/testimonials.ts`** — the reviews in there are **samples for layout only**. Replace them with real reviews from real customers (with permission). Don't launch with invented reviews.
3. **`src/data/faqs.ts`** — read through the answers and make sure they match how you actually operate (payment method, finance payouts, areas, etc.).
4. **`src/data/areas.ts`** — adjust regions/suburbs to your real coverage.
5. **Email delivery** — copy `.env.example` to `.env`, sign up at [resend.com](https://resend.com) (free tier is plenty), and set:
   - `RESEND_API_KEY` — your API key
   - `QUOTE_TO_EMAIL` — the inbox that should receive leads
   - `QUOTE_FROM_EMAIL` — keep the default while testing; switch to your own verified domain sender for production
   Until the key is set, the form still works and leads are logged to the server console instead of emailed.
6. **`NEXT_PUBLIC_SITE_URL`** — set to your real domain when you connect one (used for SEO tags and the sitemap).
7. **`/privacy`** — starter text only, not legal advice; review before launch.

## Develop

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
```

## Deploy

The site deploys cleanly to [Vercel](https://vercel.com) — import the repo, add the environment variables from `.env.example`, and deploy. Remember to add `RESEND_API_KEY`, `QUOTE_TO_EMAIL` and `NEXT_PUBLIC_SITE_URL` in the Vercel project settings.
