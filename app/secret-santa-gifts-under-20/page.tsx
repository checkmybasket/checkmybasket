import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage, Section } from "@/components/info-page";
import { GiftGuidePicks } from "@/components/gift-guide-picks";
import { GIFT_GUIDES } from "@/lib/gift-guides";

export const dynamic = "force-dynamic";
const guide = GIFT_GUIDES.find(item => item.slug === "secret-santa-gifts-under-20")!;
export const metadata: Metadata = {
  title: { absolute: `${guide.title} | CheckMyBasket` }, description: guide.description,
  alternates: { canonical: `/${guide.slug}` },
  openGraph: { title: guide.title, description: guide.description, url: `https://www.checkmybasket.co.uk/${guide.slug}` },
  twitter: { card: "summary_large_image", title: guide.title, description: guide.description },
};
export default function GiftGuide() {
  return <InfoPage title={guide.title} updated="11 October 2026">
      <p className="text-lg leading-relaxed">A £20 limit gives you room to choose something connected to a hobby rather than a generic novelty. Start with a wishlist or an interest your recipient has shared, and keep the final cost comfortable for the whole group.</p>
      <Section heading="Choose something they can enjoy straight away"><p>A complete puzzle, a book on a favourite subject or a useful notebook can be easier to give than a specialist accessory. Check whether a game needs several players, a craft activity includes its materials or an accessory requires another product.</p><p>For readers, look at the topic and format. For stationery fans, check the paper layout and size. For someone who enjoys home accessories, choose a design that fits their taste rather than assuming everyone wants the same decoration.</p></Section>
      <Section heading="Leave room for delivery and personalisation"><p>Our under £20 collection contains item prices strictly below £20. Delivery, wrapping and optional extras can take the checkout total above that amount. If the limit includes postage, start with the £15 filter and check the actual delivery charge.</p><p>Personalised gifts need particular care: the displayed base price may not include every option. Check the spelling, selected design, lead time and returns terms before paying.</p></Section>
      <Section heading="Make the choice feel personal without overspending"><p>A note explaining the connection to their interest makes a modest gift feel considered. A cookbook for someone who enjoys baking or a puzzle for someone who likes a quiet challenge gives the gift a reason.</p><p>Avoid filling the budget with unrelated extras. One useful item is easier to appreciate than several things chosen only to reach the limit.</p></Section>
      <Section heading="Use the wishlist when preferences matter"><p>For food, fragrance, clothing or alcohol, use preferences the recipient has shared voluntarily. If you are unsure, ask a neutral question about the kind of gift they would enjoy.</p><p>For a workplace exchange, keep participation optional and gifts suitable for the team. Our guide for colleagues has more ideas for choosing without awkward assumptions.</p></Section>
      <GiftGuidePicks category={guide.category} budget={2000}/>
      <Section heading="More help choosing and organising">
        <nav aria-label="Other gift guides" className="flex flex-wrap gap-x-4 gap-y-2">{GIFT_GUIDES.filter(item => item.slug !== guide.slug).map(item => <Link key={item.slug} href={`/${item.slug}`} className="inline-flex min-h-11 items-center underline">{item.title}</Link>)}</nav>
        <p><Link href="/wishlists" className="underline">Create a wishlist</Link> · <Link href="/create" className="underline">Create a free Secret Santa draw</Link> · <Link href="/office-secret-santa" className="underline">Office organiser checklist</Link></p>
      </Section>
    </InfoPage>;
}
