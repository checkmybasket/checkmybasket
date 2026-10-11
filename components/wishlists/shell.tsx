import Link from "next/link";
import { Gift } from "lucide-react";
export function WishlistShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-[var(--cmb-bg)] text-[var(--cmb-text-primary)] px-4 py-6 sm:py-10">
      <a className="cmb-skip-link" href="#main-content">Skip to content</a>
      <div className="max-w-3xl mx-auto">
        <header className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-2 font-semibold text-[var(--cmb-primary)]"
          >
            <Gift size={20} aria-hidden />
            CheckMyBasket
          </Link>
          <nav className="flex flex-wrap gap-x-4 text-sm" aria-label="Wishlist navigation">
            <Link className="inline-flex min-h-11 items-center underline underline-offset-4" href="/wishlists">
              My wishlists
            </Link>
            <Link className="inline-flex min-h-11 items-center underline underline-offset-4" href="/return">
              Return &amp; sign in
            </Link>
          </nav>
        </header>
        <main id="main-content" tabIndex={-1}>{children}</main>
        <footer className="mt-10 border-t border-[var(--cmb-border)] pt-4 text-xs text-[var(--cmb-text-muted)] flex flex-wrap items-center gap-x-4">
          <Link className="inline-flex min-h-11 items-center underline" href="/privacy">
            Privacy
          </Link>
          <Link className="inline-flex min-h-11 items-center underline" href="/contact">
            Help
          </Link>
          <span>No ads. No group required.</span>
        </footer>
      </div>
    </div>
  );
}
export const panel =
  "rounded-2xl border border-[var(--cmb-border)] bg-[var(--cmb-surface)] p-5 sm:p-6";
export const field =
  "w-full rounded-xl border border-[var(--cmb-border)] bg-[var(--cmb-surface)] p-3 min-h-11 text-base";
export const secondary =
  "inline-flex items-center justify-center rounded-xl border border-[var(--cmb-border)] px-4 py-2 min-h-11 text-sm font-medium hover:bg-[var(--cmb-bg)] disabled:opacity-50";
