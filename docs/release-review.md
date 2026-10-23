# Production polish release review

23 October 2026 release update: owner checks approved; tested candidate promoted to both customer domains. Fresh public Lighthouse accessibility/best-practices/SEO are 100 on home/create/gifts, with zero captured browser console warnings/errors across 40 routes. See audit/PRODUCTION_RELEASE.md. The original pre-release review follows; PR #3 remains draft and main is not merged.

Production polish and local acceptance are ready for review; this draft does not claim the production release is complete.

The change adds per-route social metadata and brand icons, consistent shared styling, accessible controls/headings/focus, safe loading/error/empty states, lighter initial page JavaScript and isolated local Supabase/mail staging. It also closes three verified game authorization gaps: actual gifts require round membership, prediction subjects must share the group, and submissions require an open round.

Validation: staging build, lint, TypeScript and all 110 local regressions pass. Real local Auth/RPC/email/recovery and member/nonmember permission suites pass. Evidence includes 400 public viewport cases, 70 private-state viewport cases and 50 real wishlist stress cases, plus sampled keyboard traversal and controlled save-failure/retry checks. These counts describe different scoped matrices; they do not certify every interaction. Normal captured console errors/warnings are zero. Historical production-mode Lighthouse accessibility/best practices/SEO were 100 on measured key pages; local staging intentionally fails crawlability because it is noindex.

Release gates remain open: private owner/group native 200% zoom, actual screen reader, physical phone, clipboard denial and the documented upstream development-tool advisory decision. The protected cloud preview has no isolated backend configuration; local loopback services cannot be used by Vercel. Do not substitute production credentials for a test preview.

SECURITY 03–05 are now applied in production as server versions 20261023161744, 20261023161924 and 20261023162053. Their SQL hashes and policy definitions were verified; all 29 migration inventories match. The website candidate is staged but not promoted to customer domains. Read-only live checks show correct canonicals/headers/sitemap/redirects; 24 live pages still lack OG image tags that this branch supplies. Release the reviewed website candidate through the normal process, retain the applied policies, then rerun custom-domain production verification. Never deploy the local staging .next artifact.

Review evidence: BACKLOG.md; audit/FINAL_REPORT.md; audit/LOCAL_STAGING_REPORT.md. Reproduction and remaining owner checks: docs/staging.md; docs/owner-release-checks.md.

## Targets

- Repository: checkmybasket/checkmybasket; base main; head polish/production-audit.
- Vercel: checkmybasket, prj_n7T4GLJLEZBnejmvD3BfTL3O5Bcj, team_wccODqbGv3QVLCfz2Dm1Nee5; Node 24.x.
- Vercel authentication remains enabled for all deployments except custom domains.
- Production public Supabase/App URL variables exist; the three corresponding preview variables are absent. No secret values were copied into this document.

## Release order

1. Complete or explicitly resolve the open owner checks and review this draft.
2. The three backward-compatible authorization migrations are already applied and verified in production. Retain them during any app rollback; do not replay them under old timestamps.
3. The final protected production-configured candidate for website commit 5534eb0 is staged. Complete the outstanding owner gates and review audit/RELEASE_CANDIDATE_REPORT.md before promotion.
4. Promote only the tested production candidate, then verify the deployed commit, canonicals/OG, console, Lighthouse, email delivery and permission boundaries.
5. If application rollback is needed, retain the tightened authorization policies: the old client API remains compatible. Do not restore the vulnerable insert policies as a routine rollback.
