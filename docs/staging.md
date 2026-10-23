# Staging setup and acceptance status

23 October 2026. Work continues from `polish/production-audit`.

## Current result

- Production Supabase project confirmed: `nejkvrzabdetsnhpeqtl`; existing organisation: `checkmybasket's Org` (`sqdqxiddbanwxwqnwvwu`), Free plan.
- Creating `polish-staging` as a branch was rejected: **Branching is supported only on the Pro plan or above.** No branch was created and no plan was upgraded.
- Docker and Supabase CLI are not installed locally; Vercel CLI is present. Local Docker staging is an alternative, not an environment that already exists.
- Vercel project `checkmybasket` is correctly linked. Its Supabase URL/public key are currently production-only variables; no preview overrides have been written. Preview deployment protection is enabled.
- STAGE 01 fixed the app CSP so HTTPS/Realtime endpoints follow the configured backend. Three focused origin tests pass.
- STAGE 02 prevents three live integration scripts from reading production `.env.local`. Four guard tests pass; each actual script also exits before requests when staging variables are absent.
- Final preparation checks: build/lint/TypeScript pass; 27 local Node tests pass. Existing 16 analytics, 9 gift-selection and 54 verifier checks are separate from those 27.
- No cloud resource, credential, production record, notification provider, deployment or account setting was changed.

**Pending decision:** create a separate project in the existing organisation, or install Docker for local staging. The provisioning tool requires the user's explicit organisation choice. Any nonzero quoted cloud cost requires separate approval. Do not treat the original general “go ahead” as acceptance of an unquoted subscription upgrade.

## Provisioning sequence

1. Confirm the staging location. For cloud, create `checkmybasket-staging` in the selected organisation, preferably London like production. Respect the provider's project quota/cost response; do not upgrade the plan automatically.
2. Wait for a healthy, genuinely separate project and record its project ref. Verify it differs from production. Do not copy production rows, auth users, Vault secrets, webhook credentials or mail credentials.
3. Apply the checked-in migrations in filename order to the **new staging project only**. Inspect the existing target tables first; verify migrations and security advisors afterward. Do not reset, merge into or migrate the production project.
4. Configure staging anonymous auth to match app requirements. Keep external SMTP/Resend disconnected. Use a local mail sink for Docker or a dedicated staging email capture service for cloud. Verify the delivery destination before testing any notification/recovery send. Do not use real participant addresses.
5. Copy `config/staging.env.example` to `.env.staging.local` and fill the real staging ref/public key. Leave `.env.local`, `.env.production.local` and `.env.development.local` unchanged. Keep secrets out of Git and test reports.
6. Configure preview-only, branch-scoped Supabase variables for `polish/production-audit` once the backend exists. Do not replace production values. The public `NEXT_PUBLIC_*` values are frozen at build time: rebuild for staging rather than reusing a production artifact.
7. Build/run the app with the explicit staging file. Production mode avoids development eval/CSP noise:

   ```sh
   node --env-file=.env.staging.local node_modules/next/dist/bin/next build
   node --env-file=.env.staging.local node_modules/next/dist/bin/next start --port 3101
   ```

   These commands require the template placeholders to be replaced first. They write only generated `.next` output. Stop any existing local server before rebuilding.

8. Confirm CSP allows only the real staging HTTPS/WebSocket endpoints, requests actually use that backend, noindex is present, and no private data enters metadata. For Vercel, retain preview protection and verify noindex on the real preview before exercising data.

## Disposable fixtures and browser acceptance

Create an organiser, two members and a separate non-member identity in staging. Use clearly named test groups. Retain fixture IDs in a private cleanup manifest with mode 0600; never put session tokens in committed evidence.

- Pending group: valid join, duplicate join, editing own preferences, wishlists, exclusions, organiser/member controls and non-member denials.
- Drawn group: valid draw, retry/concurrent draw behavior, private reveal per member, gift-bought state, anonymous question/reply and report, late-join rejection, no cross-member assignment access.
- Settings: group-name edit, invite copy success/denial, own wishlist clearing, leave and organiser delete. Use only the disposable group for destructive actions.
- Personal wishlists: empty, one item and 200 items; sharing, recipient reservations, release, owner visibility, regeneration/disable of share links and cross-owner denial.
- Failures: slow/offline fetches, expired/missing sessions and permission errors; verify recovery actions and no raw backend details. Real 200% zoom and screen-reader/device checks remain explicit manual checks.
- Notifications/recovery: run only after proving the isolated sink receives the emails. Check verification, one accepted draw email per eligible user, retry idempotency and recovery without exposing assignments.

Existing integration scripts now use only explicit `CMB_TEST_*` variables:

```sh
node --env-file=.env.staging.local tests/wishlists-live.cjs
node --env-file=.env.staging.local tests/wishlists-api-live.cjs
```

These scripts write disposable identities and fixture data. Do not run them until the isolated target is provisioned and verified. They clean feature data where implemented; auth identities still need staging-admin cleanup. Recovery's `prepare`/redeem workflow also requires a separately prepared isolated token/email fixture; running its script alone does not configure email isolation.

## Remaining gates

- Staging location/organisation and any quoted cost approved.
- Separate backend healthy, migrations applied and auth settings verified.
- Test inbox/sink proven isolated.
- Full browser and role/failure matrix executed against staging.
- Manual accessibility checks and preview smoke completed.
- Production release only after these results are reviewed. No production deployment was performed during preparation.

References: [Supabase deployment workflow](https://supabase.com/docs/guides/deployment), [branching](https://supabase.com/docs/guides/deployment/branching). Next's installed environment-variable guide was consulted for build-time variable behavior.
