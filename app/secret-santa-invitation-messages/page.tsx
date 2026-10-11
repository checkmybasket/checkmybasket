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

export default function InvitationGuide() {
  return <InfoPage title="Secret Santa invitation messages for WhatsApp and email" updated="11 October 2026">
    <p className="text-lg leading-relaxed">A good Secret Santa invitation answers four questions: who can join, what to spend, when to join and when gifts will be exchanged. Use these messages as a starting point, replace every bracketed field and share the invitation with your chosen group.</p>
    <Section heading="Before sending your invitation">
      <p><Link href="/create" className="underline">Create your free draw</Link> and copy the group invitation link from the confirmation screen. Use that joining link in an invitation, rather than a private match or recovery link. CheckMyBasket needs at least three joined participants before drawing names.</p>
      <p>Agree the budget and whether delivery counts toward it. Leave enough time between the draw and the exchange for shopping and any personalisation. The <Link href="/secret-santa-rules" className="underline">Secret Santa rules guide</Link> includes an organiser checklist.</p>
      <p>The buttons below only copy text. Review the dates and link, then send the message yourself through WhatsApp, email or your usual chat app.</p>
    </Section>
    {templates.map(template => <Section key={template.heading} heading={template.heading}><InvitationMessage invitation={template.text} copyLabel={template.label}/></Section>)}
    <Section heading="Make the message fit your group">
      <p>For colleagues, emphasise that joining is optional and avoid putting pressure on anyone to spend more. For family or friends, say whether homemade gifts are welcome. For remote participants, include the delivery plan rather than assuming everyone can attend in person.</p>
      <p>The invitation can be forwarded, so share it with the people you want involved and check the member list before drawing. Keep delivery addresses and private matches out of a large group chat. A recipient can use a wishlist to share gift preferences without posting their personal details.</p>
      <p>A single helpful reminder is usually clearer than repeated messages. If someone joins late or withdraws after the draw, speak to the organiser privately before changing the arrangements.</p>
    </Section>
    <Section heading="More help organising and choosing gifts">
      <OrganiserGuideLinks current={guide.slug}/>
      <p><Link href="/secret-santa-whatsapp" className="underline">How to set up a draw on WhatsApp</Link> · <Link href="/office-secret-santa" className="underline">Office Secret Santa checklist</Link> · <Link href="/gifts" className="underline">Browse gift ideas</Link></p>
    </Section>
  </InfoPage>;
}
