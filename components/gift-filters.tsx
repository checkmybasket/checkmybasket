import { GIFT_CATEGORIES } from "@/lib/gift-categories";
import { GIFT_INTERESTS, giftInterestLabel, type GiftFilters } from "@/lib/gift-selection";
export function GiftFiltersForm({ filters, category }: { filters: GiftFilters; category?: string }) {
  const fieldClass = "mt-1 min-h-11 w-full rounded-[var(--cmb-radius)] border border-[var(--cmb-border)] bg-[var(--cmb-surface)] px-3 py-2 text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cmb-primary)]";
  return <section id="gift-filters" aria-labelledby="gift-filters-heading" className="scroll-mt-20 mb-6 rounded-[var(--cmb-radius)] border border-[var(--cmb-border)] bg-[var(--cmb-surface)] p-4 sm:p-5">
    <h2 id="gift-filters-heading" className="font-display text-lg font-semibold mb-1">Find a gift for your recipient</h2>
    <p className="text-sm text-[var(--cmb-text-secondary)] mb-4">Set an item budget and choose what they enjoy. Delivery costs are extra.</p>
    <form data-gift-filters action={`${category ? `/gifts/${category}` : "/gifts"}#gift-results`} className={`grid grid-cols-2 gap-3 items-end ${category ? "sm:grid-cols-3" : "lg:grid-cols-4"}`}>
    {!category ? <label className="col-span-2 lg:col-span-1 text-sm font-medium">Gift category<select name="category" defaultValue={filters.category || ""} className={fieldClass}><option value="">All categories</option>{GIFT_CATEGORIES.map(c => <option key={c.slug} value={c.slug}>{c.label}</option>)}</select></label> : null}
    <label className="text-sm font-medium">Maximum budget<select name="budget" defaultValue={filters.budget || ""} className={fieldClass}><option value="">Any budget</option>{[500, 1000, 1500, 2000, 3000, 5000].map(p => <option key={p} value={p}>£{p / 100}</option>)}</select></label>
    <label className="text-sm font-medium">Recipient interest<select name="interest" defaultValue={filters.interest || ""} className={fieldClass}><option value="">Any interest</option>{GIFT_INTERESTS.map(i => <option key={i} value={i}>{giftInterestLabel(i)}</option>)}</select></label>
    <button type="submit" className={`col-span-2 ${category ? "sm:col-span-1" : "lg:col-span-1"} min-h-11 rounded-[var(--cmb-radius)] bg-[var(--cmb-primary)] text-[var(--cmb-text-inverse)] px-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cmb-primary)]`}>Find gift ideas</button>
    </form>
  </section>;
}
