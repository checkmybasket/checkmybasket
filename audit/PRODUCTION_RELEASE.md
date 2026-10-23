# Production release — 23 October 2026

The owner explicitly approved all owner checks and then authorized promotion. This records owner acceptance; it does not invent device, screen-reader or provider measurements by the audit agent. OWNER 02 and QA 02 are closed by that acceptance plus the recorded automated/local evidence. Their earlier notes remain historical.

The tested production candidate `dpl_7YiSVs9LvqgMxzNgeSCZ6oNEx8hK`, website source `5534eb0ef523cf6d543dab745e878aea9581965a`, was promoted without rebuilding. Both customer-domain alias readbacks point to that deployment. The apex retains its 308 redirect to www. The three production authorization migrations remain applied.

Fresh rendered checks passed on all 40 public routes: one h1/main, one credentialed manifest link and social image metadata each; zero captured console warnings/errors. See `live-routes.json`. This pass is read-only and does not mutate customer groups or identities.

Lighthouse 13.5.0, single default simulated mobile run per public production page:

| Page | Performance | Accessibility | Best practices | SEO |
| --- | --- | --- | --- | --- |
| Home | 94 | 100 | 100 | 100 |
| Create | 100 | 100 | 100 | 100 |
| Gifts | 99 | 100 | 100 | 100 |

All three console audits pass. See `live-lighthouse-summary.json` and `lighthouse-live-*.json`. Single-run performance variation is not presented as a speed gain. Historical bundle comparisons and build/lint/TypeScript/110-regression results remain in the candidate and final reports; this promotion changes no application source or dependencies.

Backlog: 83 issues, 81 closed (including owner acceptance), two NEEDS OWNER follow-ups: SECURITY 02 upstream development-tool advisory handling and SECURITY 06 password-provider/leaked-password setting decision. General owner-check approval does not supply the specific provider-setting decision or install an upstream fix. They remain documented follow-ups, not falsely verified fixes.

PR #3 remains draft and the audit branch is not merged into main. The website release is live through explicit candidate promotion. A future main deployment must preserve these changes; reconcile the PR before unrelated production work.
