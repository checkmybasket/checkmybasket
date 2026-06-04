import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Secret Santa Gift Ideas UK",
  description: "Curated Secret Santa gift ideas from UK shops, filtered by budget. Under £5, £10, £15, £20, £25. No ads.",
};

export default function GiftsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
