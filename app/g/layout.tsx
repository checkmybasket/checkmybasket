import { socialMetadata } from "@/lib/page-metadata";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Secret Santa group",
  description: "View your private Secret Santa group, wishlists and anonymous questions. Return with your verified email on a new device.",
  ...socialMetadata("Your Secret Santa group", "View a private Secret Santa group on CheckMyBasket. Use your invitation or verified email to return.", "/return"),
  robots: { index: false, follow: false },
};

export default function GroupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
