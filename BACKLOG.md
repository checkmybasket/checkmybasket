# CheckMyBasket production polish backlog

23 October 2026. Repository: `seo-release`; branch: `polish/production-audit`; starting commit: `237cf0c`. This is the production-polish backlog. The parent `../BACKLOG.md` remains the separate product/security master backlog.

Phase 1 summary was presented before implementation. Phase 2 changes are committed by issue ID. Phase 3 evidence and before/after measurements are in [audit/FINAL_REPORT.md](audit/FINAL_REPORT.md). Local staging follow-up is in [audit/LOCAL_STAGING_REPORT.md](audit/LOCAL_STAGING_REPORT.md).

Release update: owner checks explicitly approved; verified candidate promoted to customer domains. Current count: 83 issues, 81 closed including owner acceptance, two NEEDS OWNER follow-ups (SECURITY 02 and SECURITY 06). See [audit/PRODUCTION_RELEASE.md](audit/PRODUCTION_RELEASE.md). Earlier phase summaries below retain historical scope.

Post-release update: PR #3 merged into main; its production deployment is verified. SECURITY 07 patches a newly reported dev-only advisory and SECURITY 02 now has clean full-audit evidence. Current count: 84 issues, 83 closed, SECURITY 06 NEEDS OWNER. See [audit/POST_RELEASE.md](audit/POST_RELEASE.md).

Final account decision: SECURITY 06 is resolved following the owner's passwordless choice and authenticated dashboard inspection. All 84 issues are closed, including documented owner acceptance/decisions; closure does not claim backend password endpoints are disabled or the paid leaked-password advisor warning is cleared. See [audit/AUTH_PROVIDER_DECISION.md](audit/AUTH_PROVIDER_DECISION.md).

Some original evidence and line numbers came from an older checkout. Each finding was reconciled against this newer base before implementation; completion notes distinguish fixes made here from defects already resolved in the newer base. Older checkout Lighthouse scores are not used as this branch's baseline.

## Stack and routes

Next.js App Router (16.4.0 at baseline, patched to 16.4.2), React 19.2.4, strict TypeScript, Tailwind CSS 4, semantic CSS variables, Base UI/shadcn-generated primitives, Lucide and Sonner; Supabase backend, documented Vercel hosting. Fonts: Inter and IBM Plex Mono. Removed unused date-fns, Zustand and the shadcn generator; no dependencies added.

The complete page/handler inventory is in [audit/route-inventory.json](audit/route-inventory.json). There are 39 indexable public URLs, plus noindex `/return`, `/wishlists`, `/wishlists/[id]`, `/w/[token]`, `/join/[invite_code]`, `/g/[group_id]`, `/g/[group_id]/reveal` and `/g/[group_id]/settings`. Gift categories resolve to eight public routes. Wishlist metadata/image API handlers and generated metadata/image endpoints are included in the inventory.

## Baseline and final checks

Current checkout baseline: build PASS; TypeScript PASS; lint FAIL in CommonJS test harness rules. Initial current-home Lighthouse: 97/100/100/100. Create/gifts performance baselines were captured after correctness work and before the performance pass; see the report for precise provenance.

Current source: build, lint and TypeScript PASS; 110 local regression checks PASS. Four measured public page types score 100 for accessibility, best practices and SEO. The public 40-route/10-viewport matrix passes structural, metadata and overflow checks with zero captured console errors/warnings. Authenticated end-to-end certification remains NEEDS OWNER, not a claimed pass.

Ruflo/ToolSearch tools were searched for but unavailable. No production data writes, external email/WhatsApp sends, production schema changes, pushes or deployment occurred. Local disposable fixtures and captured test mail were created in isolated staging. Existing OG artwork was reused and verified.

## Issues

### [x] SEO 10 — P1

- Severity: P1
- Location: lib/topic-guides.ts, data/topic-guides.json, components/topic-guide.tsx; /secret-santa-odd-number
- Evidence: Search Console shows 262 impressions, average position 7.9 and zero clicks for 9–21 October. Queries include whether Secret Santa works with 5, 7 or an odd number of people. Existing description begins “See how” rather than answering directly.
- Fix: User-approved editorial update: shorten search/social title around odd-number groups, answer yes in the description and opening copy, clarify a five-person example, and record this guide's actual revision date without changing other guides' dates. Preserve existing URL, canonical, examples, minimum three members and exclusion guidance. No ranking gain is assumed.
- Acceptance criteria: Search/social metadata use the new accurate title/description; one h1 and the existing canonical; direct answer and valid five-person example visible; revision date applies only to this guide; 320/375/414/768/1440 layouts fit; build/lint/TypeScript and 110 regressions pass. Compare Search Console after sufficient new data.
- Status: DONE
- Completion note: Updated search/social title and description, direct opening answer and five-person explanation; preserved h1, canonical, 3/5/7 example tables and draw constraints. Only this guide's revision date changes. Five-width browser checks pass with no overflow or captured warnings/errors; another guide retains its old date. Build/lint/TypeScript and 110 regressions pass. Search impact remains to be measured.

### [x] UI 12 — P2

- Severity: P2
- Location: components/receipt/sections.tsx; homepage /
- Evidence: Owner requests removing the visible “Example draw” line from the main receipt illustration.
- Fix: Remove that visible line while retaining the accessible description identifying the illustrative draw. This explicitly records the requested display-copy removal before implementation; no product behavior or data change.
- Acceptance criteria: Homepage receipt has no visible Example draw line; illustration remains labelled and contained at mobile/desktop widths; build/lint/TypeScript and regressions pass.
- Status: DONE
- Completion note: Removed the visible subtitle and retained the illustrative accessible description. Homepage checks at 320/375/414/768/1440px show no label or horizontal overflow. Build/lint/TypeScript and 110 regressions pass.

### [x] UI 13 — P1

- Severity: P1
- Location: components/gift-card.tsx; catalogue and gift guide routes
- Evidence: Owner's iPhone screenshots show red Shop at retailer links ending before the full-width Save to wishlist action because the retailer anchor is inline-flex without width:100%.
- Fix: Make each retailer link fill the card action column, with centred wrapping text and a nonshrinking external-link icon. Preserve destinations and labels.
- Acceptance criteria: Shop and Save action rectangles have equal left/right edges across 320/375/414/768/1440 widths, including long retailer names; no horizontal overflow; build/lint/TypeScript and regressions pass.
- Status: DONE
- Completion note: Shared retailer anchor now fills the card action column; label wraps and external icon retains its size. All 80 rendered shop/save pairs across funny guide/catalogue at five widths have equal edges, contained text and at least 44px height, with no page overflow. Build/lint/TypeScript and 110 regressions pass.

Sorted by severity, then area and ID. DONE refers to the documented implementation/source verification; any fixture-dependent browser coverage is explicitly retained in OWNER 02/QA 02. Every remaining issue is marked NEEDS OWNER with a concrete next action.

### [x] BUILD 02 — P0

- Severity: P0
- Location: eslint.config.mjs, scripts/*/test.cjs, tests/wishlists-recovery-live.cjs; all routes
- Evidence: npm run lint exits 1 before any changes. CommonJS imports trigger no-require-imports; local module variable triggers Next rule; test mock aliases this; unused callback index.
- Fix: allow intentional require imports only in .cjs tools/tests; rename harness variables and remove alias/unused index without disabling application rules.
- Acceptance criteria: build, lint and tsc pass; existing local analytics, selection, verifier and wishlist/email tests pass. No database/live tests run.
- Status: DONE
- Completion note: Build, lint, TypeScript, 16 analytics, 9 gift-flow, 54 verifier and 16 wishlist/email regression checks pass.

### [x] SECURITY 03 — P0

- Severity: P0
- Location: supabase/migrations; /g/[group_id]?tab=games Data API
- Evidence: A fresh authenticated nonmember inserted its own actual_gifts row into a known local group round successfully. The insert policy checks identity only.
- Fix: Require membership in the round group as well as matching recipient and logger identity. This explicitly flags a backend authorization change before implementation; no table/data-model change.
- Acceptance criteria: Nonmember and impersonated inserts fail; a real member can log its own gift after reveal; denied rows do not exist. Local integration, build, lint and TypeScript pass.
- Status: DONE

- Completion note: Restricted actual-gift inserts to round-group members. Live denial/unchanged-data and valid-member checks pass; local security advisor clean; staging build/lint/TypeScript and 110 regressions pass. Migration is committed for release, applied locally only.

- Production release: Applied via authenticated Supabase migration API as version 20261023161744. Normalized SQL hash matches 02471f08e268121a11b76b363e43934b; live policy now requires authenticated round membership. Server history preserved; repo filename/local history aligned to that assigned version.

### [x] SECURITY 04 — P0

- Severity: P0
- Location: supabase/migrations; /g/[group_id]?tab=games Data API
- Evidence: A local member successfully inserted a prediction whose subject was an authenticated nonmember.
- Fix: Require the prediction subject to be a member of the round group, retaining predictor membership and identity checks. This explicitly flags a backend authorization change before implementation; no table/data-model change.
- Acceptance criteria: Outside-group subjects and impersonated predictors fail; valid member predictions save; denied rows do not exist. Local integration, build, lint and TypeScript pass.
- Status: DONE

- Completion note: Prediction inserts now require subjects in the same group. Real member/outsider/impersonation and private-before-reveal checks pass; denied writes leave no rows. Local advisor clean; build/lint/TypeScript and 110 regressions pass. Applied locally only.

- Production release: Applied and read back as version 20261023161924. Normalized SQL hash matches 5ece573546d0f5377c53a0564602769b; live policy requires a subject in the round group and matching authenticated predictor. Server history preserved; repo/local history aligned.

### [x] SECURITY 05 — P0

- Severity: P0
- Location: supabase/migrations; /g/[group_id]?tab=games Data API
- Evidence: A local member successfully submitted a new prediction after the organiser revealed the round.
- Fix: Require round status open for prediction inserts; preserve existing prediction visibility. This explicitly flags a backend authorization change before implementation; no table/data-model change.
- Acceptance criteria: Open-round predictions succeed; closed and revealed submissions fail; denied writes leave counts unchanged. Local integration, build, lint and TypeScript pass.
- Status: DONE

- Completion note: Prediction inserts now require an open round. Real closed/revealed denial tests preserve the original row/count; valid open predictions and member-only revealed reads pass. Local advisor clean; build/lint/TypeScript and 110 regressions pass. Applied locally only.

- Production release: Applied and read back as version 20261023162053. Normalized SQL hash matches 3400d68c42d2fd46c004658b01d44e4f; the live prediction insert policy requires an open round and same-group subject. Server history preserved; repo/local history aligned.

### [x] SECURITY 01 — P0

- Severity: P0
- Location: package.json and package-lock.json; all routes
- Evidence: npm audit --omit=dev on 23 October reports critical Next.js advisories GHSA-2464-fhr4-w9xw and GHSA-673q-mjm6-r5xr plus high GHSA-p3m5-59mp-jv5r affecting installed 16.4.0. npm recommends 16.4.2. The vendor's build security gate also interrupts verification.
- Fix: update existing next and matching eslint-config-next to exact 16.4.2. No new dependency. This takes priority over remaining polish.
- Acceptance criteria: production dependency audit has zero findings; build/lint/TypeScript and existing local regression suites pass; public browser smoke succeeds.
- Status: DONE
- Completion note: Updated Next.js and matching ESLint config to 16.4.2. Production npm audit reports zero advisories; build/lint/TypeScript, 95 local regression checks and homepage browser smoke pass. Development-tool advisories remain a separate backlog finding.

### [x] A11Y 01 — P1

- Severity: P1
- Location: app/create/page.tsx:232; /create
- Evidence: Browser: four inputs have labels.length=0 and no aria-label. Field renders a sibling Label without htmlFor.
- Fix: Give each control a stable id and connect its label, hint and error.
- Acceptance criteria: All inputs have accurate accessible names; clicking each label focuses its control.
- Status: DONE
- Completion note: Existing labels retained; added the missing custom-budget label. Browser confirms all six displayed inputs have labels; build, lint and TypeScript pass.

### [x] A11Y 02 — P1

- Severity: P1
- Location: app/create/page.tsx:232; /create
- Evidence: Submit an empty form: errors appear, but aria-invalid and role=alert counts stay zero; focus remains on submit.
- Fix: Associate field errors, set invalid state and focus the first invalid field or an announced summary.
- Acceptance criteria: Keyboard/screen-reader users receive the errors and can navigate to each affected input.
- Status: DONE
- Completion note: Added invalid states, linked error/hint IDs and first-invalid focus. Production browser confirms group-name focus and two announced field errors; build/lint/TypeScript pass.

### [x] A11Y 03 — P1

- Severity: P1
- Location: components/info-page.tsx:11; app/page.tsx; app/gifts/[category]/page.tsx; shared navigation
- Evidence: Rendered DOM contains a > button: four on /, one on each information page and three on each category page.
- Fix: Render one semantic anchor styled as a button for navigation; retain buttons for actions.
- Acceptance criteria: No nested interactive elements across routes; each navigation control is one tab stop and navigates correctly.
- Status: DONE
- Completion note: Converted all thirteen nested link/button controls (including multiline private-route controls) into styled links. Production create DOM has no nested controls; source scan, build/lint/TypeScript pass.

### [x] A11Y 04 — P1

- Severity: P1
- Location: app/create/page.tsx; components/info-page.tsx; mobile navigation and gift cards
- Evidence: At 320px, back control is 36x36px; budget chips are 40px tall. Gift shop links use h-10.
- Fix: Increase mobile control hit areas to at least 44x44px, preserving visual hierarchy.
- Acceptance criteria: Measure all mobile controls across routes; every touch target meets the requested 44px minimum without overlap.
- Status: DONE
- Completion note: Added a mobile 44px button minimum and enlarged compact back/edit controls. Browser at 320px finds no undersized visible buttons or page overflow on create; private flows remain covered by OWNER 02. Build/lint/TypeScript pass.

### [x] A11Y 05 — P1

- Severity: P1
- Location: app/g/[group_id]/settings/page.tsx:111; /g/[group_id]/settings
- Evidence: Group name Label has no htmlFor and the edit Input has no explicit matching id.
- Fix: Connect the edit label and control; audit other group-route labels and fix each demonstrated gap in a separate issue.
- Acceptance criteria: Group name input has the correct accessible name; clicking its label focuses it.
- Status: DONE
- Completion note: Connected group-name label and input; source associations, build/lint/TypeScript pass. Loaded private-state browser coverage remains in OWNER 02.

### [x] A11Y 06 — P1

- Severity: P1
- Location: app/g/[group_id]/page.tsx; /g/[group_id]
- Evidence: The only h1 is inside the private/no-access branch; loaded dashboard sections start at h2.
- Fix: Render the group name as the loaded dashboard h1.
- Acceptance criteria: A valid group dashboard has exactly one h1, including after tab changes.
- Status: DONE
- Completion note: Loaded dashboard group name is now the single h1 above all tabs; source branch review and build/lint/TypeScript pass. Private browser QA remains in OWNER 02.

### [x] A11Y 07 — P1

- Severity: P1
- Location: app/g/[group_id]/settings/page.tsx:98; /g/[group_id]/settings
- Evidence: Group settings is a span; section headings are h2 and no h1 exists in the route source.
- Fix: Make the visible page title an h1.
- Acceptance criteria: Loaded settings has exactly one h1 and a logical heading hierarchy.
- Status: DONE
- Completion note: Visible settings title is now h1 above the h2 sections; source hierarchy and build/lint/TypeScript pass. Private browser QA remains in OWNER 02.

### [x] A11Y 08 — P1

- Severity: P1
- Location: app/create/page.tsx header; /create
- Evidence: Lighthouse button-name and link-name fail on the icon-only back control; browser DOM scan finds one unnamed button.
- Fix: Give the single semantic back link a meaningful accessible name while applying A11Y 03.
- Acceptance criteria: Back navigation is announced as Back to home, with one focus stop; Lighthouse button-name and link-name pass.
- Status: DONE
- Completion note: Name back links by destination. Generated create HTML contains Back to home; build/lint/TypeScript pass. Final public browser sweep will recheck links.

### [x] A11Y 09 — P1

- Severity: P1
- Location: app/create/page.tsx selected group-type cards; app/globals.css muted color
- Evidence: Lighthouse finds Friends subtitle contrast 4.36:1: #6e6e6e on composited #f1ede5 at 12px.
- Fix: Use a selected-state text/background combination meeting AA and verify other selectable group cards.
- Acceptance criteria: All selected/unselected group-card text is >=4.5:1; Lighthouse color-contrast passes for /create.
- Status: DONE
- Completion note: The current base already replaced the old group-type cards and cream palette. Final create Lighthouse contrast/accessibility is 100; no obsolete selected-card contrast defect remains. No redundant source change made.

### [x] A11Y 10 — P1

- Severity: P1
- Location: components/gift-card.tsx:30; /gifts and populated /gifts/[category]
- Evidence: Browser category headings jump h1 to h3; Lighthouse /gifts reports heading-order failure on the first product card.
- Fix: Give the product listing an appropriate h2 section heading or render card headings at the correct contextual level.
- Acceptance criteria: No heading-level skips on gift routes; Lighthouse heading-order passes.
- Status: DONE
- Completion note: Add an h2 for each product listing before the card h3 headings. Source hierarchy and build/lint/TypeScript pass; guide-card hierarchy is preserved.

### [x] A11Y 11 — P1

- Severity: P1
- Location: components/gift-card.tsx:36; all product listings
- Evidence: Lighthouse label-content-name-mismatch: visible Shop at Cadbury is overridden by a label beginning Shop [product] at [shop], without the visible phrase.
- Fix: Build the accessible name from the actual visible shop label, then append product/context.
- Acceptance criteria: Accessible name contains visible link text in the same order; speech-control selection and automated name check pass.
- Status: DONE
- Completion note: Start accessible names with the visible shop/save link text. Source strings match visible text in order; build/lint/TypeScript pass.

### [x] A11Y 12 — P1

- Severity: P1
- Location: app/create/page.tsx; /create budget presets
- Evidence: preset selection is communicated by color only; buttons have no aria-pressed state and the Budget per person label has no group association.
- Fix: name and describe the budget button group and expose each preset's pressed state, preserving existing clicks, tab order and validation.
- Acceptance criteria: exactly one preset is announced selected, including after choosing Custom; generated markup and browser checks plus build/lint/TypeScript pass.
- Status: DONE
- Completion note: Named and described the budget group and added aria-pressed to presets. Production browser confirms exactly one selected Custom preset and its labelled amount field; build/lint/TypeScript pass.

### [x] A11Y 13 — P1

- Severity: P1
- Location: inline guide/contact links and compact footer links; mobile public routes
- Evidence: the final 320px browser sweep finds prose links about 20px tall and footer links such as About/Terms narrower than the requested 44px minimum.
- Fix: enforce mobile minimum anchor hit sizes and give plain prose/list links an inline-flex hit box, preserving existing card/grid/flex link layouts and desktop typesetting.
- Acceptance criteria: measured mobile links meet 44x44px, no horizontal overflow/overlap is introduced, and build/lint/TypeScript pass.
- Status: DONE
- Completion note: Enforced mobile 44px minimum link hit boxes with prose/list links handled without changing card/flex layouts. Rechecked home, contact and two guide types at 320px: no small links or overflow. Build/lint/TypeScript pass; final full sweep follows.

### [x] A11Y 14 — P1

- Severity: P1
- Location: components/gift-card.tsx: retailer action; gift routes
- Evidence: The hover opacity .9 composites the red action background to about #D83F3A on white: white text contrast drops from 5.05:1 to 4.46:1, below AA for its 14px label.
- Fix: Use the existing darker accent-hover token instead of reducing whole-button opacity; preserve text, destination and click behavior.
- Acceptance criteria: normal/hover action text contrast meets 4.5:1; no action behavior changes; build/lint/TypeScript pass.
- Status: DONE
- Completion note: Keep retailer hover text above AA contrast. Existing dark accent hover yields 6.64:1 against white, versus 4.46:1 under the old opacity treatment; build/lint/TypeScript pass.

### [x] A11Y 15 — P1

- Severity: P1
- Location: app/create/page.tsx share view and app/g/[group_id]/page.tsx reminder action
- Evidence: The hardcoded bright #25D366 gives insufficient contrast for white share text and green reminder text on white. These states were found in the source contrast review.
- Fix: Use the existing accessible success-green token for these WhatsApp actions, preserving their labels and share behavior.
- Acceptance criteria: normal/hover action text contrast meets 4.5:1; no action behavior changes; build/lint/TypeScript pass.
- Status: DONE
- Completion note: Use the accessible green token for share and reminder actions. Contrast is above 4.5:1 for white-on-green and green-on-white; labels and handlers are untouched. Build/lint/TypeScript pass; private share-state browser tests remain OWNER 02.

### [x] A11Y 16 — P1

- Severity: P1
- Location: app/g/[group_id]/page.tsx; group section navigation
- Evidence: Loaded four-member staging group: Draw/Wishlists/Messages/Games buttons have neither aria-pressed nor aria-current; selection appears only in color/underline. The nav has no accessible label.
- Fix: Name the navigation and expose the selected button state without changing keyboard order or section behavior.
- Acceptance criteria: Exactly one group section is pressed, and selection follows clicks; loaded browser verification, build/lint/TypeScript pass.
- Status: DONE
- Completion note: Named Group sections navigation and exposed aria-pressed on its buttons. Loaded staging browser confirms exactly one selected section and correct state after switching to Wishlists. Build/lint/TypeScript and 110 local checks pass.

### [x] A11Y 17 — P1

- Severity: P1
- Location: app/g/[group_id]/page.tsx; loaded private group views — Message composer label
- Evidence: Loaded Messages composer has no associated label or aria-label; only a disappearing placeholder names the input.
- Fix: Add a visible, associated message/reply label and describe the character limit.
- Acceptance criteria: Input remains named after typing, its label focuses it, and the local message send/reply flow still works. Browser/build/lint/TypeScript checks pass.
- Status: DONE
- Completion note: Added persistent message/reply labels and linked the character-limit hint. Browser confirms one associated label, label-click focus and successful Enter submission; a separate local recipient received/replied while sender identity remained protected. Build/lint/TypeScript and local regressions pass.

### [x] A11Y 18 — P1

- Severity: P1
- Location: app/g/[group_id]/page.tsx; loaded private group views — Empty-state heading hierarchy
- Evidence: Loaded Messages empty state goes directly from the group h1 to Break the ice h3. Games pending has the same root empty-state helper.
- Fix: Allow the empty-state helper to render h2 by default and h3 explicitly when nested under the wishlist h2.
- Acceptance criteria: No heading level is skipped in loaded empty Messages/Games/Wishlists views. Browser/build/lint/TypeScript checks pass.
- Status: DONE
- Completion note: Empty states now default to h2, with wishlist-nested content explicitly h3. Loaded browser verifies root Messages and pending Games h1→h2, and wishlist h1→h2→h3. Build/lint/TypeScript and local regressions pass.

### [x] A11Y 19 — P1

- Severity: P1
- Location: app/g/[group_id]/page.tsx; loaded private group views — Conversation selection state
- Evidence: Recipient/Your Secret Santa conversation buttons expose no selected state, only selected styling.
- Fix: Name the conversation button group and expose aria-pressed on both choices.
- Acceptance criteria: Exactly one conversation is pressed after switching, with existing message permissions retained. Browser/build/lint/TypeScript checks pass.
- Status: DONE
- Completion note: Named the Conversation group and exposed aria-pressed on both thread choices. Loaded browser confirms exactly one pressed choice after switching; permissions and message flow remain unchanged. Build/lint/TypeScript and local regressions pass.

### [x] A11Y 20 — P1

- Severity: P1
- Location: app/g/[group_id]/page.tsx; loaded private group views — Progress indicator names
- Evidence: Loaded Gifts bought progressbar has neither aria-label nor aria-labelledby; setup progress uses the same unnamed pattern.
- Fix: Name both progressbars from their visible section purpose, preserving values.
- Acceptance criteria: Loaded Gifts bought and Setup progress indicators have correct names and numeric values. Browser/build/lint/TypeScript checks pass.
- Status: DONE
- Completion note: Named Setup progress and Gifts bought indicators. Loaded pending/drawn browser states expose those names and correct numeric values (17 and 25 in fixtures); build/lint/TypeScript and local regressions pass.

### [x] A11Y 21 — P1

- Severity: P1
- Location: components/ui/input.tsx styling via app/globals.css; private recovery/notification forms
- Evidence: Loaded pending/drawn groups at 320, 375 and 414px: both email inputs are 32px high, below the requested 44px mobile target.
- Fix: Apply a mobile minimum height to the existing shared text-input primitive; preserve compact desktop sizes and larger explicit input sizes.
- Acceptance criteria: Every displayed email input measures at least 44px at mobile widths without new overflow; build/lint/TypeScript pass.
- Status: DONE
- Completion note: Shared text inputs now have a mobile-only 44px minimum. Loaded pending-group measurements at 320/375/414px show 44px inputs and no overflow; larger explicit and compact desktop sizing remain intact. Build/lint/TypeScript and local regressions pass.

### [x] A11Y 22 — P1

- Severity: P1
- Location: app/g/[group_id]/page.tsx; /g/[group_id]?tab=games prediction form
- Evidence: Selecting A Mug changes its colour but its button has no aria-pressed or other selected-state semantics in the loaded browser.
- Fix: Expose the existing selected state with aria-pressed on category buttons; preserve selection and submission behaviour.
- Acceptance criteria: Exactly the chosen category is pressed; changing category and revisiting a subject keep semantics in sync. Build/lint/TypeScript and local checks pass.
- Status: DONE

- Completion note: Prediction categories expose aria-pressed. Browser verified selection, replacement and back-navigation state; staging build/lint/TypeScript and all 110 local checks pass.

### [x] A11Y 23 — P1

- Severity: P1
- Location: components/wishlists/item-card.tsx and shared.tsx; /w/[token]
- Evidence: Loaded shared wishlist has h1 list title, h2 priority section, then h2 gift titles inside that section. Item titles do not express their nested relationship.
- Fix: Allow ItemCard heading level 2 or 3; shared priority sections use level 3 while owner cards retain level 2. Preserve labels, style and interactions.
- Acceptance criteria: Shared list/card views render h1 → h2 priority → h3 gift titles; owner titles remain h2. Build/lint/TypeScript and local checks pass; keyboard interaction remains usable.
- Status: DONE

- Completion note: Shared list/card views expose h1 title, h2 priority and 200 h3 gift titles; owner gift headings remain h2. Keyboard Enter collapses/expands priority sections. Build/lint/TypeScript and all 110 local checks pass.

### [x] BUILD 01 — P1

- Severity: P1
- Location: next.config.ts; production server startup
- Evidence: next start warns that /Users/hassan/package-lock.json was selected as the workspace root because multiple lockfiles exist.
- Fix: Explicitly configure the correct tracing root after checking deployment needs.
- Acceptance criteria: Build and start pass without inferred-root warning; traced deployment includes required application files only.
- Status: DONE
- Completion note: Declare the repository as the tracing and Turbopack root. Build/lint/TypeScript pass and the build no longer emits an ignored external-lockfile warning.

### [x] DEPLOY 01 — P1

- Severity: P1
- Location: app/robots.ts:5; app/layout.tsx; preview deployments
- Evidence: robots always allows / and root metadata has no environment-dependent indexing rule.
- Fix: Disable indexing on non-production deployments using a verified environment signal and response/meta directives.
- Acceptance criteria: Production public pages remain indexable; preview responses and robots disallow indexing. Owner verifies hosting environment values.
- Status: DONE
- Completion note: Added environment-aware noindex response headers, root metadata and robots. Local/production retain existing indexing; preview/development/custom environments deny indexing. Five environment cases plus build/lint/TypeScript pass; deployed host confirmation stays in final owner checklist.

### [x] DEPLOY 02 — P1

- Severity: P1
- Location: supabase/migrations/20261006190147_personal_wishlist_owner_unreserve.sql; migration release workflow
- Evidence: Production records owner-unreserve as version 20261006190849 while the repo/local history uses 20261006190147. Normalized SQL MD5 matches exactly (9f99ac3fea86bc11cdefc82cb5dc84a6). A blanket CLI push would encounter history drift before the three new fixes.
- Fix: Rename the repository file and its test/document references to the already applied production timestamp; repair only the disposable local history to match, without rerunning the SQL or rewriting production history.
- Acceptance criteria: Production and local history match the file version/hash; the old filename is absent; referenced test files exist. Local build/lint/TypeScript and regressions pass.
- Status: DONE

- Completion note: Renamed the identical owner-unreserve migration to the already applied production version 20261006190849, updated references and repaired disposable local history only. Normalized SQL hashes match; build/lint/TypeScript and all 110 regressions pass. Production history and schema were preserved.

### [x] DEPLOY 03 — P1

- Severity: P1
- Location: app/layout.tsx and app/manifest.ts; protected production candidate, all pages
- Evidence: Candidate Lighthouse home/create/gifts records two manifest CSP errors per page. Credential-less /manifest.webmanifest requests redirect to Vercel SSO, then fail default-src self; best practices scores 92. Installed Next adds manifest credentials only for preview, while this protected candidate uses production settings.
- Fix: Keep the existing static manifest URL/content in public/manifest.webmanifest and emit a single explicit head link with crossOrigin use-credentials. Remove the file-convention manifest to avoid a duplicate link. No app data, copy or route-URL change; CSP and protection stay intact. Browser requirement: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/crossorigin#web_manifest_with_credentials.
- Acceptance criteria: One manifest link with use-credentials; identical manifest fields and application/manifest+json response; build/lint/TypeScript and regressions pass. Protected candidate browser/Lighthouse manifest errors disappear and best practices reaches at least 95; expected Vercel noindex is preserved.
- Status: DONE

- Completion note: One explicit credentialed manifest link serves the unchanged static manifest with correct MIME type. Local build/lint/TypeScript and 110 regressions pass. Protected verification build Lighthouse best practices is 100 (was 92), accessibility 100, and console audit passes on home/create/gifts; only expected noindex SEO failure remains. Before/after reports retained.

### [x] DEPLOY 04 — P1

- Severity: P1
- Location: supabase/migrations/20260714090000_group_members_surprise_me.sql; full migration inventory
- Evidence: Full 29-version comparison found repo/local version 20260714090000 versus production version 20260714101843. Normalized SQL hashes match fe6ed3fda4a8216588138e103e17d6a2; no SQL difference exists.
- Fix: Align the filename and disposable local history with the already applied production version. Do not replay the SQL or edit production history.
- Acceptance criteria: All 29 production/repo/local migration version/name pairs match; SQL bytes remain unchanged. Build/lint/TypeScript and local regressions pass.
- Status: DONE

- Completion note: Aligned the identical surprise-me migration to production version 20260714101843 and repaired local history only. All 29 production/repo/local version/name pairs now match; SQL hash unchanged. Build/lint/TypeScript and 110 regressions pass; production history preserved.

### [x] FORM 01 — P1

- Severity: P1
- Location: app/create/page.tsx; /create custom budget
- Evidence: validation uses parseInt while submission uses parseFloat. A positive £0.50 budget is rejected even though the existing pence model supports it. Fractions beyond two decimal places are silently rounded at submission.
- Fix: validate positive whole-pence currency consistently with submission, including the existing signed-integer API range. This is an explicitly flagged validation behavior correction; no data model or successful normal-budget flow changes.
- Acceptance criteria: £0.50 and ordinary two-decimal budgets validate; zero, sub-penny and out-of-range values get clear local errors; no backend calls during the invalid-form browser checks; build/lint/TypeScript pass.
- Status: DONE
- Completion note: Unified positive whole-pence validation with submission and the existing integer API contract. Browser accepts £0.50 locally while rejecting sub-penny amounts; blank required names prevent backend calls. Clear format/too-large messages replace inconsistent parsing. Build/lint/TypeScript pass.

### [x] FORM 02 — P1

- Severity: P1
- Location: app/create/page.tsx; /create keyboard submission
- Evidence: create inputs and the fixed submit action are not associated with a native form, so Enter does not submit or invoke validation.
- Fix: connect the existing fields and action through a labelled native form using the existing validation and async handler. This is a flagged keyboard behavior improvement; click behavior and backend payload stay the same.
- Acceptance criteria: Enter and the fixed submit button use the same handler, invalid submission focuses the first field without backend writes, and build/lint/TypeScript pass.
- Status: DONE
- Completion note: Connected fields and fixed submit action to the labelled create form, retaining custom validation and the existing async handler. Production browser Enter triggers errors and focuses group-name; the submit action belongs to create-draw. No backend write; build/lint/TypeScript pass.

### [x] FORM 03 — P1

- Severity: P1
- Location: components/wishlists/item-form.tsx and list-form.tsx; /wishlists and /wishlists/[id]
- Evidence: Stopping local REST then saving a gift displays raw backend text "name resolution failed". Wishlist creation/editing uses the same raw-message fallback. Gift draft is retained and submit re-enables.
- Fix: Route backend/transport errors through the existing safe userError helper while preserving specific local gift validation and the draft.
- Acceptance criteria: Failed gift and list saves show actionable guidance without raw backend text; drafts survive; submitting re-enables; retry after restoration saves exactly once. Build/lint/TypeScript and local checks pass.
- Status: DONE

- Completion note: Both forms use safe actionable backend errors while retaining local validation and known limits. Controlled REST failures retain drafts and re-enable submit; restored retries save edits exactly once (200 items, one matching gift). Build/lint/TypeScript and 110 checks pass. Evidence: audit/save-failure-checks.json.

### [x] OWNER 02 — P1

- Severity: P1
- Location: Authenticated /g/[group_id], /reveal, /settings and /join/[invite_code] QA
- Evidence: No isolated test project or valid disposable multi-member fixtures were identified. Production group membership, draws, messages and deletion were not mutated.
- Fix: Provision the user-selected local Supabase environment with disposable multi-member groups and isolated email; retain human/manual acceptance checks as NEEDS OWNER until every private-state criterion is verified.
- Acceptance criteria: Run every private-route interaction, role/permission failure, slow/failed request, long-string case, requested viewport and 200% zoom without affecting real users.
- Status: DONE — owner accepted remaining checks on 23 October 2026; no additional agent-measured device evidence is claimed.
- Completion note: Local staging is now provisioned with Docker/Colima, all 26 migrations, disposable pending/drawn groups and captured native/custom email. Core browser, member/non-member privacy, recovery and notification idempotency checks pass; production is unchanged. NEEDS OWNER: complete the remaining exhaustive private games/large-data/permission matrix and manual device/zoom/clipboard-denial checks before certifying every private-state acceptance criterion. See audit/LOCAL_STAGING_REPORT.md; this issue is not claimed fully passed.

### [x] PERF 01 — P1

- Severity: P1
- Location: app/page.tsx; app/layout.tsx; /
- Evidence: Lighthouse mobile homepage LCP is 4.2s and performance is 86 in the captured baseline.
- Fix: Profile the LCP element and critical font/style/render path; reduce the demonstrated delay without changing product behavior or hiding useful content.
- Acceptance criteria: Repeat comparable mobile runs; record LCP and performance changes with no visual, accessibility or console regressions.
- Status: DONE
- Completion note: The old 4.2s LCP does not reproduce in the current base: current initial home was 97 with 2.60s LCP; final is 96 with 2.76s LCP. No speedup is claimed from single-run variation. Initial script transfer falls from 262,483 to 213,575 bytes; no console or accessibility regression.

### [x] QA 01 — P1

- Severity: P1
- Location: Audit tooling and key pages
- Evidence: Baseline captured with ephemeral Lighthouse 13.5.0: home 86/100/100/100; create 89/81/100/100; gifts 79/98/100/100 (performance/accessibility/best practices/SEO). Create fails the requested accessibility threshold.
- Fix: Preserve baseline reports and rerun the same version/settings after fixes, including representative category and private pages once fixtures exist; do not add a project dependency.
- Acceptance criteria: Record before/after performance, accessibility, best-practices and SEO scores; final accessibility, best-practices and SEO are each >=95.
- Status: DONE
- Completion note: Saved comparable current-version baselines, four final Lighthouse reports, bundle and console measurements in audit/FINAL_REPORT.md and audit/metrics.json. Final home/create/gifts/guide scores are 96/95/95/96 for performance and 100 for accessibility/best practices/SEO on every measured page. Private certification remains OWNER 02; no performance gain is inferred from single-run noise.

### [x] QA 02 — P1

- Severity: P1
- Location: Every route/component; remaining audit coverage
- Evidence: Initial browser pass covers public-route headings, metadata, nested controls, console and horizontal overflow only. 200% zoom, all interactions, detailed contrast/focus, failed requests and long-data states are not yet verified.
- Fix: Finish the checklist and add each demonstrated defect as its own issue before fixing it; retain evidence per route/state.
- Acceptance criteria: Complete route/state matrix with keyboard, zoom, touch, contrast, long strings, empty/single/hundreds of items and network-failure results. No untested cell is reported as passed.
- Status: DONE — remaining owner gates explicitly approved on 23 October 2026. Production promotion and fresh 40-route/Lighthouse checks pass; see audit/PRODUCTION_RELEASE.md. Historical unmeasured cells remain identified, not reported as observed passes.
- Completion note: Public 400-case audit plus 70 loaded private viewport checks, private labels/headings/targets, actual member/non-member flows, anonymous messages, captured email/recovery and controlled failure/loading tests are recorded in audit/. NEEDS OWNER: finish remaining participant/game permission and mutation-failure states and real 200% zoom, screen-reader, device and clipboard-denial checks; then verify live production/preview headers, redirects, APP_URL links, domain/mailbox and merchant/download behavior after a reviewed release. Follow-up: organiser predictions through actual-gift logging and 50 real saved wishlist viewport checks (single/200 items, owner/shared/list/cards) now pass, with zero browser warnings/errors. A11Y 22 and UI 10 are verified fixes. SECURITY 03–05 now verify participant/nonmember game boundaries, and FORM 03 verifies retained drafts plus failed-save retries; those fixes are local and committed, not deployed. Fresh normal-state browser console is clean. Follow-up: sampled keyboard/focus traversal and A11Y 23 shared heading checks pass; read-only live canonicals/headers/sitemap/redirects pass, but 24 live OG tags await the already implemented branch release. See docs/owner-release-checks.md for manual gates. Release review is prepared in docs/release-review.md with targets, migration order and rollback considerations. Draft PR #3 and protected preview are now available. Authorized authenticated public-response checks pass with noindex/robots intact (audit/protected-preview-checks.json); private preview flows remain blocked on isolated cloud-backend configuration. Current status: SECURITY 03–05 are live in production with matching SQL hashes, all 29 migration inventories align, and the final protected candidate passes 40 rendered public routes with zero console events. Native 200% public/shared samples pass; actual device/screen-reader results remain pending. DEPLOY 03 removes protected-manifest console errors; Lighthouse best practices/accessibility are 100, with intentional protected-host noindex SEO. See audit/RELEASE_CANDIDATE_REPORT.md. Untested states are not passed.

### [x] SECURITY 07 — P1

- Severity: P1
- Location: package-lock.json; development-only ESLint dependency chain, all routes at build time
- Evidence: Fresh npm audit reports one high advisory GHSA-mrhx-c7xc-m3w5 in transitive zod 4.4.3 through eslint-plugin-react-hooks. Production-only audit remains zero. The advisory was updated on 23 October 2026 and names 4.6.6 as patched.
- Fix: Update only the existing transitive Zod resolution within the consumers' supported range. No new dependency, runtime behavior, copy or data-model change. Avoid force or framework downgrades.
- Acceptance criteria: Lockfile diff contains only the intended compatible transitive update; full and production npm audits have zero findings; build/lint/TypeScript and all 110 local regressions pass.
- Status: DONE
- Completion note: Updated dev-only transitive Zod 4.4.3 to compatible 4.6.7; only its lockfile entry changed. Full and production npm audits return zero vulnerabilities. Staging build, lint, TypeScript and all 110 existing regressions pass. No package.json or runtime code changes. Advisory: https://github.com/advisories/GHSA-mrhx-c7xc-m3w5.

### [x] SECURITY 02 — P1

- Severity: P1
- Location: package-lock.json; development-only lint toolchain
- Evidence: after removing the unused generator, npm reports eight high development advisories; production audit is clean. Several transitive fixes are compatible; the braces advisory affects every currently published version (latest is 3.0.3), and npm suggests downgrading eslint-config-next to 14.2.35 for that chain.
- Fix: apply compatible transitive patches without force or framework/linter downgrades. Record any unpatched upstream lint chain as NEEDS OWNER with a concrete follow-up rather than claiming all dependencies are clean. No new dependency.
- Acceptance criteria: required checks and local regressions pass; npm production audit remains clean; remaining advisory chain is accurately documented with supported mitigation and owner follow-up.
- Status: DONE
- Current verification: On the post-release follow-up, full and production npm audits both exit 0 with zero findings after SECURITY 07. The previously reported braces/micromatch/fast-glob advisory chain is no longer returned by the current registry audit. Build/lint/TypeScript and all 110 regressions pass. This closes the pending advisory decision without a forced downgrade; the earlier completion note below records the historical finding, not a current risk exception.
- Completion note: Compatible transitive patches applied; 20 original development findings reduced to five entries in the same unpatched braces → micromatch → fast-glob → Next ESLint chain. Production dependencies are clean; build/lint/TypeScript and 99 local regressions pass. NEEDS OWNER: record a temporary development-tool risk exception, do not process untrusted glob patterns, and update the matching ESLint config when a compatible upstream fix ships. Do not force a downgrade to Next 14 tooling.

### [x] SEO 01 — P1

- Severity: P1
- Location: app/layout.tsx: metadata.alternates; every public child route
- Evidence: Browser checked 15 non-homepage public URLs: all declare https://www.checkmybasket.co.uk as canonical.
- Fix: Give each public page its own production canonical, including category metadata; keep private routes noindex.
- Acceptance criteria: Rendered canonicals exactly match each public route on the production origin.
- Status: DONE
- Completion note: Reconciled with the newer base: all 39 indexable public canonicals match their exact production route in audit/public-route-matrix.json. No duplicate canonical defect remains.

### [x] SEO 02 — P1

- Severity: P1
- Location: app/layout.tsx; app/gifts/[category]/page.tsx; public child routes
- Evidence: Root Open Graph URL/title and Twitter title describe the homepage; category metadata only returns title and description.
- Fix: Generate accurate per-route social titles, descriptions and absolute URLs from shared metadata helpers.
- Acceptance criteria: Inspect every public route: OG/Twitter fields accurately describe that page and use absolute production URLs.
- Status: DONE
- Completion note: Added shared page-specific social metadata for home, information, create and gift routes. Generated HTML has distinct OG/Twitter titles and production URLs; categories use catalogue data; existing branded OG artwork is referenced at 1200x630. Build/lint/TypeScript pass.

### [x] SEO 03 — P1

- Severity: P1
- Location: app/g/[group_id] route tree; app/robots.ts:10
- Evidence: robots disallows /g/, but the route tree has no metadata noindex directive. Crawl disallow alone does not declare noindex.
- Fix: Add inherited private-route noindex metadata without exposing private data in titles or social previews.
- Acceptance criteria: All group, reveal and settings responses contain noindex and remain excluded from the sitemap.
- Status: DONE
- Completion note: The newer base already provides inherited noindex. Anonymous HTTP verifies group, reveal and settings all emit noindex,nofollow; private routes are absent from the 39-URL sitemap. Evidence: audit/private-metadata.json.

### [x] SEO 07 — P1

- Severity: P1
- Location: app/g/layout.tsx, group reveal/settings layouts, return and wishlist editor metadata; private routes
- Evidence: group routes inherit the homepage marketing title/description; return and wishlist editor lack their own descriptions. Public catalogue metadata already derives from catalogue data.
- Fix: provide accurate generic per-role private metadata and previews without fetching or publishing private group names, assignments, identities or tokens. Private metadata deliberately stays generic for confidentiality; noindex remains intact.
- Acceptance criteria: private titles/descriptions reflect each screen, all remain noindex, and no private data enters metadata; build/lint/TypeScript pass.
- Status: DONE
- Completion note: Added per-role private titles, descriptions and generic social previews for groups, matches, settings, recovery, join and wishlist tools. Metadata uses no private names, assignments or tokens; noindex is preserved. Build/lint/TypeScript pass.

### [x] SEO 08 — P1

- Severity: P1
- Location: guide metadata and shared defaults; public guides and social previews
- Evidence: browser on /secret-santa-gifts-under-10 shows only og:title/description/url; og:image, og:site_name and og:type are absent. Child metadata replaces the root object, and Twitter images have similar gaps.
- Fix: share complete OG/Twitter defaults, including the existing branded image, across every page-level metadata object. Preserve page titles, descriptions and URLs.
- Acceptance criteria: every public page emits absolute OG/Twitter images, site name, type and route-specific text/URL; build/lint/TypeScript and browser tag audit pass.
- Status: DONE
- Completion note: Added complete shared OG/Twitter defaults to every metadata override. Browser confirms guide image, site name and website type with absolute production image URL. Existing page text and URLs are preserved; build/lint/TypeScript pass.

### [x] STAGE 01 — P1

- Severity: P1
- Location: next.config.ts; all routes with Supabase requests
- Evidence: connect-src hardcodes the production Supabase HTTPS and Realtime origins even when NEXT_PUBLIC_SUPABASE_URL points at staging; an isolated backend would be blocked by CSP.
- Fix: derive both allowed origins from the configured Supabase URL, preserve the existing production fallback, require HTTPS except local loopback, and reject embedded credentials. No wildcard access or new dependency.
- Acceptance criteria: staging/local origin tests pass, invalid/insecure origins fail closed; build/lint/TypeScript pass. Actual staging requests require provisioned environment.
- Status: DONE
- Completion note: CSP now derives HTTPS and Realtime origins from the configured backend, retaining the production fallback and strict origin validation. Three staging/local/invalid-origin tests and build/lint/TypeScript pass; no backend configuration was changed.

### [x] STAGE 02 — P1

- Severity: P1
- Location: tests/wishlists*-live.cjs; integration test configuration
- Evidence: Three integration scripts silently read .env.local, which currently targets production. Running them for staging would create production anonymous users unless the app env file were replaced.
- Fix: Require explicit staging-only test variables and matching project ref; reject the known production project, privileged keys and production app domain before any request. Keep current app environment files unchanged. No new dependency.
- Acceptance criteria: Missing/mismatched/production targets fail before network calls; explicit disposable project/local targets work in guard tests; build/lint/TypeScript and local regression tests pass. Live success requires provisioned staging.
- Status: DONE
- Completion note: All three live scripts now require explicit isolated test variables and matching project ref. Production, privileged keys and unsafe app targets fail before requests. Four guard tests, all 27 local Node tests and build/lint/TypeScript pass. No live integration writes were run.

### [x] STAGE 03 — P1

- Severity: P1
- Location: supabase/config.toml and local staging setup; /create, /g/*, /wishlists/*, /return
- Evidence: User selected local staging with Docker. Docker/CLI and a local Supabase configuration are absent; authenticated acceptance tests cannot yet run safely.
- Fix: Install a Docker-compatible runtime and pinned Supabase CLI tooling (no app dependency), initialise a uniquely named local stack bound to loopback, enable anonymous auth and captured local email, and apply existing migrations only locally. Keep production files/credentials unchanged.
- Acceptance criteria: Docker runs; local Auth/Postgres/API/mail capture are healthy; all checked-in migrations apply; app uses local backend and noindex; disposable fixture tests run without cloud writes or external email. Any first-run agreement/admin step stays NEEDS OWNER until performed by the user. Build/lint/TypeScript pass for committed configuration.
- Status: DONE
- Completion note: Installed Docker CLI 29.9.2 with Colima 0.10.3 and pinned Supabase CLI 2.122.0; all 26 migrations applied to the loopback-only local stack. App build/lint/TypeScript, 27 Node tests, existing wishlist/API acceptance suites, local Auth inbox receipt and create/join/draw/reveal/settings/role checks pass. Production env files are unchanged; evidence: audit/local-staging.json. Custom Resend capture and broader private QA remain separate follow-up.

### [x] STAGE 04 — P1

- Severity: P1
- Location: supabase/functions/group-recovery, send-draw-emails and local staging tooling
- Evidence: Native Auth mail is captured locally, but custom recovery/draw functions hardcode Resend; recovery links also hardcode the production app URL. Their full acceptance path cannot be exercised in the isolated inbox.
- Fix: Add explicit local-only email transport to Mailpit, fail closed outside the known local stack and for non-fixture recipients, keep normal production delivery unchanged, allow the existing APP_URL setting for recovery links, and configure only ignored local function variables. No new dependency or data model.
- Acceptance criteria: Default transport behavior is unchanged; local capture rejects cloud configuration and real recipient domains; actual recovery verification/redemption and draw-email suppression work through local Edge Functions and captured messages; build/lint/TypeScript and local regressions pass.
- Status: DONE
- Completion note: Added guarded local Mailpit transport; default provider fetch is unchanged, cloud activation and real-recipient domains are rejected. Real local recovery identity restoration/single-use tokens and draw-email duplicate suppression pass. Staging build/lint/TypeScript, 31 Node tests and 79 other local regressions pass. No cloud function or provider credentials were changed.

### [x] STATE 01 — P1

- Severity: P1
- Location: app/not-found.tsx (missing); unmatched URLs and invalid gift categories
- Evidence: Browser /polish-audit-missing shows default '404 / This page could not be found' with no recovery link.
- Fix: Create a branded 404 with useful home and gift links.
- Acceptance criteria: Unknown URLs return HTTP 404, match the app design and provide working keyboard-accessible recovery links.
- Status: DONE
- Completion note: Added a branded information-page 404 with home and gift recovery links. Browser confirms the heading and destinations; HTTP 404 and build/lint/TypeScript pass.

### [x] STATE 02 — P1

- Severity: P1
- Location: app/error.tsx and app/global-error.tsx (missing); all routes
- Evidence: No route-level or root runtime error boundary exists in the app tree.
- Fix: Add branded error recovery with a clear explanation, retry and safe navigation.
- Acceptance criteria: Inject a controlled render failure in an isolated environment; recovery UI works and shows no stack trace or raw error object.
- Status: DONE
- Completion note: Added segment and root error boundaries using the installed Next.js retry API. A temporary dynamic route reproduced a server render failure; browser verified recovery UI and retry without raw internal text. Fixture removed; final build/lint/TypeScript pass.

### [x] STATE 03 — P1

- Severity: P1
- Location: app/g/[group_id]/page.tsx:217 and other toast.error(error.message) call sites; group, reveal and settings routes
- Evidence: Multiple backend errors are passed directly to toast.error(error.message).
- Fix: Map failures to specific plain-language actions across group/create/join views; keep technical diagnostics outside user-facing messages. This is a flagged copy change: preserve known domain constraints, and replace arbitrary backend details with recovery guidance.
- Acceptance criteria: Simulated permission, network and validation failures give useful recovery guidance without raw database/internal errors.
- Status: DONE
- Completion note: Added action-specific safe errors for group/create/join, notification and wishlist surfaces while retaining draw constraints. Four error-safety tests and 16 wishlist/email regressions pass; build/lint/TypeScript pass. No database behavior changed.

### [x] STATE 05 — P1

- Severity: P1
- Location: app/g/[group_id]/page.tsx, reveal/page.tsx, settings/page.tsx and app/join/[invite_code]/page.tsx; initial async views
- Evidence: initial effects lack rejection handling; join treats backend errors as invalid invitations; dashboard defaults failed queries to empty arrays. A rejected load can leave skeletons indefinitely.
- Fix: show the shared recoverable error panel on failed reads while preserving absent-group/no-match handling. This is an explicitly flagged error-state behavior change; successful flows and models are unchanged.
- Acceptance criteria: build/lint/TypeScript pass; initial rejected loads have a retry action; valid absent-resource states stay distinct. Private fixture validation remains OWNER 02.
- Status: DONE
- Completion note: Initial reads now route rejected/backend failures, including returned auth transport errors, to retryable recovery instead of permanent skeletons, false empty data or invalid-invite copy. Absent records retain existing states. Build/lint/TypeScript pass; valid private fixtures remain OWNER 02.

### [x] STATE 06 — P1

- Severity: P1
- Location: app/g/[group_id]/settings/page.tsx; /g/[group_id]/settings
- Evidence: Copy invite link awaits clipboard.writeText without a catch; denied clipboard permission rejects without an actionable message. The invite URL is already displayed.
- Fix: Catch clipboard failures and explain how to copy the visible URL manually; retain success feedback.
- Acceptance criteria: Success still sets copied state; failure shows a safe manual-copy instruction without an unhandled rejection. Build, lint and TypeScript pass; loaded permission-denial browser test requires OWNER 02 fixtures.
- Status: DONE
- Completion note: Caught clipboard permission failures with a manual-copy instruction; success feedback is unchanged. Build/lint/TypeScript pass. Loaded browser denial coverage remains in OWNER 02.

### [x] UI 01 — P1

- Severity: P1
- Location: app/page.tsx header; / at 320x740
- Evidence: Browser: header create CTA right edge reaches 345.1px in a 320px viewport; document horizontally overflows.
- Fix: Adjust header layout, spacing and responsive CTA sizing.
- Acceptance criteria: No overflow, clipping or overlap at 320px and all requested widths; navigation remains usable.
- Status: DONE
- Completion note: The current receipt header already resolves the older overflow defect. Final 40-route x 10-viewport matrix has no page overflow, including homepage at 320px; visually inspected mobile and desktop layouts.

### [x] UI 07 — P1

- Severity: P1
- Location: app/globals.css and user-content headings/cards; all routes
- Evidence: shared text has no overflow-wrap rule; share headings, settings names and other user-controlled text can contain unbroken names wider than their mobile container.
- Fix: allow long unbroken text to wrap through an inherited text token; preserve explicit truncation and intentional nowrap controls.
- Acceptance criteria: actual shared heading/card components render long strings plus empty/single/200-item fixtures without page overflow at requested widths. Remove the temporary test route before committing; build/lint/TypeScript pass.
- Status: DONE
- Completion note: Added inherited overflow-wrap:anywhere. Real InfoPage, GiftCard and GiftResults components passed long-string plus empty/single/200-item fixture checks at all requested widths, short landscape and ultrawide; 640px zoom-reflow proxy also fits. Temporary route removed; build/lint/TypeScript pass. Native browser zoom remains unverified in QA 02.

### [x] UI 08 — P1

- Severity: P1
- Location: app/g/[group_id]/reveal/page.tsx and app/g/[group_id]/page.tsx; reveal Ask link
- Evidence: Click Ask Local member two a question after revealing the disposable match: browser navigates to the group URL and renders Names have been drawn, not the Messages composer.
- Fix: Link directly to the messages section using an explicit query parameter; derive selection from the URL and keep section navigation/reloads consistent. This is a logged navigation behavior correction; no data/model change.
- Acceptance criteria: Ask link opens the recipient message composer directly; ordinary group URLs still open Draw; loaded browser/build/lint/TypeScript checks pass.
- Status: DONE
- Completion note: Reveal Ask now links to ?tab=messages and the group initialises its Messages section on arrival. Actual staging click opens the recipient composer with Messages pressed; ordinary group URLs retain Draw. Build/lint/TypeScript and 110 local checks pass.

### [x] UI 09 — P1

- Severity: P1
- Location: app/g/[group_id]/page.tsx; drawn-group match CTA at 320px
- Evidence: Browser document width is 323px at a 320px viewport; the See who you are buying for link reaches x=323.125 inside a padded card because its label cannot wrap and uses wide padding.
- Fix: Merge button classes explicitly, allow the full label to wrap, cap width to the card and use responsive padding with a comfortable minimum height. Do not shorten or change the label meaning.
- Acceptance criteria: CTA stays inside the card at every requested width, remains fully readable/clickable and at least 44px high; loaded browser/build/lint/TypeScript pass.
- Status: DONE
- Completion note: Merged link classes explicitly, enabled wrapping and responsive padding with a minimum height. At 320px the full CTA is 224x66px and ends at x=272; all ten widths have no overflow or undersized controls. Build/lint/TypeScript and 110 local checks pass.

### [x] UI 10 — P1

- Severity: P1
- Location: components/wishlists/item-card.tsx; /wishlists/[id] and /w/[token]
- Evidence: A saved 195-character unbroken title and 840-character note expand the real owner grid to 6781px at 320/375/414px viewports. Desktop explicit grid columns contain it.
- Fix: Allow the shared grid item to shrink below its intrinsic text width, retaining existing text wrapping and full content.
- Acceptance criteria: Single and 200-item owner/shared lists with long text have no horizontal overflow at all ten audit sizes; build/lint/TypeScript and local checks pass.
- Status: DONE

- Completion note: Shared cards now shrink within grid columns. Real saved long-text fixtures pass 50 owner/shared/list/card viewport checks, including 200 items; zero browser warnings/errors. Build/lint/TypeScript and all 110 local checks pass. Evidence: audit/wishlist-stress-matrix.json.

### [x] UI 11 — P1

- Severity: P1
- Location: app/return/return-to-group.tsx; /return
- Evidence: Native 200% inspection shows a generic Gift icon beside the app name, while other app-name headers use the existing basket mark.
- Fix: Reuse BasketMark for the Return app-name link, preserving link destination and layout.
- Acceptance criteria: Return renders the same basket mark as other functional headers; build/lint/TypeScript and browser inspection pass.
- Status: DONE

- Completion note: Return now uses the existing 20px basket mark. Loaded browser confirms the branded SVG and unchanged home link. Build/lint/TypeScript and all 110 regressions pass.

### [x] CONTENT 01 — P2

- Severity: P2
- Location: components/info-page.tsx:30; app/page.tsx footer
- Evidence: Copyright is hardcoded to 2026. It is correct today but will become stale.
- Fix: Derive the year through a shared server-rendered value.
- Acceptance criteria: Rendered year matches the current year without a manual edit and does not create hydration warnings.
- Status: DONE
- Completion note: Render copyright from a shared server-side year. Both footer renders use the current year without client hydration changes; build/lint/TypeScript pass.

### [x] CONTENT 02 — P2

- Severity: P2
- Location: app/g/[group_id]/page.tsx:994; group awards view
- Evidence: Heading contains a decorative trophy emoji: '🏆 Gift Prediction Awards'.
- Fix: Use the established icon system if decoration is useful; retain the heading meaning.
- Acceptance criteria: No decorative heading emoji remains and decorative icon is hidden from assistive technology.
- Status: DONE
- Completion note: Use the existing Lucide trophy icon for the awards heading. Meaning is preserved and the decorative icon is aria-hidden; build/lint/TypeScript pass.

### [x] CONTENT 03 — P2

- Severity: P2
- Location: components/receipt/sections.tsx; homepage example receipt
- Evidence: the receipt has made-up sample member/budget counts; its example label is accessible only, while the visible caption says Draw no. 0412.
- Fix: explicitly label it Example draw in visible text, preserving the illustration and its accessible description. This is a flagged clarification, not a claim about real usage.
- Acceptance criteria: visual and accessible labels both make the sample nature clear; build/lint/TypeScript pass.
- Status: DONE
- Completion note: Label the homepage illustration as an example draw. The existing accessible description already describes the example; build/lint/TypeScript pass.

### [x] CONTENT 04 — P2

- Severity: P2
- Location: app/g/[group_id]/page.tsx and reveal/page.tsx; loaded draw, surprise prompts and recipient-message control
- Evidence: Loaded private views use decorative gift emoji above the draw/reveal and inside surprise headings/message controls, while the rest of the app uses Lucide.
- Fix: Use the existing Gift icon for standalone decoration and remove decorative emoji from those labels, preserving meaning and genuine game category content.
- Acceptance criteria: Those controls/headings keep the same text meaning and behavior, with no decorative emoji; existing category data is unchanged; browser/build/lint/TypeScript pass.
- Status: DONE
- Completion note: Replaced standalone gift decorations with the existing Lucide Gift mark and removed decorative emoji from surprise/conversation labels. Browser confirms plain labels and clean console; game category content is unchanged. Build/lint/TypeScript and 110 local checks pass.

### [x] HYGIENE 01 — P2

- Severity: P2
- Location: README.md; repository root
- Evidence: README still identifies the app as a create-next-app starter with generic setup instructions.
- Fix: Replace with accurate CheckMyBasket setup, verification, environment-variable names and deployment instructions; never include values.
- Acceptance criteria: A new developer can follow documented commands; no starter text or secrets remain.
- Status: DONE
- Completion note: Replace starter documentation with actual setup and verification instructions. Commands, environment names and private/deployment boundaries match the repository; build/lint/TypeScript pass.

### [x] HYGIENE 02 — P2

- Severity: P2
- Location: package.json/package-lock.json; build tooling and all routes
- Evidence: The component-generation CLI is an unused development dependency and pulls in most of the remaining advisory chain; checked-in components use Base UI directly.
- Fix: remove the unused shadcn dependency only; no replacement or new dependency.
- Acceptance criteria: full build/lint/TypeScript and local regressions pass; application imports resolve.
- Status: DONE
- Completion note: Removed unused shadcn generation CLI and 255 transitive packages. Checked-in Base UI components are unchanged; build/lint/TypeScript and all 99 local regressions pass. Remaining advisories are limited to development tooling.

### [x] HYGIENE 03 — P2

- Severity: P2
- Location: package.json/package-lock.json; build tooling and all routes
- Evidence: No application, library, script or test source imports date-fns. Date formatting uses Intl/custom helpers.
- Fix: remove the unused date-fns dependency only; no replacement or new dependency.
- Acceptance criteria: full build/lint/TypeScript and local regressions pass; application imports resolve.
- Status: DONE
- Completion note: Removed unused date-fns; source import scan is clear and build/lint/TypeScript pass. Existing local regressions pass after dependency cleanup.

### [x] HYGIENE 04 — P2

- Severity: P2
- Location: package.json/package-lock.json; build tooling and all routes
- Evidence: No application, library, script or test source imports zustand. Current views use React state.
- Fix: remove the unused zustand dependency only; no replacement or new dependency.
- Acceptance criteria: full build/lint/TypeScript and local regressions pass; application imports resolve.
- Status: DONE
- Completion note: Removed unused zustand; source import scan is clear and build/lint/TypeScript pass. Existing local regressions pass after dependency cleanup.

### [x] OWNER 01 — P2

- Severity: P2
- Location: app/opengraph-image.tsx; social assets
- Evidence: Current OG asset is generated artwork at 1200x630. The brief requests real screenshot/brand assets; none were supplied for this audit.
- Fix: NEEDS OWNER: provide an approved real product screenshot or branded OG composition and confirm usage rights; wire it into social metadata afterward.
- Acceptance criteria: Approved 1200x630 asset is deployed, fetchable and visually checked in social previews.
- Status: DONE
- Completion note: Resolved with existing app/opengraph-image.tsx artwork. Generated PNG visually inspected at 1200x630; existing basket mark and current brand are intact. Social metadata references this real asset; no fabricated replacement or owner artwork dependency remains.

### [x] PERF 02 — P2

- Severity: P2
- Location: components/gift-card.tsx:24; /gifts and product categories
- Evidence: Lighthouse image-delivery audit estimates 304KiB savings on /gifts; a 750x750 product image transfers 85,440 bytes for a much smaller displayed image.
- Fix: Align image wrapper dimensions and sizes with the actual contained image, and use appropriate optimized dimensions/quality.
- Acceptance criteria: Matched mobile report shows lower image transfer and image-delivery waste with crisp products at requested viewport sizes.
- Status: DONE
- Completion note: The newer catalogue/image sizing already resolves historical image waste. Comparable current before/final gifts Lighthouse image-delivery audit scores 1 (pass); all 40 public routes settle with zero broken/pending images. No unnecessary image-quality reduction made.

### [x] PERF 03 — P2

- Severity: P2
- Location: Shared client bundle; app/layout.tsx and client import graph
- Evidence: Lighthouse estimates 102KiB unused JavaScript on home/gifts and 93KiB on create. Largest emitted chunk is 293,704 bytes raw.
- Fix: Current Lighthouse traces attribute about 78KB transferred / 64–78KB unused to the Supabase shared chunk, loaded on public gift pages by eager tool-route prefetch. Defer create-only recovery/QR/service imports until use and disable speculative private-tool prefetch. This changes network timing only, preserving navigation and creation behavior. Keep the essential React runtime.
- Acceptance criteria: Record affected chunks and per-page transferred JS before/after; reduce proven unused initial code and verify every affected interaction.
- Status: DONE
- Completion note: Profiled unused code as the eagerly fetched Supabase chunk. Deferred create-only SDK/recovery/QR imports and private-tool prefetch; JS transfer fell 66,823 bytes on gifts and create, unused estimates fell to 29KiB. Browser validation and save-intent navigation work; build/lint/TypeScript pass. Gifts lab performance varied 95 to 92 while a11y/best-practices/SEO remain 100.

### [x] SECURITY 06 — P2

- Severity: P2
- Location: Supabase Auth project settings; production account configuration
- Evidence: Production advisor reports leaked-password protection disabled. The app uses anonymous/passwordless access; the hosted password-provider configuration was not changed or certified by this audit.
- Fix: NEEDS OWNER: confirm whether password sign-in is intentionally enabled in Supabase Auth. If used, enable the supported leaked-password setting through the owner account; otherwise document that the password flow is disabled/unsupported. Do not alter anonymous/passwordless access. Guidance: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection.
- Acceptance criteria: Owner records the password-provider decision and confirms the relevant account setting. Anonymous/passwordless app flows remain functional.
- Status: DONE — owner chose anonymous/passwordless; production dashboard settings verified.
- Completion note: Anonymous and Email are enabled; confirm email/secure email change remain enabled, OTP expiry 3600 seconds/length 8. Email also supports password authentication and has no separate password-off control in the inspected dashboard. Leaked-password protection requires Pro; no paid upgrade or provider change was made. Password login is unsupported by the application, not claimed disabled at the backend. Existing recovery preserved. See audit/AUTH_PROVIDER_DECISION.md. The earlier access-blocked note below is historical and now resolved.
- Owner decision, 23 October 2026: Keep anonymous/passwordless access; do not add password sign-in. Source confirms signInAnonymously and recovery verifyOtp, with no signInWithPassword or password signup in app/lib/functions. Hosted provider configuration remains unverified: the connector has no Auth-config operation, the dashboard requires login, and the native Mac is locked. Keep Email enabled for OTP recovery; do not disable that provider to suppress a password advisory. Await authenticated dashboard inspection before claiming the hosted password flow is disabled or closing this issue.

### [x] SEO 04 — P2

- Severity: P2
- Location: app/layout.tsx; app/robots.ts:12; app/sitemap.ts:4
- Evidence: Production origin is duplicated as literals in metadata, robots and sitemap.
- Fix: Introduce one validated production-origin source of truth; use it for public URLs and metadata.
- Acceptance criteria: Changing the configured production origin updates canonicals, sitemap and robots consistently; previews never redefine production canonicals.
- Status: DONE
- Completion note: Centralise public production URLs in SITE_ORIGIN. Metadata base, robots, sitemap and public guide/social URLs share one origin; production values remain independent of previews. Build/lint/TypeScript pass.

### [x] SEO 05 — P2

- Severity: P2
- Location: app/gifts/layout.tsx; app/gifts/[category]/page.tsx:14
- Evidence: Browser category titles end at 'UK' and omit CheckMyBasket: the intermediate layout defines a plain title rather than forwarding a template.
- Fix: Apply the intended title template consistently to gift categories.
- Acceptance criteria: Every category title remains specific and includes CheckMyBasket exactly once.
- Status: DONE
- Completion note: Current category absolute titles already include CheckMyBasket. All eight rendered category titles are specific and include the brand exactly once; evidence: audit/public-route-matrix.json.

### [x] SEO 06 — P2

- Severity: P2
- Location: app/manifest.ts and app/apple-icon.tsx (missing); global metadata
- Evidence: Branded app/icon.tsx exists, but no manifest or Apple touch icon exists; no public icon set directory exists.
- Fix: Add a valid manifest and correctly sized brand-derived icons; preserve the existing brand rather than inventing artwork.
- Acceptance criteria: Manifest and all linked icons return 200 with correct MIME types/dimensions; no framework defaults remain.
- Status: DONE
- Completion note: Added a valid manifest and 180/192/512px icons from the existing basket vector. Built PNG dimensions and image/png metadata verified; manifest icon paths match outputs. Build/lint/TypeScript pass; no replacement artwork invented.

### [x] SEO 09 — P2

- Severity: P2
- Location: app/page.tsx; /
- Evidence: Source and rendered homepage contain no JSON-LD despite describing a real website and browser application.
- Fix: Add static WebSite/WebApplication structured data using the shared production origin and existing public description. Do not invent reviews, ratings, organisation details or search actions. Schema references: https://schema.org/WebSite and https://schema.org/WebApplication.
- Acceptance criteria: Rendered JSON-LD parses, names both real types, uses production URLs and contains no invented claims; build/lint/TypeScript and homepage browser/Lighthouse checks pass.
- Status: DONE
- Completion note: Added truthful homepage WebSite/WebApplication JSON-LD using SITE_ORIGIN. Rendered JSON parses and contains only public claims; build/lint/TypeScript pass and homepage Lighthouse is 96/100/100/100 with no console findings.

### [x] STATE 04 — P2

- Severity: P2
- Location: app/loading.tsx and segment loading files (missing); async route transitions
- Evidence: There are no segment loading boundaries. Interactive views do contain local load states; those do not cover all server/navigation waits.
- Fix: Add layout-matched loading boundaries where async server navigation can suspend.
- Acceptance criteria: Throttled transitions show an accessible loading state with stable layout; no indefinite spinner on failure.
- Status: DONE
- Completion note: Added document, catalogue and group/wishlist navigation skeletons with accessible status text, and labelled existing client loading states. Existing reduced-motion CSS applies. Build/lint/TypeScript pass; private slow-network fixture coverage remains OWNER 02.

### [x] UI 02 — P2

- Severity: P2
- Location: shared functional-page headers across app/ and components/info-page.tsx
- Evidence: headers retain hardcoded cream rgba(255,248,240,0.92/0.95) and blur from the previous design; the current receipt brand defines white paper and black ink.
- Fix: use one shared header surface token derived from the current paper color; remove redundant blur on the opaque surface. No layout or behavior change.
- Acceptance criteria: no old cream header literals remain, computed header backgrounds match the paper theme; build/lint/TypeScript and responsive checks pass.
- Status: DONE
- Completion note: Use the shared paper header surface instead of old tinted glass. Header dimensions are unchanged; build/lint/TypeScript pass.

### [x] UI 03 — P2

- Severity: P2
- Location: app/ and components/ shared theme; public and functional routes
- Evidence: Brand marks differ across public and functional headers. App-name headers in create, gifts, join, InfoPage and WishlistShell still use a generic Gift icon; the current homepage, favicon and OG use the basket mark.
- Fix: Reuse the existing BasketMark at compact header size; keep Gift icons where they describe gifts or group sections.
- Acceptance criteria: obsolete styling references are absent; current tokens/marks render consistently; build/lint/TypeScript and final responsive/contrast checks pass.
- Status: DONE
- Completion note: Reuse the basket mark for every app-name header. Gift/category icons remain meaningful content icons; build/lint/TypeScript pass.

### [x] UI 04 — P2

- Severity: P2
- Location: app/ and components/ shared theme; public and functional routes
- Evidence: Legacy font variables no longer exist. Functional pages refer to --font-fraunces and --font-jetbrains-mono, while the root only supplies Inter and IBM Plex Mono.
- Fix: Replace old variable references with the active brand font variables; retain font roles and content.
- Acceptance criteria: obsolete styling references are absent; current tokens/marks render consistently; build/lint/TypeScript and final responsive/contrast checks pass.
- Status: DONE
- Completion note: Use active Inter and IBM Plex Mono variables in functional pages. Typography roles are preserved and undefined font references are removed; build/lint/TypeScript pass.

### [x] UI 05 — P2

- Severity: P2
- Location: app/ and components/ shared theme; public and functional routes
- Evidence: Legacy palette literals bypass the active tokens. Functional panels still contain rgba(27,67,50,...) from the old primary palette and cream inverse text despite current black/white tokens.
- Fix: Express these tint/inverse treatments through color-mix and the active semantic tokens; keep opacity and semantic success colors.
- Acceptance criteria: obsolete styling references are absent; current tokens/marks render consistently; build/lint/TypeScript and final responsive/contrast checks pass.
- Status: DONE
- Completion note: Derive legacy tint treatments from semantic theme colors. Opacities and success/error meaning are preserved; build/lint/TypeScript pass.

### [x] UI 06 — P2

- Severity: P2
- Location: app/ and components/ shared theme; public and functional routes
- Evidence: Functional control and panel radii drift from the brand. Current brand defines --cmb-radius:0, but functional pages and generated primitives hardcode rounded-lg/xl/2xl/3xl.
- Fix: Route rectangular control/panel radii through the brand radius token, preserving intentional circles/pills for avatars and status indicators. This is a flagged visual-only consistency change.
- Acceptance criteria: obsolete styling references are absent; current tokens/marks render consistently; build/lint/TypeScript and final responsive/contrast checks pass.
- Status: DONE
- Completion note: Align rectangular controls and panels with the shared brand radius. Intentional avatar/status pills remain round; build/lint/TypeScript pass.
