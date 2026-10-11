import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage, Section } from "@/components/info-page";
import { GiftGuidePicks } from "@/components/gift-guide-picks";
import { GIFT_GUIDES } from "@/lib/gift-guides";

export const dynamic = "force-dynamic";
const guide = GIFT_GUIDES.find(item => item.slug === "secret-santa-gifts-under-10")!;
export const metadata: Metadata = {
  title: { absolute: `${guide.title} | CheckMyBasket` }, description: guide.description,
  alternates: { canonical: `/${guide.slug}` },
  openGraph: { title: guide.title, description: guide.description, url: `https://www.checkmybasket.co.uk/${guide.slug}` },
  twitter: { card: "summary_large_image", title: guide.title, description: guide.description },
};
export default function GiftGuide() {
  return <InfoPage title={guide.title} updated="11 October 2026">

      <p className="text-lg leading-relaxed">A small Secret Santa budget can still buy a thoughtful gift. Start with something your recipient enjoys, choose one useful or entertaining item, and leave room for delivery if your group’s limit includes it.</p>
      <Section heading="Choose by interest, rather than buying a random novelty">
        <p>A good low-budget gift gives someone a small moment they will enjoy. Their wishlist is the best starting point; if it is empty, choose a familiar interest rather than guessing their size, diet or personal taste.</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>For a reader:</strong> a bookmark or a compact book about an interest they have mentioned. Check the format and avoid buying a title they already own.</li>
          <li><strong>For a stationery fan:</strong> an A5 notebook or a useful writing accessory. Look at the page ruling and dimensions rather than choosing on the cover alone.</li>
          <li><strong>For a puzzle lover:</strong> a small puzzle or game. Check the age guidance, player count and whether it suits solo use or a group.</li>
          <li><strong>For someone who likes a cosy evening:</strong> a small home accessory can work if you know their taste. Check materials and care instructions; fragrance and clothing sizes are harder to guess.</li>
        </ul>
      </Section>
      <Section heading="Keep the whole gift within the agreed budget">
        <p>Our under £10 collection uses item prices below £10. Postage, wrapping and optional personalisation can take the total above your limit, so check the final basket before paying. If delivery counts towards a £10 limit, use the £5 budget filter to leave some room, then confirm the actual charge.</p>
        <p>A smaller complete gift is usually easier to give than an accessory that needs extra equipment. Read the product details for batteries, refills or parts that are sold separately.</p>
      </Section>
      <Section heading="Make an inexpensive gift feel considered">
        <p>Add a short note explaining why you chose it: a book for their barbecue hobby, a notebook for their plans, or a puzzle for a quiet weekend. Simple wrapping and a personal note can make the choice feel more thoughtful without increasing the item budget.</p>
        <p>For food, drink or scented gifts, use preferences the recipient has willingly shared. Do not assume that alcohol, allergens or fragrance will be welcome. In a work exchange, keep humour kind and suitable for the whole team.</p>
      </Section>
      <Section heading="When you do not know your recipient well">
        <p>Ask for two or three wishlist ideas at different prices, or use an anonymous question after your draw. A request such as “Would you prefer something to read, something useful or a small game?” gives direction without asking for personal details.</p>
        <p>Organising the exchange? <Link href="/create" className="underline">Create a free Secret Santa draw</Link> and share your spending limit before anyone shops.</p>
      </Section>

      <GiftGuidePicks category={guide.category} budget={guide.budget}/>
      <Section heading="More help choosing and organising">
        <p><Link href="/secret-santa-gifts-for-colleagues" className="underline">Secret Santa gifts for colleagues</Link> · <Link href="/wishlists" className="underline">Create a wishlist</Link> · <Link href="/create" className="underline">Create a free draw</Link></p>
      </Section>
    </InfoPage>;
}
