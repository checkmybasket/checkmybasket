"use client";

import Link from "next/link";
import { BasketMark } from "@/components/receipt/logo";

export function PageRecovery({ retry }: { retry: () => void }) {
  return <main className="min-h-dvh flex items-center justify-center bg-[var(--cmb-bg)] px-4 py-12">
    <title>Page unavailable | CheckMyBasket</title>
    <meta name="robots" content="noindex" />
    <div className="w-full max-w-lg border border-[var(--cmb-border)] p-6 sm:p-10">
      <div className="mb-8 flex items-center gap-3 font-semibold"><BasketMark /><span>CheckMyBasket</span></div>
      <h1 className="text-3xl font-bold mb-4">This page could not load</h1>
      <p className="mb-6 text-[var(--cmb-text-secondary)]">Try loading it again. If the problem continues, return to the homepage and reopen the page you need.</p>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={retry} className="min-h-11 px-5 font-semibold bg-[var(--cmb-primary)] text-[var(--cmb-text-inverse)]">Try again</button>
        <Link href="/" className="inline-flex min-h-11 items-center px-5 font-semibold border border-[var(--cmb-border-strong)]">Back to home</Link>
      </div>
    </div>
  </main>;
}
