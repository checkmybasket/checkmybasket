# CheckMyBasket local staging verification

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
