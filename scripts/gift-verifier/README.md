# Gift master and daily website rotation

Master: https://docs.google.com/spreadsheets/d/1nTrzLmCH7chbSbhi_SAQx2tP8i2sNFckIWzGLkL3Esw/edit

Google-hosted script: https://script.google.com/u/1/home/projects/1bTDWWg0lxNcBPKtzr2DjC74HmYqsNI_0JcNlyceGC4uKz6m71ZHwGvtw/edit

## Capacity and schedule

The original tab has room for 500 gifts plus its header. Version 1.2.0 supports 500 unique IDs, compresses the persisted ID queue to fit Google's property limit, and preserves old queue formats. Google authorization is complete. The existing dailyVerification trigger runs around 07:00 Europe/London; continueVerification runs every ten minutes. Six gifts are attempted per batch, so a full 500-gift cycle takes roughly 14 hours without retailer delays. The computer can be closed. Re-running installDailyVerification does not duplicate triggers. No web-app deployment is needed.

Every attempted row is checkpointed. If an execution terminates during a retailer request, the next worker records fetch-timeout and skips that retailer for the rest of that cycle. It retries the retailer next cycle. Missing/blocked facts are never guessed. Check CMB Runs and Apps Script Executions, including standard Google trigger failure notifications. A complete run means all queued items were attempted, not that every gift was verified. Monitor spreadsheet capacity and archive history periodically.

## Publication controls

Edit only the original catalogue tab. Keep unique gift_id values and all headers. Each public gift needs:

- publication_status = published;
- approval_status = approved;
- approved_by and approved_date filled in;
- approved product_name (or gift_name), short_description, retailer, categories and recipient_interests;
- a matching current verification result with a fixed positive GBP price, in-stock status and verified status checked within 36 hours.

Starting prices, ambiguous variants, failed checks, stale facts and changed product URLs are excluded. Dietary, safety, delivery and personalisation claims require editorial review before approval. Price changes automatically use the new verified price. Successful gifts retain the master’s approvals, copy and links. Failed gifts can now be replaced under the owner-authorised policy below.

Image approval is separate: an HTTPS master image is exported only when image_approved=yes under the owner’s display instruction. Permission evidence remains a separate record and is not invented. The specifically approved master image is used; scraped replacements are never approved by inference. Without an approved image, the website uses a neutral illustration. Unsupported image hosts also fall back to that illustration. Direct retailer links are used; affiliate integration remains separate.

CMB Website Feed is the only published tab. It contains 12 public product fields and excludes approval identity, private notes and history. Google automatically republishes changes; publishing delays can vary. The website reads this CSV through the server-only GIFT_MASTER_FEED_URL environment variable, with a five-minute fetch cache. It validates schema, URLs, unique IDs and price freshness independently. The original master tab returned HTTP 401 in an unauthenticated check; the public feed returned HTTP 200.

Do not publish the entire workbook or edit the generated feed manually. Changing a gift to draft or withdrawing approval removes it on the next feed sync (the ten-minute continuation also refreshes the feed while idle). Google's publication delay and the website cache apply. On feed failure, the website retains the existing reviewed catalogue. It never substitutes stale scraped prices.

## Website relevance and rotation

/gifts and category pages use the visitor's selected category, maximum budget and recipient interest. Filtering happens before rotation; unrelated gifts do not fill empty matches. The order rotates at each UK calendar day and stays stable within that day for the same matching set. Pagination preserves filters. No profile, group, wishlist or analytics data is used for recommendations.

The existing approved affiliate catalogue stays available and participates in rotation. The main master holds 500 product slots. All entries were authorised by the owner; the separate private reserve provides future replacements.

## Source and checks

The Apps Script project runs Code.gs and appsscript.json. Update that project when editing local source; there is no automatic source deployment from this directory.

- node scripts/gift-verifier/test.cjs: 48 parser, scheduler, preservation, publication, replacement and recovery checks.
- node scripts/gift-selection/test.cjs: 11 daily order, UK timezone, relevance, links, budget boundaries, CSV and feed safety checks.
- TypeScript, targeted ESLint and the production Next.js build.

Live local preflight results and activation evidence are saved under outputs/gift-verifier-2026-10-10. The original preflight used a local network; Google-origin retailer restrictions differ. Persistently blocked retailers need an authorised feed or manual review; the scraper does not bypass access controls.

## Replacement and description policy (11 October 2026)

Confirmed blocked/robots-disallowed/unavailable pages, missing products, uncertain fixed prices/variants, identity failures and out-of-stock/discontinued products are replaced from **CMB Replacement Pool**. Transient timeouts, fetch errors and HTTP 429 need failure in two separate daily cycles. Stale checks alone remain hidden while awaiting the next attempt.

A reserve row must have publication_status=reserve, explicit approval identity/date, recipient interests/categories, safety notes, a completed short_description and description_basis. New copy is prepared with the product selection; publication refuses rows without description evidence. The verifier never generates unsupported claims or invents missing prices. Approved reserve entries are ranked by category and interest overlap, then freshly scraped from the configured retailers. The exact fixed GBP price must remain below the outgoing slot’s budget-band ceiling. Tags come from the new product, not the outgoing gift.

Only one reserve candidate is fetched per worker batch. Failed reserve checks become needs-review; successful promotion preserves the 500 slot IDs, records the previous complete master row in **CMB Replacements**, and marks the reserve entry used. Both records are re-read after the network request so concurrent owner edits are preserved. Existing affiliate links are not transferred to another product.

The reserve is finite. When no approved in-budget candidate remains, the failed gift stays hidden; replenish the private pool with verified products, complete descriptions/evidence and approvals. No whole-workbook publication, extra permissions, new triggers or web-app deployment are needed.
