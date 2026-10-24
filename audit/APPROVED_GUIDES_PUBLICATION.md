# Approved guides publication

24 October 2026. Owner explicitly approved all five completed drafts for publication.

New public routes:

- /last-minute-secret-santa
- /secret-santa-questionnaire
- /no-clutter-secret-santa-gifts
- /secondhand-secret-santa
- /anonymous-secret-santa-wrapping

Approved article copy is implemented as static server-rendered pages using existing InfoPage, GuideIntro and Section components. Draft-only metadata/status/review notes are not public article text. The original Markdown remains an archival review record. Each page has a unique search/social title and description, production canonical, existing branded social image, 24 October revision date, quick answer and working contents anchors.

A pure editorial registry feeds the organiser registry, guide index and sitemap; metadata helpers stay separate from the registry consumed by client analytics. Sitemap now contains 44 URLs and includes each new route exactly once. Existing links provide contextual paths into gift guides, draw creation and wishlists. No dependency, parser, product-flow or data-model changes.

Baseline and final build/lint/TypeScript plus all 110 regressions pass. Initial publication verification found JSX apostrophes requiring escaping, then an explicit import map in the existing analytics harness requiring the new registry; both corrected and the complete sequence rerun. Analytics privacy checks cover all new public guide paths while preserving private/token route exclusions.

Browser evidence: published-guides-responsive.json records five guides across ten sizes (320, 375, 414, 768, 1024, 1280, 1440, 1920 widths, short landscape and ultrawide). All 50 cases have one h1/main, correct metadata/social images, valid contents anchors, a current date and no page overflow or draft notes. No captured browser warnings/errors. Mobile questionnaire screenshot was visually inspected.

Deployment verification is performed after merge; the commit records pre-release source evidence. Publication and sitemap discovery do not establish Google indexing or ranking gains. Search Console follow-up should measure actual inclusion and search performance after crawling.
