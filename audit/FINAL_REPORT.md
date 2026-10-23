# CheckMyBasket production polish report

23 October 2026 · branch `polish/production-audit` · base `237cf0c` · repository `seo-release`.

The public polish implementation is complete. 55 findings are fixed or verified as already resolved in the current application; three issues remain NEEDS OWNER. The complete production definition of done is **not certified** until the owner checks below pass. Changes are local commits; nothing was pushed or deployed. No database schemas/models, real memberships, draws, reservations or customer data were changed, and no emails or WhatsApp messages were sent.

## Changes and scope

- Patched Next.js and matching ESLint config from 16.4.0 to 16.4.2, repaired the baseline CommonJS lint configuration, and fixed workspace-root detection.
- Connected labels/errors, focused invalid fields, exposed budget selection, removed nested link/button controls, named icon controls, restored loaded-state headings, enlarged mobile targets and fixed demonstrated contrast failures.
- Added branded 404/error recovery and loading boundaries; replaced raw backend messages with safe action-specific guidance; handled load/auth transport and clipboard failures. Four regression tests check error-detail safety.
- Preserved and completed per-page canonical/social metadata using one web production-origin constant, added preview noindex logic, manifest and app/touch icons, and reused the existing 1200×630 OG artwork. Added truthful homepage structured data.
- Unified header backgrounds, brand marks, fonts, rectangular radii and surface colors through existing brand tokens; supported unbroken long text. Replaced the decorative awards emoji, made the sample receipt explicitly an example, and generated the copyright year.
- Deferred create-only SDK, QR and recovery code until needed, disabled speculative prefetch into private tools, and removed unused shadcn CLI, date-fns and Zustand. No dependencies were added; Lighthouse ran ephemerally.
- Logged the intentional validation/interaction changes before implementation: custom budgets now validate consistently as whole pence (including £0.50), reject excess decimal precision and oversized amounts, and the create screen supports native Enter-key submission. Product data models and copy meaning were retained.

The earlier audit used an older checkout. Canonical, old header overflow, selected-card contrast, category branding and image-delivery findings were already resolved in this newer base. Their issue notes record this; no redundant fix is claimed. The parent `../BACKLOG.md` remains untouched as the separate product/security backlog.

## Required checks

| Check | Result |
| --- | --- |
| Baseline build / TypeScript | PASS / PASS |
| Baseline lint | FAIL: CommonJS harness rules; fixed in BUILD 02 |
| Final production build / lint / TypeScript | PASS / PASS / PASS |
| Local regression checks | 99 PASS: analytics 16, gift selection 9, verifier 54, local Node tests 20 |
| Production dependency advisories | 0 |
| Development dependency advisories | 5 high entries in one upstream lint chain; SECURITY 02 |
| Production static chunk source maps | 0; probed `.js.map` returns 404 |
| Client secret-marker check | 0 files matching private-key/service-role markers; limited scan, not a comprehensive secret audit |
| Public console warnings/errors | Before: 0 in sampled public navigation. After: 0 across the 40-route matrix and settled image checks |
| Anonymous private/utility console warnings/errors | 0 in recorded navigation sample; authenticated states unmeasured |

The local regression commands were `node scripts/analytics/test.cjs`, `node scripts/gift-selection/test.cjs`, `node scripts/gift-verifier/test.cjs` and `node --test tests/*.test.cjs`. Live/database test scripts were deliberately not run against the sole production project.

## Lighthouse and JavaScript

Lighthouse 13.5.0, local production server, default simulated mobile throttling, Chrome headless. Scores are **performance/accessibility/best practices/SEO**. These are single-run lab measurements, not production field data. Accessibility, best practices and SEO meet the requested ≥95 threshold on all four measured page types.

| Page | Before | Final | Final LCP |
| --- | --- | --- | --- |
| Home | 97/100/100/100 | 96/100/100/100 | 2.76s |
| Create | 94/100/100/100 | 95/100/100/100 | 2.91s |
| Gifts | 95/100/100/100 | 95/100/100/100 | 2.91s |
| Guide | Not captured | 96/100/100/100 | 2.75s |

Home baseline is the initial current checkout (Next 16.4.0). Create/gifts baselines are commit `ae3b44d`, after correctness fixes and before the performance pass (Next 16.4.2). This distinction matters: their before accessibility scores already include correctness fixes. The earlier checkout's 86/89/79 performance and 81 create-accessibility scores are historical and are not presented as comparable gains here. Guide is `/secret-santa-rules`; no matching before run exists.

Home LCP is approximately 2.60s → 2.76s, create 3.01s → 2.91s and gifts 2.90s → 2.91s. Home performance changes 97 → 96 and gifts remains 95. These small differences do not establish a speed improvement or regression. An intermediate gifts run scored 92; it is not the final result. No score was discarded to manufacture a claimed gain.

Transferred Script bytes, summed from the Lighthouse network-request audit:

| Page | Before bytes | Final bytes | Reduction |
| --- | --- | --- | --- |
| Home | 262,483 | 213,575 | 18.6% |
| Create | 278,322 | 213,575 | 23.3% |
| Gifts | 287,893 | 223,146 | 22.5% |

All emitted raw static JavaScript, across **all routes and deferred chunks**, is **1,409,743 → 1,426,303 bytes** (+16,560; +1.2%). This baseline is also before the performance pass, not before every correctness change. Splitting/deferred functionality reduces initial transfer while the total emitted code grows slightly. Largest final raw chunks: 242,077; 233,875; 159,203; 112,594; 57,190 bytes. No claim that the entire bundle shrank is made. Final image-delivery Lighthouse audits pass on the measured pages; the historic 304KiB image-waste finding does not reproduce in this newer catalogue.

Raw reports: `lighthouse-before-*.json`, `lighthouse-after-*.json`, `bundle-before.json`, `bundle-after.json`; machine-readable comparison: [metrics.json](metrics.json).

## Re-audit evidence

| Area | Evidence and result | Limit |
| --- | --- | --- |
| Stack/router/routes | [route-inventory.json](route-inventory.json); Next App Router, React, strict TS, Tailwind 4, CSS tokens, Base UI/shadcn primitives, Lucide, Sonner, Supabase; documented Vercel target | Live account settings not changed/certified |
| Public metadata/structure | [public-route-matrix.json](public-route-matrix.json): 40 routes; unique titles/descriptions, exact public canonicals; complete OG/Twitter image tags, site name/type, manifest/apple icon/theme; one h1/main, no skipped heading levels, unnamed buttons, unlabelled controls, missing alt or nested interactive controls | Automated checks support manual inspection; they are not a full screen-reader assessment |
| Responsive layout | 40 routes × ten viewport sizes = 400 checks: 320, 375, 414, 768, 1024, 1280, 1440, 1920; landscape 740×320 and ultrawide 2560×1080. No document overflow; measured mobile links/buttons meet 44px | Physical devices and native 200% zoom remain owner checks |
| Stress/empty data | [stress-layout.json](stress-layout.json): real shared components with synthetic empty, one-item and 200-item fixtures; headings/titles/descriptions with hundreds of unbroken characters wrap. Temporary fixture routes removed | Does not replace role-specific private fixtures |
| Assets, fragments and external-link markup | [assets-and-links.json](assets-and-links.json): all 40 routes settle with zero broken/pending images, missing local fragments or unsafe target-blank links; no generic-copy regex hits in sampled main paragraphs | Merchant destination availability, purchase flow and exhaustive editorial/legal review not certified |
| Indexing and exposed files | [http-endpoints.json](http-endpoints.json): exact 39-URL public sitemap; no missing/unexpected/private URLs; robots points to it. Icons/manifest/OG return correct MIME/dimensions. Env/git/debug/admin/test probes and removed fixtures return 404 | `favicon.ico` is absent intentionally; explicit branded PNG icon routes are used. Preview logic is tested in source/environment cases, not an actual deployed preview |
| Private metadata | [private-metadata.json](private-metadata.json): group/reveal/settings/join/return/wishlist/editor/shared pages emit noindex,nofollow and role-specific metadata | Private names, assignments and share tokens deliberately never enter previews; generic metadata is intentional |
| Anonymous states | [anonymous-states.json](anonymous-states.json): private group access denial, settings redirect, no-match reveal, invalid wishlist/editor and malformed invite recovery; empty dashboard and loading state observed | No disposable authenticated production identities created |
| Interaction examples | Gift filters reach an actionable empty state; “Try any interest” keeps budget and returns results; pagination advances 1–12 to 13–24; save-gift link reaches wishlist review; create Enter/invalid/custom-budget states; FAQ disclosure; engraving preview updates character count; invitation copy shows confirmation; cookie settings opens and rejects analytics | Not every authenticated interaction or external destination was exercised |
| Errors/loading | Render-failure fixture confirmed branded retry/home recovery without raw details; root loading observed; failed malformed invite shows recovery UI; safe-error tests pass | Slow/offline and every role-specific mutation failure remain owner checks |
| Design/content | Current screenshots and source review confirm consistent paper/ink/accent system, Inter/IBM Plex, existing basket mark, tokenized controls and no default starter artwork. Sample receipt is labelled “Example draw”; no invented testimonials/reviews added | Existing legitimate functional examples/placeholders are retained; contact mailbox ownership/legal approval requires owner |

Domain scan: production web metadata uses `lib/site.ts`. There are no preview-host markers in runtime web links. Supabase recovery retains an intentional localhost:3101 development CORS allowance; changing that security policy is outside this visual polish pass. Edge notification code uses its existing `APP_URL` environment setting with a production fallback; owner must verify the deployed setting. Documentation/test fixtures and the URL validator's localhost rejection are not runtime production-link defects. Environment values were not printed.

Structured-data references: [Schema.org WebSite](https://schema.org/WebSite), [WebApplication](https://schema.org/WebApplication). Markup describes only this real website/app; it makes no rich-result eligibility, rating or search-action claims. Rendered JSON is in [structured-data.json](structured-data.json).

## NEEDS OWNER

1. **OWNER 02 — isolated private-flow QA.** The read-only Supabase inventory found the production CheckMyBasket project and no branches; development/production env files point to it. Provision staging with three disposable users, organiser/member roles, pre/post-draw groups and empty/single/200-item wishlists. Capture notifications in a test inbox. Verify join, draw, reveal, exclusions, settings, anonymous messaging, reservations, recovery and all permission/failure cases there.
2. **QA 02 — remaining environment/manual coverage.** Run real 200% browser zoom (the automation shortcut did not change zoom; 640px reflow passed only), physical-device, screen-reader and slow/offline checks. After an owner-approved deployment, smoke-test production/preview headers, noindex, redirects, domain configuration, `APP_URL` email links and contact mailbox. Confirm downloads print correctly and real merchant destinations remain available. Untested cells remain unverified.
3. **SECURITY 02 — upstream development-tool advisory.** Production audit is clean. Five development advisory entries remain in `braces → micromatch → fast-glob → @next/eslint-plugin-next → eslint-config-next`. Compatible fixes and removal of the unused generator reduced the original 20 findings to five. The available braces release remains affected; npm's suggested Next-14 ESLint downgrade is unsuitable. Record a temporary development-tool risk exception, avoid untrusted glob patterns and upgrade matching tooling when an upstream compatible fix ships.

No DNS, domain/account settings, fabricated brand assets or live-data actions were substituted for these checks. Existing branded OG artwork was found and reused, so new owner artwork is not needed.

## Review artifacts

- [Backlog](../BACKLOG.md), individual issue commits on `polish/production-audit`.
- [Desktop homepage](screenshots/home-desktop.png) and [mobile create screen](screenshots/create-mobile.png).
- Source/build tests passed before marking code issues done; final source passed build/lint/TypeScript and all 99 local regressions. Documentation/evidence-only commits followed.
