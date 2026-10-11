import Link from "next/link";
import { GiftCard } from "@/components/gift-card";
import { getAvailableGifts } from "@/lib/gift-catalogue";
import { giftFiltersHref, selectGuidePicks } from "@/lib/gift-selection";

export async function GiftGuidePicks({ category, budget, interest, retailer }: { category?: string; budget?: number; interest?: string; retailer?: string }) {
  const catalogue = await getAvailableGifts();
  const unique = selectGuidePicks(catalogue, { category, budget, interest }, retailer);
  return (
    <section aria-labelledby="guide-picks-heading">
      <h2 id="guide-picks-heading" className="text-xl font-semibold mb-3 font-display">Current catalogue ideas</h2>
      <p className="text-sm text-[var(--cmb-text-secondary)] mb-4">These ideas come from our available catalogue and rotate daily. Item prices can change; delivery is extra. Check the retailer’s current price, options and availability before buying. Some links may earn us a commission at no extra cost to you.</p>
      {unique.length ? <div className="grid sm:grid-cols-2 gap-4">{unique.map(item => <GiftCard key={item.id} {...item}/>)}</div> : <p>No matching products are available right now. Use the choosing tips above or check the collection later.</p>}
      <Link href={giftFiltersHref({ budget, interest }, category && category !== "all" ? category : undefined)} className="inline-flex min-h-11 items-center underline mt-4">Browse the full collection and filter by interest</Link>
    </section>
  );
}
