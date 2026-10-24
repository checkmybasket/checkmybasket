import Link from "next/link";
import { InfoPage, Section } from "@/components/info-page";
import { GuideIntro } from "@/components/guide-intro";
import { editorialMetadata } from "@/lib/editorial-guide-metadata";

export const metadata = editorialMetadata("secret-santa-questionnaire");

export default function Page() {
  return <InfoPage title="A Secret Santa questionnaire people can answer quickly" updated="24 October 2026">
    <GuideIntro answer="A useful Secret Santa questionnaire asks what someone would enjoy, what they already own and which details matter when choosing a gift. Keep it short, make answers optional and leave sensitive information out of anything the group can read. Eight thoughtful questions are more helpful than a long personality quiz." contents={[{"id": "copy-these-eight-questions", "label": "Copy these eight questions"}, {"id": "turn-an-answer-into-a-useful-gift-hint", "label": "Turn an answer into a useful gift hint"}, {"id": "ask-for-choices-not-personal-disclosures", "label": "Ask for choices, not personal disclosures"}, {"id": "put-the-useful-answers-where-the-santa-can-find-them", "label": "Put the useful answers where the Santa can find them"}, {"id": "a-message-to-send-with-the-questions", "label": "A message to send with the questions"}]} />
    <Section id="copy-these-eight-questions" heading="Copy these eight questions">
      <ol className="list-decimal pl-5 space-y-2"><li>Which two or three hobbies or interests would you enjoy a gift connected to?</li><li>What is one small everyday item you would use?</li><li>Is there a book, game or similar item you would like? Please give the exact title or format if it matters.</li><li>What do you already own that your Santa might otherwise buy again?</li><li>Do size, colour, material or compatibility matter for any of your ideas?</li><li>Are secondhand, homemade or non-physical gifts welcome?</li><li>What would you prefer your Santa to avoid? You can name suitable alternatives without explaining why.</li><li>Which three to five ideas fit our agreed total budget, including any delivery allowance?</li></ol>
      <p>Introduce the questions with a note that any single suitable idea is enough. A recipient should not feel they are setting an order or asking the buyer to spend the whole allowance.</p>
    </Section>
    <Section id="turn-an-answer-into-a-useful-gift-hint" heading="Turn an answer into a useful gift hint">
      <p>“I like books” gives a direction but leaves a lot of guesswork. “I enjoy short science-fiction novels, prefer paperback and already own these three titles” gives the buyer something they can use.</p>
      <p>“Coffee” becomes more useful with a brewing method and whether the person wants whole beans, ground coffee or decaf. Our <Link href="/secret-santa-gifts-for-coffee-lovers" className="underline">coffee gift guide</Link> explains why those details matter. “Gaming” needs a platform for an accessory, or a player count for a tabletop game; see the <Link href="/secret-santa-gifts-for-gamers" className="underline">gaming guide</Link>.</p>
      <p>These are fictional examples, not a requirement to disclose every preference or possession.</p>
    </Section>
    <Section id="ask-for-choices-not-personal-disclosures" heading="Ask for choices, not personal disclosures">
      <p>Leave out home addresses, phone numbers, full dates of birth and questions about health or finances. A shared gift list is not the place to collect that information. Someone can say “please choose stationery rather than food” without explaining the reason.</p>
      <p>For food, the buyer still needs to check the actual product&#39;s ingredient and allergen information. A broad questionnaire answer is not a substitute for checking the exact item.</p>
      <p>Make participation optional. If somebody leaves a question blank, use the answers they did provide rather than pushing for an explanation.</p>
    </Section>
    <Section id="put-the-useful-answers-where-the-santa-can-find-them" heading="Put the useful answers where the Santa can find them">
      <p>If your group uses CheckMyBasket, participants can add appropriate ideas to their group wishlist. A <Link href="/wishlists" prefetch={false} className="underline">personal wishlist</Link> is a separate option for collecting ideas from different shops. It starts private; enable sharing only when you want the viewing link to be used.</p>
      <p>Anyone with an enabled shared link can view and forward it, so keep the list suitable for that audience. The questionnaire here is a copyable template, not an automatic survey feature inside CheckMyBasket.</p>
    </Section>
    <Section id="a-message-to-send-with-the-questions" heading="A message to send with the questions">
      <blockquote className="border-l-2 border-[var(--cmb-border)] pl-4"><p>Please answer whichever gift questions you are comfortable with and add a few ideas within our budget. Your Santa will choose one suitable gift. Cheaper options and alternatives are welcome; please leave addresses and private details out of the shared list.</p></blockquote>
      <p>For completed examples, use <Link href="/secret-santa-wishlist-ideas" className="underline">what to put on a Secret Santa wishlist</Link>. Agree the budget and deadline first using the <Link href="/secret-santa-rules" className="underline">organiser checklist</Link>.</p>
    </Section>
  </InfoPage>;
}
