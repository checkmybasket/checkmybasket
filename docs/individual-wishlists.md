# Personal wishlists

Implemented 3 October 2026. Application changes await review/release; additive database migrations and the backwards-compatible recovery extension are already deployed.

## Experience

Create a list at `/wishlists` without a group, email or registration. The homepage hero and navigation include “Create a wishlist”. Lists start private; owners can maintain several lists with an occasion, date and description.

Add a public HTTP(S) link from any retailer, request editable product details, or add a wish without a link. Save still works when a retailer blocks extraction. Prices are optional estimates, stored in integer pence with their currency; unknown is distinct from zero. Size/colour notes, images and Love / Like / Inspiration priorities are supported. Owners can edit, remove and reorder gifts and delete lists.

Explicitly enable sharing to get a link, native share action, WhatsApp link and QR code. Disabling sharing revokes access; replacing the link revokes the previous capability while preserving reservations. Anyone with the link can forward it. Shared pages have generic social metadata, no indexing and no referrer disclosure.

Shared lists show Love, Like, then Inspiration, keeping the owner’s order within each priority. Compact image rows are the default, with optional compact cards, collapsible priority sections and expandable gift notes. Budget, currency, priority and sort controls are removed. Visitors can reserve, mark bought and unreserve their own gift. Owners also have a confirmed “Unreserve gift” backup in their editor. It clears any reservation, including bought status, without removing the gift or revealing reservation details. The owner mutation validates both list ownership and gift membership, uses the same list lock as reservation creation, and returns no reservation data. It works when sharing is disabled. One item accepts one reservation. Database locks and a unique constraint prevent duplicate winners. Owners cannot reserve their own wishes; owner views omit reservation details. This is surprise preservation, not absolute secrecy: the owner could use another browser identity to open their own shared link.

The dashboard includes gifts the visitor has reserved, including a release action after sharing stops. Same-browser sessions retain access. Optional verified email recovery restores the original identity, its lists, reservations and any groups on another device. An existing verified identity is never merged into another browser identity.

## Access and fetching

Storage lives in the unexposed `personal_wishlist` schema, with RLS enabled and no browser table/schema grants. RPCs explicitly enforce ownership or possession of an enabled sharing token. Public read functions project only viewer-safe fields. Recovery eligibility is service-role-only. Existing group wishlist tables and policies are unchanged.

Preview requests require an authenticated browser session and are limited to 20 per identity per 10 minutes. Fetching validates all DNS answers and pins a public address to the actual socket. Every redirect is validated again. Requests have a deadline, response size limits, standard web ports, no forwarded cookies/credentials, and content-type checks. Unsafe schemes, local destinations and private/reserved IP ranges are rejected. Images use the same fetcher and an item-access RPC; the proxy cannot fetch an arbitrary caller-supplied URL. Only supported raster image types are returned, with no browser contact to the image provider and no caching of private images.

Security-advisor findings for these RPCs are intentional authenticated/anonymous API endpoints. The private schema's “RLS enabled, no policies” findings represent deny-by-default storage. Guidance: https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy and https://supabase.com/docs/guides/observability/advisors?queryGroups=lint&lint=0028_anon_security_definer_function_executable.

## Validation

- Standard Next.js production build, TypeScript and targeted ESLint pass.
- Six unit tests cover money, retailer-neutral URLs, IP blocking, private destination fetching untrusted metadata and compatibility with single/all-address socket lookups.
- Nine recovery tests cover existing group setup/mail errors and new wishlist owner/reserver eligibility.
- Live disposable identities verify universal-link saving, manual wishes, ownership denials, private storage, public field boundaries, reordering, simultaneous reservation winners, repeat requests, owner-hidden claims, bought/release permissions, rotated/disabled links, image access and metadata rate limits.
- Deployed recovery restores the original list owner and reserver into fresh clients; one-use replay and expired links fail. Test addresses use example.invalid; no external test email is sent.
- Direct HTTP checks cover rendered private routes, indexing, metadata authentication, safe public previews, private URL rejection, unavailable-retailer fallback and image access.
- Browser interaction and mobile visual/keyboard verification remain unverified because the environment could not verify its admin-enforced browser security policy. Do not claim those checks passed. No alternate browser automation was used to bypass the denial.
- New email inbox receipt has not been manually checked. Recovery CORS supports production and localhost:3101; a separate preview domain does not automatically gain email-recovery access.

## Files and database releases

Application routes: `/wishlists`, `/wishlists/[id]`, `/w/[token]`, `/api/wishlists/metadata`, `/api/wishlists/image`. Existing `/return` now lists personal lists and reservations alongside groups.

Applied migrations: `20261003185559_individual_wishlists`, `20261003190353_personal_wishlist_image_access`, `20261003190621_personal_wishlist_recovery`. Deployed `group-recovery` version 3 retains its existing custom authentication, one-use token checks and original-ID restoration.

Run local checks with `node --test tests/wishlists.test.cjs`, TypeScript, ESLint, and `npm run build`. Live scripts require the intended Supabase environment and create disposable auth identities; remove their recorded IDs after checking, in addition to the scripts' list cleanup. The recovery live script's prepare phase requires an administrator to seed test-only hashed tokens before its verification phase; do not send mail or use real addresses for that test.

## Pending owner backup release — 6 October 2026

Migration `20261006190147_personal_wishlist_owner_unreserve` adds `release` to the owner mutation RPC; apply it before releasing the updated editor. Not yet applied to production. The combined compact shared-view and owner backup update awaits explicit publication approval.

Local PostgreSQL/PGlite tests in `tests/wishlists-owner-unreserve.cjs` verify ownership, anonymous and other-user denial, cross-list gift denial, bought reset, repeat clearing, retaining gifts and unrelated reservations, new reservations after clearing, former-reserver denial and disabled-sharing behavior. Run with PGlite installed outside the app and `PGLITE_MODULE` pointing to that package; no live credentials or production records are used. Build, TypeScript and targeted ESLint pass. Live database and browser interaction verification for this addition remain pending release.

## Deferred

Live price/stock monitoring, a browser extension, multi-quantity registries, contributions, co-editing and copying into group wishlists.
