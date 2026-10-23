import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage } from "@/components/info-page";

export const metadata: Metadata = {
  title: "Page not found",
  description: "This CheckMyBasket page is unavailable. Return home or browse current UK gift ideas.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return <InfoPage title="Page not found">
    <p className="text-[var(--cmb-text-secondary)]">The link may have changed or the address may be incomplete. You can start again from the homepage or browse gift ideas.</p>
    <div className="flex flex-wrap gap-3">
      <Link href="/" className="inline-flex min-h-11 items-center justify-center px-5 font-semibold bg-[var(--cmb-primary)] text-[var(--cmb-text-inverse)]">Back to home</Link>
      <Link href="/gifts" className="inline-flex min-h-11 items-center justify-center px-5 font-semibold border border-[var(--cmb-border-strong)]">Browse gift ideas</Link>
    </div>
  </InfoPage>;
}
