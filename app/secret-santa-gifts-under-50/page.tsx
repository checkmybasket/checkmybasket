import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage, Section } from "@/components/info-page";
import { GiftGuidePicks } from "@/components/gift-guide-picks";
import { GIFT_GUIDES } from "@/lib/gift-guides";

export const dynamic = "force-dynamic";
const guide = GIFT_GUIDES.find(item => item.slug === "secret-santa-gifts-under-50")!;
export const metadata: Metadata = {
  title: { absolute: `${guide.title} | CheckMyBasket` }, description: guide.description,
  alternates: { canonical: `/${guide.slug}` },
  openGraph: { title: guide.title, description: guide.description, url: `https://www.checkmybasket.co.uk/${guide.slug}` },
  twitter: { card: "summary_large_image", title: guide.title, description: guide.description },
};
export default function GiftGuide() {
  return <InfoPage title={guide.title} updated="11 October 2026">
      <p className="text-lg leading-relaxed">A £50 Secret Santa budget should be a limit everyone is comfortable with, rather than a target to reach. Use it to choose a gift that fits the person well, and keep lower-cost ideas in the mix.</p>
      <Section heading="Agree the budget before drawing names"><p>A larger limit can create pressure in a group, so agree it together and make taking part optional. State whether postage and wrapping count, especially if some participants are remote.</p><p>Our under £50 collection includes all qualifying lower-priced products too. A thoughtful £10 or £20 gift remains a valid choice; you do not need to make up the difference.</p></Section>
      <Section heading="Use an exact wishlist for specialist purchases"><p>For equipment, accessories or anything size-dependent, an exact product suggestion helps avoid a mismatch. Confirm the chosen model, compatibility, dimensions and any required extras before paying.</p><p>For a person you do not know well, choose a familiar interest or ask an anonymous question after your draw. A bigger budget is not a reason to guess at personal taste.</p></Section>
      <Section heading="Judge the product rather than the presentation"><p>Read the contents and materials of gift sets, check the format of books and games, and look at whether the item can be used straight away. A decorative box does not tell you whether the gift is useful for your recipient.</p><p>Avoid unsupported claims about luxury, durability or performance. The practical details on the retailer’s page are more useful than a promotional label.</p></Section>
      <Section heading="Check delivery, care and returns"><p>The collection’s item prices are strictly below £50; delivery and extras can increase the total. Confirm the final basket, expected dispatch and exchange date. Personalised products may have different returns conditions.</p><p>Consider storage, care instructions and whether a fragile item can be safely transported. Keep the gift easy to receive as well as enjoyable to open.</p></Section>
      <GiftGuidePicks category={guide.category} budget={5000}/>
      <Section heading="More help choosing and organising">
        <nav aria-label="Other gift guides" className="flex flex-wrap gap-x-4 gap-y-2">{GIFT_GUIDES.filter(item => item.slug !== guide.slug).map(item => <Link key={item.slug} href={`/${item.slug}`} className="inline-flex min-h-11 items-center underline">{item.title}</Link>)}</nav>
        <p><Link href="/wishlists" className="underline">Create a wishlist</Link> · <Link href="/create" className="underline">Create a free Secret Santa draw</Link> · <Link href="/office-secret-santa" className="underline">Office organiser checklist</Link></p>
      </Section>
    </InfoPage>;
}
