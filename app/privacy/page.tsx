import type { Metadata } from "next";
import { InfoPage, Section } from "@/components/info-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "What CheckMyBasket collects, optional analytics cookies, and your privacy choices. No ads.",
};

export default function PrivacyPage() {
  return (
    <InfoPage title="Privacy Policy" updated="4 October 2026">
      <Section heading="The short version">
        <p>
          We collect the minimum needed to run your Secret Santa or personal
          wishlist: the name you type when you join, and anything you choose to
          add (wishlist items, likes and dislikes, messages). No account is
          required, so we don&apos;t ask for a phone number or password. Email
          is optional, for draw notifications and, if you verify it,
          password-free access on another device. We show no ads and use no
          advertising trackers. When you leave a group or a group is deleted,
          its group data goes with it. A notification email stays on your
          profile until you remove it. A verified sign-in email is retained
          separately so you can return to your groups.
        </p>
      </Section>

      <Section heading="What we collect">
        <p>
          <strong>Things you give us:</strong>
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>The display name you enter when creating or joining a group</li>
          <li>
            An email address, only if you choose to receive draw notifications.
            It is saved on your profile and used for groups linked to your
            member identity.
          </li>
          <li>
            A verified sign-in email, only if you choose to save access to your
            groups, personal wishlists or gift reservations.
          </li>
          <li>
            Group details set by the organiser (group name, budget, exchange
            date and location)
          </li>
          <li>
            Wishlist items, likes, dislikes and sizes — only if you choose to
            add them
          </li>
          <li>
            Anonymous messages you send or receive within your group (text only,
            500 characters)
          </li>
          <li>
            Gift Predictions game selections (fixed categories only — no free
            text about other people)
          </li>
        </ul>
        <p>
          <strong>Things created automatically:</strong>
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            A member identifier, stored in a cookie so you stay signed in to
            your group. It starts anonymously and can be linked to a verified
            email for access on another device. It is never linked to a phone
            number.
          </li>
          <li>Your Secret Santa draw assignment</li>
        </ul>
        <p>
          We do <strong>not</strong> require email addresses or collect payment
          details, photos, precise location, or contacts. We use no third-party
          advertising cookies. Optional analytics cookies are explained below.
        </p>
      </Section>

      <Section heading="How we use it">
        <p>
          Solely to run your Secret Santa and personal wishlists: matching the
          draw, showing wishlists to your group, delivering anonymous messages,
          running the group game, sending draw notifications if you provide an
          email, and restoring access to your existing member identity when you
          verify a sign-in email. We never sell your data, never share it with
          advertisers, and never use it to build profiles of you.
        </p>
        <p>
          The legal basis for this processing (UK GDPR) is the performance of
          the service you asked for when you created a wishlist or joined a
          group (Article 6(1)(b)), and our legitimate interest in keeping the
          service safe (Article 6(1)(f)).
        </p>
      </Section>

      <Section heading="Optional analytics cookies">
        <p>
          If you accept analytics, we use Google Analytics to understand visits
          to our public pages and improve the site. Google processes cookie
          identifiers, public page paths and device/browser information, and
          processing may take place outside the UK/EEA. Advertising features
          and Google signals are disabled. Private groups, shared wishlist
          links and sign-in recovery pages are excluded from page tracking.
          We do not send names, emails, gift details or private access links
          as analytics event data.
        </p>
        <p>
          The basis for optional analytics is your consent. Google Analytics
          only loads after you choose Accept analytics. Rejecting it does not
          affect the service. Use Cookie settings at the bottom of any page to
          change your choice; rejecting stops collection and removes our
          analytics cookies. Your choice is saved in this browser. Google
          Analytics cookies can last up to two years unless cleared earlier.
        </p>
      </Section>

      <Section heading="Who can see what">
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Your optional email is private from group members and organisers. We
            use Resend to deliver draw emails, sharing your address, display
            name and group name with that service. Verification and sign-in
            emails also use Resend, which receives your address and the private
            access link.
          </li>
          <li>
            Your group name, wishlist, likes/dislikes and sizes are visible only
            to members of your group.
          </li>
          <li>
            Your draw assignment is visible only to you — not to other members,
            and not to the organiser. This is enforced at the database level.
          </li>
          <li>
            Anonymous messages show the recipient only &ldquo;Your Secret Santa
            🤫&rdquo; — the sender&apos;s identity is never exposed, and this is
            also enforced at the database level.
          </li>
          <li>
            &ldquo;I&apos;m getting this&rdquo; marks on wishlist items are
            hidden from the item&apos;s owner.
          </li>
        </ul>
      </Section>

      <Section heading="Personal wishlists">
        <p>
          Personal wishlists start private. If you enable sharing, anyone with
          the link can see the display name, list description and gift details,
          and can forward the link. Shared lists are excluded from search
          indexing. You can stop sharing or replace the link to revoke previous
          access.
        </p>
        <p>
          Gift reservations are stored against your browser identity. Other
          visitors see availability, but never the reserver&apos;s identity or
          email. Reservations stay hidden in the owner&apos;s normal view; an
          owner could still view their own shared link from another browser.
          Optional verified email recovery restores lists and reservations saved
          with the same identity.
        </p>
        <p>
          When you request product details, we fetch the shop page to suggest
          editable details. Wishlist images are fetched through our server so
          your browser does not contact an image provider directly. Shops may
          receive our server&apos;s request information. Clicking a shop link
          takes you to that retailer, whose privacy policy applies.
        </p>
        <p>
          Deleting a personal wishlist removes its items and reservations
          immediately. Releasing a reservation removes it immediately. Private
          links grant viewing access, so share them only with people you choose.
        </p>
      </Section>

      <Section heading="Where it lives">
        <p>
          Data is stored with Supabase in their London (eu-west-2) region and
          the site is hosted by Vercel. Both act as our processors under their
          standard data processing terms. Optional email notifications are
          processed by Resend and its delivery providers; delivery may involve
          processing outside the UK/EEA.
        </p>
      </Section>

      <Section heading="How long we keep it">
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Leave a group → your membership and wishlist for that group are
            deleted immediately.
          </li>
          <li>
            An organiser deletes a group → everything in it (members, wishlists,
            messages, draws, game data) is deleted immediately.
          </li>
          <li>
            You can remove your saved email on the match reveal screen to stop
            future draw emails. Leaving or deleting a group does not itself
            remove the notification email stored on your profile.
          </li>
          <li>
            Sign-in links expire after 15 minutes and work once. We store only
            their hashes in the database; expired records are removed when
            further recovery requests are processed. Hashed rate-limit
            identifiers are kept for up to a day of inactivity, then removed on
            the next request.
          </li>
          <li>
            Removing your notification email does not remove your verified
            sign-in email. Contact us to change or delete your sign-in identity;
            deleting it also ends email recovery.
          </li>
          <li>You can clear your wishlist at any time from group settings.</li>
        </ul>
      </Section>

      <Section heading="Your rights">
        <p>
          Under UK GDPR you can ask for access to, correction of, or deletion of
          your data, and you can object to or restrict processing. Most of this
          you can do yourself in the app (leave group, clear wishlist, delete
          group). For anything else, contact us and we&apos;ll sort it. You also
          have the right to complain to the Information Commissioner&apos;s
          Office (ico.org.uk).
        </p>
      </Section>

      <Section heading="Children">
        <p>
          Kids often take part in family Secret Santas. Because no account,
          email or personal profile is required, a child can join a family group
          with just a first name. Groups are private spaces created by someone
          with the invite link; we recommend an adult organises any group
          involving children.
        </p>
      </Section>

      <Section heading="Affiliate links">
        <p>
          Some gift links may earn us a small commission at no extra cost to you
          — this is how we keep CheckMyBasket free and ad-free. Affiliate
          partners do not receive any of your personal data from us.
        </p>
      </Section>

      <Section heading="Contact">
        <p>
          Questions about this policy:{" "}
          <a
            href="mailto:checkmybasketuk@gmail.com"
            className="underline text-[var(--cmb-primary)]"
          >
            checkmybasketuk@gmail.com
          </a>
        </p>
      </Section>
    </InfoPage>
  );
}
