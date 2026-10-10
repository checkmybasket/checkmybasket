import { GIFT_CATEGORIES } from "@/lib/gift-categories";

export type GiftProduct = {
  id: string; title: string; price: number; shop: string; tags: string[]; url: string;
  image: string; description: string; deliveryNote: string; categories: string[];
  interests?: string[]; priceCheckedAt?: string;
};
export const GIFT_INTERESTS = ["food", "chocolate", "coffee", "tea", "crafts", "games", "puzzles", "technology", "stationery", "plants", "home", "travel"];
export type GiftFilters = { category?: string; budget?: number; interest?: string };
export function londonDay(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const value = (key: string) => parts.find(p => p.type === key)?.value;
  return `${value("year")}-${value("month")}-${value("day")}`;
}
export function selectGifts(products: GiftProduct[], filters: GiftFilters, day = londonDay()) {
  const category = GIFT_CATEGORIES.find(c => c.slug === filters.category);
  const matching = products.filter(p => {
    if (category?.budget !== undefined && p.price >= category.budget) return false;
    if (category && category.budget === undefined && !p.categories.includes(category.slug)) return false;
    if (filters.budget && p.price > filters.budget) return false;
    if (filters.interest) {
      const interests = [...(p.interests || []), ...p.tags.map(t => t.toLowerCase())];
      if (!interests.some(i => i === filters.interest || i.includes(filters.interest!))) return false;
    }
    return true;
  }).sort((a, b) => a.id.localeCompare(b.id));
  if (matching.length < 2) return matching;
  // Rotate only within the relevant set. Adjacent days always have different first picks.
  const offset = Math.floor(Date.parse(`${day}T00:00:00Z`) / 86400000) % matching.length;
  return [...matching.slice(offset), ...matching.slice(0, offset)];
}
export function readGiftFilters(params: Record<string, string | string[] | undefined>): GiftFilters {
  const one = (key: string) => typeof params[key] === "string" ? params[key] as string : "";
  const budget = Number(one("budget"));
  return {
    category: GIFT_CATEGORIES.some(c => c.slug === one("category")) ? one("category") : undefined,
    budget: [500, 1000, 1500, 2000, 3000, 5000].includes(budget) ? budget : undefined,
    interest: GIFT_INTERESTS.includes(one("interest")) ? one("interest") : undefined,
  };
}
