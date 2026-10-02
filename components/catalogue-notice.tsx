import { catalogueUpdatedAt } from "@/lib/gift-catalogue";

export function CatalogueNotice() {
  const updated = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/London" }).format(new Date(catalogueUpdatedAt));
  return (
    <div className="rounded-xl border border-[var(--cmb-border)] bg-[var(--cmb-surface)] p-4 mb-6 text-sm text-[var(--cmb-text-secondary)]">
      <p className="mb-1">Affiliate links: we may earn a commission when you buy, at no extra cost to you.</p>
      <p>Budget collections use the product price. Delivery may cost extra. Cadbury lists standard delivery at £3.99; postal gifts and some postcodes have different charges. <a href="https://www.cadburygiftsdirect.co.uk/full-delivery-details" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">Check delivery details</a>.</p>
      <p className="mt-1 text-xs">Prices updated {updated}. Confirm current price, availability and allergens at the retailer before buying.</p>
    </div>
  );
}
