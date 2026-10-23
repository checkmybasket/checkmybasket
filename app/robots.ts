import { SITE_ORIGIN } from "@/lib/site";
import { shouldPreventIndexing } from "@/lib/deployment";
import type { MetadataRoute } from "next";

// Crawl guidance complements private-route noindex metadata; access control protects data.
export default function robots(): MetadataRoute.Robots {
  if (shouldPreventIndexing()) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/g/", "/join/"],
    },
    sitemap: `${SITE_ORIGIN}/sitemap.xml`,
  };
}
