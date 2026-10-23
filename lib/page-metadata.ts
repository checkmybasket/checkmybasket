import type { Metadata } from "next";

const socialImage = { url: "/opengraph-image", width: 1200, height: 630, alt: "CheckMyBasket | Gifting made simple" };
export const OPEN_GRAPH_DEFAULTS = { siteName: "CheckMyBasket", type: "website" as const, images: [socialImage] };
export const TWITTER_DEFAULTS = { card: "summary_large_image" as const, images: [socialImage.url] };

/** Keep public social previews aligned with each page rather than the homepage. */
export function socialMetadata(title: string, description: string, path: string): Metadata {
  const socialTitle = title.includes("CheckMyBasket") ? title : `${title} | CheckMyBasket`;
  return {
    openGraph: { ...OPEN_GRAPH_DEFAULTS, title: socialTitle, description, url: path },
    twitter: { ...TWITTER_DEFAULTS, title: socialTitle, description },
  };
}
