import { GuideIntro, GuideScreenshot } from "@/components/guide-intro";
import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage, Section } from "@/components/info-page";
import { InvitationMessage } from "@/components/whatsapp-invitation";
import { OrganiserGuideLinks } from "@/components/organiser-guide-links";
import { ORGANISER_GUIDES } from "@/lib/organiser-guides";

const guide = ORGANISER_GUIDES.find(item => item.slug === "secret-santa-invitation-messages")!;
export const metadata: Metadata = {
  title: { absolute: "Secret Santa Invitation Messages for WhatsApp & Email | CheckMyBasket" }, description: guide.description,
  alternates: { canonical: `/${guide.slug}` },
  openGraph: { title: guide.title, description: guide.description, url: `https://www.checkmybasket.co.uk/${guide.slug}` },
  twitter: { card: "summary_large_image", title: guide.title, description: guide.description },
};
const extraTemplates = [
  { heading: "A wishlist request for your group", label: "Copy wishlist request", text: `Help your Secret Santa choose something you’ll enjoy! Please add three to five ideas to your group wishlist by [date].

Our budget is [amount, including/excluding delivery]. Include a lower-priced option and useful details such as colour, size, book edition or hobbies. Alternatives are welcome - nobody needs to spend the full limit.

Please leave private addresses and sensitive details out of the wishlist. Thank you!` },
  { heading: "A thank-you message after the exchange", label: "Copy group thank-you", text: `Thank you to everyone who took part in our Secret Santa! 🎁 It was lovely to see the thought put into the gifts.

If you haven’t received your gift or need help with a handover, contact [organiser] privately so we can follow up.

Thanks for keeping the surprises and making the exchange a friendly one. Wishing you all a lovely festive season!` },
  { heading: "A personal thank-you to your Santa", label: "Copy personal thank-you", text: `Thank you for my [gift]! I especially love [one detail about it], and I’m looking forward to [how you’ll use or enjoy it]. That was a thoughtful choice - thank you for being my Secret Santa!` },
];
const templates = [
  { heading: "A short WhatsApp invitation for friends", label: "Copy friends invitation", text: `Hi everyone! Fancy joining our Secret Santa this year? 🎁

Budget: [amount, and whether delivery is included]
Please join by: [date]
We’ll draw names on: [date]
Gift exchange: [date, time and place]

Join here: [group invitation link]

Add your name and a few wishlist ideas within the budget. We’ll wait until the joining deadline before drawing names. Keep your match a surprise! Taking part is optional.` },
  { heading: "A family Secret Santa invitation", label: "Copy family invitation", text: `Hi family! Let’s do a Secret Santa so everyone taking part gives one gift and receives one gift.

Our budget is [amount, including/excluding delivery]. Please join by [date], and we’ll draw names on [date]. We’ll exchange gifts at [place] on [date and time].

Join the draw: [group invitation link]

Please add a few wishlist ideas or hobbies to help your Santa. Let [organiser] know before the draw if your plans change. No pressure to join!` },
  { heading: "An office Secret Santa invitation", label: "Copy office invitation", text: `Hi team! We’re organising an optional office Secret Santa.

Gift budget: [amount, and delivery rule]
Joining deadline: [date]
Draw date: [date]
Exchange: [date, time, location or remote plan]

If you’d like to take part, join here: [group invitation link]

Please add a few wishlist ideas within the limit. Keep gifts and messages considerate and suitable for work. Questions or changes before the draw? Contact [organiser].` },
  { heading: "An email invitation with a subject line", label: "Copy email invitation", text: `Subject: Join our Secret Santa — sign up by [date]

Hi everyone,

You’re invited to our Secret Santa gift exchange. Taking part is entirely optional.

Budget: [amount, including/excluding delivery]
Join by: [date]
Names drawn: [date]
Gift exchange: [date, time and location or delivery arrangements]

Join using this link: [group invitation link]

Please add your name and a few wishlist ideas. After the draw, open your group in CheckMyBasket to privately reveal who you’re buying for.

Contact [organiser] with any questions before the draw.

Thanks,
[organiser]` },
  { heading: "A gentle reminder before the joining deadline", label: "Copy joining reminder", text: `Quick Secret Santa reminder 🎁 If you’d like to take part, please join by [date and time]: [group invitation link]

Budget: [amount, and delivery rule]
Gift exchange: [date]

Already joined? Please add a few wishlist ideas. We’ll draw names on [date] once the member list is checked. Taking part is still optional.` },
  { heading: "A message after names have been drawn", label: "Copy draw announcement", text: `Our Secret Santa names have been drawn! 🎁

Open your group in CheckMyBasket and privately reveal who you’re buying for. Please keep your match out of the group chat.

Budget: [amount, and delivery rule]
Gift exchange: [date, time and location or delivery plan]

Check your recipient’s wishlist before shopping. If you can no longer take part, contact [organiser] privately as soon as possible.` },
  { heading: "A reminder before the gift exchange", label: "Copy exchange reminder", text: `Our Secret Santa exchange is on [date] at [time], at [location or video-call details].

Please have your gift ready using our agreed budget of [amount, and delivery rule]. Label it with your recipient’s name and [our agreed rule about revealing the giver].

If delivery or attendance is a problem, contact [organiser] privately so we can arrange a handover. Looking forward to it! 🎁` },
];
const allTemplates = [...templates, ...extraTemplates];

export default function InvitationGuide() {
  return <InfoPage title="Secret Santa invitation messages for WhatsApp and email" updated="11 October 2026">
    <GuideIntro answer="Include the budget, joining deadline, draw date, exchange arrangements and group invitation link. Say participation is optional. Copy a template below, replace the bracketed fields, then review and send it through your usual chat or email app." contents={[
      { id: "before-sending-your-invitation", label: "Before you send" },
      { id: "create-a-group-to-get-your-invitation-link", label: "Get your invitation link" },
      ...allTemplates.map(template => ({ id: template.heading.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""), label: template.heading })),
      { id: "invitation-questions", label: "Common questions" },
    ]} />
    <p className="text-lg leading-relaxed">A good Secret Santa invitation answers four questions: who can join, what to spend, when to join and when gifts will be exchanged. Use these messages as a starting point, replace every bracketed field and share the invitation with your chosen group.</p>
    <Section id="before-sending-your-invitation" heading="Before sending your invitation">
      <p><Link href="/create" className="underline">Create your free draw</Link> and copy the group invitation link from the confirmation screen. Use that joining link in an invitation, rather than a private match or recovery link. CheckMyBasket needs at least three joined participants before drawing names.</p>
      <p>Agree the budget and whether delivery counts toward it. Leave enough time between the draw and the exchange for shopping and any personalisation. The <Link href="/secret-santa-rules" className="underline">Secret Santa rules guide</Link> includes an organiser checklist.</p>
      <p>The buttons below only copy text. Review the dates and link, then send the message yourself through WhatsApp, email or your usual chat app.</p>
    </Section>
    <Section id="create-a-group-to-get-your-invitation-link" heading="Create a group to get your invitation link">
      <GuideScreenshot src="/guides/create-draw.png" width={1280} height={1151} alt="CheckMyBasket draw setup form showing a group name and budget" caption="Start with the create-draw form. This is the actual screen with example details; after submitting your own details, the confirmation screen provides the joining link for your message." />
    </Section>
    {allTemplates.map(template => <Section key={template.heading} id={template.heading.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")} heading={template.heading}><InvitationMessage invitation={template.text} copyLabel={template.label}/></Section>)}
    <Section id="make-the-message-fit-your-group" heading="Make the message fit your group">
      <p>For colleagues, emphasise that joining is optional and avoid putting pressure on anyone to spend more. For family or friends, say whether homemade gifts are welcome. For remote participants, include the delivery plan rather than assuming everyone can attend in person.</p>
      <p>The invitation can be forwarded, so share it with the people you want involved and check the member list before drawing. Keep delivery addresses and private matches out of a large group chat. A recipient can use a wishlist to share gift preferences without posting their personal details.</p>
      <p>A single helpful reminder is usually clearer than repeated messages. If someone joins late or withdraws after the draw, speak to the organiser privately before changing the arrangements.</p>
    </Section>
    <Section id="invitation-questions" heading="Common invitation questions">
      <h3 className="font-semibold">What should an office invitation say?</h3>
      <p>State that joining is optional, give a comfortable budget, list the deadlines and explain how to sign up. Include the exchange location or remote delivery plan, and name someone who can answer questions privately.</p>
      <h3 className="font-semibold">Can I send these directly from this page?</h3>
      <p>The buttons copy text only. Paste it into your chosen app, replace every placeholder and check the audience before sending. CheckMyBasket does not send these messages for you.</p>
      <h3 className="font-semibold">Which link belongs in the invitation?</h3>
      <p>Use the group invitation link supplied after creating the group. Keep private match information and sign-in recovery links out of group invitations.</p>
    </Section>
    <Section id="more-help-organising-and-choosing-gifts" heading="More help organising and choosing gifts">
      <OrganiserGuideLinks current={guide.slug}/>
      <p><Link href="/secret-santa-whatsapp" className="underline">How to set up a draw on WhatsApp</Link> · <Link href="/office-secret-santa" className="underline">Office Secret Santa checklist</Link> · <Link href="/gifts" className="underline">Browse gift ideas</Link></p>
    </Section>
  </InfoPage>;
}
