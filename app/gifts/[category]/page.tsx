import type { Metadata } from "next";
import { getGiftsForCategory } from "@/lib/gift-catalogue";
import { GIFT_CATEGORIES } from "@/lib/gift-categories";
import Link from "next/link";
import { Gift, ChevronLeft, ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GiftCard } from "@/components/gift-card";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ category:string }> }): Promise<Metadata> {
  const { category } = await params;
  const cat = GIFT_CATEGORIES.find(cat => cat.slug === category);
  if (!cat) return {};
  return {
    title: { absolute: `${cat.heading} UK | CheckMyBasket` },
    description: `${cat.desc}. Explore gift ideas from UK shops for your Secret Santa exchange.`,
    alternates: { canonical: `/gifts/${category}` },
    robots: getGiftsForCategory(category).length === 0 ? { index: false, follow: true } : { index: true, follow: true },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ category:string }> }) {
  const { category } = await params;
  const cat = GIFT_CATEGORIES.find(cat => cat.slug === category);
  if (!cat) notFound();
  const products = getGiftsForCategory(category);

  return (
    <div className="min-h-dvh bg-[var(--cmb-bg)]">
      <header className="sticky top-0 z-30 border-b border-[var(--cmb-border)]" style={{ background:"rgba(255,248,240,0.92)", backdropFilter:"blur(12px)" }}>
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/gifts"><Button variant="ghost" size="sm" aria-label="Back to gift ideas" className="h-9 w-9 p-0 rounded-lg"><ChevronLeft size={20} strokeWidth={1.5}/></Button></Link>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Gift size={18} strokeWidth={1.5} className="text-[var(--cmb-primary)] shrink-0"/>
            <span className="font-semibold truncate font-display text-[var(--cmb-primary)]">{cat.heading}</span>
          </div>
          <Link href="/create"><Button size="sm" className="h-9 px-3 rounded-lg text-xs font-semibold flex-shrink-0 bg-[var(--cmb-primary)] text-[var(--cmb-text-inverse)]">Create draw</Button></Link>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 font-display">{cat.heading}</h1>
          <p className="text-[var(--cmb-text-secondary)]">{cat.desc}</p>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8">
          {GIFT_CATEGORIES.filter(cat => cat.slug !== category).map(({ slug, label }) => (
            <Link key={slug} href={`/gifts/${slug}`}
              className="flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium border transition-all duration-150 bg-[var(--cmb-surface)] border-[var(--cmb-border)] text-[var(--cmb-text-secondary)]">{label}</Link>
          ))}
        </div>
        {products.length === 0 ? (
          <div className="rounded-2xl border border-[var(--cmb-border)] bg-[var(--cmb-surface)] p-8 text-center mb-10">
            <h2 className="font-display text-xl font-bold mb-2">More gift ideas coming soon</h2>
            <p className="text-sm text-[var(--cmb-text-secondary)] mb-4">We’re finding gifts for this collection. In the meantime, explore our gifts by budget.</p>
            <Link href="/gifts/under-20" className="font-semibold text-[var(--cmb-primary)] underline underline-offset-4">Browse gifts under £20</Link>
          </div>
        ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {products.map(item => <GiftCard key={item.id} size="lg" {...item}/>)}
        </div>
        )}
        <div className="rounded-2xl p-8 text-center mb-8 bg-[var(--cmb-primary)] shadow-[var(--shadow-lg)]">
          <h2 className="text-2xl font-bold mb-2 font-display text-[var(--cmb-text-inverse)]">Found the perfect gift?</h2>
          <p className="mb-6" style={{ color:"rgba(255,248,240,0.75)" }}>Set up Secret Santa for your group in 30 seconds — free, no account needed.</p>
          <Link href="/create"><Button size="lg" className="h-12 px-8 rounded-xl font-semibold bg-[var(--cmb-accent)] text-white">Create a free draw</Button></Link>
        </div>
        <div className="rounded-xl p-4 flex gap-2 bg-[var(--cmb-surface)] border border-[var(--cmb-border)]">
          <ShieldOff size={16} strokeWidth={1.5} className="text-[var(--cmb-text-muted)] shrink-0 mt-0.5"/>
          <p className="text-xs text-[var(--cmb-text-muted)]">Some gift links may earn us a small commission at no extra cost to you. This is how we keep CheckMyBasket free and ad-free.</p>
        </div>
      </main>
    </div>
  );
}
