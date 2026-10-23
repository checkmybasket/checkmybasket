import Link from "next/link";
import { GIFT_CATEGORIES } from "@/lib/gift-categories";
import { giftFiltersHref, giftInterestLabel, selectGifts, type GiftFilters, type GiftProduct } from "@/lib/gift-selection";

export function GiftResults({ products, catalogue, filters, category, page, pageSize }: {
  products: GiftProduct[]; catalogue: GiftProduct[]; filters: GiftFilters;
  category?: string; page: number; pageSize: number;
}) {
  const active = [
    ...(!category && filters.category ? [{ label: GIFT_CATEGORIES.find(c => c.slug === filters.category)!.label, filters: { ...filters, category: undefined } }] : []),
    ...(filters.budget ? [{ label: `Up to £${filters.budget / 100}`, filters: { ...filters, budget: undefined } }] : []),
    ...(filters.interest ? [{ label: giftInterestLabel(filters.interest), filters: { ...filters, interest: undefined } }] : []),
  ];
  const linkClass = "inline-flex min-h-11 items-center rounded-full border border-[var(--cmb-border)] bg-[var(--cmb-surface)] px-4 py-2 text-sm font-medium text-[var(--cmb-primary)] focus-visible:outline-2 focus-visible:outline-offset-2";
  const suggestions = products.length ? [] : [
    ...(filters.interest ? [{ label: "Try any interest", filters: { ...filters, interest: undefined } }] : []),
    ...(!category && filters.category ? [{ label: "Try all categories", filters: { ...filters, category: undefined } }] : []),
  ].map(s => ({ ...s, count: selectGifts(catalogue, { ...s.filters, category: category || s.filters.category }).length })).filter(s => s.count > 0);
  return <section id="gift-results" aria-labelledby="gift-results-heading" className="scroll-mt-20 mb-5">
    <h2 id="gift-results-heading" className="font-display text-xl font-bold mb-2">{active.length ? "Gift ideas for your recipient" : "Today’s gift ideas"}</h2>
    <p className="text-sm text-[var(--cmb-text-secondary)] mb-3" role="status">
      {products.length ? `Showing ${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, products.length)} of ${products.length} gift ideas. Picks rotate daily.` : "No gifts match these choices today."}
    </p>
    <a href="#gift-filters" className="inline-flex min-h-11 items-center mb-2 text-sm underline underline-offset-4">Change gift filters</a>
    {active.length ? <div aria-label="Applied filters" className="flex flex-wrap gap-2 mb-4">
      {active.map(a => <Link key={a.label} href={giftFiltersHref(a.filters, category)} aria-label={`Remove ${a.label} filter`} className={linkClass}>{a.label}<span aria-hidden="true" className="ml-2">×</span></Link>)}
      <Link href={giftFiltersHref({}, category)} className="inline-flex min-h-11 items-center px-2 text-sm underline underline-offset-4">Clear filters</Link>
    </div> : null}
    {!products.length ? <div className="rounded-[var(--cmb-radius)] border border-[var(--cmb-border)] bg-[var(--cmb-surface)] p-5">
      <p className="text-sm text-[var(--cmb-text-secondary)] mb-4">{suggestions.length ? "These options keep your selected budget. Choose one to broaden the results." : "Try changing your budget or clearing the filters to explore this collection."}</p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map(s => <Link key={s.label} href={giftFiltersHref(s.filters, category)} className={linkClass}>{s.label} ({s.count})</Link>)}
        <Link href={giftFiltersHref({}, category)} className={linkClass}>Clear filters and browse {category ? "this collection" : "all gifts"}</Link>
        {category ? <Link href={giftFiltersHref({ budget: filters.budget, interest: filters.interest })} className={linkClass}>Search all gifts</Link> : null}
      </div>
    </div> : null}
  </section>;
}
