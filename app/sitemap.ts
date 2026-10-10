import type { MetadataRoute } from "next";
import { getGiftsForCategory } from "@/lib/gift-catalogue";
import { GIFT_CATEGORIES } from "@/lib/gift-categories";

const BASE = "https://www.checkmybasket.co.uk";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE,            changeFrequency: "weekly",  priority: 1 },
    { url: `${BASE}/create`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/gifts`,  changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE}/secret-santa-whatsapp`, changeFrequency: "monthly", priority: 0.7 },
    ...GIFT_CATEGORIES.filter(({ slug }) => getGiftsForCategory(slug).length > 0).map(({ slug }) => ({
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
