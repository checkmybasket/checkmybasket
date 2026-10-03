import Link from "next/link";
import { Gift } from "lucide-react";
export function WishlistShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-dvh bg-[var(--cmb-bg)] text-[var(--cmb-text-primary)] px-4 py-6 sm:py-10">
      <div className="max-w-3xl mx-auto">
        <header className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-semibold text-[var(--cmb-primary)]"
          >
            <Gift size={20} aria-hidden />
            CheckMyBasket
          </Link>
          <nav className="flex gap-4 text-sm" aria-label="Wishlist navigation">
            <Link className="underline underline-offset-4" href="/wishlists">
              My wishlists
            </Link>
            <Link className="underline underline-offset-4" href="/return">
              Return &amp; sign in
            </Link>
          </nav>
        </header>
        {children}
        <footer className="mt-10 border-t border-[var(--cmb-border)] pt-4 text-xs text-[var(--cmb-text-muted)] flex gap-4">
          <Link className="underline" href="/privacy">
            Privacy
          </Link>
          <Link className="underline" href="/contact">
            Help
          </Link>
          <span>No ads. No group required.</span>
        </footer>
      </div>
    </main>
  );
}
export const panel =
  "rounded-2xl border border-[var(--cmb-border)] bg-[var(--cmb-surface)] p-5 sm:p-6";
export const field =
  "w-full rounded-xl border border-[var(--cmb-border)] bg-[var(--cmb-surface)] p-3 min-h-11 text-base";
export const secondary =
  "inline-flex items-center justify-center rounded-xl border border-[var(--cmb-border)] px-4 py-2 min-h-11 text-sm font-medium hover:bg-[var(--cmb-bg)] disabled:opacity-50";
