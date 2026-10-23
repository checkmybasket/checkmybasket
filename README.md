# CheckMyBasket

Free Secret Santa draws, wishlists and UK gift discovery. Built with Next.js App Router, React, TypeScript and Tailwind CSS, with Supabase authentication and data. Vercel is the hosting target.

## Local setup

Run commands from this repository directory. Install the locked dependencies with `npm ci`. Obtain the project's development environment configuration through the existing Vercel project or its owner; use an isolated Supabase project for test writes.

Required application variables in `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`: development Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: the project's public client key.
- `GIFT_MASTER_FEED_URL`: optional published CSV feed. Without it, the checked-in catalogue is used.

Do not commit local environment files. Email and recovery functions have their own deployment configuration; see `docs/email-recovery.md`. Notification email remains optional and requires separate ownership verification.

Use `npm run dev` for development or `npm run build` followed by `npm run start` for a production-mode check. The production CSP intentionally disallows eval, so use production mode for reliable browser/console verification.

## Verification

```sh
npm run build
npm run lint
npx tsc --noEmit --incremental false
node --test tests/*.test.cjs
node scripts/analytics/test.cjs
node scripts/gift-selection/test.cjs
node scripts/gift-verifier/test.cjs
```

See [docs/staging.md](docs/staging.md) for staging provisioning, guarded integration-test variables and outstanding setup gates.

The commands above run local checks. Files named `*-db.cjs`, `*-live.cjs` and other integration scripts require a separately reviewed isolated fixture environment; they are not part of local verification.

## Production configuration

The public origin is defined in `lib/site.ts`. Keep public canonicals, sitemap, robots and social links aligned with it. Vercel non-production environments receive noindex response headers. Private group, invitation, recovery and wishlist routes remain excluded from indexing and private data is not used in social previews.

Review `BACKLOG.md` for production polish and the parent project's master backlog for product work. Check the parent `RELEASE_CHECKLIST.md` before publishing; this branch's local changes are not a production deployment.
