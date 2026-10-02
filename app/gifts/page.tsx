import Link from "next/link";
import { featuredGifts } from "@/lib/gift-catalogue";
import { GIFT_CATEGORIES } from "@/lib/gift-categories";
import { Gift, ChevronRight, ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GiftCard } from "@/components/gift-card";

export const metadata = { title: "Secret Santa Gift Ideas UK", description: "Curated Secret Santa gift ideas from UK shops. Under £10, £20, £30 and £50, plus colleague, funny, cosy and personalised gifts. No ads." };

export default function GiftsPage() {
  return (
    <div className="min-h-dvh bg-[var(--cmb-bg)]">
      <header className="sticky top-0 z-30 border-b border-[var(--cmb-border)]" style={{ background:"rgba(255,248,240,0.92)", backdropFilter:"blur(12px)" }}>
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[var(--cmb-primary)]">
            <Gift strokeWidth={1.5} size={20}/><span className="font-semibold font-display">CheckMyBasket</span>
          </Link>
          <Link href="/create"><Button size="sm" className="h-9 px-4 rounded-lg text-sm font-semibold bg-[var(--cmb-primary)] text-[var(--cmb-text-inverse)]">Create a draw</Button></Link>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-10 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3 font-display">Gift ideas for every budget</h1>
          <p className="text-[var(--cmb-text-secondary)]">Curated picks from UK shops. No ads — some links earn us a small commission.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
          {GIFT_CATEGORIES.map(cat => (
            <Link key={cat.slug} href={`/gifts/${cat.slug}`} className="rounded-2xl p-4 border transition-all duration-150 hover:scale-105 group bg-[var(--cmb-surface)] border-[var(--cmb-border)] shadow-[var(--shadow-sm)]">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background:"rgba(27,67,50,0.08)" }}>
                <Gift size={20} strokeWidth={1.5} className="text-[var(--cmb-primary)]"/>
              </div>
              <p className="font-semibold text-sm mb-0.5">{cat.label}</p>
              <p className="text-xs leading-relaxed text-[var(--cmb-text-muted)]">{cat.desc}</p>
              <ChevronRight size={14} strokeWidth={2} className="mt-2 transition-transform duration-150 group-hover:translate-x-0.5 text-[var(--cmb-primary)]"/>
            </Link>
          ))}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {featuredGifts.map(item => <GiftCard key={item.id} {...item}/>)}
        </div>
        <div className="rounded-xl p-4 flex gap-2 bg-[var(--cmb-surface)] border border-[var(--cmb-border)]">
          <ShieldOff size={16} strokeWidth={1.5} className="text-[var(--cmb-text-muted)] shrink-0 mt-0.5"/>
          <p className="text-xs text-[var(--cmb-text-muted)]">
            Some gift links may earn us a small commission at no extra cost to you. This is how we keep CheckMyBasket free and ad-free.
          </p>
        </div>
      </main>
    </div>
  );
}
