import { SITE_ORIGIN } from "@/lib/site";
import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage, Section } from "@/components/info-page";
import { GiftGuidePicks } from "@/components/gift-guide-picks";
import { GIFT_GUIDES } from "@/lib/gift-guides";

export const dynamic = "force-dynamic";
const guide = GIFT_GUIDES.find(item => item.slug === "secret-santa-gifts-under-30")!;
export const metadata: Metadata = {
  title: { absolute: `${guide.title} | CheckMyBasket` }, description: guide.description,
  alternates: { canonical: `/${guide.slug}` },
  openGraph: { title: guide.title, description: guide.description, url: `${SITE_ORIGIN}/${guide.slug}` },
  twitter: { card: "summary_large_image", title: guide.title, description: guide.description },
};
export default function GiftGuide() {
  return <InfoPage title={guide.title} updated="11 October 2026">
      <p className="text-lg leading-relaxed">With a £30 Secret Santa limit, focus on a gift that fits an existing interest. Spending more does not make a gift automatically better: usefulness, compatibility and the recipient’s taste still matter most.</p>
      <Section heading="Choose a gift for a hobby they already enjoy"><p>A more substantial book, a puzzle, a game or an everyday accessory can work well when you know the recipient’s interest. Check whether a game suits the number of people they usually play with and whether a book covers a subject they actually want to read about.</p><p>For specialist hobbies, use a wishlist link. Equipment can depend on size, model or skill level, so an exact suggestion is more helpful than guessing.</p></Section>
      <Section heading="Look at what is included in a set"><p>A set may look generous in its photos while including only a few small pieces. Read the contents, measurements and materials, and check whether the recipient will need batteries, tools, refills or other purchases to use it.</p><p>Choose a complete gift where possible. Packaging alone is not a reliable guide to the amount or quality of what is inside.</p></Section>
      <Section heading="Set a total spending limit before shopping"><p>Our under £30 collection uses item prices below £30, not a delivered-price guarantee. Check postage, optional personalisation and any gift-wrapping charge in the basket. If those costs count towards the limit, browse a lower budget first.</p><p>The collection also includes cheaper ideas. There is no need to spend close to £30 if an inexpensive gift suits the recipient better.</p></Section>
      <Section heading="Consider the practical details before ordering"><p>Look at dispatch estimates against the exchange date, especially for personalised products. Check whether a fragile gift will be practical to carry or post and whether the recipient has room to use it.</p><p>Include a thoughtful note and keep the receipt or order details so you can help with any issue. Check the retailer’s return conditions rather than assuming every gift can be exchanged.</p></Section>
      <GiftGuidePicks category={guide.category} budget={3000}/>
      <Section heading="More help choosing and organising">
        <nav aria-label="Other gift guides" className="flex flex-wrap gap-x-4 gap-y-2">{GIFT_GUIDES.filter(item => item.slug !== guide.slug).map(item => <Link key={item.slug} href={`/${item.slug}`} className="inline-flex min-h-11 items-center underline">{item.title}</Link>)}</nav>
        <p><Link prefetch={false} href="/wishlists" className="underline">Create a wishlist</Link> · <Link href="/create" className="underline">Create a free Secret Santa draw</Link> · <Link href="/office-secret-santa" className="underline">Office organiser checklist</Link></p>
      </Section>
    </InfoPage>;
}
