import type { Metadata } from "next";
import type { ReactNode } from "react";
import { socialMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = {
  title: "Your Secret Santa match",
  description: "Privately view your Secret Santa match, their wishlist and gift preferences.",
  ...socialMetadata("Your Secret Santa match", "Privately view your Secret Santa match, their wishlist and gift preferences.", "/return"),
};
export default function Layout({ children }: { children: ReactNode }) { return children; }
