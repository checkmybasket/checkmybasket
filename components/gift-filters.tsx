import { GIFT_CATEGORIES } from "@/lib/gift-categories";
import { GIFT_INTERESTS, type GiftFilters } from "@/lib/gift-selection";
export function GiftFiltersForm({ filters, category }: { filters: GiftFilters; category?: string }) {
  const fieldClass = "mt-1 min-h-11 w-full rounded-lg border border-[var(--cmb-border)] bg-[var(--cmb-surface)] px-3 py-2 text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cmb-primary)]";
  return <section aria-labelledby="gift-filters-heading" className="mb-6 rounded-2xl border border-[var(--cmb-border)] bg-[var(--cmb-surface)] p-4 sm:p-5">
    <h2 id="gift-filters-heading" className="font-display text-lg font-semibold mb-1">Find a gift for your recipient</h2>
    <p className="text-sm text-[var(--cmb-text-secondary)] mb-4">Set an item budget and choose what they enjoy. Delivery costs are extra.</p>
    <form data-gift-filters action={`${category ? `/gifts/${category}` : "/gifts"}#gift-results`} className={`grid gap-3 items-end ${category ? "sm:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-4"}`}>
    {!category ? <label className="text-sm font-medium">Gift category<select name="category" defaultValue={filters.category || ""} className={fieldClass}><option value="">All categories</option>{GIFT_CATEGORIES.map(c => <option key={c.slug} value={c.slug}>{c.label}</option>)}</select></label> : null}
    <label className="text-sm font-medium">Maximum budget<select name="budget" defaultValue={filters.budget || ""} className={fieldClass}><option value="">Any budget</option>{[500, 1000, 1500, 2000, 3000, 5000].map(p => <option key={p} value={p}>£{p / 100}</option>)}</select></label>
    <label className="text-sm font-medium">Recipient interest<select name="interest" defaultValue={filters.interest || ""} className={fieldClass}><option value="">Any interest</option>{GIFT_INTERESTS.map(i => <option key={i} value={i}>{i === "gaming" ? "Video gaming" : i === "games" ? "Tabletop games" : i[0].toUpperCase() + i.slice(1)}</option>)}</select></label>
    <button type="submit" className="min-h-11 rounded-lg bg-[var(--cmb-primary)] text-[var(--cmb-text-inverse)] px-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cmb-primary)]">Find gift ideas</button>
    </form>
  </section>;
}
