import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage, Section } from "@/components/info-page";
import { OrganiserGuideLinks } from "@/components/organiser-guide-links";
import { ORGANISER_GUIDES } from "@/lib/organiser-guides";

const guide = ORGANISER_GUIDES.find(item => item.slug === "secret-santa-rules")!;
export const metadata: Metadata = {
  title: { absolute: "Secret Santa Rules & Organiser Checklist | CheckMyBasket" }, description: guide.description,
  alternates: { canonical: `/${guide.slug}` },
  openGraph: { title: guide.title, description: guide.description, url: `https://www.checkmybasket.co.uk/${guide.slug}` },
  twitter: { card: "summary_large_image", title: guide.title, description: guide.description },
};

export default function RulesGuide() {
  return <InfoPage title="Secret Santa rules: how to organise a fair gift exchange" updated="11 October 2026">
    <p className="text-lg leading-relaxed">In Secret Santa, each participant is assigned someone to buy a gift for. Everyone gives one gift and receives one gift, while the matches stay a surprise until your agreed reveal. The organiser’s main job is to make the budget, deadlines and expectations clear before drawing names.</p>
    <Link href="/create" className="inline-flex min-h-11 items-center rounded-xl bg-[var(--cmb-primary)] px-5 py-3 font-semibold text-[var(--cmb-text-inverse)]">Create a free Secret Santa draw</Link>
    <Section heading="1. Invite people to opt in">
      <p>Ask who wants to participate rather than adding everyone automatically. This is especially useful at work, where people may have different budgets or plans. Give people a joining deadline and a named organiser to contact with questions.</p>
      <p>CheckMyBasket needs at least three joined members before you can draw names. Wait until everyone who wants to take part has joined, then check the member list for missing or duplicate entries.</p>
    </Section>
    <Section heading="2. Agree the spending limit and what it includes">
      <p>Choose an amount everyone is comfortable spending. State whether the limit includes wrapping and delivery, and whether homemade gifts are welcome. The point is a thoughtful exchange, not a competition to spend the most.</p>
      <p>For example: “Our total budget is £15, including delivery. Please keep wishlist ideas below that amount so there is room for postage.” If you agree an item-only budget instead, say that explicitly. Our <Link href="/gifts" className="underline">gift catalogue</Link> filters item prices; selected options and delivery can add to the total.</p>
    </Section>
    <Section heading="3. Set the joining, draw and exchange dates">
      <p>A joining deadline tells people when to sign up. A draw date tells them when they can find out who they are buying for. The exchange date is when gifts need to be ready or delivered. Share all three so a late invitation does not leave someone with too little shopping time.</p>
      <p>For a remote exchange, agree whether everyone posts their gift before a video call or opens it independently. Ask buyers to check retailer dispatch estimates; personalised products may need extra making time.</p>
    </Section>
    <Section heading="4. Check restrictions before drawing names">
      <p>If the group wants to avoid particular matches, such as partners buying for each other, agree that before the draw. Add the relevant exclusion pairs in your group settings and review them carefully. Too many restrictions can leave no valid draw, especially in a small group.</p>
      <p>Once names have been drawn, ask people to contact the organiser privately if someone needs to withdraw. Do not publish matches or casually redraw: someone may already have ordered a gift. Discuss a fair solution with the affected people first.</p>
    </Section>
    <Section heading="5. Keep wishlists useful and matches private">
      <p>Ask for a few ideas at different prices within the limit, together with helpful preferences such as a favourite hobby or the exact notebook size. A wishlist gives the buyer direction; it should not require them to buy the most expensive item.</p>
      <p>CheckMyBasket participants privately reveal their own match. Keep that information out of the group chat, and avoid screenshots that reveal it. Our <Link href="/secret-santa-wishlist-ideas" className="underline">wishlist guide</Link> includes examples of useful details to add.</p>
    </Section>
    <Section heading="6. Agree how the reveal will work">
      <p>Decide whether gifts will have only the recipient’s name on them, and whether the giver reveals themselves after opening. Keep jokes kind and appropriate for the setting. If someone cannot attend, arrange a handover or delivery rather than leaving them out.</p>
      <p>Send one clear reminder with the date, time and location. There is no need to discuss what everyone has bought. You can use our <Link href="/secret-santa-invitation-messages" className="underline">invitation and reminder templates</Link> to keep the message short.</p>
    </Section>
    <Section heading="Your printable organiser checklist">
      <ul className="list-disc pl-5 space-y-2">
        <li>Participation is optional and everyone has the invitation.</li>
        <li>Budget, delivery costs and homemade-gift rules are agreed.</li>
        <li>Joining deadline, draw date and exchange arrangements are clear.</li>
        <li>The member list and any exclusion pairs have been checked.</li>
        <li>Participants have time to add wishlists and buy their gifts.</li>
        <li>Matches stay private, and everyone knows how the reveal works.</li>
      </ul>
      <p><a href="/secret-santa-organiser-checklist.txt" download className="inline-flex min-h-11 items-center underline">Download the organiser checklist (.txt)</a> to fill in and print, or print this page using your browser’s Print command.</p>
    </Section>
    <Section heading="Can Secret Santa work with an odd number of people?">
      <p>Yes. People do not need to form pairs. With three participants, Alex can buy for Blake, Blake for Casey and Casey for Alex. Everyone still gives and receives one gift. CheckMyBasket requires at least three joined members; any exclusion rules must still allow a valid draw.</p>
    </Section>
    <Section heading="More help planning your exchange">
      <OrganiserGuideLinks current={guide.slug}/>
      <p><Link href="/office-secret-santa" className="underline">Office organiser checklist</Link> · <Link href="/secret-santa-whatsapp" className="underline">WhatsApp setup guide</Link></p>
    </Section>
  </InfoPage>;
}
