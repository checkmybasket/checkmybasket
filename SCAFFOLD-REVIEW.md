# CheckMyBasket Scaffold Review

**Date:** 8 July 2026 · **Reviewed by:** Claude Code
**Scaffold commit:** `041f770` ("Build CheckMyBasket Secret Santa app — full prototype", 4 June 2026)
**Deployed:** Vercel `checkmybasket` (production READY, built from github.com/checkmybasket/checkmybasket @ same commit)
**Database:** Supabase `nejkvrzabdetsnhpeqtl` — ACTIVE_HEALTHY, 1 migration (`initial_schema`), 11 tables, RLS on all, 0 rows

## Headline verdict

The scaffold is **worth keeping — but it is a UI prototype, not a partially-built app**. Every screen exists and is well-branded (correct fonts, colours, UK English, mobile-first, tasteful animations), and the Supabase schema is genuinely good (server-side draw function, rate-limited messaging, thoughtful RLS). **But the two halves have never been connected**: there is not a single Supabase call in any page. All flows run on hardcoded `MOCK_*` constants. "Continue the build" (Phase 3) is therefore mostly *wiring*, not redesign — which is the right kind of remaining work.

**One genuine security bug found** (anonymous-messaging identity leak at the API level — exactly what the brief told me to check). Details in C2.

**Caveat (resolved 8 July, evening):** the strategy documents were originally not found on this machine. The canonical 8 docs are now in `docs/` (from Hassan's Google Drive "4th June" folder) and the previously unverified items have been re-checked — see **"Re-verification against strategy docs"** below. Headline: Gift Predictions conforms exactly; rebrand copy conforms with three small gaps; backlog P0 scope confirms the wiring-first fix order.

---

## Critical — blocks launch quality

### C1. Frontend is 100% mock data; no persistence anywhere
- **Where:** every page — `app/create/page.tsx` (create just flips local state, nothing saved), `app/join/[invite_code]/page.tsx` (`MOCK_GROUP`, redirects to `/g/demo-group-id`), `app/g/[group_id]/page.tsx` (`MOCK_GROUP/ME/MEMBERS/WISHLISTS/MESSAGES/RESULTS`), `reveal/page.tsx` (`MOCK_MATCH`), `settings/page.tsx` (`MOCK_GROUP`)
- **Issue:** Nothing a user does is stored. Two people opening the same link see the same fake "Marketing Team Secret Santa". The deployed site is a demo.
- **Fix:** Wire each flow to Supabase (clients already written in `lib/supabase/`). Create → insert `groups` + organiser member; join → anonymous auth session + insert `group_members`; dashboard → live queries; draw → call `execute_draw` RPC; reveal → read own `draws` row; messages → `anon_messages_safe` view; predictions → `prediction_rounds`/`predictions`.
- **Effort:** L (1–2 days of focused work; this *is* Phase 3)

### C2. Anonymous messaging leaks the buyer's identity via the API 🔴
- **Where:** Supabase — `anon_messages` table policies + grants
- **Issue:** A masking view `anon_messages_safe` exists (nulls `sender_id` unless you are the sender) — but the **base table is still fully readable**. The SELECT policy `sender_id = auth.uid() OR recipient_id = auth.uid()` grants the *recipient* row access, and `anon`/`authenticated` roles hold column-level SELECT on `sender_id`. Any recipient can call `GET /rest/v1/anon_messages?select=sender_id&recipient_id=eq.<me>` and unmask their Secret Santa. This defeats the product's primary differentiator.
- **Fix (migration):** revoke SELECT (and UPDATE/INSERT via table grant hygiene) on `anon_messages` from `anon`/`authenticated` except the columns needed, or drop the recipient arm from the base-table SELECT policy so recipients can *only* read via the view. Convert the view to `security_invoker` with proper policies (also clears the advisor ERROR on SECURITY DEFINER views). Add a test that queries as a recipient and asserts `sender_id` is null.
- **Effort:** S (one migration + verification queries)

### C3. Recipients can rewrite messages they receive
- **Where:** `anon_messages` UPDATE policy "Recipients can report (soft-delete via update)"
- **Issue:** No `WITH CHECK`, and `authenticated` holds UPDATE on **all** columns — a recipient can edit `content` (or even `sender_id`) of any message sent to them. Reporting should not grant editing.
- **Fix:** column-level `GRANT UPDATE (reported)` only (add a `reported`/`hidden` boolean if missing), or move reporting behind an RPC. Same pattern for `draws` "Giver marks gift as bought" — restrict UPDATE to `gift_bought` so a giver can't alter `recipient_id`.
- **Effort:** S

### C4. `lib/supabase/` was never committed to git — ✅ RESOLVED 8 July
Committed in `012e3bd` (with `.claude/launch.json`, already renamed `checkmybasket-dev`). Original finding kept below for the record.


- **Where:** `git status` → `lib/supabase/` and `.claude/` untracked
- **Issue:** The only Supabase integration code exists solely on this machine. The GitHub repo (and therefore Vercel builds) has no DB layer at all. A `git clean` or another machine loses it.
- **Fix:** `git add lib/supabase .claude/launch.json` (rename `giftcircle-dev` → `checkmybasket-dev` first) and commit.
- **Effort:** XS

### C5. Every user can enumerate all names and emails
- **Where:** `profiles` policy "Users can read any profile" — `USING (true)`; table has an `email` column
- **Issue:** Any signed-in (including anonymous) user can `SELECT name, email FROM profiles` for **every user of the product**, across all groups. Contradicts the minimal-personal-data posture and is a GDPR problem.
- **Fix:** replace with "profiles visible to co-members" (EXISTS join through `group_members`). Strongly consider dropping `email` from `profiles` entirely — the no-account join flow doesn't collect it; if organisers later opt into email reminders, store it purpose-bound at that point.
- **Effort:** S

---

## Important — fix before feature work

### I1. No-account join has no auth strategy implemented
The schema requires `auth.uid()` everywhere (correctly), which for "join in seconds, no account" means **Supabase anonymous sign-ins**. Nothing in the codebase creates a session. Decide + implement: silent `signInAnonymously()` on join/create, session persisted in cookie, later upgradeable. Verify anonymous sign-ins are enabled in the Supabase dashboard and `handle_new_user` copes with null email. **Effort: M** (foundational for C1)

### I2. Schema lives only in Supabase, not in the repo
One migration exists (`20260604115605_initial_schema`) but there's no `supabase/migrations/` in git. Pull the schema down (`supabase db pull` or export the migration SQL) and commit, so schema changes are reviewable and reproducible. **Effort: S**

### I3. Fabricated social proof on the landing page
`app/page.tsx:97` — "**1,247 groups** created this week" is hardcoded fiction. Untrue claims are a trust killer and risky under UK consumer-protection rules. Remove, or replace with a real counter once persistence exists (or honest copy: "Loved by families, flatmates and office teams"). **Effort: XS**

### I4. No OG image — WhatsApp previews will be bare
The brief explicitly requires a 1200×630 OG image slot; `metadata.openGraph` has no `images` and there's no `app/opengraph-image.*`. For a product whose whole invite flow lives in WhatsApp, the link preview *is* the first impression. Add branded `opengraph-image` (static or `next/og` generated, forest green + gold, "Secret Santa, sorted."), plus a per-group join-page variant later ("Priya invited you to Marketing Team Secret Santa"). **Effort: S**

### I5. SEO plumbing missing
No `app/robots.ts`, no `app/sitemap.ts` (the `/gifts/*` category pages are the SEO play and are invisible to crawlers), favicon appears to be the create-next-app default, unused template SVGs in `public/` (`next.svg`, `vercel.svg`, etc.), README is stock create-next-app. Also `<html lang="en">` → `en-GB`. **Effort: S**

### I6. Residual GiftCircle traces
Zero in app code/copy (good). Remaining: `package-lock.json` `"name": "giftcircle"` (regenerate lockfile — this is on the rebrand brief's explicit find-and-replace list, so not optional), ~~`.claude/launch.json`~~ (done — now `checkmybasket-dev`), CSS token prefix `--gc-*` throughout `globals.css` and every page (cosmetic; rename to `--cmb-*` in one mechanical pass or accept), and the local folder name `~/giftcircle` (suggest `mv ~/giftcircle ~/checkmybasket-app`; requires re-linking nothing — `.vercel/` and `.git` move with it). **Effort: S**

### I7. Supabase advisor findings
- ERROR: `anon_messages_safe` is SECURITY DEFINER (resolved by C2 fix)
- WARN ×4: mutable `search_path` on `execute_draw`, `daily_message_count`, `is_group_member`, `is_group_organiser` → `ALTER FUNCTION ... SET search_path = ''` (qualify references)
- WARN: those functions + `handle_new_user` are callable via `/rest/v1/rpc/*` by `anon` → revoke EXECUTE where not needed (`handle_new_user` should be trigger-only)
**Effort: S**

### I8. Exclusions `bidirectional` flag is ignored by the draw
`exclusions.bidirectional` exists in schema and `lib/types.ts`, and the (now-redundant) client-side `drawNames()` in `lib/utils.ts` respects it — but `execute_draw` in Postgres always treats exclusions as bidirectional. Pick one semantic (bidirectional-only is simpler and matches "couples don't draw each other"), and delete the unused client implementation so there's a single source of truth. **Effort: S**

### I9. Invite code generation: client-side `Math.random`, no uniqueness guarantee
`generateInviteCode()` runs in the browser with `Math.random`, and the create flow never checks collisions. Move generation into the `groups` insert (DB default using `gen_random_uuid()`-derived slug or a unique-constrained retry), keep 31-char alphabet / 8 chars. **Effort: S**

### I10. QR code is a permanent skeleton
`app/create/page.tsx:76-83` shows a shimmering placeholder that never resolves — looks broken. Either render a real QR (tiny dependency-free SVG QR is fine) or drop the panel until built. **Effort: S**

---

## Nice-to-have

| # | Item | Where | Effort |
|---|------|-------|--------|
| N1 | Duplicate `GiftCard` component defined twice | `app/gifts/page.tsx`, `app/gifts/[category]/page.tsx` | XS |
| N2 | Heavy inline `style={{}}` usage instead of Tailwind utility classes mapped to the tokens already in `@theme` — harder to maintain, no hover/dark variants | all pages | M (incremental) |
| N3 | Contrast audit where gold `#D4A574` sits on light backgrounds (fails ~1.8:1 on cream; it's currently mostly on dark green, which is fine — keep it that way) | `globals.css` `--gc-warning`, awards UI | XS |
| N4 | `timeAgo()` has no week/month units and mishandles future dates | `lib/utils.ts:58` | XS |
| N5 | `.DS_Store` files scattered; add to `.gitignore` | repo root | XS |
| N6 | Gifts catalogue is hardcoded placeholder data with dummy URLs — real affiliate strategy is Phase 3 backlog work | `app/gifts/*` | — |
| N7 | Lighthouse not yet run (do after C1/I4/I5 land; landing page is static and light, 90+ is realistic) | — | — |
| N8 | `viewport.themeColor` is set and copy is UK English throughout — no action, noted as ✅ | — | — |

---

## What's already right (don't touch)

- **Branding:** Fraunces + DM Sans correctly loaded via `next/font`; tokens exactly match spec (#1B4332 / #D4A574 / #FFF8F0); "Secret Santa, sorted." present; no-ads promise and affiliate disclosure in the footer; UK English ("organiser") throughout.
- **No Guess the Baby remnants** anywhere — schema, routes, copy all clean. Gift Predictions uses the fixed 12-category enum in both `lib/types.ts` and the DB.
- **No secrets in the repo:** `.env*` gitignored; only `NEXT_PUBLIC_*` vars exist locally; no service-role key anywhere.
- **`execute_draw` is the right design:** SECURITY DEFINER RPC, organiser-only, ≥3 members, self-draw + exclusion checks, retries then fails loudly, single transaction. Draws are only readable by the giver (`giver_id = auth.uid()`) — assignments can't be scraped.
- **Message rate-limiting** (10/day/group) enforced in the INSERT policy.
- **Mobile-first UX** is genuinely good: bottom tab bar with safe-area insets, one-handed reach, `prefers-reduced-motion` respected, focus-visible styles, WhatsApp-first share screen.

## Re-verification against strategy docs (8 July, evening)

The canonical 8 strategy documents are now in `docs/`. The three items the original audit couldn't verify:

### R1. Backlog priorities (`GiftCircle-Feature-Backlog.xlsx`) — scaffold matches P0 scope; wiring is the gap
48 items across P0 (20 items, 52 days, deadline 1 Oct 2026) → P3. Checked P0 against the scaffold:
- **UI surface exists for every P0 feature** (GC-005, GC-007–GC-017 screens, GC-018 gift pages) — but all on mock data, so the real P0 gap is exactly C1 + I1 (GC-004 anonymous auth is the only P0 item with *nothing* built).
- **GC-006 (SEO/OG) is P0-High in the backlog** — upgrades the urgency of I4 (OG image) and I5 (sitemap): these are launch-blocking per the backlog, not polish.
- **GC-019 is still "Guess the Baby" in the xlsx** — expected: the Game Replacement Brief explicitly supersedes it (§"What This Replaces in Other Documents"). Gift Predictions is the correct implementation target; the xlsx was never updated.
- The fabricated social-proof stat (removed in `4bb1b02`) is confirmed correct: a **real** counter is GC-025, deliberately P1 — not faked in P0.
- Suggested fix order below is consistent with backlog priorities; no re-ordering needed.

### R2. Gift Predictions conformance (`GiftCircle-Game-Replacement-Brief.md`) — ✅ exact match
- **12 categories identical** in brief, `lib/types.ts` `GiftCategory`, and the DB `gift_category` enum: mug, chocolate, bath_body, candle, cosy, joke, book, drinks, gift_card, experience, useful, surprise.
- **Data model field-for-field**: `prediction_rounds`, `predictions`, `actual_gifts` in Supabase match the brief's PredictionRound/Prediction/ActualGift exactly (incl. `round_status` enum open|closed|revealed, nullable `closed_at`, `logged_by`). DB uses proper enums where the brief said "string" — a conforming improvement.
- **No Guess the Baby remnants in the DB** (11 tables, no BabyPhoto/BabyPhotoGuess) — confirms the original spot-check.
- One forward note: the brief's **48-hour auto-close** of prediction rounds needs a scheduled job or lazy check; nothing implements it yet (falls under C1 wiring).

### R3. Rebrand conformance (`CheckMyBasket-Rebrand-Brief.md`) — ✅ conforms, three gaps
Verified exact: hero headline/subheadline/CTA/trust line, bottom-CTA tagline "Secret Santa, sorted.", footer brand line, affiliate disclosure wording, WhatsApp share message format, homepage/create/gifts title tags, colour palette (all 5 hex), Fraunces + DM Sans, `metadataBase` = www.checkmybasket.co.uk, `package.json` name.
Gaps found:
1. **Footer is missing "About · Privacy · Terms · Contact" links and the standalone "No ads, ever." line** (brief §4 Footer). No Privacy/Terms pages exist at all — also a GDPR item, fold into I5.
2. **Join page has no title tag** — brief specifies "Join Secret Santa — CheckMyBasket"; `app/join/[invite_code]/page.tsx` is a client component with no metadata export.
3. **Meta description deviates slightly**: layout adds "from any shop" to the brief's exact sentence. Harmless (arguably better), flagging only for the record.
Already tracked elsewhere: `package-lock.json` still `giftcircle` (I6 — now confirmed against the brief's mandatory find-and-replace table); OG image missing (I4 — brief §4 requires it with CheckMyBasket alt text).

## Phase 2 status (9 July)

Executed and **verified end-to-end in the browser plus API-level security probes** (test data cleaned up afterwards):
- **C1 + I1 ✅** — anonymous auth (enabled in the Supabase dashboard) + full wiring: create → share → join (×3 users) → wishlists → exclusions → draw (execute_draw RPC) → reveal animation with real match → gift-bought toggle → organiser gifts-bought aggregate → anonymous message + blind reply → Gift Predictions round → pre-reveal privacy → results + awards. All exercised live on 9 July.
- **I2 ✅** — full migration history mirrored in `supabase/migrations/` (initial schema recovered byte-identical, md5-verified).
- **I7 ✅** — search_path pinned, anon EXECUTE revoked everywhere; 5 remaining advisor WARNs are intentional (authenticated needs execute_draw + policy helpers).
- **I8 ✅** — bidirectional-only semantic chosen; client `drawNames()` deleted; `exclusions.bidirectional` column retained but unused.
- **I9 ✅** — invite codes generated server-side in `create_group` with unique-collision retry.
- **New RPCs** (all SECURITY DEFINER, pinned search_path, least-privilege grants): `create_group`, `get_group_preview` (only anon-callable function), `join_group`, `gifts_bought_count`, `reply_to_anon_message` (recipients reply without ever learning the sender id).
- **Extra hardening beyond the audit:** wishlist claims now hidden from the item owner at RLS level (was UI-only in the design).
- **Security probes re-verified:** `profiles?select=*` → 403, `anon_messages?select=sender_id` → 403, pre-reveal predictions visible to predictor only, claim invisible to item owner.

**Update 10 July:** I4 ✅ (generated OG image, live), I5 ✅ (robots.ts disallowing /g/ + /join/, sitemap with all 15 URLs, generated favicon, `lang=en-GB`, template SVGs deleted, About/Privacy/Terms/Contact pages shipped), I6 ✅ lockfile renamed (only `--gc-*` CSS prefix remains, accepted as cosmetic), R3 gaps ✅ (footer links + "No ads, ever." + join page title). All verified live on checkmybasket.vercel.app. Note: og:image URLs resolve via metadataBase to www.checkmybasket.co.uk, so link previews show the image only after the domain cutover.

Still open: I10 (QR placeholder), N-items, the game brief's 48-hour round auto-close (needs a scheduled job), and the domain cutover itself (Hassan-triggered).

**Update 10 July (afternoon):** I10 ✅ — real QR codes on the create share step and group settings, rendered by a dependency-free encoder in `lib/qr.ts` (byte mode, level M, versions 1–10, verified 5/5 against a jsQR decode round-trip including a version-10 symbol) via `components/qr-code.tsx` (SVG, forest green on white, 2-module quiet zone). 48-hour auto-close ✅ — migration `20260710140940_prediction_rounds_48h_auto_close` enables pg_cron and schedules `auto_close_prediction_rounds` hourly (at :07) calling a SECURITY DEFINER function that flips `prediction_rounds` open→revealed (with `closed_at`) after 48h, mirroring the organiser-reveal path; client EXECUTE revoked. Verified live: backdated round auto-revealed, test group + orphaned anon users deleted afterwards.

## Security review (11 July)

Full pass: secret scan (repo + entire git history), RLS/policy audit of all 11 tables, per-column write-grant audit, SECURITY DEFINER function review, HTTP header review. Findings and fixes:

- **CRITICAL — member→organiser privilege escalation (FIXED, confirmed exploitable then confirmed blocked).** `authenticated` held table-wide INSERT/UPDATE grants on `group_members`, and the RLS policies didn't constrain columns, so any member could `UPDATE group_members SET role='organiser' WHERE user_id=auth.uid()` (or self-insert as organiser given a known group_id — group_ids appear in `/g/{id}` URLs). Organiser powers = delete/alter group, re-run draw, manage exclusions, reveal prediction rounds. Fix: migration `20260711100522` revokes direct INSERT/UPDATE, re-grants only `likes,dislikes,sizes,name`, and forces the self-insert policy to `role='member'`. All membership creation already routes through the `create_group`/`join_group` SECURITY DEFINER RPCs (verified still working).
- **MEDIUM — prediction-round blind-phase bypass (FIXED).** A member could INSERT a round with `status='revealed'`; predictions dropped into it are visible immediately. Migration `20260711101340` forces `status='open'` on insert.
- **MEDIUM — arbitrary groups insertion (FIXED).** "Authenticated users can create" let any user insert a groups row with arbitrary `organiser_id`/`invite_code`/`draw_status`. Policy dropped + direct `groups` INSERT revoked (creation is RPC-only). Same migration.
- **LOW (noted, not changed):** `wishlist_claims`/`wishlist_items` INSERT policies force `claimed_by`/`user_id = auth.uid()` but don't verify group membership of the referenced item/group — a user who knows a foreign UUID could pollute another group's list/claims (not readable by them; low impact). `get_group_preview` is anon-callable with no per-IP rate limit (invite-code space is 31^8, enumeration-resistant).
- **Secrets: clean.** No service_role key, JWT, or private key anywhere in the working tree or full git history. `.env.local` is git-ignored and holds only `NEXT_PUBLIC_*` values (the anon/publishable key, safe to expose by design; protected by RLS). **No key rotation required — nothing was ever exposed.**
- **Headers (ADDED):** `next.config.ts` now sets CSP (connect-src limited to the Supabase origin + wss, `frame-ancestors 'none'`), HSTS (preload), `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`. CSP verified non-breaking against the live Supabase fetch path (no violations, request reached the API).
- **RLS: on for all 11 public tables** (unchanged — was already enabled). Supabase advisor now returns only expected WARNs (the self-authorising RPCs + the by-design anonymous-auth policies).
- **CORS:** no custom API routes exist; the app talks only to Supabase, whose REST CORS is JWT/RLS-gated (not origin-trusted), so there is no wildcard-CORS surface in our code to lock down. `frame-ancestors 'none'` covers embedding.

**Update 10 July (evening):** `--gc-*` → `--cmb-*` token rename ✅ (14 files, 18 tokens, 0 stragglers, verified against served output). Lighthouse pass on the landing page ✅ — mobile 92/100/100/100, desktop 99+/100/100/100 (production build, headless Chrome). Fixes: `<main>` landmark added, step numerals recoloured `#E8DDD0` → `#A08A6B` (3.3:1, large-text AA) and marked `aria-hidden`, `--cmb-text-muted` darkened `#8A8A8A` → `#6E6E6E` (≥4.5:1 on white and cream). Remaining mobile perf gap is Next.js runtime JS on a throttled connection — not worth chasing. Still open: email notifications (needs Hassan's Resend decision), domain cutover (Hassan-triggered).

## Suggested fix order (Phase 2, pending your approval)

1. **C4** commit `lib/supabase/` (30 s, protects work)
2. **C2 + C3 + C5 + I7** one security migration (half a day, testable immediately)
3. **I3** delete fake stat (1 min)
4. **I1 + C1** anonymous auth + wire create → join → draw → reveal end-to-end (the big one)
5. **I2** pull schema into repo
6. **I4 + I5 + I6** OG image, robots/sitemap/favicon/README, GiftCircle stragglers
7. **I8–I10**, then N-items opportunistically alongside Phase 3 feature work

## Infrastructure status (checked today)

- Supabase: **ACTIVE_HEALTHY** (already unpaused), Postgres 17, eu-west-2, no pending migrations, all tables empty
- Vercel: production deployment READY on `checkmybasket.vercel.app`, GitHub-connected, `NEXT_PUBLIC_APP_URL=https://www.checkmybasket.co.uk` set locally — **verify the same env vars exist in Vercel project settings** before the next deploy
- Domain: not touched, per the transition plan
