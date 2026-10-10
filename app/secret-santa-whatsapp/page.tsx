import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage, Section } from "@/components/info-page";
import { WhatsAppInvitation } from "@/components/whatsapp-invitation";

const title = "How to Organise Secret Santa on WhatsApp | CheckMyBasket";
const description = "Organise a free Secret Santa draw with WhatsApp invitations. Follow the setup steps, copy an invitation message and keep everyone's match a surprise.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/secret-santa-whatsapp" },
  openGraph: { title, description, url: "https://www.checkmybasket.co.uk/secret-santa-whatsapp" },
  twitter: { card: "summary_large_image", title, description },
};

export default function WhatsAppGuide() {
  return (
    <InfoPage title="How to organise Secret Santa on WhatsApp" updated="10 October 2026">
      <p className="text-lg leading-relaxed text-[var(--cmb-text-secondary)]">
        Use WhatsApp to invite your friends, family or colleagues, and
        CheckMyBasket to draw names and privately reveal each person&apos;s match.
        Your participants can add wishlists from any shop and ask anonymous
        questions after the draw. Creating and joining a draw is free.
      </p>
      <Link href="/create" className="inline-flex min-h-11 items-center rounded-xl bg-[var(--cmb-primary)] px-5 py-3 font-semibold text-[var(--cmb-text-inverse)]">Create a free Secret Santa draw</Link>
      <Section heading="1. Agree a budget, date and joining deadline">
        <p>Planning a workplace exchange? Our <Link href="/office-secret-santa" className="underline">office Secret Santa checklist</Link> covers opt-in participation, wishlist etiquette and remote colleagues.</p>
        <p>Ask who wants to take part before you start. Agree a gift budget and when and where you will exchange gifts. Set a joining deadline so everyone has time to join before you draw names.</p>
        <p>CheckMyBasket needs at least three joined members for a draw. Wait for everyone who wants to participate before starting it.</p>
      </Section>
      <Section heading="2. Create your draw">
        <p>Open <Link href="/create" className="underline">Create a free draw</Link>, enter your group details and your name, then create the group. You can leave the email field blank. A notification email is optional; verified email recovery is set up separately.</p>
      </Section>
      <Section heading="3. Share the group invitation on WhatsApp">
        <p>On the confirmation screen, choose <strong>Share via WhatsApp</strong>, then select your chat and review the message before sending. You can also copy the invite link and paste it into a message with your budget, exchange date and joining deadline.</p>
        <p>Share the invitation only with the people you want in your draw. It is a joining link, not a link that reveals anyone&apos;s match. It can be forwarded, so check the member list before drawing names.</p>
      </Section>
      <Section heading="A WhatsApp invitation message you can reuse">
        <WhatsAppInvitation />
      </Section>
      <Section heading="4. Let everyone join and add gift ideas">
        <p>Each person opens the invitation and joins with their name. They can leave their email blank and add wishlist links or preferences to help their Secret Santa choose. A wishlist is helpful, but it is not required to draw names.</p>
        <p>Ask participants to keep using the browser they joined with. To return on another device, they should verify a recovery email through <strong>Save access to your group</strong> while they still have access.</p>
      </Section>
      <Section heading="5. Check the group and draw names">
        <p>Check that everyone has joined. If needed, add exclusion pairs before the draw so couples or other pairs cannot draw each other. Too many exclusions can make a valid draw impossible; adjust them if the draw reports a problem.</p>
        <p>The organiser then chooses <strong>Draw names now</strong> and confirms. The app warns that drawing names cannot be undone, so make your checks first.</p>
      </Section>
      <Section heading="6. Reveal matches privately and choose gifts">
        <p>Tell your WhatsApp group that names are ready. Each member returns to their group in the browser they joined with and opens their own match reveal. The organiser does not receive a list of everyone&apos;s matches.</p>
        <p>Do not post your match or a screenshot of your reveal in the group chat. Look at your recipient&apos;s wishlist and preferences, or use anonymous questions in CheckMyBasket to ask what they would like. Browse <Link href="/gifts" className="underline">UK gift ideas by budget</Link> if you need inspiration.</p>
      </Section>
      <Section heading="Returning on another device">
        <p>If you have already verified a recovery email, use <Link href="/return" className="underline">Return &amp; sign in</Link> to request a sign-in link. Saving a notification email alone does not enable recovery. Without a verified recovery email, we cannot restore your original member identity on a new device.</p>
        <p>For wishlists outside a Secret Santa group, you can also <Link href="/wishlists" className="underline">create a personal wishlist</Link> and choose whether to share it.</p>
      </Section>
      <p><Link href="/create" className="inline-flex min-h-11 items-center rounded-xl bg-[var(--cmb-primary)] px-5 py-3 font-semibold text-[var(--cmb-text-inverse)]">Set up your free draw</Link></p>
    </InfoPage>
  );
}
