# The Receipt preview

This branch updates the public homepage, shared font and palette tokens, favicon and social sharing image. It preserves the approved headline **Gifting made simple**, tagline **Thoughtful gifts, no matter how well you know them.**, journey heading **From group to gifts in minutes**, and the eight gift categories.

The reviewed source of truth is `docs/BRAND.md`. The supplied download remains untouched. The revised brief removes the superseded hero/social headline, the previously removed provenance claim, whole journey timing claims, repeated receipt puns and wording implying every gift category already has products. Setup timing applies only to creating a draw. Tailwind 4 uses the existing CSS theme mapping.

Homepage components are reusable and mostly server rendered. Only the mobile menu needs client state. Links remain anchors rather than nested link and button controls. The existing UI Button API and functional routes are unchanged.

Shared typography and palette update other pages, but their detailed layouts, legacy logo placements, rounded corners and functional status colours remain for a later pass. The existing warm game colour is retained so awards and chart states remain visible. The homepage uses only the new palette. No authentication, draw logic, database, notification or product feed changes are included.

## Validation

- Production build, TypeScript and lint for changed TSX files passed.
- Browser checks at 390, 768 and 1440 pixels: no horizontal overflow, one approved H1, fonts loaded and all visible interactive elements at least 44 pixels high.
- Mobile navigation opens, follows its anchor and closes.
- All 15 linked page routes returned 200; each was checked at 390 pixels without horizontal overflow.
- No browser page errors observed.
- Lighthouse homepage accessibility score: 100.
- Desktop and mobile screenshots inspected. Receipt is explicitly labelled as illustrative data.

The user approved The Receipt design and Inter typography for publication. Full interactive group journeys were not rerun because this branch does not change their logic. Inter is used in the shared font tokens and social sharing image; the headline is unchanged.
