# Partner catalogue update, 4 October 2026

Input: datafeed_2918745.csv.gz, 218,219 rows. Advertisers: Craft Buddy 45747 (2 rows), PcNova 125822 (218,188 rows), MORiSH 126437 (29 rows). No Brickzonehub in this feed.

Added six retailer-verified gifts: five MORiSH 20 x 4g seaweed multipacks at £18 and the Craft Buddy Harry Potter crystal art album starter pack at £9.99. Checked retailer variant prices and available flags against the feed. The starter pack has an album, six assorted stickers and tools; additional stickers cost extra.

Excluded sold-out MORiSH pork multipack, beef, mixed bundle and smaller seaweed packs; avoided duplicate larger packs and gift cards pending programme eligibility. The separate craft sticker pack requires tools and is a refill, so not selected as a standalone starter gift.

PcNova items remain unpublished: retailer pages rejected the verification request, and the feed's delivery_cost field contains a delivery timeframe rather than a monetary cost. Revisit consumer price/VAT, stock, merchant identity and gift suitability before selecting those products. No computer spare parts were bulk-imported.

Cadbury products remain. Partner data is in data/partner-products.json. Brand fonts, palette and page layouts remain as currently approved. Gift buttons use the product's retailer, and the image proxy permits only the two selected Shopify store paths in addition to Cadbury.

Manual refresh: python3 scripts/import-partner-feed.py /path/to/datafeed.csv.gz. It streams the feed, updates only approved products, preserves editorial text and variant labels, validates affiliate IDs and image/store URLs, and hides missing products only for advertisers present in the supplied feed. Review retailer variants again before publishing because the Awin stock snapshot can lag. Automatic refresh is still not configured.
