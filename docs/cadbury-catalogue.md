# Cadbury catalogue

Launched from Awin advertiser 736, publisher 2918745, feed 48599, supplied 2 October 2026.
16 approved gifts were checked against the retailer product pages: exact GBP prices and InStock offers matched the feed. There are no fabricated ratings or reviews. Teacher-themed gifts are not assigned to the colleague collection. £20 products appear under £30/£50, not under £20.

Data lives in `data/cadbury-products.json`; selection and featured choices use stable merchant IDs. Product photos use the Next.js image proxy with one allowed retailer/path. Browser security headers stay intact. Gift cards show exact prices, an affiliate disclosure and delivery wording. The postal box does not promise a delivered total because the retailer description and generic delivery tab differ.

## Refresh

Download a fresh Awin feed with the same columns, then run:

```sh
python3 scripts/import-cadbury-feed.py /path/to/736-48599-en_GB-Cadbury_Shopping_Feed.csv.gz
```

The importer updates only the approved selection, preserving editorial text and collection assignments. Missing/out-of-stock/not-for-sale products are hidden. Invalid URLs, wrong publisher/advertiser IDs, empty feeds or invalid prices abort before replacing the catalogue. Review changed products against the retailer; run the build and publish the approved diff using the existing deployment workflow.

Refresh at least weekly during this pilot and before any promotion. Automated updates are not enabled yet: a private Awin feed download credential/URL and a server-side scheduled integration still need configuration. Never put the private feed URL into source control or browser code. A local downloaded feed is sufficient for manual refreshes.

Funny, cosy and personalised categories remain available with a coming-soon message until suitable real products are approved.
