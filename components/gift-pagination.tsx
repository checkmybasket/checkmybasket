import Link from "next/link";
import type { GiftFilters } from "@/lib/gift-selection";
export function GiftPagination({ page, pages, filters, category }: { page: number; pages: number; filters: GiftFilters; category?: string }) {
  if (pages < 2) return null;
  function href(next: number) {
    const query = new URLSearchParams();
    if (!category && filters.category) query.set("category", filters.category);
    if (filters.budget) query.set("budget", String(filters.budget));
    if (filters.interest) query.set("interest", filters.interest);
    query.set("page", String(next));
    return `${category ? `/gifts/${category}` : "/gifts"}?${query}`;
  }
  return <nav aria-label="Gift pages" className="flex items-center justify-center gap-5 mb-10 text-sm">
    {page > 1 ? <Link href={href(page - 1)} className="underline underline-offset-4">Previous gifts</Link> : null}
    <span>Page {page} of {pages}</span>
    {page < pages ? <Link href={href(page + 1)} className="underline underline-offset-4">More gift ideas</Link> : null}
  </nav>;
}
