import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Secret Santa Gift Ideas UK",
  description: "Curated Secret Santa gift ideas from UK shops, filtered by budget. Under £10, £20, £30 and £50, plus colleague, funny, cosy and personalised gifts. No ads.",
};

export default function GiftsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
