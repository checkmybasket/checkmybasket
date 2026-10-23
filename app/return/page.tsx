import { socialMetadata } from "@/lib/page-metadata";
import type { Metadata } from "next";
import { ReturnToGroup } from "./return-to-group";

export const metadata: Metadata = {
  ...socialMetadata("Return to CheckMyBasket", "Return to your groups and wishlists using a verified recovery email on this device.", "/return"),
  title: "Return to CheckMyBasket",
  description: "Return to your groups and wishlists using a verified recovery email on this device.",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};
export default function ReturnPage() {
  return <ReturnToGroup />;
}
