import Link from "next/link";
import { InfoPage, Section } from "@/components/info-page";
import { GuideIntro } from "@/components/guide-intro";
import { editorialMetadata } from "@/lib/editorial-guide-metadata";

export const metadata = editorialMetadata("no-clutter-secret-santa-gifts");

export default function Page() {
  return <InfoPage title="Secret Santa gifts for someone who does not want more stuff" updated="24 October 2026">
    <GuideIntro answer="For someone who wants less clutter, start with a consumable they already enjoy, a useful replacement they have requested or an activity they would genuinely choose. Check the preference first. A gift creates clutter when it takes up space or creates work the recipient did not want, even if the packaging calls it minimalist." contents={[{"id": "ask-what-no-more-stuff-means-to-them", "label": "Ask what “no more stuff” means to them"}, {"id": "choose-something-they-already-use-up", "label": "Choose something they already use up"}, {"id": "make-an-experience-easy-to-use", "label": "Make an experience easy to use"}, {"id": "a-useful-replacement-should-be-requested", "label": "A useful replacement should be requested"}, {"id": "a-no-clutter-wishlist-note", "label": "A no-clutter wishlist note"}]} />
    <Section id="ask-what-no-more-stuff-means-to-them" heading="Ask what “no more stuff” means to them">
      <p>One person may welcome a paperback but dislike decorative objects. Another may have enough books and prefer a café treat. Ask a simple question: “Would you rather have something to use up, something practical or an activity?”</p>
      <p>Do not turn the answer into a challenge to find the one ornament they will love. If their wishlist says no mugs, respect it. A clearly expressed preference is more useful than a generic list of gifts for minimalists.</p>
    </Section>
    <Section id="choose-something-they-already-use-up" heading="Choose something they already use up">
      <p>Their usual coffee, a preferred stationery refill or a familiar treat can be a starting point. Check the exact format and whether a refill fits what they own. Someone who only uses capsules cannot necessarily use a bag of whole beans.</p>
      <p>Food, fragrance and skincare are personal choices. Check relevant preferences and actual product information rather than assuming that being consumable makes an item universally suitable. If you cannot check, choose another category.</p>
      <p>Avoid a large hamper just to fill the budget. A smaller requested item may be easier to store and enjoy. Our <Link href="/secret-santa-gifts-for-coffee-lovers" className="underline">coffee guide</Link> and <Link href="/secret-santa-wishlist-ideas" className="underline">wishlist examples</Link> show how to make a preference specific.</p>
    </Section>
    <Section id="make-an-experience-easy-to-use" heading="Make an experience easy to use">
      <p>A contribution towards an activity can work if the group permits it and the person wants it. Check the location, booking process, expiry and whether they would need to pay extra to take part. A voucher requiring expensive travel or another ticket may be a burden rather than a treat.</p>
      <p>A homemade promise should be something you can realistically deliver and the recipient would welcome. Offer a choice rather than scheduling an activity for them without asking. Do not present an unpaid favour as an obligation they must redeem.</p>
    </Section>
    <Section id="a-useful-replacement-should-be-requested" heading="A useful replacement should be requested">
      <p>If someone has mentioned needing a new notebook or worn-out accessory, ask about the details. Do not buy a replacement simply because you think something they own looks old. Their preferred item may still work perfectly well.</p>
      <p>Keep quality claims modest. “Reusable”, “natural” or “eco” on packaging does not establish that a gift is necessary, durable or lower-impact in its particular use.</p>
    </Section>
    <Section id="a-no-clutter-wishlist-note" heading="A no-clutter wishlist note">
      <blockquote className="border-l-2 border-[var(--cmb-border)] pl-4"><p>I am trying to keep fewer things at home. I would enjoy one small consumable or one of the practical ideas on my list. Please avoid decorative items and large gift sets. A lower-priced choice is absolutely welcome.</p></blockquote>
      <p>Treat this as sample wording, not a rule to impose on everybody. Check that the exchange allows vouchers, homemade gifts or other alternatives before buying.</p>
      <p>Set the spending limit with the <Link href="/secret-santa-rules" className="underline">Secret Santa rules checklist</Link>, then <Link href="/wishlists" prefetch={false} className="underline">create a wishlist</Link> containing a few specific options. If shopping, use the <Link href="/gifts" className="underline">catalogue</Link> for ideas while checking the actual selected option and delivered total.</p>
    </Section>
  </InfoPage>;
}
