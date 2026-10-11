import { catalogueWishDraft } from "@/lib/catalogue-wishlist";
import type { Metadata } from "next";
import { WishlistDashboard } from "@/components/wishlists/dashboard";
export const metadata: Metadata = {
  title: "Personal wishlists",
  description:
    "Create a wishlist, add gifts from any shop and share it with anyone. No group required.",
  robots: { index: false, follow: false },
};
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;
  const draft = await catalogueWishDraft(query.gift);
  return <WishlistDashboard draft={draft} giftUnavailable={!!query.gift && !draft} />;
}
