import type { Metadata } from "next";
import { WishlistDashboard } from "@/components/wishlists/dashboard";
export const metadata: Metadata = {
  title: "Personal wishlists",
  description:
    "Create a wishlist, add gifts from any shop and share it with anyone. No group required.",
  robots: { index: false, follow: false },
};
export default function Page() {
  return <WishlistDashboard />;
}
