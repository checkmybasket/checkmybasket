import { catalogueWishDraft } from "@/lib/catalogue-wishlist";
import type { Metadata } from "next";
import { WishlistEditor } from "@/components/wishlists/editor";
export const metadata: Metadata = {
  title: "Your wishlist",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const draft = await catalogueWishDraft(query.gift);
  return <WishlistEditor key={id} id={id} draft={draft} />;
}
