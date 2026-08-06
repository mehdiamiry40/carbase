<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

Carbase is a single Next.js 16 (App Router, Turbopack) marketing + lead-gen site. There is no database, backend service, or monorepo — only the dev server plus one dynamic API route (`/api/quote`).

- Run the app: `npm run dev` serves everything at `http://localhost:3000` (dev server started via `npm install` in the update script). `npm run build` produces the production build.
- Type checking / "lint": there is no ESLint or test tooling configured. `npm run build` runs the TypeScript type check, so use it as the type/CI gate before committing.
- Quote form (`POST /api/quote`): required fields are `make`, `model`, `year`, `name`, `phone`, `suburb`. When `RESEND_API_KEY` is unset, leads are logged to the server console and the API returns `{ ok: true, delivered: false }` — the form still shows success to the user, so email is optional for local testing. Set `RESEND_API_KEY`, `QUOTE_TO_EMAIL`, `QUOTE_FROM_EMAIL` (see `.env.example`) only to verify real email delivery.
- Remote images (`images.unsplash.com`) are configured in `next.config.ts`; pages still work if they fail to load.
