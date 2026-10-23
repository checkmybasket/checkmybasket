import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage, Section } from "@/components/info-page";
import { ORGANISER_GUIDES } from "@/lib/organiser-guides";
import { GIFT_GUIDES } from "@/lib/gift-guides";

const title = "Secret Santa and gift guides | CheckMyBasket";
const description = "Plan your Secret Santa, choose gifts by budget and interest, and get personalisation right with practical guides, invitation messages and printable checklists.";
export const metadata: Metadata = {
  title: { absolute: title }, description,
  alternates: { canonical: "/guides" },
  openGraph: { title, description, url: "/guides", type: "website" },
  twitter: { card: "summary_large_image", title, description },
};
const planning = [
  { slug: "secret-santa-whatsapp", title: "Secret Santa on WhatsApp", description: "Create a draw and share your invitation with a WhatsApp group." },
  { slug: "office-secret-santa", title: "Office Secret Santa", description: "Plan an optional workplace exchange with clear budgets and deadlines." },
  ...ORGANISER_GUIDES,
];
const groups = [
  { id: "planning", heading: "Plan your Secret Santa", intro: "Start with the rules, invitations and wishlists. Find help for office groups, remote teams and odd numbers.", guides: planning },
  { id: "budget", heading: "Choose gifts by budget", intro: "Set a comfortable limit and leave room for delivery and wrapping.", guides: GIFT_GUIDES.filter(g => /^secret-santa-gifts-under-/.test(g.slug)) },
  { id: "interests", heading: "Match their interests and your group", intro: "Use what you know about the recipient, or start with considerate ideas for someone you do not know well.", guides: GIFT_GUIDES.filter(g => !/^secret-santa-gifts-under-/.test(g.slug) && g.category !== "personalised") },
  { id: "personalised", heading: "Make a personalised gift", intro: "Check names, engraving, options and making time before placing an order.", guides: GIFT_GUIDES.filter(g => g.category === "personalised") },
];

export default function GuidesPage() {
  return <InfoPage title="Secret Santa and gift guides">
    <p className="text-[var(--cmb-text-secondary)] leading-relaxed">Practical help for organising a gift exchange and choosing something thoughtful. Browse the guides below, then put your plan into action with a free draw or wishlist.</p>
    <nav aria-label="Guide topics" className="flex flex-wrap gap-x-5 gap-y-2">{groups.map(group => <a key={group.id} href={`#${group.id}`} className="inline-flex min-h-11 items-center underline text-sm">{group.heading}</a>)}</nav>
    <div className="flex flex-wrap gap-3">
      <Link href="/create" className="inline-flex min-h-11 items-center rounded-[var(--cmb-radius)] bg-[var(--cmb-primary)] px-4 text-white font-semibold text-sm">Create a free draw</Link>
      <Link prefetch={false} href="/wishlists" className="inline-flex min-h-11 items-center rounded-[var(--cmb-radius)] border border-[var(--cmb-border)] px-4 font-semibold text-sm">Create a wishlist</Link>
      <Link href="/gifts" className="inline-flex min-h-11 items-center underline text-sm">Browse current gifts</Link>
    </div>
    {groups.map(group => <Section key={group.id} id={group.id} heading={group.heading}>
      <p>{group.intro}</p>
      <ul className="grid sm:grid-cols-2 gap-3 list-none p-0">{group.guides.map(guide => <li key={guide.slug} className="rounded-[var(--cmb-radius)] border border-[var(--cmb-border)] bg-white p-4">
        <h3 className="font-semibold text-[var(--cmb-text)]"><Link href={`/${guide.slug}`} className="inline-flex min-h-11 items-center underline underline-offset-4">{guide.title}</Link></h3>
        <p className="mt-1">{guide.description}</p>
      </li>)}</ul>
    </Section>)}
    <Section heading="Printable planning sheets" id="printables"><ul className="space-y-2 list-none p-0">{[
      ["/secret-santa-organiser-checklist.pdf", "Secret Santa organiser checklist (PDF)"],
      ["/remote-secret-santa-planner.pdf", "Remote Secret Santa planner (PDF)"],
      ["/engraving-order-checklist.pdf", "Engraving order checklist (PDF)"],
    ].map(([href,label]) => <li key={href}><a href={href} className="inline-flex min-h-11 items-center underline">{label}</a></li>)}</ul></Section>
  </InfoPage>;
}
