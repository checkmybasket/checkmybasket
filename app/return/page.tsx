import type { Metadata } from "next";
import { ReturnToGroup } from "./return-to-group";

export const metadata: Metadata = {
  title: "Return to your group",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};
export default function ReturnPage() { return <ReturnToGroup />; }
