import { SITE_ORIGIN } from "@/lib/site";
import type { Metadata } from "next";
import { SharedWishlist } from "@/components/wishlists/shared";
export const metadata: Metadata = {
  title: "A wishlist for you",
  description:
    "View a shared wishlist on CheckMyBasket. Gifts from any shop, all in one place.",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
  openGraph: {
    title: "A wishlist for you",
    description: "Gifts from any shop, all in one place.",
    url: `${SITE_ORIGIN}/wishlists`,
  },
};
export default async function Page({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <SharedWishlist key={token} token={token} />;
}
