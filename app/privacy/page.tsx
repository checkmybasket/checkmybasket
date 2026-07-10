import type { Metadata } from "next";
import { InfoPage, Section } from "@/components/info-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What CheckMyBasket collects (very little), why, and your rights. No ads, no tracking, no nonsense.",
};

export default function PrivacyPage() {
  return (
    <InfoPage title="Privacy Policy" updated="10 July 2026">
      <Section heading="The short version">
        <p>
          We collect the minimum needed to run a Secret Santa: the name you type when you join, and anything you
          choose to add (wishlist items, likes and dislikes, messages). No account is required, so we don&apos;t ask for
          your email, phone number or password. We show no ads and use no advertising trackers. When you leave a
          group or a group is deleted, your data goes with it.
        </p>
      </Section>

      <Section heading="What we collect">
        <p><strong>Things you give us:</strong></p>
        <ul className="list-disc pl-5 space-y-1">
          <li>The display name you enter when creating or joining a group</li>
          <li>Group details set by the organiser (group name, budget, exchange date and location)</li>
          <li>Wishlist items, likes, dislikes and sizes — only if you choose to add them</li>
          <li>Anonymous messages you send or receive within your group (text only, 500 characters)</li>
          <li>Gift Predictions game selections (fixed categories only — no free text about other people)</li>
        </ul>
        <p><strong>Things created automatically:</strong></p>
        <ul className="list-disc pl-5 space-y-1">
          <li>An anonymous account identifier, stored in a cookie so you stay signed in to your group. It is not linked to your email, phone or any real-world identity.</li>
          <li>Your Secret Santa draw assignment</li>
        </ul>
        <p>
          We do <strong>not</strong> collect email addresses, payment details, photos, precise location, or contacts.
          We use no third-party advertising or tracking cookies.
        </p>
      </Section>

      <Section heading="How we use it">
        <p>
          Solely to run your Secret Santa: matching the draw, showing wishlists to your group, delivering anonymous
          messages, and running the group game. We never sell your data, never share it with advertisers, and never
          use it to build profiles of you.
        </p>
        <p>
          The legal basis for this processing (UK GDPR) is the performance of the service you asked for when you
          created or joined a group (Article 6(1)(b)), and our legitimate interest in keeping the service safe
          (Article 6(1)(f)).
        </p>
      </Section>

      <Section heading="Who can see what">
        <ul className="list-disc pl-5 space-y-1">
          <li>Your name, wishlist, likes/dislikes and sizes are visible only to members of your group.</li>
          <li>Your draw assignment is visible only to you — not to other members, and not to the organiser. This is enforced at the database level.</li>
          <li>Anonymous messages show the recipient only &ldquo;Your Secret Santa 🤫&rdquo; — the sender&apos;s identity is never exposed, and this is also enforced at the database level.</li>
          <li>&ldquo;I&apos;m getting this&rdquo; marks on wishlist items are hidden from the item&apos;s owner.</li>
        </ul>
      </Section>

      <Section heading="Where it lives">
        <p>
          Data is stored with Supabase in their London (eu-west-2) region and the site is hosted by Vercel. Both act
          as our processors under their standard data processing terms. Your data does not leave the UK/EEA hosting
          region in the ordinary course of the service.
        </p>
      </Section>

      <Section heading="How long we keep it">
        <ul className="list-disc pl-5 space-y-1">
          <li>Leave a group → your membership and wishlist for that group are deleted immediately.</li>
          <li>An organiser deletes a group → everything in it (members, wishlists, messages, draws, game data) is deleted immediately.</li>
          <li>You can clear your wishlist at any time from group settings.</li>
        </ul>
      </Section>

      <Section heading="Your rights">
        <p>
          Under UK GDPR you can ask for access to, correction of, or deletion of your data, and you can object to or
          restrict processing. Most of this you can do yourself in the app (leave group, clear wishlist, delete
          group). For anything else, contact us and we&apos;ll sort it. You also have the right to complain to the
          Information Commissioner&apos;s Office (ico.org.uk).
        </p>
      </Section>

      <Section heading="Children">
        <p>
          Kids often take part in family Secret Santas. Because no account, email or personal profile is required, a
          child can join a family group with just a first name. Groups are private spaces created by someone with the
          invite link; we recommend an adult organises any group involving children.
        </p>
      </Section>

      <Section heading="Affiliate links">
        <p>
          Some gift links may earn us a small commission at no extra cost to you — this is how we keep CheckMyBasket
          free and ad-free. Affiliate partners do not receive any of your personal data from us.
        </p>
      </Section>

      <Section heading="Contact">
        <p>Questions about this policy: <a href="mailto:checkmybasketuk@gmail.com" className="underline" style={{ color: "var(--gc-primary)" }}>checkmybasketuk@gmail.com</a></p>
      </Section>
    </InfoPage>
  );
}
