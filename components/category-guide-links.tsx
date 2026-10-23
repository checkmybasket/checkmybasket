import Link from "next/link";
import { GIFT_GUIDES } from "@/lib/gift-guides";

export function CategoryGuideLinks({ category }: { category: string }) {
  const guides = GIFT_GUIDES.filter(guide => guide.category === category).slice(0, 3);
  return (
    <section className="my-8 rounded-2xl border border-[var(--cmb-border)] bg-[var(--cmb-surface)] p-5" aria-labelledby="collection-guides-heading">
      <h2 id="collection-guides-heading" className="text-xl font-semibold font-display mb-2">Help choosing your gift</h2>
      <nav aria-label="Guides for this gift collection" className="flex flex-col items-start">
        {guides.map(guide => <Link key={guide.slug} href={`/${guide.slug}`} className="inline-flex min-h-11 items-center underline underline-offset-4">{guide.title}</Link>)}
        <Link href="/guides" className="inline-flex min-h-11 items-center underline underline-offset-4">Browse all gift and Secret Santa guides</Link>
        <Link prefetch={false} href="/wishlists" className="inline-flex min-h-11 items-center underline underline-offset-4">Create a wishlist to collect your ideas</Link>
      </nav>
    </section>
  );
}
