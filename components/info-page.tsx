import { COPYRIGHT_YEAR } from "@/lib/site";
import Link from "next/link";
import { ExploreNavigation } from "@/components/explore-navigation";
import { Gift, ChevronLeft } from "lucide-react";

// Shared shell for the static info pages (About, Privacy, Terms, Contact).
export function InfoPage({ title, updated, children }: { title: string; updated?: string; children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col bg-[var(--cmb-bg)]">
      <a className="cmb-skip-link" href="#main-content">Skip to content</a>
      <header className="sticky top-0 z-30 border-b border-[var(--cmb-border)]" style={{ background: "rgba(255,248,240,0.92)", backdropFilter: "blur(12px)" }}>
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/" className="inline-flex min-h-11 w-11 items-center justify-center rounded-lg hover:bg-[var(--cmb-surface-hover)]" aria-label="Back to home"><ChevronLeft size={20} strokeWidth={1.5} aria-hidden="true"/></Link>
          <div className="flex items-center gap-2 text-[var(--cmb-primary)]">
            <Gift size={20} strokeWidth={1.5}/>
            <span className="font-semibold font-display">CheckMyBasket</span>
          </div>
        </div>
      </header>
      <main id="main-content" tabIndex={-1} className="flex-1 max-w-2xl mx-auto w-full px-4 py-10">
        <div className="mb-6"><ExploreNavigation /></div>
        <h1 className="text-3xl font-bold mb-2 font-display">{title}</h1>
        {updated && <p className="text-sm mb-8 text-[var(--cmb-text-muted)]">Last updated: {updated}</p>}
        <div className="info-prose space-y-6">{children}</div>
      </main>
      <footer className="py-8 px-4 border-t border-[var(--cmb-border)] text-center text-xs text-[var(--cmb-text-muted)]">
        <div className="flex flex-wrap gap-4 justify-center mb-2">
          <Link href="/guides" className="inline-flex min-h-11 items-center hover:underline">Guides</Link>
          <Link href="/about" className="inline-flex min-h-11 items-center hover:underline">About</Link>
          <Link href="/privacy" className="inline-flex min-h-11 items-center hover:underline">Privacy</Link>
          <Link href="/terms" className="inline-flex min-h-11 items-center hover:underline">Terms</Link>
          <Link href="/contact" className="inline-flex min-h-11 items-center hover:underline">Contact</Link>
        </div>
        <p>© {COPYRIGHT_YEAR} CheckMyBasket</p>
      </footer>
    </div>
  );
}

export function Section({ heading, id, children }: { heading: string; id?: string; children: React.ReactNode }) {
  return (
    <section id={id} className={id ? "scroll-mt-20" : undefined}>
      <h2 className="text-lg font-semibold mb-2 font-display">{heading}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-[var(--cmb-text-secondary)]">{children}</div>
    </section>
  );
}
