import Link from "next/link";
import { InfoPage, Section } from "@/components/info-page";
import { GuideIntro } from "@/components/guide-intro";
import { editorialMetadata } from "@/lib/editorial-guide-metadata";

export const metadata = editorialMetadata("anonymous-secret-santa-wrapping");

export default function Page() {
  return <InfoPage title="Secret Santa wrapping ideas that keep the surprise" updated="24 October 2026">
    <GuideIntro answer="To wrap a Secret Santa gift anonymously, label it for the recipient without adding the giver&#39;s name, check for receipts or sender details and follow the group&#39;s handover plan. Simple paper and a clear label are enough. The aim is a pleasant surprise, not disguising information someone needs for delivery, returns or safe use." contents={[{"id": "make-the-recipient-obvious", "label": "Make the recipient obvious"}, {"id": "pick-one-simple-wrapping-idea", "label": "Pick one simple wrapping idea"}, {"id": "check-the-accidental-clues", "label": "Check the accidental clues"}, {"id": "agree-the-handover-before-the-day", "label": "Agree the handover before the day"}, {"id": "finish-with-a-five-point-check", "label": "Finish with a five-point check"}]} />
    <Section id="make-the-recipient-obvious" heading="Make the recipient obvious">
      <p>Use the name the group recognises and check spelling. If two people share a name, ask the organiser how to distinguish them without exposing private details. A beautifully wrapped parcel is not useful if nobody knows who should open it.</p>
      <p>For an in-person exchange, the label can simply read “For Morgan, from your Secret Santa”. Avoid a public label containing a home address or phone number. For a posted parcel, use the delivery details required by the carrier through the agreed private channel; an anonymous party label does not replace a proper shipping label.</p>
    </Section>
    <Section id="pick-one-simple-wrapping-idea" heading="Pick one simple wrapping idea">
      <ul className="list-disc pl-5 space-y-2"><li><strong>Plain paper and a bold name tag:</strong> use paper you already have and make the recipient&#39;s name the focal point.</li><li><strong>A small paper bag:</strong> useful for awkward shapes. Fold the top neatly and add a recipient label.</li><li><strong>A reusable gift bag:</strong> keep the presentation simple and remove old tags so another name does not create confusion.</li><li><strong>A gift with a reading clue:</strong> for a book, add a short note about the genre without giving away the ending or the sender.</li></ul>
      <p>Check that the wrapping suits the item. Support fragile objects properly rather than relying on extra paper to protect them. Do not cover instructions the recipient needs or remove safety information from the product.</p>
    </Section>
    <Section id="check-the-accidental-clues" heading="Check the accidental clues">
      <p>A retailer dispatch note may show the buyer&#39;s name or price. Check what the seller includes before arranging direct delivery. A gift option might help, but do not assume it removes every sender detail.</p>
      <p>Keep any receipt or order information needed for a return accessible through an agreed private arrangement. Do not destroy it just to preserve the surprise. If using a gift receipt, check what information appears on it.</p>
      <p>Other clues can include an old gift tag, distinctive personal stationery or a handwritten signature. Decide how much mystery your group actually wants. Some groups enjoy guessing the giver; others prefer to keep names private until the reveal.</p>
    </Section>
    <Section id="agree-the-handover-before-the-day" heading="Agree the handover before the day">
      <p>Dropping gifts in a shared area may reveal who brought which parcel. If that matters to your group, ask the organiser to explain a consistent handover process. Avoid leaving valuable or fragile gifts unattended simply for anonymity.</p>
      <p>For remote exchanges, sender details and retailer tracking can reveal clues despite careful wrapping. Discuss expectations rather than promising that the giver&#39;s identity will remain impossible to discover. Our <Link href="/remote-team-secret-santa" className="underline">remote-team guide</Link> covers delivery planning and keeping addresses out of group chats.</p>
    </Section>
    <Section id="finish-with-a-five-point-check" heading="Finish with a five-point check">
      <ol className="list-decimal pl-5 space-y-2"><li>The right recipient&#39;s name is clear.</li><li>Old labels and unintended price details have been checked.</li><li>Essential product information stays with the gift.</li><li>Return or order details can be accessed privately if needed.</li><li>The handover follows the group&#39;s agreed plan.</li></ol>
      <p>If you are still choosing, start with your person&#39;s wishlist or <Link href="/gifts" className="underline">gift ideas by budget</Link>. Organisers can settle the reveal and handover rules using the <Link href="/secret-santa-rules" className="underline">Secret Santa checklist</Link>.</p>
    </Section>
  </InfoPage>;
}
