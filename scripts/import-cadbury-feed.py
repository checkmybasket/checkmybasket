#!/usr/bin/env python3
"""Refresh the approved Cadbury selection from a newly downloaded Awin CSV/CSV.gz.
Usage: python3 scripts/import-cadbury-feed.py /path/to/feed.csv.gz
Keeps editorial text; never mass-imports new products. Review the diff before publishing.
"""
import csv
import gzip
import json
import sys
from datetime import datetime, timezone
from decimal import Decimal
from pathlib import Path
from urllib.parse import parse_qs, urlparse


def refresh(source, catalogue_path):
    catalogue = json.loads(catalogue_path.read_text())
    opener = gzip.open if source.suffix == ".gz" else open
    with opener(source, "rt", encoding="utf-8-sig", newline="") as stream:
        reader = csv.DictReader(stream)
        required = {"merchant_product_id", "product_name", "search_price", "currency", "in_stock", "aw_deep_link", "merchant_deep_link", "merchant_image_url", "aw_product_id"}
        if not required.issubset(reader.fieldnames or []):
            raise ValueError("Feed is missing required columns")
        rows = {}
        for row in reader:
            product_id = row["merchant_product_id"]
            if product_id in rows:
                raise ValueError("Duplicate merchant product ID")
            rows[product_id] = row
    if not rows:
        raise ValueError("Feed is empty")
    changed = 0
    for product in catalogue["products"]:
        row = rows.get(product["merchantProductId"])
        if row is None:
            product["inStock"] = False
            continue
        link = urlparse(row["aw_deep_link"])
        query = parse_qs(link.query)
        merchant = urlparse(row["merchant_deep_link"])
        image = urlparse(row["merchant_image_url"])
        price = Decimal(row["search_price"])
        if (row["currency"] != "GBP" or not price.is_finite() or price <= 0
            or link.scheme != "https" or link.netloc != "www.awin1.com"
            or link.path != "/pclick.php" or query.get("a") != [catalogue["publisherId"]]
            or query.get("m") != [catalogue["advertiserId"]]
            or query.get("p") != [row["aw_product_id"]]
            or merchant.scheme != "https" or merchant.netloc != "www.cadburygiftsdirect.co.uk"
            or image.scheme != "https" or image.netloc != "www.cadburygiftsdirect.co.uk"
            or not image.path.startswith("/media/catalog/product/") or image.query):
            raise ValueError("Feed product failed price, currency or URL validation: " + product["merchantProductId"])
        product.update(title=row["product_name"], price=int((price * 100).quantize(Decimal("1"))),
                       awinProductId=row["aw_product_id"], url=row["aw_deep_link"],
                       merchantUrl=row["merchant_deep_link"], image=row["merchant_image_url"],
                       inStock=row["in_stock"] == "1" and row.get("is_for_sale", "1") == "1")
        changed += 1
    if not changed:
        raise ValueError("No approved products found; catalogue left unchanged")
    catalogue["updatedAt"] = datetime.now(timezone.utc).isoformat(timespec="seconds")
    temporary = catalogue_path.with_suffix(".tmp")
    temporary.write_text(json.dumps(catalogue, indent=2) + "\n")
    temporary.replace(catalogue_path)
    return changed


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    target = Path(__file__).resolve().parents[1] / "data" / "cadbury-products.json"
    count = refresh(Path(sys.argv[1]), target)
    print(f"Refreshed {count} approved products. Review prices, availability and the diff before publishing.")
