import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage, Section } from "@/components/info-page";
import { InvitationMessage } from "@/components/whatsapp-invitation";

const title = "Office Secret Santa Guide & Organiser Checklist | CheckMyBasket";
const description = "Plan an office Secret Santa with opt-in invitations, a clear budget, joining deadlines and wishlist etiquette. Includes a checklist and invitation template.";
const invitation = `Hi team! Would you like to join our office Secret Santa? 🎁

Taking part is completely optional.
Gift budget: [amount]
Please join by: [joining deadline]
Gift exchange: [date, time and location or delivery plan]

Join here: [paste your CheckMyBasket group invitation link]

Please add a few wishlist ideas within the budget, plus any preferences you'd like to share. We'll draw names after the joining deadline. You'll privately reveal your match in CheckMyBasket—please keep it a surprise!

If you need to change your plans before the draw, contact [organiser].`;

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/office-secret-santa" },
  openGraph: { title, description, url: "https://www.checkmybasket.co.uk/office-secret-santa" },
  twitter: { card: "summary_large_image", title, description },
};

export default function OfficeGuide() {
  return (
    <InfoPage title="How to organise an office Secret Santa" updated="10 October 2026">
      <p className="text-lg leading-relaxed text-[var(--cmb-text-secondary)]">
        An office Secret Santa works best when taking part is optional, the budget
        is comfortable and everyone knows the deadline. Use this checklist to
        organise your workplace gift exchange, then let CheckMyBasket draw names
        and keep each participant&apos;s match private.
      </p>
      <Link href="/create" className="inline-flex min-h-11 items-center rounded-xl bg-[var(--cmb-primary)] px-5 py-3 font-semibold text-[var(--cmb-text-inverse)]">Create a free office draw</Link>
      <Section heading="Your organiser checklist">
        <ul className="list-disc pl-5 space-y-2">
          <li>Invite colleagues to opt in; avoid automatically enrolling the whole team.</li>
          <li>Agree a spending limit and whether it includes postage.</li>
          <li>Choose a joining deadline, draw date and gift exchange date.</li>
          <li>Plan how remote colleagues will give and receive their gifts.</li>
          <li>Ask for wishlist ideas and check any exclusion pairs before drawing.</li>
          <li>Confirm at least three members have joined and everyone expected is present.</li>
          <li>Draw names, remind people to reveal their matches privately and confirm exchange arrangements.</li>
        </ul>
      </Section>
      <Section heading="1. Make participation optional and set a comfortable budget">
        <p>Ask who wants to join and give people a straightforward way to decline. Choose a modest spending limit with the team rather than assuming everyone can afford the same amount. Make clear that spending more is not expected.</p>
        <p>For remote colleagues, agree whether delivery costs count towards the limit. Browse <Link href="/gifts" className="underline">UK gift ideas by budget</Link> for inspiration once the limit is settled.</p>
      </Section>
      <Section heading="2. Pick deadlines that allow time to buy and deliver">
        <p>Separate the joining deadline from the exchange date. Leave time after the draw for shopping, deliveries, leave and different working days. Decide whether you will swap gifts at a team gathering or arrange delivery.</p>
        <p>If gifts need posting, arrange addresses privately with the people involved. Keep personal addresses out of team-wide chats and shared wishlist notes.</p>
      </Section>
      <Section heading="3. Create the group and invite your colleagues">
        <p><Link href="/create" className="underline">Create a free draw</Link> with your group name, budget, exchange details and your name. Share the group invitation in your agreed team channel. Joining does not require an email address or password.</p>
        <p>CheckMyBasket needs at least three joined members. The invitation can be forwarded, so review the member list before you draw names. For WhatsApp sharing steps, see the <Link href="/secret-santa-whatsapp" className="underline">WhatsApp Secret Santa guide</Link>.</p>
      </Section>
      <Section heading="An office Secret Santa invitation you can copy">
        <InvitationMessage invitation={invitation} />
      </Section>
      <Section heading="4. Encourage useful, considerate wishlists">
        <p>Ask each person for a few ideas within the budget, ideally with links from different shops. They can add preferences to help their giver choose. Wishlists help, but they are not required to draw names.</p>
        <p>Keep gifts suitable for work. Avoid jokes about appearance, relationships or personal circumstances. Do not assume someone wants alcohol, food or scented products; use their preferences or ask an anonymous question after the draw. People should only share details they are comfortable with their group seeing.</p>
      </Section>
      <Section heading="5. Check exclusions and draw names">
        <p>Before drawing, check that everyone expected has joined. The organiser can add exclusion pairs so selected people cannot draw each other—for example, partners taking part in the same office draw. Exclusions work in both directions, and too many can prevent a valid draw.</p>
        <p>When the group is ready, choose <strong>Draw names now</strong> and confirm. The app warns that this cannot be undone, so resolve changes to participation first. Each person then opens their own match reveal; the organiser does not get everyone&apos;s matches.</p>
      </Section>
      <Section heading="6. Keep the surprise and finish the exchange">
        <p>Remind colleagues to check their match without posting it in the team chat. They can look at their recipient&apos;s wishlist and use anonymous questions in CheckMyBasket if they need guidance.</p>
        <p>Before the exchange, send a practical reminder about the date, location or delivery arrangements. Agree how to label wrapped gifts and what to do if someone is away. If a participant&apos;s plans change after the draw, ask them to contact the organiser so the group can arrange a solution.</p>
      </Section>
      <Section heading="Help colleagues keep access to their draw">
        <p>Ask participants to return using the browser they joined with. For another device, they should first verify a recovery email through <strong>Save access to your group</strong> in their original browser, then use <Link href="/return" className="underline">Return &amp; sign in</Link> to request a sign-in link. A notification email alone does not enable recovery.</p>
        <p>Without verified recovery, we cannot restore the original member identity on another device. Share the <Link href="/#faq-heading" className="underline">Secret Santa FAQs</Link> with colleagues who have questions before they join.</p>
      </Section>
      <p><Link href="/create" className="inline-flex min-h-11 items-center rounded-xl bg-[var(--cmb-primary)] px-5 py-3 font-semibold text-[var(--cmb-text-inverse)]">Set up your office Secret Santa</Link></p>
    </InfoPage>
  );
}
