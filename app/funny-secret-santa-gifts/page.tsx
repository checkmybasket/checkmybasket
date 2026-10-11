import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage, Section } from "@/components/info-page";
import { GiftGuidePicks } from "@/components/gift-guide-picks";
import { GIFT_GUIDES } from "@/lib/gift-guides";

export const dynamic = "force-dynamic";
const guide = GIFT_GUIDES.find(item => item.slug === "funny-secret-santa-gifts")!;
export const metadata: Metadata = {
  title: { absolute: `${guide.title} | CheckMyBasket` }, description: guide.description,
  alternates: { canonical: `/${guide.slug}` },
  openGraph: { title: guide.title, description: guide.description, url: `https://www.checkmybasket.co.uk/${guide.slug}` },
  twitter: { card: "summary_large_image", title: guide.title, description: guide.description },
};
export default function GiftGuide() {
  return <InfoPage title={guide.title} updated="11 October 2026">
      <p className="text-lg leading-relaxed">A funny Secret Santa gift should make the recipient smile without putting them on the spot. Choose humour you know they enjoy, and favour a gift that has a use after the joke has landed.</p>
      <Section heading="Choose humour based on a shared interest"><p>A playful design connected to a favourite animal, hobby or everyday habit can feel more personal than a random gag. Wordplay and silly illustrations are easier to judge when you already know the recipient’s taste.</p><p>If you are unsure, choose a light-hearted game, puzzle or practical accessory rather than a joke that depends on a private detail.</p></Section>
      <Section heading="Avoid making the person the punchline"><p>Do not choose jokes about appearance, age, relationships, money, religion or personal circumstances. A gift opened in front of colleagues should be comfortable for the recipient and the wider team.</p><p>Avoid gifts designed to embarrass, insult or force a reaction. If you would need to explain that it was &ldquo;only a joke&rdquo;, a different choice is usually easier to give.</p></Section>
      <Section heading="Check that the novelty is a usable gift"><p>Look at size, materials and what is included. Novelty products can look larger in photographs than they are, or require another item to be useful. Check age guidance and small-part information for games.</p><p>For wearable jokes, do not guess the fit. For edible jokes, use the recipient’s stated food preferences and check the retailer’s ingredient details.</p></Section>
      <Section heading="Keep the agreed spending limit"><p>Choose your budget in the funny collection before browsing. Item prices do not include delivery or optional extras, so check the full basket against your group’s limit.</p><p>A short, kind note can explain the shared joke. Keep the exchange enjoyable without expecting the recipient to wear, display or use the gift in front of everyone.</p></Section>
      <GiftGuidePicks category={guide.category}/>
      <Section heading="More help choosing and organising">
        <nav aria-label="Other gift guides" className="flex flex-wrap gap-x-4 gap-y-2">{GIFT_GUIDES.filter(item => item.slug !== guide.slug).map(item => <Link key={item.slug} href={`/${item.slug}`} className="inline-flex min-h-11 items-center underline">{item.title}</Link>)}</nav>
        <p><Link href="/wishlists" className="underline">Create a wishlist</Link> · <Link href="/create" className="underline">Create a free Secret Santa draw</Link> · <Link href="/office-secret-santa" className="underline">Office organiser checklist</Link></p>
      </Section>
    </InfoPage>;
}
