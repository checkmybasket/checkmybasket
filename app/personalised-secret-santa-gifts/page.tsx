import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage, Section } from "@/components/info-page";
import { GiftGuidePicks } from "@/components/gift-guide-picks";
import { GIFT_GUIDES } from "@/lib/gift-guides";

export const dynamic = "force-dynamic";
const guide = GIFT_GUIDES.find(item => item.slug === "personalised-secret-santa-gifts")!;
export const metadata: Metadata = {
  title: { absolute: `${guide.title} | CheckMyBasket` }, description: guide.description,
  alternates: { canonical: `/${guide.slug}` },
  openGraph: { title: guide.title, description: guide.description, url: `https://www.checkmybasket.co.uk/${guide.slug}` },
  twitter: { card: "summary_large_image", title: guide.title, description: guide.description },
};
export default function GiftGuide() {
  return <InfoPage title={guide.title} updated="11 October 2026">
      <p className="text-lg leading-relaxed">A personalised Secret Santa gift can mark a shared memory or make an everyday item feel more individual. It works best when the name, message or design is something the recipient would be happy to use.</p>
      <Section heading="Choose a personal detail they will welcome"><p>A name, initials or a short message can work on a small keepsake or practical accessory. Keep the wording suitable for the recipient and the setting where the gift will be opened.</p><p>Avoid sensitive information or an inside joke that could embarrass them. For a colleague, a simple name or neutral design is easier to judge than a reference to their private life.</p></Section>
      <Section heading="Check the spelling and preview twice"><p>Confirm the recipient’s preferred name, punctuation and capitalisation. Read character limits and look at how the design places the text; long names may appear differently.</p><p>Use the retailer’s preview where available and review the selected options before checkout. Do not assume the example photograph includes your exact colour, size or wording.</p></Section>
      <Section heading="Confirm the final price and production time"><p>The catalogue price may cover the base product, while additional wording, accessories or delivery cost more. Only freshly verified fixed-price products are shown, but your selected extras can still change the total.</p><p>Personalisation can add production time before dispatch. Check both the making time and delivery estimate against your exchange date, and allow for any approval step the retailer requires.</p></Section>
      <Section heading="Read the returns terms before ordering"><p>Personalised products can have different cancellation and change-of-mind terms. Read the retailer’s conditions before submitting your wording, and keep your order confirmation and design details.</p><p>Check size, materials and care instructions as carefully as you would for an unpersonalised gift. The personal detail should add to a suitable product, not replace checking whether it is useful.</p></Section>
      <GiftGuidePicks category={guide.category}/>
      <Section heading="More help choosing and organising">
        <nav aria-label="Other gift guides" className="flex flex-wrap gap-x-4 gap-y-2">{GIFT_GUIDES.filter(item => item.slug !== guide.slug).map(item => <Link key={item.slug} href={`/${item.slug}`} className="inline-flex min-h-11 items-center underline">{item.title}</Link>)}</nav>
        <p><Link href="/wishlists" className="underline">Create a wishlist</Link> · <Link href="/create" className="underline">Create a free Secret Santa draw</Link> · <Link href="/office-secret-santa" className="underline">Office organiser checklist</Link></p>
      </Section>
    </InfoPage>;
}
