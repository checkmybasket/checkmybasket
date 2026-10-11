import Link from "next/link";
import { giftFiltersHref, type GiftFilters } from "@/lib/gift-selection";
export function GiftPagination({ page, pages, filters, category }: { page: number; pages: number; filters: GiftFilters; category?: string }) {
  if (pages < 2) return null;
  const href = (next: number) => giftFiltersHref(filters, category, next);
  return <nav aria-label="Gift pages" className="flex items-center justify-center gap-5 mb-10 text-sm">
    {page > 1 ? <Link href={href(page - 1)} className="inline-flex min-h-11 items-center underline underline-offset-4">Previous gifts</Link> : null}
    <span>Page {page} of {pages}</span>
    {page < pages ? <Link href={href(page + 1)} className="inline-flex min-h-11 items-center underline underline-offset-4">More gift ideas</Link> : null}
  </nav>;
}
