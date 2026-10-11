import Link from "next/link";
import { GiftCard } from "@/components/gift-card";
import { getAvailableGifts } from "@/lib/gift-catalogue";
import { selectGifts } from "@/lib/gift-selection";

export async function GiftGuidePicks({ category, budget }: { category: string; budget?: number }) {
  const catalogue = await getAvailableGifts();
  const matching = selectGifts(catalogue, { category, budget }).filter(item => !/\b(refills?|replacement|spare parts?)\b/i.test(item.title));
  // Prefer a range of interests; each product appears only once.
  const picks = ["books", "stationery", "puzzles", "games"].flatMap(interest =>
    selectGifts(matching, { interest }).slice(0, 1));
  const unique = [...new Map([...picks, ...matching].map(item => [item.id, item])).values()].slice(0, 4);
  return (
    <section aria-labelledby="guide-picks-heading">
      <h2 id="guide-picks-heading" className="text-xl font-semibold mb-3 font-display">Current catalogue ideas</h2>
      <p className="text-sm text-[var(--cmb-text-secondary)] mb-4">These ideas come from our available catalogue and rotate daily. Item prices can change; delivery is extra. Check the retailer’s current price, options and availability before buying. Some links may earn us a commission at no extra cost to you.</p>
      {unique.length ? <div className="grid sm:grid-cols-2 gap-4">{unique.map(item => <GiftCard key={item.id} {...item}/>)}</div> : <p>No matching products are available right now. Use the choosing tips above or check the collection later.</p>}
      <Link href={`/gifts/${category}${budget ? `?budget=${budget}` : ""}`} className="inline-flex min-h-11 items-center underline mt-4">Browse the full collection and filter by interest</Link>
    </section>
  );
}
