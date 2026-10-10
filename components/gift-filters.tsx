import { GIFT_CATEGORIES } from "@/lib/gift-categories";
import { GIFT_INTERESTS, type GiftFilters } from "@/lib/gift-selection";
export function GiftFiltersForm({ filters, category }: { filters: GiftFilters; category?: string }) {
  const fieldClass = "mt-1 w-full rounded-lg border border-[var(--cmb-border)] bg-[var(--cmb-surface)] px-3 py-2 text-sm";
  return <form action={category ? `/gifts/${category}` : "/gifts"} className="mb-8 grid gap-3 sm:grid-cols-4 items-end">
    {!category ? <label className="text-sm font-medium">Gift category<select name="category" defaultValue={filters.category || ""} className={fieldClass}><option value="">All categories</option>{GIFT_CATEGORIES.map(c => <option key={c.slug} value={c.slug}>{c.label}</option>)}</select></label> : null}
    <label className="text-sm font-medium">Maximum budget<select name="budget" defaultValue={filters.budget || ""} className={fieldClass}><option value="">Any budget</option>{[500, 1000, 1500, 2000, 3000, 5000].map(p => <option key={p} value={p}>£{p / 100}</option>)}</select></label>
    <label className="text-sm font-medium">Recipient interest<select name="interest" defaultValue={filters.interest || ""} className={fieldClass}><option value="">Any interest</option>{GIFT_INTERESTS.map(i => <option key={i} value={i}>{i[0].toUpperCase() + i.slice(1)}</option>)}</select></label>
    <button className="h-10 rounded-lg bg-[var(--cmb-primary)] text-[var(--cmb-text-inverse)] px-4 text-sm font-semibold">Find gift ideas</button>
  </form>;
}
