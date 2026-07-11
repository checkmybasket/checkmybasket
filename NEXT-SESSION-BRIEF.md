# CheckMyBasket — Next Session Brief

**For:** a fresh Claude Code session, working in `~/giftcircle`
**Written:** 11 July 2026 (updated after the code-quality pass landed)
**Repo:** `checkmybasket/checkmybasket`, branch `main`, pushes auto-deploy Vercel prod. **Last commit: `32ab2a7`. Tree is clean and building.**
**Supabase:** `nejkvrzabdetsnhpeqtl` (eu-west-2). History in `SCAFFOLD-REVIEW.md`; product specs in `docs/`.

## Status of the four-part request
1. **Domain cutover** — NOT done (Hassan-triggered). Instructions below to hand him.
2. **Email notifications** — NOT started; blocked on Hassan (Resend account/key + PII decision). Plan below.
3. **Security features** (2 low-severity fixes) — NOT started. Specs below.
4. **Code quality** — ✅ **DONE** (N1, N4, N3), except **N2** which is a large judgement-call refactor (see below). Committed in `32ab2a7`.

## The full request (four parts, in order the user gave them)

### 1. Domain cutover — INSTRUCTIONS ONLY (do not touch the domain yourself)
`checkmybasket.co.uk` still points at an old site; the cutover is **Hassan-triggered**. Rule from prior sessions: **do NOT modify the domain**; the Vercel CLI token is stale so use the dashboard via Hassan's Chrome. Give Hassan these steps (confirm exact DNS records against what the Vercel dashboard shows him — Vercel displays the authoritative values):
1. Vercel → project `checkmybasket` → **Settings → Domains** → add `checkmybasket.co.uk` and `www.checkmybasket.co.uk`.
2. At the registrar, point DNS at Vercel: apex `A @ → 76.76.21.21`, and `www CNAME → cname.vercel-dns.com` (use whatever Vercel's panel states — it may differ).
3. Wait for SSL auto-provision (green in the Domains panel).
4. Set the env var in Vercel → Settings → Environment Variables: `NEXT_PUBLIC_APP_URL=https://www.checkmybasket.co.uk` (match the canonical host chosen), then **redeploy**.
5. Verify OG/link previews now render — they resolve via `metadataBase` to the `.co.uk` host, so they only work after cutover. Test with the WhatsApp/Twitter card validators.
6. Also confirm the other env vars exist in Vercel (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).

### 2. Email notifications — user said "lets do email notifications" (approving the feature)
**Design (from `docs/GiftCircle-ClaudeCode-Brief-v2.md` + `docs/CheckMyBasket-Rebrand-Brief.md`):** email is **optional**, **collected AFTER the draw reveal** ("Add your email to save access to your group" — Layer 3 delayed ask), transactional via **Resend**. Primary email = **"Names have been drawn! 🎅 Open CheckMyBasket to see your match"** sent on draw execution. Sender name **CheckMyBasket**; footer: "You're receiving this because you joined a Secret Santa group on CheckMyBasket. Unsubscribe anytime." Secondary (later): 24h stalled-organiser nudge.

**HARD BLOCKERS — cannot be finished without Hassan (surface these, don't guess):**
- **No email addresses exist today** — the app uses Supabase **anonymous auth**, no accounts, "minimal data" is a core promise. Email is net-new PII. Needs a new optional column (e.g. `group_members.email` or `profiles.email`, currently neither exists — `profiles` = id, name, created_at) + a post-reveal capture UI + a privacy-policy line.
- **Resend account + API key + verified sending domain** — I cannot create the account or enter the key (prohibited). The sending domain ties to the **domain cutover** (DNS verification); until then only Resend's `onboarding@resend.dev` test sender works. The key must live as a **Supabase secret** (`RESEND_API_KEY`), consumed by a **Supabase Edge Function** (keep it server-side, never in the `NEXT_PUBLIC_*` client bundle).

**Recommended build shape (once Hassan confirms + provides the key):** a Supabase Edge Function `send-draw-emails` invoked from `execute_draw` (or a DB trigger/pg_net call) that reads members' optional emails and calls Resend. Do NOT expose email addresses through RLS to other members (same privacy discipline as the rest of the app). **Suggest asking Hassan up front:** (a) confirm optional-email-post-reveal model + adding the PII column, (b) has he created the Resend account / can he add `RESEND_API_KEY` as a Supabase secret, (c) which sender domain (blocks on cutover, or use resend.dev to prototype). Build the schema + capture UI + edge function scaffold that activates when the key is present; full end-to-end send-verification is blocked on the key.

### 3. Security features — the two LOW-severity items from the 11 July review (user said "implement the security features")
Both still OUTSTANDING. Apply as a Supabase migration via the MCP `apply_migration`, then **mirror the SQL into `supabase/migrations/` with the applied version timestamp** (query `supabase_migrations.schema_migrations` for it — established workflow). Verify each with RLS-simulated sessions (see pattern below), then clean up test data.
- **wishlist_claims INSERT** currently only checks `claimed_by = auth.uid()` — does not verify the claimer is a member of the claimed item's group. Tighten to also require membership of the item's group, e.g. `WITH CHECK (claimed_by = auth.uid() AND EXISTS (SELECT 1 FROM wishlist_items wi WHERE wi.id = wishlist_claims.wishlist_item_id AND is_group_member(wi.group_id)))`. Consider also blocking self-claim (`wi.user_id <> auth.uid()`).
- **wishlist_items** "Owner manages own wishlist" (FOR ALL) checks only `user_id = auth.uid()` — `group_id` unconstrained, so a user could insert an item into a group they're not in. Add a write-side check: keep `USING (user_id = auth.uid())` but set `WITH CHECK (user_id = auth.uid() AND is_group_member(group_id))` (reads/deletes stay ownership-only so leave-group cleanup still works — the leave flow deletes wishlist_items *before* removing membership).
- **get_group_preview** (anon-callable, no rate limit) — enumeration is impractical (invite code = 31^8) but the user asked to implement. Rewrite as VOLATILE plpgsql with a small IP-keyed rate-limit table (IP from `current_setting('request.headers', true)::json->>'x-forwarded-for'`), e.g. ~60 calls / IP / 10 min, fail-open if the header is absent so legit users aren't harmed. (Weigh the write-amplification; if Hassan prefers, a Supabase edge/WAF rate limit is an alternative — note the tradeoff.)

### 4. Code quality — "fix all code quality" (the N-items) — ✅ DONE except N2
- **N1 ✅** — duplicated `GiftCard` extracted to `components/gift-card.tsx` with a `size="sm"|"lg"` variant; both gift pages use it. Verified via served HTML: `/gifts` renders 12 compact "View"/h-36 cards, `/gifts/under-15` renders 12 "Buy now"/h-40 cards, no crossover.
- **N4 ✅** — `lib/utils.ts` `timeAgo()` now clamps future timestamps to "just now" and adds w/mo/y units. Unit-checked at every boundary.
- **N3 ✅** — found two real small-text gold-on-white failures and fixed them: the received anon-message sender label (`app/g/[group_id]/page.tsx` ~714) now uses `--cmb-primary`; the "Wishlist" member badge (~328) uses a new `--cmb-gold-strong` token (`#8A6D2F`, 4.87:1 on white). Gold on dark green (awards, hero, CTAs) left as-is — already compliant.
- **N2 (STILL OPEN — JUDGEMENT CALL, do NOT blindly mass-edit)** — heavy inline `style={{}}` instead of Tailwind utilities mapped to the `@theme` tokens, across every page. Large incremental refactor with real visual-regression risk. Recommend scoping it (one component/page at a time, verifying each in the preview) rather than a single sweeping change. Flag to the user before doing the whole thing.

## Verification patterns (reuse these)
- **RLS attacker simulation** (proved the role-escalation fixes): create fake `auth.users` rows (a trigger auto-creates `profiles` — do NOT insert profiles manually), build a group + members, then `SET LOCAL role authenticated; SET LOCAL request.jwt.claims = '{"sub":"<uuid>","role":"authenticated"}';` and run the attack/legit query. **Prod DB is currently empty (0 rows)** — always delete test groups + orphaned `auth.users WHERE is_anonymous AND NOT EXISTS (member)` afterwards.
- **Build/preview:** `cd ~/giftcircle && npx next build`. The `checkmybasket-dev` preview (port 3100) via `preview_start` is flaky and gets killed between calls; a plain `npx next start -p 3101` (run_in_background) is more stable for Lighthouse/curl checks. The claude-in-chrome `javascript_tool` does not reliably await async IIFEs — store results on `window.__x` and read them in a second synchronous call.

## Hard rules (do not relearn)
- **Next.js 16** with breaking changes — read `node_modules/next/dist/docs/` before framework code (AGENTS.md mandates). `params` is a Promise (`use(params)` client-side); middleware is `proxy.ts`; client-page metadata goes in a segment `layout.tsx`. `next.config.ts` now has security headers (CSP with Supabase-only `connect-src`, HSTS, X-Frame-Options DENY, etc.) — if you add an external origin (e.g. Resend assets, a CDN), update the CSP `connect-src`/`img-src` or it'll be blocked.
- **RLS is strict and intentional** — several tables deny `select=*` (column grants); `draws` are giver-visible only; `anon_messages` has no readable `sender_id`; wishlist claims are hidden from the item owner. Don't "fix" these — they're the product promise. All membership writes go through the `create_group`/`join_group` SECURITY DEFINER RPCs (direct client INSERT/UPDATE on `group_members` is revoked except the preference columns).
- **Build locally, verify in preview, THEN push.** Push to `main` = Vercel prod deploy. Delete any prod test data you create.
- Brand: forest `#1B4332`, gold `#D4A574`, cream `#FFF8F0`, Fraunces + DM Sans, UK English, **no ads ever, no accounts, minimal data**. CSS tokens are now `--cmb-*` (the `--gc-*` rename is done).
- Commits: one-line summary + bulleted body, `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`. When a phase lands, update `SCAFFOLD-REVIEW.md`.

## State recap (all pushed to `main`)
QR codes (I10, `lib/qr.ts` + `components/qr-code.tsx`); 48h prediction-round auto-close (pg_cron, migration `20260710140940`); `--gc-*`→`--cmb-*` rename; Lighthouse (mobile 92, all others 100); security review — fixed CRITICAL member→organiser escalation + 2 medium issues (migrations `20260711100522`, `20260711101340`, `20260711103024`) and added security headers; prediction rounds organiser-only to create; code-quality pass N1/N4/N3 (`components/gift-card.tsx`, `timeAgo`, contrast + new `--cmb-gold-strong` token). **Last commit on `main`: `32ab2a7`.**

## What's left, at a glance
- **N2** inline-styles → Tailwind refactor (scope it, don't mass-edit).
- **Security features** — 2 low-severity RLS/rate-limit fixes (section 3).
- **Email notifications** — blocked on Hassan's Resend account/key + PII decision (section 2).
- **Domain cutover** — Hassan-triggered (section 1); OG previews stay broken until then.
