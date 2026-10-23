import { SITE_ORIGIN } from "@/lib/site";
import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage, Section } from "@/components/info-page";
import { GiftGuidePicks } from "@/components/gift-guide-picks";
import { GIFT_GUIDES } from "@/lib/gift-guides";

export const dynamic = "force-dynamic";
const guide = GIFT_GUIDES.find(item => item.slug === "secret-santa-gifts-for-colleagues")!;
export const metadata: Metadata = {
  title: { absolute: `${guide.title} | CheckMyBasket` }, description: guide.description,
  alternates: { canonical: `/${guide.slug}` },
  openGraph: { title: guide.title, description: guide.description, url: `${SITE_ORIGIN}/${guide.slug}` },
  twitter: { card: "summary_large_image", title: guide.title, description: guide.description },
};
export default function GiftGuide() {
  return <InfoPage title={guide.title} updated="11 October 2026">

      <p className="text-lg leading-relaxed">The best starting point for a colleague’s Secret Santa gift is a shared budget and something they have said they enjoy. Aim for a considerate gift they can use outside work too, without making assumptions about their personal life.</p>
      <Section heading="Four useful directions for workplace gifts">
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Stationery:</strong> a notebook or writing accessory for someone who enjoys lists, sketches or planning. Check the format, page ruling and whether it fits their routine.</li>
          <li><strong>Books:</strong> a small book related to cooking, travel or another interest they have mentioned. Choose the topic for the person, rather than giving unsolicited career or self-improvement advice.</li>
          <li><strong>Puzzles and games:</strong> a compact puzzle or game for someone who likes a challenge. Confirm the player count and practical size before choosing it.</li>
          <li><strong>A useful everyday accessory:</strong> something for a known hobby or routine can work well. Check compatibility and dimensions; a phone accessory is only useful if it fits their device.</li>
        </ul>
      </Section>
      <Section heading="Match the budget without creating pressure">
        <p>Agree the limit before drawing names and make participation optional. The current ideas below have item prices up to £20; use the full collection’s budget filter for a £5, £10 or £15 limit. Delivery costs and optional extras are separate, so confirm the total at checkout.</p>
        <p>You do not need to spend the full amount or buy several items. One well-chosen gift avoids making colleagues feel that they should spend more to keep up.</p>
      </Section>
      <Section heading="Keep jokes considerate and preferences private">
        <p>A light-hearted gift should be enjoyable for the recipient, not a joke at their expense. Avoid comments about appearance, age, relationships, salary, religion or personal circumstances. If you would hesitate to explain the gift in front of the team, choose something else.</p>
        <p>Food, alcohol, fragrance and clothing need more knowledge of the recipient’s preferences. Use their wishlist or ask a neutral anonymous question; nobody needs to share health information or explain why they would prefer another gift.</p>
      </Section>
      <Section heading="Plan for remote colleagues and busy schedules">
        <p>Check delivery estimates against the exchange date, and allow for leave and different office days. If you are posting a gift, arrange the address privately rather than putting it in a team chat or public wishlist. Personalised products may need extra time and can have different returns terms.</p>
        <p>For deadlines, opt-in invitations and drawing names, use our <Link href="/office-secret-santa" className="underline">office Secret Santa organiser checklist</Link>. If the team uses WhatsApp, the <Link href="/secret-santa-whatsapp" className="underline">WhatsApp invitation guide</Link> explains how to share your draw.</p>
      </Section>

      <GiftGuidePicks category={guide.category} budget={guide.budget}/>
      <Section heading="More help choosing and organising">
        <p><Link href="/secret-santa-gifts-under-10" className="underline">Secret Santa gifts under £10</Link> · <Link href="/wishlists" className="underline">Create a wishlist</Link> · <Link href="/create" className="underline">Create a free draw</Link></p>
      </Section>
    </InfoPage>;
}
