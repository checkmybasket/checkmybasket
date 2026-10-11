import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage, Section } from "@/components/info-page";
import { GiftGuidePicks } from "@/components/gift-guide-picks";
import { GIFT_GUIDES } from "@/lib/gift-guides";

export const dynamic = "force-dynamic";
const guide = GIFT_GUIDES.find(item => item.slug === "cosy-secret-santa-gifts")!;
export const metadata: Metadata = {
  title: { absolute: `${guide.title} | CheckMyBasket` }, description: guide.description,
  alternates: { canonical: `/${guide.slug}` },
  openGraph: { title: guide.title, description: guide.description, url: `https://www.checkmybasket.co.uk/${guide.slug}` },
  twitter: { card: "summary_large_image", title: guide.title, description: guide.description },
};
export default function GiftGuide() {
  return <InfoPage title={guide.title} updated="11 October 2026">
      <p className="text-lg leading-relaxed">A cosy gift is about a comfortable moment that suits your recipient: reading, a quiet puzzle or a small home accessory. Choose for their routine and preferences rather than treating one style as cosy for everyone.</p>
      <Section heading="Think about their favourite quiet moment"><p>A book for someone who likes reading, a puzzle for a relaxed evening or a small accessory for their usual routine can give the gift a clear purpose. Use their wishlist to narrow the choice.</p><p>For home decor, consider the space and colours they like. A small item can be easier to place than a large decoration chosen without knowing their home.</p></Section>
      <Section heading="Check textures, fit and care"><p>For socks, textiles and similar gifts, check the listed size, fibre content and washing instructions. Softness is subjective, so avoid assuming a material will suit every recipient.</p><p>Look at dimensions in centimetres rather than judging scale from the photograph. Choose an item that fits the way they will use and store it.</p></Section>
      <Section heading="Do not assume fragrance or food preferences"><p>Scented products, drinks and food gifts need more knowledge of the person. Use preferences they have willingly shared or ask a simple question about what they would enjoy.</p><p>Keep the choice practical and follow retailer use guidance. A cosy gift does not need promises about sleep, wellbeing or health to feel thoughtful.</p></Section>
      <Section heading="Choose a comfortable budget"><p>Filter the cosy collection by your agreed spending limit and an interest such as reading, puzzles or home. The prices shown are item prices; delivery and extras are separate.</p><p>A note suggesting a quiet moment to enjoy the gift can add meaning. Keep it an invitation rather than giving advice about how the person should relax.</p></Section>
      <GiftGuidePicks category={guide.category}/>
      <Section heading="More help choosing and organising">
        <nav aria-label="Other gift guides" className="flex flex-wrap gap-x-4 gap-y-2">{GIFT_GUIDES.filter(item => item.slug !== guide.slug).map(item => <Link key={item.slug} href={`/${item.slug}`} className="inline-flex min-h-11 items-center underline">{item.title}</Link>)}</nav>
        <p><Link href="/wishlists" className="underline">Create a wishlist</Link> · <Link href="/create" className="underline">Create a free Secret Santa draw</Link> · <Link href="/office-secret-santa" className="underline">Office organiser checklist</Link></p>
      </Section>
    </InfoPage>;
}
