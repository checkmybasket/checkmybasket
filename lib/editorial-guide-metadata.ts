import type { Metadata } from "next";
import { socialMetadata } from "@/lib/page-metadata";
import { EDITORIAL_GUIDES } from "@/lib/editorial-guides";

export function editorialMetadata(slug: string): Metadata {
  const guide = EDITORIAL_GUIDES.find(item => item.slug === slug);
  if (!guide) throw new Error("Unknown editorial guide");
  return {
    ...socialMetadata(guide.title, guide.description, `/${guide.slug}`),
    title: { absolute: `${guide.title} | CheckMyBasket` },
    description: guide.description,
    alternates: { canonical: `/${guide.slug}` },
  };
}
