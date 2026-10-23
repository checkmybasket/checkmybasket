# CheckMyBasket release candidate

Superseded release status: owner checks were explicitly approved and this candidate is now live on customer domains. See [PRODUCTION_RELEASE.md](PRODUCTION_RELEASE.md) for fresh public-domain verification. The sections below retain pre-promotion evidence.

23 October 2026. This is the current release status; earlier audit reports retain historical measurements and stage-by-stage evidence.

## Current state

- Draft review: [PR #3](https://github.com/checkmybasket/checkmybasket/pull/3).
- Final protected production-configured candidate: [checkmybasket-71t9f0oor-hassan-amjad-s-projects-1.vercel.app](https://checkmybasket-71t9f0oor-hassan-amjad-s-projects-1.vercel.app), deployment `dpl_7YiSVs9LvqgMxzNgeSCZ6oNEx8hK`, website source `5534eb0ef523cf6d543dab745e878aea9581965a`.
- Customer www/apex aliases are still on `dpl_4CCvUnK2GER4ZiDYxcPeR1TPCwmt`; the website candidate has not been promoted to them. The Vercel-generated alias may follow the staged candidate and remains protected.
- Three authorization fixes are now applied in production. Existing user records were not rewritten. Adversarial writes were tested only with disposable local fixtures; production verification read policy definitions and stored SQL hashes.
- Latest website runtime matches the candidate across 146 files. A later migration-filename reconciliation does not change website runtime.
- Backlog: 83 individual issues, 79 completed in the branch, four NEEDS OWNER. The entire release definition of done is not certified while the owner checks remain open.

## Production migrations

| Issue | Applied server version | Verified normalized SQL MD5 |
| --- | --- | --- |
| SECURITY 03 | 20261023161744 | 02471f08e268121a11b76b363e43934b |
| SECURITY 04 | 20261023161924 | 5ece573546d0f5377c53a0564602769b |
| SECURITY 05 | 20261023162053 | 3400d68c42d2fd46c004658b01d44e4f |

Actual-gift inserts require round membership and matching recipient/logger. Prediction inserts require a matching authenticated predictor, subject in the same group and an open round. Readbacks confirm those definitions.

Supabase assigned migration versions during application. An attempted production-history timestamp rewrite was rejected by automatic approval review; it was not performed. Repository filenames and disposable local history were aligned to the server-assigned versions instead. Two pre-existing history-only discrepancies were also reconciled after verifying identical SQL hashes. All 29 production, repository and local version/name pairs now match. See [production-migration-inventory.json](production-migration-inventory.json).

Production advisors were checked before/after. They still flag the app's anonymous/RPC patterns and intentionally policy-less private tables; these are not presented as a clean advisor result. The leaked-password setting is separately tracked as SECURITY 06, NEEDS OWNER: [Supabase password protection guidance](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection). Existing advisory categories were not silenced by changing anonymous/passwordless behavior or revoking intended RPC access.

## Verification

Build, lint, TypeScript and all 110 local regressions pass after each implementation fix. The real local game-permission suite also passes. The refreshed production dependency audit reports zero vulnerabilities. Existing dev-tool advisory work remains SECURITY 02.

The final committed candidate passed a fresh rendered browser pass on all 40 inventoried routes: one h1/main each, OG image tags on all 39 indexable routes, one credentialed manifest link each, zero captured browser warnings/errors. See [final-candidate-routes.json](final-candidate-routes.json). This is public-route coverage, not production-private data mutation testing.

Native Chrome's View menu verified 200% zoom. Home, create top/bottom (including fixed submit action), gifts, the actual 200-item shared wishlist in list/card layouts, and signed-out Return were visually inspected at a 1920×1080 desktop window. The inspected content/actions remained readable and contained. Chrome was restored to 100%. This narrows the zoom gate; private owner/group views, screen-reader and physical-device checks remain unverified. Earlier 640px reflow evidence is still not counted as native zoom.

All pre-existing application env files were verified byte-for-byte unchanged. Clean deployment archives excluded local env files and .next output; Vercel rebuilt with production settings on Node 24.x. No production test identities, draws, reservations or external emails were created by this release verification.

## Protected manifest fix and Lighthouse

The first production-configured candidate exposed a manifest fetch problem behind deployment protection: requests omitted credentials, redirected to Vercel SSO, then failed CSP. DEPLOY 03 keeps the existing static manifest URL/content and emits one explicit `crossorigin=use-credentials` link. CSP and protection remain intact. This follows the [manifest credential requirement](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/crossorigin#web_manifest_with_credentials).

Lighthouse 13.5.0, one default simulated-mobile run per page before/after this demonstrated fix:

| Page | Before P/A/BP/SEO | Fixed P/A/BP/SEO | Console errors before → after |
| --- | --- | --- | --- |
| Home | 99/100/92/66 | 100/100/100/66 | 2 → 0 |
| Create | 100/100/92/66 | 99/100/100/66 | 2 → 0 |
| Gifts | 99/100/92/69 | 99/100/100/69 | 2 → 0 |

The sole failed SEO audit is crawlability: Vercel intentionally adds `x-robots-tag: noindex` to the unpromoted protected hostname. It must not be removed to chase a score. Every other SEO audit passes. Fresh indexable custom-domain Lighthouse remains a post-promotion requirement.

These Lighthouse runs used a protected verification build containing dc392b6 plus the uncommitted manifest fix, as required by fix → verify → commit. The clean committed final candidate has identical runtime files to that verified build (198 compared files), and then passed the separate 40-route browser check. Reports are [before summary](candidate-before-manifest-lighthouse-summary.json) and [fixed summary](candidate-lighthouse-summary.json); raw reports redact temporary access values. Performance differences of one point are not treated as gains.

The first staging build hit a transient generated-output cleanup error and passed on retry. An initial candidate build with incorrect commit metadata was canceled; it is not the final candidate. The final clean source commit is explicitly identified above.

## Bundle and earlier before/after provenance

The controlled local initial-script measurements in [metrics.json](metrics.json) remain the comparable before/after record: home 262,483 → 213,575 bytes; create 278,322 → 213,575; gifts 287,893 → 223,146. Those baselines have different documented starting phases; see [FINAL_REPORT.md](FINAL_REPORT.md).

Fresh protected hosted script transfers were 207,059 / 208,194 / 217,099 bytes for home/create/gifts. Hosting, compression and authenticated navigation differ, so these are not claimed as additional percentage savings over the local baseline. Total local raw JS is 1,430,969 bytes across 40 chunks, versus the pre-performance baseline 1,409,743 (+1.5%); public source maps: zero. Smaller initial loads are not a claim that the entire emitted bundle shrank.

## Remaining owner/release gates

- OWNER 02 / QA 02: actual screen-reader and physical-phone checks, private owner/group native zoom, clipboard denial, remaining untested interaction states, and real provider/account/merchant behavior. The [owner checklist](../docs/owner-release-checks.md) has explicit actions. A user answer has been requested for device/screen-reader results; no pass or waiver is inferred from silence.
- Functional isolated cloud preview: still lacks an isolated cloud-accessible backend; local loopback Supabase cannot serve Vercel. Do not substitute production credentials for destructive test fixtures.
- SECURITY 02: upstream dev-tool advisory decision/compatible fix remains with the owner.
- SECURITY 06: owner confirms password-provider settings and relevant leaked-password protection; anonymous/passwordless behavior must remain intact.

Keep PR #3 in draft and the customer-domain promotion pending until those checks are completed or explicitly resolved. Then promote the tested production candidate through the normal release process and rerun live custom-domain SEO/Lighthouse, console and provider checks. The backend policy fixes should remain applied during any application rollback.
