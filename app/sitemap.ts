import type { MetadataRoute } from "next";

const BASE = "https://www.checkmybasket.co.uk";

// The /gifts/* category pages are the SEO play — every one must be listed.
// Keep in sync with CATEGORIES in app/gifts/[category]/page.tsx.
const GIFT_CATEGORIES = [
  "under-5", "under-10", "under-15", "under-20", "under-25",
  "colleague", "funny", "cosy",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE,            changeFrequency: "weekly",  priority: 1 },
    { url: `${BASE}/create`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/gifts`,  changeFrequency: "weekly",  priority: 0.8 },
    ...GIFT_CATEGORIES.map((slug) => ({
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
