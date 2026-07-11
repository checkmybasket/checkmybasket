import Link from "next/link";
import { Gift, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

// Shared shell for the static info pages (About, Privacy, Terms, Contact).
export function InfoPage({ title, updated, children }: { title: string; updated?: string; children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col bg-[var(--cmb-bg)]">
      <header className="sticky top-0 z-30 border-b border-[var(--cmb-border)]" style={{ background: "rgba(255,248,240,0.92)", backdropFilter: "blur(12px)" }}>
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/"><Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-lg" aria-label="Back to home"><ChevronLeft size={20} strokeWidth={1.5}/></Button></Link>
          <div className="flex items-center gap-2 text-[var(--cmb-primary)]">
            <Gift size={20} strokeWidth={1.5}/>
            <span className="font-semibold font-display">CheckMyBasket</span>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-10">
        <h1 className="text-3xl font-bold mb-2 font-display">{title}</h1>
        {updated && <p className="text-sm mb-8 text-[var(--cmb-text-muted)]">Last updated: {updated}</p>}
        <div className="info-prose space-y-6">{children}</div>
      </main>
      <footer className="py-8 px-4 border-t border-[var(--cmb-border)] text-center text-xs text-[var(--cmb-text-muted)]">
        <div className="flex gap-4 justify-center mb-2">
          <Link href="/about" className="hover:underline">About</Link>
          <Link href="/privacy" className="hover:underline">Privacy</Link>
          <Link href="/terms" className="hover:underline">Terms</Link>
          <Link href="/contact" className="hover:underline">Contact</Link>
        </div>
        <p>Made in the UK 🇬🇧 · © 2026 CheckMyBasket</p>
      </footer>
    </div>
  );
}

export function Section({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-semibold mb-2 font-display">{heading}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-[var(--cmb-text-secondary)]">{children}</div>
    </section>
  );
}
