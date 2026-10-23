import { socialMetadata } from "@/lib/page-metadata";
import { catalogueWishDraft } from "@/lib/catalogue-wishlist";
import type { Metadata } from "next";
import { WishlistEditor } from "@/components/wishlists/editor";
export const metadata: Metadata = {
  ...socialMetadata("Your wishlist", "Edit your private wishlist, add gifts from any shop and manage who can view your shared list.", "/wishlists"),
  title: "Your wishlist",
  description: "Edit your private wishlist, add gifts from any shop and manage who can view your shared list.",
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
