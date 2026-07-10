# CheckMyBasket — Next Session Brief

**For:** a fresh Claude Code session, working in `~/giftcircle`
**Written:** 10 July 2026, after the launch-polish session

## Context in three sentences

CheckMyBasket (checkmybasket.vercel.app, repo `checkmybasket/checkmybasket`, branch `main`) is a UK Secret Santa web app — no accounts (Supabase anonymous auth), no ads, RLS-enforced privacy. It is fully wired end-to-end and live: create → join → draw → reveal → anonymous messages → Gift Predictions all verified against production Supabase (`nejkvrzabdetsnhpeqtl`, eu-west-2). History and decisions live in `SCAFFOLD-REVIEW.md`; product specs live in `docs/` (8 strategy documents — the Game Replacement Brief and rebrand brief are the ones you'll need).

## Your tasks, in order

### 1. Real QR code on the share screens (I10)
`app/create/page.tsx` (share step) and `app/g/[group_id]/settings/page.tsx` show a permanent shimmering QR *placeholder* that looks broken. Render a real QR code for the invite link (`{origin}/join/{invite_code}`).
- **No new npm packages without explicit approval** — write a small dependency-free QR encoder (SVG output) in `lib/qr.ts`, or ask Hassan before adding a package.
- Style: dark modules in brand forest green `#1B4332` on white, rounded container matching the existing card.

### 2. Gift Predictions 48-hour auto-close
The Game Replacement Brief (docs/GiftCircle-Game-Replacement-Brief.md, "How It Works") says a prediction round closes when everyone has submitted, the organiser closes it, **or after 48 hours** (auto-close with whoever has submitted). The organiser-reveal path exists; the 48h path does not.
- Prefer **`pg_cron`** in Supabase (extension list → enable if needed) calling a SQL function that flips `prediction_rounds.status` from `'open'` to `'revealed'` where `created_at < now() - interval '48 hours'`. No new services.
- Apply via the Supabase MCP `apply_migration`, then **mirror the SQL into `supabase/migrations/` with the exact applied version timestamp** (query `supabase_migrations.schema_migrations` for it). This mirror-after-apply workflow is established — look at the 7 existing migration files.

### 3. If time remains (ask Hassan first)
- `--gc-*` → `--cmb-*` CSS token rename (one mechanical pass over `app/globals.css` + every page; cosmetic).
- Lighthouse pass on the landing page (target 90+; it's static and light).
- Email notifications (backlog GC-021/022, P1) — needs a Resend account decision from Hassan; don't start without him.

## Rules of the road (hard-won — do not relearn these)

- **Next.js 16** with breaking changes: read `node_modules/next/dist/docs/` before writing framework code (AGENTS.md mandates this). `params` is a `Promise` (use `use(params)` client-side), middleware is `proxy.ts`, metadata for client pages goes in a segment `layout.tsx`.
- **RLS is strict**: several tables deny `select=*` (column grants) — always select explicit columns. `draws` rows are giver-visible only. `anon_messages` has no readable `sender_id`. Wishlist claims are invisible to the item's owner. Don't "fix" any of this; it's the product's core promise.
- **Push to `main` auto-deploys Vercel production.** Build locally first (`cd ~/giftcircle && npx next build`), verify in the preview (`checkmybasket-dev`, port 3100), then push.
- **Verify by driving the app**, not by grepping bundles — the Supabase client lives in a lazy chunk. If you create test data in prod Supabase, delete it afterwards (delete the group, then orphaned `auth.users` where `is_anonymous`).
- **Do NOT touch the `checkmybasket.co.uk` domain** — it still points at an old site; cutover is Hassan-triggered. (Known consequence: og:image previews won't render until then.)
- **Vercel CLI token is stale** — use the dashboard via Hassan's Chrome if Vercel changes are needed.
- Brand: forest `#1B4332`, gold `#D4A574`, cream `#FFF8F0`, Fraunces + DM Sans, UK English, no ads ever, no accounts, minimal data.
- Commits: one-line summary + bulleted breakdown. When a phase is done, update `SCAFFOLD-REVIEW.md` and propose the next phase — don't wait to be asked.
