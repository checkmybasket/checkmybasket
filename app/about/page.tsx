import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage, Section } from "@/components/info-page";

export const metadata: Metadata = {
  title: "About",
  description: "Why CheckMyBasket exists: Secret Santa without the ads, accounts, or awkward gifts.",
};

export default function AboutPage() {
  return (
    <InfoPage title="About CheckMyBasket">
      <Section heading="Secret Santa, sorted.">
        <p>
          Most Secret Santa tools make you create an account, wade through ads, and then leave you buying a mystery
          gift for someone you barely know. CheckMyBasket is our answer: tap a link, type your name, and you&apos;re
          in. Draw names fairly, share wishlists from any shop, and ask your person anonymous questions so you buy
          something they actually want.
        </p>
      </Section>

      <Section heading="What we believe">
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>No ads, ever.</strong> We&apos;re funded by optional affiliate links on gift ideas — never by selling your attention or your data.</li>
          <li><strong>No accounts.</strong> Joining a draw should take 30 seconds, not an inbox verification dance.</li>
          <li><strong>Private by design.</strong> Nobody — not even the organiser — can see who drew who. Your Secret Santa stays secret.</li>
          <li><strong>Made in the UK.</strong> Budgets in pounds, gift ideas from shops you actually use.</li>
        </ul>
      </Section>

      <Section heading="Get started">
        <p>
          <Link href="/create" className="underline" style={{ color: "var(--cmb-primary)" }}>Create a free draw</Link> — it takes about 30 seconds, and it&apos;s free forever.
        </p>
      </Section>
    </InfoPage>
  );
}
