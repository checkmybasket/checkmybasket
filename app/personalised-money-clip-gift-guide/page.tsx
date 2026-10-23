import { SITE_ORIGIN } from "@/lib/site";
import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage, Section } from "@/components/info-page";
import { GiftCard } from "@/components/gift-card";
import { getAvailableGifts } from "@/lib/gift-catalogue";
import { selectGifts } from "@/lib/gift-selection";
import { GIFT_GUIDES } from "@/lib/gift-guides";

export const dynamic = "force-dynamic";
const guide = GIFT_GUIDES.find(item => item.slug === "personalised-money-clip-gift-guide")!;
export const metadata: Metadata = {
  title: { absolute: `${guide.title} | CheckMyBasket` }, description: guide.description,
  alternates: { canonical: `/${guide.slug}` },
  openGraph: { title: guide.title, description: guide.description, url: `${SITE_ORIGIN}/${guide.slug}` },
  twitter: { card: "summary_large_image", title: guide.title, description: guide.description },
};

export default async function MoneyClipGuide() {
  const catalogue = await getAvailableGifts();
  const owned = catalogue.filter(item => item.shop === "UtilityNestPro (Etsy)");
  const featured = owned.find(item => item.url.includes("/4366450629/"));
  const otherDesigns = selectGifts(owned.filter(item => item.id !== featured?.id), {}).slice(0, 4);
  return <InfoPage title={guide.title} updated="11 October 2026">
    <p className="text-lg leading-relaxed">For someone who prefers a slim accessory to a full wallet, an engraved money clip can make an everyday habit feel more personal. A wave pattern adds a design detail; their initials or name make the gift their own.</p>
    <Section heading="Our featured design: Seigaiha waves and sun">
      <p>The engraved Seigaiha money clip combines a repeating Japanese wave pattern with a sun motif. It is a considered choice for someone who likes patterned metal accessories, Japanese-inspired design or a practical keepsake with their initials.</p>
      <p>Etsy displayed a “Bestseller” badge on this listing when we checked on 11 October 2026.</p>
      {featured ? <div className="max-w-md"><GiftCard {...featured} size="lg"/></div> : <p>The featured clip is awaiting a fresh price and availability check. <a className="underline" href="https://utilitynestpro.etsy.com/uk/listing/4366450629/engraved-money-clip-japanese-seigaiha" target="_blank" rel="noopener noreferrer sponsored">View the design and current options on Etsy</a>.</p>}
    </Section>
    <Section heading="Who would enjoy a personalised money clip?">
      <p>Think about how the recipient actually carries money. A clip suits someone who already likes keeping folded notes together and would use a compact accessory. It may be less useful to someone who needs coin storage or several card compartments.</p>
      <p>For a birthday, Father’s Day or a Christmas gift, initials can keep the detail subtle. For a colleague’s Secret Santa, choose a neutral pattern and confirm their preferred name. A personal gift works best when it respects their taste rather than assuming everyone wants the same style.</p>
    </Section>
    <Section heading="Make the engraving meaningful">
      <p>A name or a short set of initials is a simple starting point. Check spelling, capitalisation and punctuation before ordering. Avoid putting private information on an accessory that may be used in public.</p>
      <p>The listing offers optional personalisation and asks buyers to enter their wording. The seller normally chooses a font suited to initials or a full name; add a note if you have a preference. Confirm the available engraving space and any limits directly with the shop before sending a longer message.</p>
    </Section>
    <Section heading="Keep the selected option within budget">
      <p>Our catalogue price is for the “Clip Only” option. The Seigaiha clip was £9.99 and the gift-box option £11.99 when checked on 11 October 2026. These are dated observations: use the current card and Etsy’s selected option price when ordering.</p>
      <p>A gift box can take this choice over a £10 exchange limit. Check the final price with your engraving, presentation option and delivery destination before paying. Confirm the current making and delivery estimates against the date you need it, and read the shop’s personalised-item returns terms.</p>
    </Section>
    <Section heading="Choose a pattern that feels like them">
      <p>The shop also offers koi, tiger, geometric, checkered and textured designs. A geometric finish may suit someone who prefers understated accessories; an animal motif can reflect an interest you already know they enjoy. Religious and national motifs are best chosen when you know they are welcome.</p>
      <p>The available designs below rotate daily. Only products with a fresh price and availability check appear in our catalogue.</p>
      {otherDesigns.length ? <div className="grid sm:grid-cols-2 gap-4">{otherDesigns.map(item => <GiftCard key={item.id} {...item}/>)}</div> : <p>Other designs are awaiting fresh checks. <a className="underline" href="https://utilitynestpro.etsy.com" target="_blank" rel="noopener noreferrer sponsored">Browse UtilityNestPro on Etsy</a>.</p>}
    </Section>
    <Section heading="More personalised gift ideas">
      <p><Link href="/money-clip-engraving-ideas" className="underline">Engraving wording and preview</Link> · <Link href="/personalised-gifts-for-dads" className="underline">Personalised gifts for dads</Link> · <Link href="/personalised-groomsmen-gifts" className="underline">Groomsmen gift planning</Link></p>
      <p><Link className="underline" href="/personalised-secret-santa-gifts">Read our personalised Secret Santa choosing guide</Link> · <Link className="underline" href="/gifts/personalised">Browse personalised gifts</Link> · <Link prefetch={false} className="underline" href="/wishlists">Create a wishlist</Link></p>
    </Section>
  </InfoPage>;
}
