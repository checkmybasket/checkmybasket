import type { Metadata } from "next";
import { InfoPage, Section } from "@/components/info-page";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with CheckMyBasket — questions, problems, feedback or data requests.",
};

export default function ContactPage() {
  return (
    <InfoPage title="Contact us">
      <Section heading="Email">
        <p>
          For anything — a question, a problem with your draw, feedback, reporting misuse, or a data request — email{" "}
          <a href="mailto:checkmybasketuk@gmail.com" className="underline text-[var(--cmb-primary)]">checkmybasketuk@gmail.com</a>.
          We&apos;re a small team, but we read everything and reply as quickly as we can.
        </p>
      </Section>

      <Section heading="Reporting a message">
        <p>
          If someone misuses anonymous messaging, use the report option on the message itself — that flags it to us
          with the context we need. You can also leave any group at any time from its settings.
        </p>
      </Section>
    </InfoPage>
  );
}
