# Local staging

Local staging is running on this Mac using Docker CLI **29.9.2**, Colima **0.10.3** and Supabase CLI **2.122.0**. No cloud project, subscription or production environment was changed. Docker Desktop's installer rolled back after a filesystem permission error; the working Docker runtime is Colima.

- App: http://localhost:3101
- Supabase Studio: http://127.0.0.1:54323
- Captured mail: http://127.0.0.1:54324
- Local API: http://127.0.0.1:54321

All published backend ports bind to `127.0.0.1`. The dedicated `cmb-staging` VM uses 2 CPUs and 6 GiB RAM; the default Docker context is unchanged. Supabase's project ID is `checkmybasket-local`. The database was created empty and all 26 checked-in migrations applied. Public tables have RLS; the local security advisor found no warnings.

## Start again

Run from this repository. The Docker network and local environment files already exist on this machine.

```sh
colima start cmb-staging --activate=false --ssh-config=false
DOCKER_HOST=unix://$HOME/.colima/cmb-staging/docker.sock npx --yes supabase@2.122.0 start --network-id cmb-staging-local
```

Start local Edge Functions in another terminal:

```sh
DOCKER_HOST=unix://$HOME/.colima/cmb-staging/docker.sock npx --yes supabase@2.122.0 functions serve --network-id cmb-staging-local --env-file .env.functions.staging.local
```

Build and start the app:

```sh
node scripts/staging/app.cjs build
node scripts/staging/app.cjs start
```

Stop an existing app server before rebuilding. The launcher reads `.env.staging.local`, validates matching local app/test credentials and starts on loopback only. It loads variables into the child environment rather than passing Node's `--env-file` to Next; Node 26 rejects that flag when Next forwards it through worker `NODE_OPTIONS`.

The current `.next` output is a **local staging build** with local backend credentials and noindex. Rebuild with the intended production configuration before any release; do not deploy this local artifact as prebuilt production output.

## Environment files and fresh-machine setup

`.env.staging.local` and `.env.functions.staging.local` are ignored and mode 0600. Existing `.env.local`, `.env.production.local` and `.env.development.local` were preserved byte-for-byte. No provider or server secret belongs in a `NEXT_PUBLIC_*` variable.

On a fresh Mac, install Docker CLI and Colima with `brew install docker colima`, create the dedicated profile, then create the loopback network before starting Supabase:

```sh
colima start cmb-staging --activate=false --ssh-config=false --cpu 2 --memory 6 --disk 40
DOCKER_HOST=unix://$HOME/.colima/cmb-staging/docker.sock docker network create -o com.docker.network.bridge.host_binding_ipv4=127.0.0.1 cmb-staging-local
```

Copy `config/staging.env.example` to `.env.staging.local`, filling its public/anon key from **local** `supabase status`. Never copy production env files. The app/test Supabase URL must both be `http://127.0.0.1:54321`, with `CMB_TEST_PROJECT_REF=local` and app URL `http://localhost:3101`. Do not print full `supabase status` JSON in shared logs because it also contains local server credentials.

Copy `config/functions.staging.env.example` to `.env.functions.staging.local`. It uses a dummy capture key, not a real Resend credential. Set both files to mode 0600.

Native Auth mail uses local SMTP. Custom recovery/draw functions use the explicit `CMB_LOCAL_MAILPIT=true` transport: it rejects hosted Supabase origins and recipients outside `example.invalid`, and does not forward provider credentials to Mailpit. Without that flag, the existing production fetch transport is unchanged. Recovery links use `APP_URL`, defaulting to the existing production origin when unset. No cloud function or provider settings were deployed.

## Verification

```sh
node --test tests/*.test.cjs
node scripts/analytics/test.cjs
node scripts/gift-selection/test.cjs
node scripts/gift-verifier/test.cjs
node --env-file=.env.staging.local tests/wishlists-live.cjs
node --env-file=.env.staging.local tests/wishlists-api-live.cjs
node --env-file=.env.staging.local tests/local-mail-live.cjs
```

The 110 local regression checks pass (31 Node tests plus 79 existing analytics/gift checks). The three live scripts above also pass against local staging. They create disposable identities and feature data; they refuse production targets before requests. Their implemented cleanup removes feature data, while local Auth fixture identities remain disposable.

The mail acceptance test runs the real local Auth, Edge Functions and database. It checks captured recovery mail, same-identity restoration, a single-use recovery token, verified notification preference, accepted draw mail and duplicate suppression. Nothing is sent to a real inbox.

The browser-created pending and drawn groups are explicitly named local acceptance fixtures. Create/join/draw/reveal, name editing, invite copy, gift-bought update and anonymous question/reply were exercised. Separate member and non-member clients verified match privacy, organiser restrictions, immutable assignments, private-table reads and late-join rejection.

Seven loaded private states passed all ten requested viewport sizes (70 cases), with one h1/main, no skipped headings, no unlabelled controls, no nested interactive elements, no mobile target violations and no horizontal overflow. Normal-state console capture is clean. Deliberately stopping local Auth showed actionable recovery, and restarting it plus Retry restored the group. Pausing local REST showed the named loader and resumed normally; expected fault-request console events are excluded from the normal count.

Evidence and remaining scope: [local staging report](../audit/LOCAL_STAGING_REPORT.md), [private matrix](../audit/private-route-matrix.json), [local status evidence](../audit/local-staging.json).

## Stop and retain fixtures

Stop the app and function-server terminals with Ctrl-C, then:

```sh
DOCKER_HOST=unix://$HOME/.colima/cmb-staging/docker.sock npx --yes supabase@2.122.0 stop --project-id checkmybasket-local
colima stop cmb-staging
```

Do not use `--no-backup`, `--all`, reset, merge or linked/cloud database commands for routine shutdown. These scoped stop commands preserve the local fixture data.

## Release gates still open

The local setup and recorded flows are verified, not a certification of every private game/large-data/permission state. Complete the remaining exhaustive state matrix, native 200% zoom, screen-reader/physical-device and clipboard-denial checks before release. The earlier 640px reflow proxy is not a real 200% zoom pass.

Production/preview deployment, real domain/account configuration, mail-provider delivery and external merchant checks remain separate. No production deployment was performed. The development-tool advisory exception remains in SECURITY 02.

References: [Supabase local workflow](https://supabase.com/docs/guides/local-development/cli-workflows), [Colima Docker runtime](https://github.com/abiosoft/colima#docker), [Mailpit API](https://mailpit.axllent.org/docs/api-v1/).
