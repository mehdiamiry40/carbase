<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Carbase project instructions

Carbase is a single Next.js 16 (App Router, Turbopack) marketing + lead-gen site. There is no relational database, separate backend service, or monorepo. Its two API routes are public quote intake (`/api/quote`) and authenticated recovery (`/api/cron/quote-outbox`), backed by a private Vercel Blob outbox.

- Install with `npm install`; `npm run dev` serves the site at `http://localhost:3000`. Before committing, run `npm test`, `npm run typecheck`, and `npm run build`.
- Vercel builds run `npm run verify:deployment`, which must pass unit tests, type checking, lint, the production build and mocked browser tests before publication. Browser tests must never use live delivery credentials.
- Carbase serves the Toowoomba Region only. Keep customer-facing service claims, location content, metadata, structured data, canonicals, and the sitemap scoped to that region; do not add other service locations. The canonical production origin is `https://carbase.au`.
- Quote form (`POST /api/quote`): required fields are `make`, `model`, `year`, `name`, `phone`, `suburb`. Before calling Resend, stage the complete lead atomically in the private Vercel Blob outbox configured by `BLOB_READ_WRITE_TOKEN`; use bounded provider operations and an idempotency key, delete the staged object only after confirmed email acceptance, and retain it on failure. The endpoint may claim safe receipt only after confirmed email delivery or private persistence, must preserve the existing failure response if both paths fail, and must never log customer, vehicle, photo, provider-error or secret values. `QUOTE_TO_EMAIL` and `QUOTE_FROM_EMAIL` are optional server-side overrides documented in `.env.example`.
- Remote images (`images.unsplash.com`) are configured in `next.config.ts`; pages still work if they fail to load.
