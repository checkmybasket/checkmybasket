#!/usr/bin/env python3
"""Refresh approved partner products from a downloaded Awin CSV or CSV.gz.
Usage: python3 scripts/import-partner-feed.py /path/to/feed.csv.gz
Review variant prices and stock at the retailer before publishing.
"""
import csv
import gzip
import json
import sys
from datetime import datetime, timezone
from decimal import Decimal
from pathlib import Path
from urllib.parse import urlparse, parse_qs

STORES = {
    "45747": ("www.craftbuddyshop.com", "/s/files/1/0331/0528/1083/files/"),
    "126437": ("morishsnacks.co.uk", "/s/files/1/0883/3587/6424/files/"),
}


def refresh(source, target):
    catalogue = json.loads(target.read_text())
    approved = {p["id"]: p for p in catalogue["products"]}
    seen, advertisers = set(), set()
    opener = gzip.open if source.suffix == ".gz" else open
    with opener(source, "rt", encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        required = {"merchant_id", "merchant_product_id", "aw_product_id", "search_price", "currency", "aw_deep_link", "merchant_deep_link", "merchant_image_url", "in_stock"}
        if not required.issubset(reader.fieldnames or []):
            raise ValueError("Missing required feed columns")
        for row in reader:
            advertiser = row["merchant_id"]
            advertisers.add(advertiser)
            key = "awin:" + advertiser + ":" + row["merchant_product_id"]
            if key not in approved:
                continue
            if key in seen:
                raise ValueError("Duplicate selected product")
            seen.add(key)
            price = Decimal(row["search_price"])
            affiliate, merchant, image = (urlparse(row[field]) for field in ["aw_deep_link", "merchant_deep_link", "merchant_image_url"])
            query = parse_qs(affiliate.query)
            host, image_path = STORES[advertiser]
            if (not price.is_finite() or price <= 0 or row["currency"] != "GBP"
                or affiliate.scheme != "https" or affiliate.netloc != "www.awin1.com" or affiliate.path != "/pclick.php"
                or query.get("a") != [catalogue["publisherId"]] or query.get("m") != [advertiser]
                or query.get("p") != [row["aw_product_id"]]
                or merchant.scheme != "https" or merchant.netloc != host
                or image.scheme != "https" or image.netloc != "cdn.shopify.com" or not image.path.startswith(image_path)):
                raise ValueError("Invalid price, currency or URL for " + key)
            approved[key].update(price=int((price * 100).quantize(Decimal("1"))), awinProductId=row["aw_product_id"],
                                 url=row["aw_deep_link"], merchantUrl=row["merchant_deep_link"], image=row["merchant_image_url"],
                                 inStock=row["in_stock"] == "1" and row.get("is_for_sale", "1") == "1")
    if not advertisers.intersection(STORES):
        raise ValueError("No selected advertisers present; catalogue unchanged")
    for key, product in approved.items():
        if product["advertiserId"] in advertisers and key not in seen:
            product["inStock"] = False
    catalogue["updatedAt"] = datetime.now(timezone.utc).isoformat(timespec="seconds")
    temporary = target.with_suffix(".tmp")
    temporary.write_text(json.dumps(catalogue, indent=2) + "\n")
    temporary.replace(target)
    return len(seen)


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    count = refresh(Path(sys.argv[1]), Path(__file__).resolve().parents[1] / "data/partner-products.json")
    print(f"Updated {count} approved products. Review retailer variants and the diff before publishing.")
