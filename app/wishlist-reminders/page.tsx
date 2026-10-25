import type { Metadata } from "next";
import { WishlistShell } from "@/components/wishlists/shell";
import { UnsubscribeReminders } from "@/components/wishlists/unsubscribe-reminders";
export const metadata: Metadata = {
  title: "Wishlist reminder settings",
  description: "Turn off occasion reminders for your wishlist.",
  robots: { index: false, follow: false },
};
export default function ReminderSettings() {
  return (
    <WishlistShell>
      <h1 className="text-3xl font-semibold">Wishlist reminders</h1>
      <UnsubscribeReminders />
    </WishlistShell>
  );
}
