import type { Metadata } from "next";
import type { ReactNode } from "react";
import { socialMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = {
  title: "Group settings",
  description: "Manage your Secret Santa group details, invitation and membership settings.",
  ...socialMetadata("Group settings", "Manage your Secret Santa group details, invitation and membership settings.", "/return"),
};
export default function Layout({ children }: { children: ReactNode }) { return children; }
