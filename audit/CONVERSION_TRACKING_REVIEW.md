# Conversion tracking review

24 October 2026. Read-only review of production GA4 and application source. No Analytics settings changed, no test business events sent to Google and no production groups/wishlists created.

## Account and stream

GA4 property 540121380, CheckMyBasket Web stream 14997519823, production site https://www.checkmybasket.co.uk. Measurement ID G-V29MEMTFL2 matches lib/analytics.ts. Stream reports recent traffic. Enhanced measurement is OFF, consistent with explicit allowlisting and private-route exclusions. It was not enabled.

The Events admin page confirms draw_created and wishlist_created are already marked as key events and have stream data in the last 28 days. Recent events also lists gift_retailer_click, gift_filters_applied and gift_save_started. This proves event names have reached the stream; it does not establish that every event was a real customer action or that every browser delivers events successfully. Old form_start/scroll events in the 28-day list do not prove those collectors remain enabled today.

The Home report's last-seven-day period (17–23 October) shows 5 active users, 10 sessions, 24 views and 42 events, with zero key events for that period. Sparse consented data is not a reliable count of all product use. No user-level records or identifying event parameters were exported.

## Event meaning and trigger checks

| Event | What it means | Source/guard | GA4 role |
| --- | --- | --- | --- |
| draw_created | Successful group/draw setup, NOT execution of the name draw | app/create/page.tsx: after create_group RPC returns without error; validate/busy guards before submission | Already a key event |
| wishlist_created | Successful creation of a personal wishlist, NOT editing an existing list | components/wishlists/list-form.tsx: after successful save_personal_wishlist; only when no existing list | Already a key event |
| gift_retailer_click | An outbound retailer-link click, NOT a purchase or commission | Delegated click listener and retailer allowlist | Secondary engagement event |
| gift_save_started | Public Save to wishlist click, NOT a completed private gift save | Public catalogue/guide route guard; no gift ID or private state exported | Intent event |
| gift_filters_applied | Submitted catalogue filters | Category/budget/interest allowlist | Engagement event |

Do not relabel retailer clicks as sales or group creation as a completed random draw. Existing event names were preserved to avoid silently changing historical reporting.

## Consent and privacy verification

- No accepted consent: event helpers return without sending.
- Tracking disabled, private/token route, arbitrary retailer or unavailable gtag: suppressed.
- Tracking errors cannot interrupt product actions.
- Existing 16 analytics/privacy checks pass, including rejection, consent withdrawal guard, allowlisting and exclusion of private fields, query/fragment content, product text and token-shaped routes.
- Source shows the Google script loads only with accepted consent on allowlisted routes; private navigation disables collection. Consent rejection removes Analytics cookies without touching auth cookies.
- Successful creation is tracked after backend error checks, not on form submission. Editing a wishlist does not fire wishlist_created. Failed validation/backend paths do not reach the event call.

Verification scope: source placement + existing executable privacy/event checks + authenticated GA4 stream/key-event readback. A new end-to-end browser-to-Google conversion was deliberately not fabricated. Historical receipt and passing isolated tests are separate evidence, not a claim that production delivery is infallible. No source changes were needed for this review.

## Attribution limitation and recommendations

The app intentionally blanks page_referrer and strips query/fragment values from page_location. It protects group tokens and private details, but limits acquisition/campaign attribution. The Home report shows Direct sessions; that must not be interpreted as proof that every visitor typed or bookmarked the URL. UTM-tagged outreach links are not a guaranteed attribution solution under the current implementation.

Search Console can show organic clicks by landing page; GA4 can show consented public-page and key-event activity. Do not claim a joined query-to-conversion funnel is currently verified. GA4 also recommends linking Search Console; the account-link setting was not changed because that is a separate integration decision.

Recommended reporting vocabulary: group setups, personal wishlists created, outbound retailer clicks, save intents. Keep acquisition analysis qualified. If richer attribution is desired, first specify an allowlisted, privacy-preserving design and review it before changing the existing collection policy. Never enable broad enhanced measurement as a shortcut.

Google references: [key events](https://support.google.com/analytics/answer/9267568), [event configuration](https://support.google.com/analytics/answer/12844695). Local source evidence: lib/analytics.ts, components/analytics-consent.tsx, app/create/page.tsx, components/wishlists/list-form.tsx and scripts/analytics/test.cjs.
