import type { Metadata } from "next";

// The page itself is a client component, so the rebrand brief's title tag
// ("Join Secret Santa — CheckMyBasket") lives in this segment layout.
export const metadata: Metadata = {
  title: "Join Secret Santa",
  description: "You've been invited to a Secret Santa! Tap to join — no account needed, takes 30 seconds.",
  robots: { index: false, follow: false },
};

export default function JoinLayout({ children }: { children: React.ReactNode }) {
  return children;
}
