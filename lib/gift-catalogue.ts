import { cache } from "react";
import partners from "@/data/partner-products.json";
import cadbury from "@/data/cadbury-products.json";
import { selectGifts, type GiftProduct } from "@/lib/gift-selection";
import { parseGiftFeed } from "@/lib/gift-sheet-feed";

export const catalogueUpdatedAt = cadbury.updatedAt;
const existingGifts: GiftProduct[] = [...cadbury.products, ...partners.products].filter(p => p.inStock).map(p => {
  const labels = p.tags.join(" ").toLowerCase();
  const interests = [...(/chocolate|snack|seaweed/.test(labels) ? ["food"] : []), ...(/craft|crystal/.test(labels) ? ["crafts"] : [])];
  return { ...p, interests };
});

export const getAvailableGifts = cache(async (): Promise<GiftProduct[]> => {
  const feedUrl = process.env.GIFT_MASTER_FEED_URL;
  if (!feedUrl) return existingGifts;
  try {
    const url = new URL(feedUrl);
    if (url.protocol !== "https:" || url.hostname !== "docs.google.com" || !url.pathname.startsWith("/spreadsheets/d/e/") || !url.pathname.endsWith("/pub") || url.searchParams.get("output") !== "csv") throw Error("Invalid gift feed location");
    const response = await fetch(url, { next: { revalidate: 300 }, signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw Error("Gift feed unavailable");
    const csv = await response.text();
    if (csv.length > 2000000) throw Error("Gift feed too large");
    return [...parseGiftFeed(csv), ...existingGifts];
  } catch {
    console.warn("Gift master feed unavailable or invalid; using existing catalogue");
    return existingGifts;
  }
});
export async function getGiftsForCategory(slug: string) {
  return selectGifts(await getAvailableGifts(), { category: slug });
}
