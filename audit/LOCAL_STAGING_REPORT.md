# CheckMyBasket local staging verification

> Current release status: see [RELEASE_CANDIDATE_REPORT.md](RELEASE_CANDIDATE_REPORT.md). Three policy fixes are now live in production; the protected website candidate is staged but customer-domain promotion remains pending. Statements below about earlier local-only stages retain their historical scope.

23 October 2026 · `polish/production-audit` · local-only follow-up to the production polish report.

Local staging is installed, running and verified for the flows below. The entire release definition of done is **not certified**: exhaustive private states and manual/live-environment checks remain open in OWNER 02 / QA 02. No production data, credentials, schema, deployment or subscription was changed.

## Running environment

| Service | Address |
| --- | --- |
| App | http://localhost:3101 |
| Supabase Studio | http://127.0.0.1:54323 |
| Captured email | http://127.0.0.1:54324 |
| Local Supabase API | http://127.0.0.1:54321 |

Docker CLI 29.9.2 runs through Colima 0.10.3 in the dedicated `cmb-staging` profile (2 CPUs, 6 GiB RAM). The default Docker context is unchanged. Docker Desktop's installer failed to create `/usr/local/bin` and rolled back; the working runtime is Colima. Supabase CLI is pinned to 2.122.0 and is not an app dependency. No cloud plan upgrade was needed.

All backend ports are loopback-only. The stack started empty, all 26 repository migrations applied, all public tables have row-level security, and local security advisors reported no warnings. No production rows/users/secrets were copied. Existing development/production app env files were preserved byte-for-byte; local env files are ignored and mode 0600.

The app is built with explicit local credentials and emits `noindex, nofollow`. Its CSP allows the local HTTP/WebSocket backend and excludes the production Supabase host. This `.next` output is a local artifact, not something to deploy as prebuilt production output.

## Verified

| Check | Result |
| --- | --- |
| Local production-mode build / lint / TypeScript | PASS / PASS / PASS |
| Local Node regressions | 31 PASS |
| Existing analytics / gift selection / verifier | 16 / 9 / 54 PASS; 110 total local checks including Node tests |
| Existing live wishlist suite | PASS: real local Auth/RPC ownership, sharing, reservation, return and field boundaries |
| Existing live wishlist API suite | PASS: authentication, safe previews, URL restrictions, noindex and image access |
| Browser create → join → draw → reveal | PASS with organiser and three disposable local members |
| Group settings / invite / gift state | PASS: edit name, copy invite, mark gift bought |
| Anonymous question/reply | PASS: browser sent question, recipient replied, reply displayed; sender-ID column denied |
| Member permissions | PASS: each member reads only own match; member cannot execute organiser draw or edit assignment columns |
| Authenticated non-member | PASS: group/member/draw/wishlist/message reads return no rows; draw and late join denied |
| Native Auth email capture | PASS: SMTP points at local Mailpit; fixture email arrived there |
| Custom recovery and draw-email acceptance | PASS: real Auth/Edge/Postgres/Mailpit path, same-identity restoration, single-use token, verified preference, one accepted draw email and duplicate suppression |
| Loaded private viewport matrix | PASS: 7 states × 10 widths/heights = 70 cases |
| Private structure | One h1/main, no skipped headings, unlabelled controls or nested interactive controls in recorded states |
| Mobile targets / overflow | No measured target below 44px; no horizontal overflow in final private matrix |
| Normal console | Zero captured warnings/errors in recorded normal states and fresh final tab |
| Failed Auth request | PASS: local Auth stopped → safe retry/home recovery → Auth restored → Retry restored group |
| Stalled data request | PASS: local REST paused → named loading skeleton → unpause restored group |

The fault tests intentionally produce failed/stalled requests; their expected failure events are excluded from the normal console count. They do not establish zero console events under every simulated outage.

The private matrix covers pending group, drawn group, Messages, Wishlists, initial Games, settings and reveal-ready states at 320, 375, 414, 768, 1024, 1280, 1440 and 1920 widths, landscape 740×320 and ultrawide 2560×1080. It is not a claim to cover every game round, dialog, role, shared-list state or actual device.

## Local Lighthouse follow-up

Lighthouse 13.5.0 on this final local build, default simulated mobile settings:

| Page | Performance | Accessibility | Best practices | SEO |
| --- | --- | --- | --- | --- |
| home | 96 | 100 | 100 | 66 |
| create | 95 | 100 | 100 | 66 |
| gifts | 95 | 100 | 100 | 69 |

The only failed SEO audit is `is-crawlable`: staging deliberately blocks indexing with noindex/robots protection. This is expected and was preserved. Accessibility, best practices and console checks pass on all three pages. The earlier production-mode SEO scores were 100; live production verification remains a release gate. These local performance scores are not treated as comparable before/after gains. Raw reports are `lighthouse-local-{home,create,gifts}.json`.

## Fixes made during staging

- **STAGE 01–02:** environment-specific CSP; explicit integration-test targets reject production and privileged client keys.
- **STAGE 03:** isolated Docker/Supabase configuration, anonymous auth, local SMTP, guarded app launcher and verified migrations. The launcher fixes Node 26/Next worker `--env-file` incompatibility.
- **STAGE 04:** explicit local-only custom email capture. Hosted origins and real recipient domains cannot activate it. Provider credentials are not forwarded to Mailpit; ordinary production delivery keeps its existing fetch implementation. Recovery now honours `APP_URL`, with the original production default.
- **A11Y 16–21:** named/selected group navigation, persistent message labels, correct empty-state heading levels, selected conversation state, named progressbars and 44px mobile text inputs.
- **UI 08:** the revealed-match Ask action opens Messages directly; section URLs, selection and reload behavior stay consistent.
- **UI 09:** the match CTA wraps within its card at 320px. Before: document width 323px. After: no overflow; full-label CTA measures 224×66px and ends at x=272.
- **CONTENT 04:** existing Lucide icons replace standalone gift emoji; private control labels use plain text. Meaningful game category content is unchanged.

Each implementation issue was verified and committed separately with its ID. No app dependencies were added, and no cloud Edge Function was deployed.

## Remaining gates

**OWNER 02 / QA 02:** the isolation prerequisite is now solved. Complete the remaining exhaustive private games/large-data/permission-state matrix, native 200% zoom, screen-reader/physical-device and clipboard-denial checks before certifying every private interaction. Existing 640px reflow evidence is not native zoom. The remaining scope is explicitly unverified, not silently passed.

Live production/preview deployment checks, domain/account configuration, real provider delivery, mailbox ownership and external merchant/print verification remain separate. No production release was performed. **SECURITY 02** still records the upstream development-only lint advisory chain; production dependencies were clean in the prior audit, and package versions did not change in this staging work.

## Evidence and operation

- [Local status and checks](local-staging.json)
- [Final private matrix](private-route-matrix.json) and [before matrix](private-route-matrix-before.json)
- [Controlled failure/loading checks](local-failure-checks.json)
- [Mobile local group screenshot](screenshots/local-group-mobile.png)
- [Start, stop and verification runbook](../docs/staging.md)
- [Issue backlog](../BACKLOG.md)

The earlier public Lighthouse/bundle measurements remain in [FINAL_REPORT.md](FINAL_REPORT.md) with their original baseline provenance. They were not remeasured against a different local backend and presented as a performance gain.

## Private follow-up: predictions and real wishlist stress

The organiser completed a local game round through start, three category choices, prediction submission, results reveal and actual-gift logging. Selected values appeared in the locked confirmation and the actual gift appeared after saving. This verifies the organiser path; it does not certify the remaining participant/permission matrix.

A real wishlist was created through the browser, including a 195-character unbroken title and 840-character unbroken note. The initial mobile owner view overflowed to 6781px. **UI 10** adds a shrink constraint to the shared item card. Fifty final viewport checks pass: owner/shared single-item, owner 200-item, shared 200-item list and shared 200-item cards, each at the ten audit sizes. The additional 199 items were seeded only into the disposable local database. See [wishlist-stress-matrix.json](wishlist-stress-matrix.json). No application dependency or data model changed.

**A11Y 22** exposes prediction category selection with aria-pressed. Browser checks verified choosing, replacing and returning to a choice. Both fixes separately passed staging build, lint, TypeScript and all 110 local regression checks. Captured normal-state browser warnings/errors: zero. Lighthouse was not rerun for these narrowly scoped changes; the measurements above retain their original provenance.

Remaining coverage is narrower: participant/game permission edges, empty/shared interactions beyond the checks above, controlled mutation failures, native 200% zoom, screen reader, physical devices and clipboard denial. Live deployment checks remain a release gate.

## Participant permissions and failed saves

The local adversarial probe found three previously allowed writes, each logged and fixed in its own implementation commit:

- **SECURITY 03:** a nonmember could insert its own actual gift against a known round. Inserts now require membership in that round's group.
- **SECURITY 04:** a member could predict for a nonmember. Prediction subjects must now belong to the same group.
- **SECURITY 05:** a member could submit after results were revealed. Inserts now require an open round.

`tests/game-permissions-live.cjs` verifies real API calls with disposable owner/member/nonmember identities. Participants cannot create/reveal rounds; attempts leave the open round unchanged. Nonmember/impersonated gift inserts fail without creating records, while a member's own gift saves. Invalid subjects and impersonated predictors fail; valid open-round predictions save and stay private before reveal. Closed/revealed predictions fail without changing the original record/count. Revealed predictions remain hidden from outsiders. The local security advisor reports no warnings. All three migrations are recorded in local history; **production has not received these fixes**.

**FORM 03:** a controlled local REST outage exposed raw `name resolution failed` text in gift saves; wishlist list forms used the same fallback. Both now use safe actionable messages. Browser checks verified gift/list draft retention, enabled retry buttons and successful restored retries. Database verification found exactly 200 fixture items and one updated gift, with no duplicate. The 200-gift limit retains specific guidance. See [save-failure-checks.json](save-failure-checks.json).

Each fix passed build, lint, TypeScript and all 110 local regressions before its commit. A fresh browser tab after service restoration loaded all 200 items with zero warnings/errors. Expected network errors from deliberate outages and rejected validation requests are not counted as normal-state errors. All local services were restored. No dependencies were added, no data model changed and no production writes/deployments occurred. Lighthouse/bundle measurements above were not remeasured during this stage.

Backlog now has 77 individual issues: 74 completed, three retained as NEEDS OWNER. Remaining release gates include manual native zoom/screen reader/physical-device/clipboard-denial checks, broader untested interaction states, live deployment verification and the documented upstream dev-tool advisory decision.

## Keyboard, heading and live read-only follow-up

**A11Y 23:** shared wishlist priority sections were h2 with nested gift titles also h2. ItemCard now accepts level 2 or 3; shared views use h3, while owner cards retain h2. Loaded list/card views each expose one h1, one priority h2 and 200 gift h3 headings. Owner cards remain h2. Enter collapses and expands shared priority sections. Build, lint, TypeScript and all 110 local checks pass.

Keyboard sampling covered ten routes/states, up to 18 Tab steps per state. Settled Return-page traversal was checked separately after async content loaded. The create and Return primary actions have a settled 3px focus ring; immediate transition snapshots are not evidence of missing focus styling. This is sampled traversal, not complete keyboard or screen-reader certification. Raw evidence: [keyboard-focus-checks.json](keyboard-focus-checks.json).

Read-only checks of the currently deployed site found all 40 inventoried URLs respond 200, all titles unique, every page with one h1, all 39 indexable pages with the expected production canonical, and Return noindex. CSP, HSTS, nosniff and frame denial headers are present on every checked page. The sitemap has all 39 indexable URLs and excludes private utilities; robots points to it. HTTP/apex requests resolve to HTTPS www. This is deployed-version evidence, not proof this branch has been released. Raw evidence: [live-readonly.json](live-readonly.json).

Twenty-four live pages lack OG image tags. The existing branch supplies those tags on all 24, confirmed against local staging with noindex intact: [local-og-release-check.json](local-og-release-check.json). The original SEO fixes and SECURITY 03–05 therefore still need the reviewed production release. No production deployment, backend write, account or DNS change was made.

The remaining owner checks are concrete in [docs/owner-release-checks.md](../docs/owner-release-checks.md). Native zoom, actual screen-reader/physical-device use, clipboard denial and functional protected cloud preview remain unverified. The backlog now has 78 issues: 75 completed in the branch, three NEEDS OWNER. Existing Lighthouse and bundle numbers retain their measurement dates; they were not rerun for this heading-only change.

## Protected review preview

Draft PR [#3](https://github.com/checkmybasket/checkmybasket/pull/3) publishes the audit branch. Vercel successfully built commit `026aa1d` as deployment `dpl_3E9nGVugpnmSnRBqhhu6ZeCsPcoy`; reported PR deployment checks pass. Production remains unchanged.

After the owner authorized retrying protected access, authenticated read-only checks returned 200 for home, create, gifts, guides, robots and sitemap. All four HTML pages have distinct titles, OG images, production canonicals and noindex/nofollow. Preview robots disallows all crawling; sitemap has 39 public locations. Security headers are recorded in [protected-preview-checks.json](protected-preview-checks.json). These are response checks, not browser/Lighthouse or private-flow certification. No share links, cookies or credentials are stored in evidence.

The preview has no isolated Supabase/App URL environment variables, so private cloud flows remain unverified. No production credentials were substituted. The first access attempt was rejected by automatic review; an earlier CLI unexpectedly created an automation bypass token, which was revoked and verified absent before the authorized connector retry. Deployment protection stayed configured. Native Chrome control was interrupted, so native zoom remains unverified. Remaining owner gates and reviewed migration/release order still apply.
