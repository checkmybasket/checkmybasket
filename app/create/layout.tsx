import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create a Secret Santa Draw",
  description: "Set up a free Secret Santa draw in 30 seconds. Name your group, set a budget, share the link. No account needed.",
};

export default function CreateLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
