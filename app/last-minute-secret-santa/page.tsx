import Link from "next/link";
import { InfoPage, Section } from "@/components/info-page";
import { GuideIntro } from "@/components/guide-intro";
import { editorialMetadata } from "@/lib/editorial-guide-metadata";

export const metadata = editorialMetadata("last-minute-secret-santa");

export default function Page() {
  return <InfoPage title="Secret Santa is tomorrow: a practical last-minute plan" updated="24 October 2026">
    <GuideIntro answer="If your Secret Santa exchange is tomorrow, start with your recipient&#39;s wishlist and a realistic collection plan. Choose one suitable gift you can actually obtain, keep delivery or travel-related spending in mind, and tell the organiser early if you cannot make the deadline. A confirmed modest gift is more useful than an ambitious order with an uncertain arrival date." contents={[{"id": "work-backwards-from-the-handover", "label": "Work backwards from the handover"}, {"id": "pick-the-easiest-suitable-option-not-the-biggest-gift", "label": "Pick the easiest suitable option, not the biggest gift"}, {"id": "be-careful-with-the-gift-card-shortcut", "label": "Be careful with the gift-card shortcut"}, {"id": "if-the-gift-will-be-late-give-an-honest-update", "label": "If the gift will be late, give an honest update"}, {"id": "keep-a-small-fallback-checklist", "label": "Keep a small fallback checklist"}]} />
    <Section id="work-backwards-from-the-handover" heading="Work backwards from the handover">
      <p>Write down when and where the exchange happens, when you can shop and how you will get there. An evening opening time is no help if you finish work after the last collection slot. Check the retailer&#39;s exact branch, product variant and collection instructions before travelling.</p>
      <p>An item marked available online may not be on a nearby shelf. Reserve or confirm stock through the retailer&#39;s normal process where possible. Do not treat a search-result delivery estimate as an order confirmation.</p>
    </Section>
    <Section id="pick-the-easiest-suitable-option-not-the-biggest-gift" heading="Pick the easiest suitable option, not the biggest gift">
      <p>Look at what the person actually requested. A named paperback, an ordinary notebook with the right layout or a familiar treat can be easier to source than something made to order. Check relevant product details rather than assuming a substitute will do.</p>
      <p>If their list offers several ideas, you need one gift within the agreed limit, not the whole list. If it gives only a theme, use that as a direction. Someone who mentions drawing may prefer a suitable sketchbook to a random decorative item labelled for artists.</p>
      <p>Our <Link href="/secret-santa-wishlist-ideas" className="underline">wishlist guide</Link> explains which preferences make a substitution useful. The <Link href="/gifts" className="underline">gift catalogue</Link> can help with ideas, but its item prices and links do not establish local availability or next-day arrival.</p>
    </Section>
    <Section id="be-careful-with-the-gift-card-shortcut" heading="Be careful with the gift-card shortcut">
      <p>A gift card can work if the group allows it and the recipient uses that retailer. Check how it is delivered, when it becomes usable, restrictions and expiry terms. A digital format does not automatically mean immediate delivery. Verify it arrives before relying on it as the present.</p>
      <p>Avoid choosing a subscription that creates ongoing payments or requires the recipient to supply payment details without their agreement.</p>
    </Section>
    <Section id="if-the-gift-will-be-late-give-an-honest-update" heading="If the gift will be late, give an honest update">
      <p>Tell the organiser privately before the exchange. Do not invent a tracking update or buy an extra gift you cannot afford simply to hide the delay. A short message is enough:</p>
      <blockquote className="border-l-2 border-[var(--cmb-border)] pl-4"><p>My gift may not arrive before tomorrow. I am checking the retailer&#39;s confirmed estimate. Can we agree how to handle the handover without leaving anyone out?</p></blockquote>
      <p>Agree whether a note or later handover is appropriate. Do not reveal your match in the group chat unless the group has agreed to end the surprise.</p>
    </Section>
    <Section id="keep-a-small-fallback-checklist" heading="Keep a small fallback checklist">
      <ul className="list-disc pl-5 space-y-2"><li>The item suits an expressed preference.</li><li>The selected option fits the total spending limit.</li><li>Stock or collection has been checked directly.</li><li>You have time to collect and wrap it.</li><li>The organiser knows promptly if there is a problem.</li></ul>
      <p>For next time, agree a joining deadline and buying window using the <Link href="/secret-santa-rules" className="underline">Secret Santa rules checklist</Link>. A <Link href="/wishlists" prefetch={false} className="underline">wishlist</Link> with several suitable options gives your Santa more room to make a sensible choice.</p>
    </Section>
  </InfoPage>;
}
