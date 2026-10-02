import type { MetadataRoute } from "next";
import { GIFT_CATEGORIES } from "@/lib/gift-categories";

const BASE = "https://www.checkmybasket.co.uk";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE,            changeFrequency: "weekly",  priority: 1 },
    { url: `${BASE}/create`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/gifts`,  changeFrequency: "weekly",  priority: 0.8 },
    ...GIFT_CATEGORIES.map(({ slug }) => ({
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
