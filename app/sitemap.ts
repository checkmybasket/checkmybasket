import { selectGifts } from "@/lib/gift-selection";
import type { MetadataRoute } from "next";
import { getAvailableGifts } from "@/lib/gift-catalogue";
import { GIFT_CATEGORIES } from "@/lib/gift-categories";

const BASE = "https://www.checkmybasket.co.uk";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const gifts = await getAvailableGifts();
  return [
    { url: BASE,            changeFrequency: "weekly",  priority: 1 },
    { url: `${BASE}/create`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/gifts`,  changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE}/secret-santa-whatsapp`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/office-secret-santa`, changeFrequency: "monthly", priority: 0.7 },
    ...GIFT_CATEGORIES.filter(({ slug }) => selectGifts(gifts, { category: slug }).length > 0).map(({ slug }) => ({
      url: `${BASE}/gifts/${slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    { url: `${BASE}/about`,   changeFrequency: "yearly" as const, priority: 0.3 },
    { url: `${BASE}/privacy`, changeFrequency: "yearly" as const, priority: 0.3 },
    { url: `${BASE}/terms`,   changeFrequency: "yearly" as const, priority: 0.3 },
    { url: `${BASE}/contact`, changeFrequency: "yearly" as const, priority: 0.3 },
  ];
}
