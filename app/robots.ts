import type { MetadataRoute } from "next";

// Group dashboards and invite links are private, unguessable URLs — keep
// them (and their subpages) out of search indexes entirely.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/g/", "/join/"],
    },
    sitemap: "https://www.checkmybasket.co.uk/sitemap.xml",
  };
}
