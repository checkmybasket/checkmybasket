import { socialMetadata } from "@/lib/page-metadata";
import { GIFT_GUIDES } from "@/lib/gift-guides";
import { ExploreNavigation } from "@/components/explore-navigation";
import { CategoryGuideLinks } from "@/components/category-guide-links";
import { GiftPagination } from "@/components/gift-pagination";
import type { Metadata } from "next";
import { getGiftsForCategory } from "@/lib/gift-catalogue";
import { GIFT_CATEGORIES } from "@/lib/gift-categories";
import Link from "next/link";
import { Gift, ChevronLeft, ShieldOff } from "lucide-react";
import { GiftFiltersForm } from "@/components/gift-filters";
import { giftFiltersHref, readGiftFilters, selectGifts, londonDay } from "@/lib/gift-selection";
import { GiftResults } from "@/components/gift-results";
import { GiftCard } from "@/components/gift-card";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ category:string }> }): Promise<Metadata> {
  const { category } = await params;
  const cat = GIFT_CATEGORIES.find(cat => cat.slug === category);
  if (!cat) return {};
  return {
    ...socialMetadata(`${cat.heading} UK`, `${cat.desc}. Explore gift ideas from UK shops for your Secret Santa exchange.`, `/gifts/${category}`),
    title: { absolute: `${cat.heading} UK | CheckMyBasket` },
    description: `${cat.desc}. Explore gift ideas from UK shops for your Secret Santa exchange.`,
    alternates: { canonical: `/gifts/${category}` },
    robots: (await getGiftsForCategory(category)).length === 0 ? { index: false, follow: true } : { index: true, follow: true },
  };
}

export default async function CategoryPage({ params, searchParams }: { params: Promise<{ category:string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { category } = await params;
  const cat = GIFT_CATEGORIES.find(cat => cat.slug === category);
  if (!cat) notFound();
  const guide = GIFT_GUIDES.find(item => item.category === category);
  const catalogue = await getGiftsForCategory(category);
  const query = await searchParams;
  const filters = readGiftFilters(query);
  const products = selectGifts(catalogue, { ...filters, category });
  const pages = Math.max(1, Math.ceil(products.length / 24));
  const requestedPage = typeof query.page === "string" && /^\d+$/.test(query.page) ? Number(query.page) : 1;
  const page = Math.max(1, Math.min(pages, requestedPage));

  return (
    <div className="min-h-dvh bg-[var(--cmb-bg)]">
      <a className="cmb-skip-link" href="#main-content">Skip to content</a>
      <header className="sticky top-0 z-30 border-b border-[var(--cmb-border)]" style={{ background:"var(--cmb-header-bg)" }}>
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href={giftFiltersHref({ budget: filters.budget, interest: filters.interest })} aria-label="Back to gift ideas" className="inline-flex min-h-11 w-11 shrink-0 items-center justify-center rounded-[var(--cmb-radius)] hover:bg-[var(--cmb-surface-hover)]"><ChevronLeft size={20} strokeWidth={1.5} aria-hidden="true"/></Link>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Gift size={18} strokeWidth={1.5} className="text-[var(--cmb-primary)] shrink-0"/>
            <span className="font-semibold truncate font-display text-[var(--cmb-primary)]">{cat.heading}</span>
          </div>
          <Link href="/create" className="inline-flex min-h-11 items-center justify-center px-3 rounded-[var(--cmb-radius)] text-xs font-semibold flex-shrink-0 bg-[var(--cmb-primary)] text-[var(--cmb-text-inverse)]">Create draw</Link>
        </div>
      </header>
      <main id="main-content" tabIndex={-1} className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-6"><ExploreNavigation /></div>
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 font-display">{cat.heading}</h1>
          <p className="text-[var(--cmb-text-secondary)]">{cat.desc}</p>
        </div>
        {guide ? <Link href={`/${guide.slug}`} className="inline-flex min-h-11 items-center underline text-sm mb-4">Read our {guide.title.toLowerCase()} guide</Link> : null}
        <GiftFiltersForm filters={filters} category={category}/>
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5" aria-label="Other gift collections">
          {GIFT_CATEGORIES.filter(cat => cat.slug !== category).map(({ slug, label }) => (
            <Link key={slug} href={giftFiltersHref(filters, slug)}
              className="inline-flex min-h-11 items-center flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium border transition-all duration-150 bg-[var(--cmb-surface)] border-[var(--cmb-border)] text-[var(--cmb-text-secondary)]">{label}</Link>
          ))}
        </div>
        <p className="sr-only" data-gift-day={londonDay()}>Gift ideas rotate daily within this collection.</p>
        <GiftResults products={products} catalogue={catalogue} filters={filters} category={category} page={page} pageSize={24}/>
        <h2 className="sr-only">Available gift ideas</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {products.slice((page - 1) * 24, page * 24).map(item => <GiftCard key={item.id} size="lg" {...item}/>)}
        </div>
        <GiftPagination page={page} pages={pages} filters={filters} category={category}/>
        <CategoryGuideLinks category={category} />
        <div className="rounded-[var(--cmb-radius)] p-8 text-center mb-8 bg-[var(--cmb-primary)] shadow-[var(--shadow-lg)]">
          <h2 className="text-2xl font-bold mb-2 font-display text-[var(--cmb-text-inverse)]">Found the perfect gift?</h2>
          <p className="mb-6" style={{ color:"color-mix(in srgb, var(--cmb-text-inverse) 75%, transparent)" }}>Set up Secret Santa for your group in 30 seconds — free, no account needed.</p>
          <Link href="/create" className="inline-flex min-h-12 items-center justify-center px-8 rounded-[var(--cmb-radius)] font-semibold bg-[var(--cmb-accent)] text-white">Create a free draw</Link>
        </div>
        <div className="rounded-[var(--cmb-radius)] p-4 flex gap-2 bg-[var(--cmb-surface)] border border-[var(--cmb-border)]">
          <ShieldOff size={16} strokeWidth={1.5} className="text-[var(--cmb-text-muted)] shrink-0 mt-0.5"/>
          <p className="text-xs text-[var(--cmb-text-muted)]">Some gift links may earn us a small commission at no extra cost to you. This is how we keep CheckMyBasket free and ad-free.</p>
        </div>
      </main>
    </div>
  );
}
