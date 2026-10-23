import type { Metadata } from "next";

/** Keep public social previews aligned with each page rather than the homepage. */
export function socialMetadata(title: string, description: string, path: string): Metadata {
  const socialTitle = title.includes("CheckMyBasket") ? title : `${title} | CheckMyBasket`;
  const image = { url: "/opengraph-image", width: 1200, height: 630, alt: "CheckMyBasket | Gifting made simple" };
  return {
    openGraph: { title: socialTitle, description, url: path, siteName: "CheckMyBasket", type: "website", images: [image] },
    twitter: { card: "summary_large_image", title: socialTitle, description, images: [image.url] },
  };
}
