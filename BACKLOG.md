# Production polish: current workspace

23 October 2026. Implementation branch: polish/production-audit. Current base: 237cf0c (Next.js 16.4.0). This backlog is scoped to production polish; ../BACKLOG.md remains the product master backlog. Earlier audit used an outdated checkout. Findings below are being reconciled against this newer app before changes.

Current baseline: build PASS, TypeScript PASS, lint FAIL (CommonJS test harnesses are checked with TypeScript-only require rules, two restricted local variable names and a this-alias). Earlier Lighthouse scores are historical, not the baseline of this version. Current OG artwork exists in app/opengraph-image.tsx and will be reused after visual QA. No additional OG artwork is required by assumption.

### [x] BUILD 02 — P0

- Severity: P0
- Location: eslint.config.mjs, scripts/*/test.cjs, tests/wishlists-recovery-live.cjs; all routes
- Evidence: npm run lint exits 1 before any changes. CommonJS imports trigger no-require-imports; local module variable triggers Next rule; test mock aliases this; unused callback index.
- Fix: allow intentional require imports only in .cjs tools/tests; rename harness variables and remove alias/unused index without disabling application rules.
- Acceptance criteria: build, lint and tsc pass; existing local analytics, selection, verifier and wishlist/email tests pass. No database/live tests run.
- Status: DONE — build, lint, TypeScript, 16 analytics, 9 gift-flow, 54 verifier and 16 wishlist/email regression checks pass.

# CheckMyBasket production polish backlog

Audit date: 23 October 2026. Phase 1 findings; Phase 2 has not started.
Repository: `work/site-text-removal`, local branch `main`, remote `https://github.com/checkmybasket/checkmybasket.git`.
This is a local snapshot, not a verified current production checkout. Other copies exist; `work/google-analytics` has uncommitted SEO edits and was left untouched. Do not overwrite or duplicate those changes without reconciliation.
Synced files under project `sources/` remain read-only.

## Stack and route inventory

Next.js 16.2.7 App Router, React 19.2.4, TypeScript strict, Tailwind CSS 4 with CSS variables, Base UI/shadcn components, Lucide icons, Sonner, Zustand and Supabase. Vercel is the documented hosting target; live account configuration was not verified.
Public routes: `/`, `/about`, `/contact`, `/privacy`, `/terms`, `/create`, `/gifts`, and `/gifts/[category]` for under-10, under-20, under-30, under-50, colleague, funny, cosy and personalised.
Utility/private routes: `/return`, `/join/[invite_code]`, `/g/[group_id]`, `/g/[group_id]/reveal`, `/g/[group_id]/settings`.
Metadata/system endpoints: `/icon`, `/opengraph-image`, `/robots.txt`, `/sitemap.xml`, generated `/_not-found`.

## Baseline

- `npm run build`: PASS. All routes compiled and generated.
- `npm run lint`: PASS with no reported findings.
- `tsc --noEmit --incremental false`: PASS.
- Production server: localhost:3100; startup warns about incorrect inferred workspace root.
- JavaScript: 1,244,623 bytes across all emitted static JS chunks (raw on disk, not per-page transferred size). Largest chunks: 293,704; 227,313; 146,770; 112,594; 55,883 bytes. These figures alone do not prove wasted code.
- Lighthouse 13.5.0, local production server, default simulated mobile throttling (412x823, 4x CPU, 150ms RTT), one run per page:
  - Home: performance 86, accessibility 100, best practices 100, SEO 100; LCP 4.2s.
  - Create: performance 89, accessibility 81, best practices 100, SEO 100; LCP 3.8s.
  - Gifts: performance 79, accessibility 98, best practices 100, SEO 100; LCP 5.7s.
  - JSON reports retained in `audit/lighthouse-before-{home,create,gifts}.json`. These are local baseline measurements, not live-production scores. Automated 100s do not negate manually confirmed defects.
- Public-page console: no warning/error logs captured during the first 16-page navigation pass. This is not proof for private routes or every interaction. The deliberate later 404 probe is outside this clean navigation sample.
- Public routes tested at 320, 375, 414, 768, 1024, 1280, 1440, 1920px; landscape 740x320; ultrawide 2560x1080: 160 route/viewport combinations. Homepage overflow reproduced at 320px; no other page-level overflow detected by document-width measurement. This does not certify visual layout, touch targets or zoom.
- Public route h1 counts: exactly one in each tested page. Information-page headings come from the shared shell. Private loaded states remain unverified.
- Images initially awaiting load were NOT counted as broken. Gift-index images subsequently reported complete with nonzero natural width.
- Origin scan: .env.local contains none of the requested dev/preview host markers; values were not printed. localhost appears in starter README, historical notes, and an explicit recovery-function development CORS allowlist. The historical vercel.app reference is documentation, not a demonstrated runtime link defect.
- Existing positives: en-GB document language, branded generated favicon, 1200x630 generated OG image, public sitemap excluding group/invite routes, join/return noindex, reduced-motion CSS, actual privacy/terms/contact routes, sponsored external gift links with noopener/noreferrer, category empty states.
- Additional public-route DOM scan: one main landmark and en-GB on every route; no image missing an alt attribute and no empty/#/javascript:void(0) links. Create has one unnamed button. No production static chunk source maps or service-role/secret-key marker matches were found; this is not a comprehensive secret scan.
- No product behavior, copy, dependencies, data models or runtime source were changed.
- Ruflo/ToolSearch tools are unavailable in this session. Audit used local tools and browser inspection.

## Remaining verification

This is a partial audit with confirmed source/browser findings, not a completed full checklist. QA 02 explicitly tracks outstanding coverage. Deployed headers and redirects, real external-link availability, complete shared-token drift, all component focus/contrast checks, and authenticated states remain unverified. No speculative security finding is asserted.

## Issues

Each implementation issue must pass build, lint, type check and its specific acceptance criteria before completion. Tick only after verification. Commit one issue at a time with its ID. Owner items remain open with a concrete instruction.

### [x] A11Y 01 — P1

- Severity: P1
- Location: app/create/page.tsx:232; /create
- Evidence: Browser: four inputs have labels.length=0 and no aria-label. Field renders a sibling Label without htmlFor.
- Fix: Give each control a stable id and connect its label, hint and error.
- Acceptance criteria: All inputs have accurate accessible names; clicking each label focuses its control.
- Status: DONE
- Completion note: Existing labels retained; added the missing custom-budget label. Browser confirms all six displayed inputs have labels; build, lint and TypeScript pass.

### [x] A11Y 02 — P1

- Severity: P1
- Location: app/create/page.tsx:232; /create
- Evidence: Submit an empty form: errors appear, but aria-invalid and role=alert counts stay zero; focus remains on submit.
- Fix: Associate field errors, set invalid state and focus the first invalid field or an announced summary.
- Acceptance criteria: Keyboard/screen-reader users receive the errors and can navigate to each affected input.
- Status: DONE
- Completion note: Added invalid states, linked error/hint IDs and first-invalid focus. Production browser confirms group-name focus and two announced field errors; build/lint/TypeScript pass.

### [x] A11Y 03 — P1

- Severity: P1
- Location: components/info-page.tsx:11; app/page.tsx; app/gifts/[category]/page.tsx; shared navigation
- Evidence: Rendered DOM contains a > button: four on /, one on each information page and three on each category page.
- Fix: Render one semantic anchor styled as a button for navigation; retain buttons for actions.
- Acceptance criteria: No nested interactive elements across routes; each navigation control is one tab stop and navigates correctly.
- Status: DONE
- Completion note: Converted six remaining nested link/button controls into styled links. Production create DOM has no nested controls; source scan, build/lint/TypeScript pass.

### [x] A11Y 04 — P1

- Severity: P1
- Location: app/create/page.tsx; components/info-page.tsx; mobile navigation and gift cards
- Evidence: At 320px, back control is 36x36px; budget chips are 40px tall. Gift shop links use h-10.
- Fix: Increase mobile control hit areas to at least 44x44px, preserving visual hierarchy.
- Acceptance criteria: Measure all mobile controls across routes; every touch target meets the requested 44px minimum without overlap.
- Status: DONE
- Completion note: Added a mobile 44px button minimum and enlarged compact back/edit controls. Browser at 320px finds no undersized visible buttons or page overflow on create; private flows remain covered by OWNER 02. Build/lint/TypeScript pass.

### [ ] A11Y 05 — P1

- Severity: P1
- Location: app/g/[group_id]/settings/page.tsx:111; /g/[group_id]/settings
- Evidence: Group name Label has no htmlFor and the edit Input has no explicit matching id.
- Fix: Connect the edit label and control; audit other group-route labels and fix each demonstrated gap in a separate issue.
- Acceptance criteria: Group name input has the correct accessible name; clicking its label focuses it.
- Status: OPEN
- Completion note: Pending.

### [ ] A11Y 06 — P1

- Severity: P1
- Location: app/g/[group_id]/page.tsx; /g/[group_id]
- Evidence: The only h1 is inside the private/no-access branch; loaded dashboard sections start at h2.
- Fix: Render the group name as the loaded dashboard h1.
- Acceptance criteria: A valid group dashboard has exactly one h1, including after tab changes.
- Status: OPEN
- Completion note: Pending.

### [ ] A11Y 07 — P1

- Severity: P1
- Location: app/g/[group_id]/settings/page.tsx:98; /g/[group_id]/settings
- Evidence: Group settings is a span; section headings are h2 and no h1 exists in the route source.
- Fix: Make the visible page title an h1.
- Acceptance criteria: Loaded settings has exactly one h1 and a logical heading hierarchy.
- Status: OPEN
- Completion note: Pending.

### [ ] A11Y 08 — P1

- Severity: P1
- Location: app/create/page.tsx header; /create
- Evidence: Lighthouse button-name and link-name fail on the icon-only back control; browser DOM scan finds one unnamed button.
- Fix: Give the single semantic back link a meaningful accessible name while applying A11Y 03.
- Acceptance criteria: Back navigation is announced as Back to home, with one focus stop; Lighthouse button-name and link-name pass.
- Status: OPEN
- Completion note: Pending.

### [ ] A11Y 09 — P1

- Severity: P1
- Location: app/create/page.tsx selected group-type cards; app/globals.css muted color
- Evidence: Lighthouse finds Friends subtitle contrast 4.36:1: #6e6e6e on composited #f1ede5 at 12px.
- Fix: Use a selected-state text/background combination meeting AA and verify other selectable group cards.
- Acceptance criteria: All selected/unselected group-card text is >=4.5:1; Lighthouse color-contrast passes for /create.
- Status: OPEN
- Completion note: Pending.

### [ ] A11Y 10 — P1

- Severity: P1
- Location: components/gift-card.tsx:30; /gifts and populated /gifts/[category]
- Evidence: Browser category headings jump h1 to h3; Lighthouse /gifts reports heading-order failure on the first product card.
- Fix: Give the product listing an appropriate h2 section heading or render card headings at the correct contextual level.
- Acceptance criteria: No heading-level skips on gift routes; Lighthouse heading-order passes.
- Status: OPEN
- Completion note: Pending.

### [ ] A11Y 11 — P1

- Severity: P1
- Location: components/gift-card.tsx:36; all product listings
- Evidence: Lighthouse label-content-name-mismatch: visible Shop at Cadbury is overridden by a label beginning Shop [product] at [shop], without the visible phrase.
- Fix: Build the accessible name from the actual visible shop label, then append product/context.
- Acceptance criteria: Accessible name contains visible link text in the same order; speech-control selection and automated name check pass.
- Status: OPEN
- Completion note: Pending.

### [ ] BUILD 01 — P1

- Severity: P1
- Location: next.config.ts; production server startup
- Evidence: next start warns that /Users/hassan/package-lock.json was selected as the workspace root because multiple lockfiles exist.
- Fix: Explicitly configure the correct tracing root after checking deployment needs.
- Acceptance criteria: Build and start pass without inferred-root warning; traced deployment includes required application files only.
- Status: OPEN
- Completion note: Pending.

### [ ] DEPLOY 01 — P1

- Severity: P1
- Location: app/robots.ts:5; app/layout.tsx; preview deployments
- Evidence: robots always allows / and root metadata has no environment-dependent indexing rule.
- Fix: Disable indexing on non-production deployments using a verified environment signal and response/meta directives.
- Acceptance criteria: Production public pages remain indexable; preview responses and robots disallow indexing. Owner verifies hosting environment values.
- Status: OPEN
- Completion note: Pending.

### [ ] OWNER 02 — P1

- Severity: P1
- Location: Authenticated /g/[group_id], /reveal, /settings and /join/[invite_code] QA
- Evidence: No isolated test project or valid disposable multi-member fixtures were identified. Production group membership, draws, messages and deletion were not mutated.
- Fix: NEEDS OWNER: provide a staging Supabase project and disposable multi-member groups, including pre-draw, drawn, empty, single-item and large-data states; confirm notification email is safely isolated.
- Acceptance criteria: Run every private-route interaction, role/permission failure, slow/failed request, long-string case, requested viewport and 200% zoom without affecting real users.
- Status: NEEDS OWNER
- Completion note: Pending.

### [ ] PERF 01 — P1

- Severity: P1
- Location: app/page.tsx; app/layout.tsx; /
- Evidence: Lighthouse mobile homepage LCP is 4.2s and performance is 86 in the captured baseline.
- Fix: Profile the LCP element and critical font/style/render path; reduce the demonstrated delay without changing product behavior or hiding useful content.
- Acceptance criteria: Repeat comparable mobile runs; record LCP and performance changes with no visual, accessibility or console regressions.
- Status: OPEN
- Completion note: Pending.

### [ ] QA 01 — P1

- Severity: P1
- Location: Audit tooling and key pages
- Evidence: Baseline captured with ephemeral Lighthouse 13.5.0: home 86/100/100/100; create 89/81/100/100; gifts 79/98/100/100 (performance/accessibility/best practices/SEO). Create fails the requested accessibility threshold.
- Fix: Preserve baseline reports and rerun the same version/settings after fixes, including representative category and private pages once fixtures exist; do not add a project dependency.
- Acceptance criteria: Record before/after performance, accessibility, best-practices and SEO scores; final accessibility, best-practices and SEO are each >=95.
- Status: OPEN
- Completion note: Pending.

### [ ] QA 02 — P1

- Severity: P1
- Location: Every route/component; remaining audit coverage
- Evidence: Initial browser pass covers public-route headings, metadata, nested controls, console and horizontal overflow only. 200% zoom, all interactions, detailed contrast/focus, failed requests and long-data states are not yet verified.
- Fix: Finish the checklist and add each demonstrated defect as its own issue before fixing it; retain evidence per route/state.
- Acceptance criteria: Complete route/state matrix with keyboard, zoom, touch, contrast, long strings, empty/single/hundreds of items and network-failure results. No untested cell is reported as passed.
- Status: OPEN
- Completion note: Pending.

### [ ] SEO 01 — P1

- Severity: P1
- Location: app/layout.tsx: metadata.alternates; every public child route
- Evidence: Browser checked 15 non-homepage public URLs: all declare https://www.checkmybasket.co.uk as canonical.
- Fix: Give each public page its own production canonical, including category metadata; keep private routes noindex.
- Acceptance criteria: Rendered canonicals exactly match each public route on the production origin.
- Status: OPEN
- Completion note: Pending.

### [ ] SEO 02 — P1

- Severity: P1
- Location: app/layout.tsx; app/gifts/[category]/page.tsx; public child routes
- Evidence: Root Open Graph URL/title and Twitter title describe the homepage; category metadata only returns title and description.
- Fix: Generate accurate per-route social titles, descriptions and absolute URLs from shared metadata helpers.
- Acceptance criteria: Inspect every public route: OG/Twitter fields accurately describe that page and use absolute production URLs.
- Status: OPEN
- Completion note: Pending.

### [ ] SEO 03 — P1

- Severity: P1
- Location: app/g/[group_id] route tree; app/robots.ts:10
- Evidence: robots disallows /g/, but the route tree has no metadata noindex directive. Crawl disallow alone does not declare noindex.
- Fix: Add inherited private-route noindex metadata without exposing private data in titles or social previews.
- Acceptance criteria: All group, reveal and settings responses contain noindex and remain excluded from the sitemap.
- Status: OPEN
- Completion note: Pending.

### [ ] STATE 01 — P1

- Severity: P1
- Location: app/not-found.tsx (missing); unmatched URLs and invalid gift categories
- Evidence: Browser /polish-audit-missing shows default '404 / This page could not be found' with no recovery link.
- Fix: Create a branded 404 with useful home and gift links.
- Acceptance criteria: Unknown URLs return HTTP 404, match the app design and provide working keyboard-accessible recovery links.
- Status: OPEN
- Completion note: Pending.

### [ ] STATE 02 — P1

- Severity: P1
- Location: app/error.tsx and app/global-error.tsx (missing); all routes
- Evidence: No route-level or root runtime error boundary exists in the app tree.
- Fix: Add branded error recovery with a clear explanation, retry and safe navigation.
- Acceptance criteria: Inject a controlled render failure in an isolated environment; recovery UI works and shows no stack trace or raw error object.
- Status: OPEN
- Completion note: Pending.

### [ ] STATE 03 — P1

- Severity: P1
- Location: app/g/[group_id]/page.tsx:217 and other toast.error(error.message) call sites; group, reveal and settings routes
- Evidence: Multiple backend errors are passed directly to toast.error(error.message).
- Fix: Map failures to specific plain-language actions; keep technical diagnostics outside user-facing messages.
- Acceptance criteria: Simulated permission, network and validation failures give useful recovery guidance without raw database/internal errors.
- Status: OPEN
- Completion note: Pending.

### [ ] UI 01 — P1

- Severity: P1
- Location: app/page.tsx header; / at 320x740
- Evidence: Browser: header create CTA right edge reaches 345.1px in a 320px viewport; document horizontally overflows.
- Fix: Adjust header layout, spacing and responsive CTA sizing.
- Acceptance criteria: No overflow, clipping or overlap at 320px and all requested widths; navigation remains usable.
- Status: OPEN
- Completion note: Pending.

### [ ] CONTENT 01 — P2

- Severity: P2
- Location: components/info-page.tsx:30; app/page.tsx footer
- Evidence: Copyright is hardcoded to 2026. It is correct today but will become stale.
- Fix: Derive the year through a shared server-rendered value.
- Acceptance criteria: Rendered year matches the current year without a manual edit and does not create hydration warnings.
- Status: OPEN
- Completion note: Pending.

### [ ] CONTENT 02 — P2

- Severity: P2
- Location: app/g/[group_id]/page.tsx:994; group awards view
- Evidence: Heading contains a decorative trophy emoji: '🏆 Gift Prediction Awards'.
- Fix: Use the established icon system if decoration is useful; retain the heading meaning.
- Acceptance criteria: No decorative heading emoji remains and decorative icon is hidden from assistive technology.
- Status: OPEN
- Completion note: Pending.

### [ ] HYGIENE 01 — P2

- Severity: P2
- Location: README.md; repository root
- Evidence: README still identifies the app as a create-next-app starter with generic setup instructions.
- Fix: Replace with accurate CheckMyBasket setup, verification, environment-variable names and deployment instructions; never include values.
- Acceptance criteria: A new developer can follow documented commands; no starter text or secrets remain.
- Status: OPEN
- Completion note: Pending.

### [ ] OWNER 01 — P2

- Severity: P2
- Location: app/opengraph-image.tsx; social assets
- Evidence: Current OG asset is generated artwork at 1200x630. The brief requests real screenshot/brand assets; none were supplied for this audit.
- Fix: NEEDS OWNER: provide an approved real product screenshot or branded OG composition and confirm usage rights; wire it into social metadata afterward.
- Acceptance criteria: Approved 1200x630 asset is deployed, fetchable and visually checked in social previews.
- Status: NEEDS OWNER
- Completion note: Pending.

### [ ] PERF 02 — P2

- Severity: P2
- Location: components/gift-card.tsx:24; /gifts and product categories
- Evidence: Lighthouse image-delivery audit estimates 304KiB savings on /gifts; a 750x750 product image transfers 85,440 bytes for a much smaller displayed image.
- Fix: Align image wrapper dimensions and sizes with the actual contained image, and use appropriate optimized dimensions/quality.
- Acceptance criteria: Matched mobile report shows lower image transfer and image-delivery waste with crisp products at requested viewport sizes.
- Status: OPEN
- Completion note: Pending.

### [ ] PERF 03 — P2

- Severity: P2
- Location: Shared client bundle; app/layout.tsx and client import graph
- Evidence: Lighthouse estimates 102KiB unused JavaScript on home/gifts and 93KiB on create. Largest emitted chunk is 293,704 bytes raw.
- Fix: Attribute unused bytes to modules before editing; defer noncritical client functionality where profiling justifies it. Do not delete dependencies based solely on this estimate.
- Acceptance criteria: Record affected chunks and per-page transferred JS before/after; reduce proven unused initial code and verify every affected interaction.
- Status: OPEN
- Completion note: Pending.

### [ ] SEO 04 — P2

- Severity: P2
- Location: app/layout.tsx; app/robots.ts:12; app/sitemap.ts:4
- Evidence: Production origin is duplicated as literals in metadata, robots and sitemap.
- Fix: Introduce one validated production-origin source of truth; use it for public URLs and metadata.
- Acceptance criteria: Changing the configured production origin updates canonicals, sitemap and robots consistently; previews never redefine production canonicals.
- Status: OPEN
- Completion note: Pending.

### [ ] SEO 05 — P2

- Severity: P2
- Location: app/gifts/layout.tsx; app/gifts/[category]/page.tsx:14
- Evidence: Browser category titles end at 'UK' and omit CheckMyBasket: the intermediate layout defines a plain title rather than forwarding a template.
- Fix: Apply the intended title template consistently to gift categories.
- Acceptance criteria: Every category title remains specific and includes CheckMyBasket exactly once.
- Status: OPEN
- Completion note: Pending.

### [ ] SEO 06 — P2

- Severity: P2
- Location: app/manifest.ts and app/apple-icon.tsx (missing); global metadata
- Evidence: Branded app/icon.tsx exists, but no manifest or Apple touch icon exists; no public icon set directory exists.
- Fix: Add a valid manifest and correctly sized brand-derived icons; preserve the existing brand rather than inventing artwork.
- Acceptance criteria: Manifest and all linked icons return 200 with correct MIME types/dimensions; no framework defaults remain.
- Status: OPEN
- Completion note: Pending.

### [ ] STATE 04 — P2

- Severity: P2
- Location: app/loading.tsx and segment loading files (missing); async route transitions
- Evidence: There are no segment loading boundaries. Interactive views do contain local load states; those do not cover all server/navigation waits.
- Fix: Add layout-matched loading boundaries where async server navigation can suspend.
- Acceptance criteria: Throttled transitions show an accessible loading state with stable layout; no indefinite spinner on failure.
- Status: OPEN
- Completion note: Pending.
