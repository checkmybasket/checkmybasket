import type { Metadata } from "next";
import { WishlistEditor } from "@/components/wishlists/editor";
export const metadata: Metadata = {
  title: "Your wishlist",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <WishlistEditor key={id} id={id} />;
}
