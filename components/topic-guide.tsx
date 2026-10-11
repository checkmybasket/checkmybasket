import { GIFT_GUIDES } from "@/lib/gift-guides";
import { ORGANISER_GUIDES } from "@/lib/organiser-guides";
import type { Metadata } from "next";
import Link from "next/link";
import content from "@/data/topic-guides.json";
import { TOPIC_GUIDES } from "@/lib/topic-guides";
import { InfoPage, Section } from "@/components/info-page";
import { GuideIntro, GuideScreenshot } from "@/components/guide-intro";
import { GiftGuidePicks } from "@/components/gift-guide-picks";
import { InvitationMessage } from "@/components/whatsapp-invitation";
import { EngravingPreview } from "@/components/engraving-preview";

type TopicContent = {
  slug: string; title: string; answer: string; intro: string; kind: string;
  sections: { id: string; heading: string; paragraphs: string[]; bullets?: string[]; tool?: string }[];
  category?: string; budget?: number; interest?: string; retailer?: string;
  download?: { path: string; label: string }; related: string[];
};
const guides: TopicContent[] = content;

export function topicMetadata(slug: string): Metadata {
  const guide = TOPIC_GUIDES.find(item => item.slug === slug);
  if (!guide) throw new Error("Unknown guide");
  return {
    title: { absolute: `${guide.title} | CheckMyBasket` }, description: guide.description,
    alternates: { canonical: `/${slug}` },
    openGraph: { title: guide.title, description: guide.description, url: `https://www.checkmybasket.co.uk/${slug}` },
    twitter: { card: "summary_large_image", title: guide.title, description: guide.description },
  };
}

function OddNumberExamples() {
  const names = ["Alex", "Blake", "Casey", "Dev", "Ellis", "Frankie", "Gale"];
  return <div className="grid gap-4 sm:grid-cols-3">
    {[3, 5, 7].map(size => <table key={size} className="w-full border border-[var(--cmb-border)] text-left">
      <caption className="text-left font-semibold mb-2">{size} participants: one valid example</caption>
      <thead><tr><th scope="col" className="p-2">Giver</th><th scope="col" className="p-2">Recipient</th></tr></thead>
      <tbody>{names.slice(0, size).map((name, index) => <tr key={name} className="border-t border-[var(--cmb-border)]"><th scope="row" className="p-2 font-normal">{name}</th><td className="p-2">{names[(index + 1) % size]}</td></tr>)}</tbody>
    </table>)}
  </div>;
}

const remoteMessage = `Hi team! We’re organising an optional remote Secret Santa. 🎁

Total budget: [amount, including/excluding delivery]
Please join by: [date]
Names drawn on: [date]
Gifts should arrive by: [date]
Reveal: [date, time and time zone, or flexible opening plan]

Join the group: [group invitation link]

Add a few wishlist ideas within the budget. Please use [our agreed private delivery channel] for delivery details; keep addresses and private matches out of the group chat. Contact [organiser] privately if delivery or attendance is difficult. No pressure to join!`;

export async function TopicGuide({ slug }: { slug: string }) {
  const guide = guides.find(item => item.slug === slug);
  if (!guide) throw new Error("Unknown guide");
  return <InfoPage title={guide.title} updated="11 October 2026">
    <GuideIntro answer={guide.answer} contents={[
      ...guide.sections.map(section => ({ id: section.id, label: section.heading })),
      ...(guide.download ? [{ id: "printable-planning-sheet", label: "Download the printable sheet" }] : []),
      ...(guide.kind === "gift" ? [{ id: "guide-picks-heading", label: "Current catalogue ideas" }] : []),
    ]} />
    <p className="text-lg leading-relaxed">{guide.intro}</p>
    {guide.sections.map(section => <Section key={section.id} id={section.id} heading={section.heading}>
      {section.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
      {section.bullets && <ul className="list-disc pl-5 space-y-2">{section.bullets.map(point => <li key={point}>{point}</li>)}</ul>}
      {section.tool === "odd-examples" && <OddNumberExamples />}
      {section.tool === "setup" && <GuideScreenshot src="/guides/create-draw.jpg" width={1280} height={1151} alt="CheckMyBasket create draw form with an example group name and £20 budget" caption="Actual setup screen, shown with example details without submitting a group. Your invitation explains any delivery rules and deadlines beyond the fields shown." />}
      {section.tool === "wishlist" && <GuideScreenshot src="/guides/wishlist-setup.jpg" width={1280} height={1470} alt="CheckMyBasket personal wishlist setup with an example budget and interests note" caption="Actual personal wishlist form with fictional details. A group participant can add ideas inside their group; a personal wishlist is a separate option and starts private." />}
      {section.tool === "remote-message" && <InvitationMessage invitation={remoteMessage} copyLabel="Copy remote-team invitation" />}
      {section.tool === "engraving" && <EngravingPreview />}
    </Section>)}
    {guide.download && <Section id="printable-planning-sheet" heading="Your printable planning sheet"><p><a href={guide.download.path} download className="inline-flex min-h-11 items-center rounded-xl bg-[var(--cmb-primary)] px-5 py-3 font-semibold text-[var(--cmb-text-inverse)]">{guide.download.label}</a><span className="block text-sm mt-2">One-page A4 sheet. Print at actual size and fill it in by hand.</span></p></Section>}
    {guide.kind === "gift" && <GiftGuidePicks category={guide.category} budget={guide.budget} interest={guide.interest} retailer={guide.retailer} />}
    <Section id="next-steps" heading="Your next step">
      <p><Link href={guide.kind === "organiser" ? "/create" : "/wishlists"} className="inline-flex min-h-11 items-center underline font-semibold">{guide.kind === "organiser" ? "Create a free Secret Santa draw" : "Create a wishlist with your gift ideas"}</Link></p>
      <p><Link href="/secret-santa-rules" className="underline">Secret Santa rules and organiser checklist</Link> · <Link href="/secret-santa-wishlist-ideas" className="underline">What to put on a wishlist</Link> · <Link href="/gifts" className="underline">Find gifts by budget and interest</Link></p>
      <nav aria-label="Related guides" className="flex flex-wrap gap-x-5 gap-y-2">{guide.related.map(related => <Link key={related} href={`/${related}`} className="inline-flex min-h-11 items-center underline">{[...GIFT_GUIDES, ...ORGANISER_GUIDES].find(item => item.slug === related)?.title ?? related}</Link>)}</nav>
    </Section>
  </InfoPage>;
}
