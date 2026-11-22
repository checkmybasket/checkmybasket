# Guest participant match access

Organisers of completed draws can open **Draw → Personal match links → Show personal match links**, then privately send each named participant their own link. This supports existing anonymous participants without verified email recovery; it does not create members, transfer identities, redraw names, change exclusions or grant organiser sign-in access to a participant account.

A link provides read access to exactly one participant's current assigned recipient, gift preferences and wishlist titles/notes. It does not provide a full account session, wishlist editing, anonymous messaging or bought-status controls. Existing original-browser sessions continue working. Verified recovery members should use Return & sign in.

Links use random UUID secrets, live in URL fragments, and are removed from the address bar on page load. Revealing requires a deliberate click. Keep the original full link privately to reopen it. Links expire after 90 days; opening the organiser's controls renews expired links with new secrets. A link stops working if membership is removed, the group is deleted, the draw is pending or the guest enables email recovery. Only the authenticated group organiser can issue/list links. Anyone holding one can view its match, including the organiser; the controls explicitly explain this before showing links. No entire match list is returned by the public lookup, and token tables have RLS and no client grants. The new page is excluded from indexing and analytics, with no-referrer metadata.

## Release verification, 22 November 2026

A transaction that was rolled back checked seven guest links against existing assignments, invalid/null/expired tokens, rotation on expiry, non-organiser and unauthenticated issuance rejection, and denied direct table access. Assertions compared every membership, draw and exclusion row before/after; no protected data changed. No participant names, tokens, addresses or matches are recorded in this repository.

## Prevention for future participants

The join form explains browser-only access, and onboarding immediately offers verified email recovery before preferences. Email remains optional. The shared invite after a draw and the return page both explain how a guest can ask the organiser for a personal match link. Reserved-place claims go directly to the existing group, avoiding misleading blank-name/waiting-for-draw onboarding after a completed draw.

Run `node tests/guest-match-links-db.cjs /path/to/@electric-sql/pglite` (or install PGlite in a separate test directory). The isolated database tests apply the actual migration against synthetic legacy and future draws. The 38 assertions cover issuance permissions, stable links, exact recipient scope, invalid/null/expired links, renewal, disabled access after email recovery, pending draws, private table grants and unchanged participants, matches and exclusions. No production records or mail are used.
