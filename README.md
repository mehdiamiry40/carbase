# Carbase — Toowoomba Region Car Buyers

Marketing + lead-generation website for Carbase, built with [Next.js](https://nextjs.org) (App Router), TypeScript and Tailwind CSS v4.

## What's inside

| Route                      | Purpose                                                                       |
| -------------------------- | ----------------------------------------------------------------------------- |
| `/`                        | Home — hero with the quote form, benefits, how-it-works, areas and FAQ teaser |
| `/quote`                   | Full quote page (main call-to-action)                                         |
| `/how-it-works`            | The 4-step selling process + pickup checklist                                 |
| `/about`                   | About the business                                                            |
| `/faq`                     | All FAQs, with `FAQPage` structured data for Google                           |
| `/blog`                    | Car selling guides and practical vehicle advice                               |
| `/blog/[slug]`             | Statically generated guide pages with article structured data                 |
| `/service-areas`           | Toowoomba Region suburb and town coverage hub                                 |
| `/service-areas/toowoomba` | Permanent redirect to the canonical coverage hub                              |
| `/cash-for-cars-toowoomba` | Dedicated cash-for-cars Toowoomba landing page                                |
| `/car-removal-toowoomba`   | Dedicated car-removal Toowoomba landing page                                  |
| `/privacy`                 | Starter privacy policy                                                        |
| `/api/quote`               | Receives quote form submissions (incl. photos) and emails them to you         |

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
     Without an API key the quote endpoint returns `503`, the form shows the customer an error, and no customer details are written to logs.
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

The site deploys cleanly to [Vercel](https://vercel.com) — import the repo, add the environment variables from `.env.example`, and deploy. Remember to add `RESEND_API_KEY`, `QUOTE_TO_EMAIL`, `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_GA_MEASUREMENT_ID` in the Vercel project settings.
