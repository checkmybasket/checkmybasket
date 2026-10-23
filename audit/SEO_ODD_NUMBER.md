# Odd-number search-intent update

23 October 2026. Search Console Web Search baseline from the default three-month view (available chart data 9–21 October): 602 site impressions, zero clicks, average position 27.8. The odd-number guide has 262 impressions, zero clicks, average position 7.9. Queries explicitly ask about odd groups, five people and seven people. These small-sample pre-release figures do not establish why users did not click or guarantee improvement.

SEO 10 changes the search/social title to “Secret Santa with an odd number: 3, 5 or 7 people”, starts the meta description with the direct answer, and clarifies that everyone gives and receives once. Existing h1, canonical, worked 3/5/7 tables, minimum three joined members and exclusion constraints remain. Added a concrete five-person explanation; changed only this guide's real revision date.

Baseline and final staging build, lint, TypeScript and all 110 regressions pass. Browser checks at 320/375/414/768/1440px confirm metadata, one h1, unchanged canonical, direct answer, revised date, 3/5/7 table rows and no horizontal overflow. The remote-team guide retains its previous date. Captured warnings/errors: zero. No new dependencies or product/data-model changes.

Separately, Google's live test of /gifts passed, and the user-authorized indexing request succeeded: “Indexing requested”, URL added to a priority crawl queue. This is not confirmation that the URL is now indexed. The existing sitemap is successful, last read 22 October, with 39 discovered URLs; it was not resubmitted.

Next measurement: compare like-for-like Search Console windows after recrawl and enough impressions accrue. Track the guide's query/page clicks, impressions, CTR and position; do not treat a changed title or request as a ranking guarantee.
