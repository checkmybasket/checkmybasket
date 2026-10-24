# Editorial transparency update

24 October 2026. Owner selected the trust-content recommendation. The public founder/editor attribution is requested separately and not inferred from account identifiers.

About now explains how category/budget/interest filtering and daily rotation work, that catalogue descriptions are based on retailer information rather than hands-on reviews, and what price-check dates do and do not establish. It distinguishes the regularly verified list from undated partner catalogue offers, explains item-price versus delivered-total limits, and identifies affiliate funding and a corrections route.

Source evidence: lib/gift-catalogue.ts combines the checked feed and existing partner catalogue; lib/gift-sheet-feed.ts rejects invalid/stale checked-feed entries; scripts/gift-verifier/README.md and Code.gs describe approval/verification publication controls; lib/gift-selection.ts filters before daily rotation; lib/gift-presentation.ts and components/gift-card.tsx render check-date guidance. No universal real-time availability, manual daily review or tested-product claims are introduced.

Baseline/final build, lint, TypeScript and 110 regressions pass. Browser checks at 320/375/414/768/1440 show all new sections, one h1, unchanged production canonical and no page overflow or captured warnings/errors. Existing /gifts, /guides and /contact destinations are reused. No dependencies, data models, ranking logic or privacy behavior changed.

OWNER 03 remains NEEDS OWNER for the chosen public name, role, background and optional profile link. No fake bio, portrait, expertise or experience is published. Source verification precedes release; live verification follows deployment.
