import Link from "next/link";
import { panel } from "./shell";

const questions = [
  {
    question: "Do I need a Secret Santa group to make a wishlist?",
    answer: "No. Personal wishlists work on their own for birthdays, Christmas or any occasion. You can create a list without joining a group or giving an email address.",
  },
  {
    question: "Can I add gifts from different shops?",
    answer: "Yes. Add product links from any shop, or describe a gift without a link. You can keep ideas from different retailers together in one wishlist.",
  },
  {
    question: "Who can see my wishlist?",
    answer: "Your list is private until you enable sharing. Once sharing is on, anyone with the link can view the list and reserve gifts, and they can forward the link. Your editing access and email stay private. You can turn sharing off from your wishlist.",
  },
  {
    question: "Does reserving a gift buy it?",
    answer: "No. A reservation helps other visitors avoid choosing the same gift; it does not place an order or take a payment. Buy the gift at the retailer, then mark it as bought. If your plans change, you can release your reservation.",
  },
  {
    question: "Will I see what other people have reserved on my list?",
    answer: "Reservations stay hidden in your owner view to keep the surprise. Visitors can see which gifts are already reserved. If a reservation needs clearing, you can use Unreserve gift in your editor without seeing who reserved it.",
  },
];

export function WishlistFaq() {
  return (
    <section className="mt-10" aria-labelledby="wishlist-faq-heading">
      <h2 id="wishlist-faq-heading" className="text-2xl font-display font-semibold mb-5">
        Your wishlist questions, answered
      </h2>
      <div className="grid sm:grid-cols-2 gap-4 items-start">
        {questions.map(({ question, answer }) => (
          <details key={question} className={`${panel} group`}>
            <summary className="flex min-h-11 cursor-pointer list-none items-start justify-between gap-4 rounded focus-visible:outline-2 focus-visible:outline-offset-4 [&::-webkit-details-marker]:hidden"><h3 className="text-lg font-semibold">{question}</h3><span aria-hidden="true" className="shrink-0 text-xl"><span className="group-open:hidden">+</span><span className="hidden group-open:inline">−</span></span></summary>
            <p className="mt-3 text-sm leading-relaxed text-[var(--cmb-text-secondary)]">{answer}</p>
          </details>
        ))}
        <details className={`${panel} group`}>
          <summary className="flex min-h-11 cursor-pointer list-none items-start justify-between gap-4 rounded focus-visible:outline-2 focus-visible:outline-offset-4 [&::-webkit-details-marker]:hidden"><h3 className="text-lg font-semibold">Can I open my wishlists on another device?</h3><span aria-hidden="true" className="shrink-0 text-xl"><span className="group-open:hidden">+</span><span className="hidden group-open:inline">−</span></span></summary>
          <p className="mt-3 text-sm leading-relaxed text-[var(--cmb-text-secondary)]">
            Yes, if you verify a recovery email using &ldquo;Save your wishlist access&rdquo;
            in your original browser. On another device, use{" "}
            <Link href="/return" className="underline underline-offset-4">Return &amp; sign in</Link>{" "}
            to request a sign-in link. Without verified email recovery, clearing
            browser data or switching devices can mean losing access to your
            lists and reservations. A shared wishlist link does not give you
            editing access.
          </p>
        </details>
      </div>
    </section>
  );
}
