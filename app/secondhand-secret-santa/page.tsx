import Link from "next/link";
import { InfoPage, Section } from "@/components/info-page";
import { GuideIntro } from "@/components/guide-intro";
import { editorialMetadata } from "@/lib/editorial-guide-metadata";

export const metadata = editorialMetadata("secondhand-secret-santa");

export default function Page() {
  return <InfoPage title="How to run a secondhand Secret Santa people enjoy" updated="24 October 2026">
    <GuideIntro answer="A secondhand Secret Santa works best when everyone agrees the theme before names are drawn. Set a comfortable spending limit, explain the condition expected and ask each person what kinds of pre-owned gifts they would welcome. A thoughtful used book can suit one recipient; a surprise secondhand item may be wrong for another." contents={[{"id": "agree-what-counts-before-shopping", "label": "Agree what counts before shopping"}, {"id": "look-for-the-person-not-the-bargain", "label": "Look for the person, not the bargain"}, {"id": "make-condition-part-of-the-choice", "label": "Make condition part of the choice"}, {"id": "do-not-turn-it-into-a-retail-value-contest", "label": "Do not turn it into a retail-value contest"}, {"id": "ask-for-a-secondhand-friendly-wishlist", "label": "Ask for a secondhand-friendly wishlist"}]} />
    <Section id="agree-what-counts-before-shopping" heading="Agree what counts before shopping">
      <p>Decide whether the exchange allows charity-shop purchases, other pre-owned items, things participants already own or a mixture. Clarify whether homemade additions count towards the spending limit. Do not quietly change an ordinary exchange into a secondhand one after somebody has bought a new gift.</p>
      <p>Keep participation optional. If someone dislikes receiving pre-owned items, agree another arrangement privately rather than making them justify their preference to the group.</p>
      <p>A sample theme note:</p>
      <blockquote className="border-l-2 border-[var(--cmb-border)] pl-4"><p>This year our optional Secret Santa is secondhand-themed. Choose one clean, complete gift your person would welcome, within our agreed total budget. Please use their wishlist and check condition carefully. Ask the organiser if an item or category feels uncertain.</p></blockquote>
    </Section>
    <Section id="look-for-the-person-not-the-bargain" heading="Look for the person, not the bargain">
      <p>Possible directions include a book in a format they read, a complete puzzle, an interesting print or an accessory in their preferred style. These are categories to investigate, not promises of local stock or a suitable price.</p>
      <p>For books, check the edition, writing inside and any missing pages. For games and puzzles, look for completeness information; a low price is less useful if the gift cannot be played. Inspect drinkware for chips and damage and check whether its care requirements are practical.</p>
      <p>Avoid guessing at specialist or safety-critical equipment. A Secret Santa is not a good reason to buy an item whose safety, authenticity or suitability you cannot establish.</p>
    </Section>
    <Section id="make-condition-part-of-the-choice" heading="Make condition part of the choice">
      <p>Look at the actual item, not only the listing title. If buying online, check photographs, seller descriptions, postage and the applicable return terms. Do not assume the terms are the same for every seller or marketplace.</p>
      <p>A small sign of prior use may be perfectly acceptable if it matches the agreed theme. Hidden damage or a missing essential part is different. Give yourself enough time to find an alternative rather than treating the first purchase as final.</p>
    </Section>
    <Section id="do-not-turn-it-into-a-retail-value-contest" heading="Do not turn it into a retail-value contest">
      <p>Use what you actually spend when applying the agreed purchase budget. Do not inflate the value using a speculative original price. If the group allows gifts from participants&#39; own belongings, agree how that fits the theme without requiring anyone to make an extra purchase for appearances.</p>
      <p>The aim is a suitable gift, not proving who found the largest discount. Fewer new purchases can be a reason to choose this theme, but avoid attaching invented carbon or waste savings to an individual gift.</p>
    </Section>
    <Section id="ask-for-a-secondhand-friendly-wishlist" heading="Ask for a secondhand-friendly wishlist">
      <p>A helpful note might say:</p>
      <blockquote className="border-l-2 border-[var(--cmb-border)] pl-4"><p>Pre-owned books in good condition are welcome. I enjoy nature writing and prefer paperback. Please avoid these titles, which I already own. A small print would also be lovely; I do not need a frame.</p></blockquote>
      <p>Use the <Link href="/secret-santa-gifts-for-book-lovers" className="underline">book-lover guide</Link> for useful preference checks and the <Link href="/secret-santa-wishlist-ideas" className="underline">wishlist guide</Link> for wording. Agree the rules, then <Link href="/create" className="underline">create your draw</Link> and share the theme alongside the invitation.</p>
    </Section>
  </InfoPage>;
}
