import type { Metadata } from "next";
import { InfoPage, Section } from "@/components/info-page";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "The plain-English terms for using CheckMyBasket's free Secret Santa service.",
};

export default function TermsPage() {
  return (
    <InfoPage title="Terms of Use" updated="10 July 2026">
      <Section heading="The service">
        <p>
          CheckMyBasket is a free Secret Santa organiser: create a group, share a link, draw names, share wishlists,
          send anonymous messages and play the group game. By using it you agree to these terms. If you don&apos;t
          agree, please don&apos;t use the service.
        </p>
      </Section>

      <Section heading="Fair use">
        <p>You agree not to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Use anonymous messaging to harass, abuse, threaten or deceive anyone. Every message has a report option.</li>
          <li>Post unlawful, offensive or infringing content in group names, wishlists or messages.</li>
          <li>Attempt to unmask another member&apos;s draw or identity, probe or circumvent the service&apos;s security, or scrape the service.</li>
          <li>Use the service to send spam or advertise unrelated products.</li>
        </ul>
        <p>We may remove content or groups that break these rules.</p>
      </Section>

      <Section heading="Your content">
        <p>
          You keep ownership of everything you add (names, wishlists, messages). You give us permission to store and
          display it to your group, which is the whole point of the service. Delete it whenever you like.
        </p>
      </Section>

      <Section heading="Affiliate links and gift ideas">
        <p>
          Gift guide pages and some wishlist links may be affiliate links that earn us a small commission at no extra
          cost to you. Purchases are made from the retailer, not from us — their terms, prices, stock and delivery
          apply. We curate ideas in good faith but aren&apos;t responsible for third-party products.
        </p>
      </Section>

      <Section heading="No warranty">
        <p>
          The service is provided free of charge, &ldquo;as is&rdquo;. We work hard to keep it available and your draws
          intact, but we can&apos;t guarantee uninterrupted service and we aren&apos;t liable for losses arising from
          use of the service, to the maximum extent permitted by law. Nothing in these terms limits liability that
          cannot be limited under UK law.
        </p>
      </Section>

      <Section heading="Changes">
        <p>
          We may update the service and these terms; material changes will be reflected on this page with a new date.
          These terms are governed by the laws of England and Wales.
        </p>
      </Section>

      <Section heading="Contact">
        <p>Questions: <a href="mailto:checkmybasketuk@gmail.com" className="underline" style={{ color: "var(--gc-primary)" }}>checkmybasketuk@gmail.com</a></p>
      </Section>
    </InfoPage>
  );
}
