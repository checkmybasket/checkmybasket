import { socialMetadata } from "@/lib/page-metadata";
import type { Metadata } from "next";

export const metadata: Metadata = {
  ...socialMetadata("Create a Secret Santa Draw", "Set up a free Secret Santa draw in 30 seconds. Name your group, set a budget, share the link. No account needed.", "/create"),
  alternates: { canonical: "/create" },
  title: "Create a Secret Santa Draw",
  description: "Set up a free Secret Santa draw in 30 seconds. Name your group, set a budget, share the link. No account needed.",
};

export default function CreateLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
