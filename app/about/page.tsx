import { socialMetadata } from "@/lib/page-metadata";
import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage, Section } from "@/components/info-page";

export const metadata: Metadata = {
  ...socialMetadata("About CheckMyBasket", "Learn how CheckMyBasket selects gift ideas, records price checks and uses affiliate links to fund its free Secret Santa tools.", "/about"),
  alternates: { canonical: "/about" },
  title: "About",
  description: "Learn how CheckMyBasket selects gift ideas, records price checks and uses affiliate links to fund its free Secret Santa tools.",
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

      <Section id="how-we-choose-gift-ideas" heading="How gift ideas are chosen">
        <p>Our catalogue brings together gift ideas from UK retailers and partner catalogues. Ideas are organised by budget, category and recipient interest so you can start with what suits your person.</p>
        <p>Your chosen filters narrow the selection before the order rotates each day. That rotation helps you see different relevant ideas; it is not a ranking of products we have tested. Catalogue descriptions are based on retailer information, not hands-on product reviews.</p>
        <p>Use the <Link href="/gifts" className="underline">gift filters</Link> to explore, then check the exact option at the retailer. Our <Link href="/guides" className="underline">guides</Link> explain practical details such as compatibility, personalisation and delivery costs to consider before buying.</p>
      </Section>

      <Section id="what-price-checks-mean" heading="What a price-check date means">
        <p>For gifts in our regularly checked list, publication requires an approved listing and a recent successful check of the retailer&apos;s fixed item price and stock status. Failed, ambiguous or stale checks are excluded from that list until suitable current information is available.</p>
        <p>Where a card shows “Price checked”, that date is the last recorded check. It is not a live stock reservation or a promise that the price will stay the same. Some partner catalogue entries do not carry a check date; their price and availability still need confirmation at the retailer.</p>
        <p>Budget filters use item prices. Delivery, wrapping, personalisation options or a different size can change the total. Always confirm the selected option, stock, delivery estimate and checkout price before ordering. The retailer handles the purchase, delivery and returns.</p>
      </Section>

      <Section id="affiliate-links-and-corrections" heading="Affiliate links and corrections">
        <p>Some gift links may earn us a commission if you buy, at no extra cost to you. That helps fund the free draw and wishlist tools. Not every retailer link is an affiliate link.</p>
        <p>A listing is a suggestion, not a guarantee that an item suits every recipient. If you spot an incorrect detail or a broken product link, <Link href="/contact" className="underline">contact us</Link> with the gift name and retailer so we can investigate. Please leave private group links and personal information out of the report.</p>
      </Section>

      <Section heading="Get started">
        <p>
          <Link href="/create" className="underline text-[var(--cmb-primary)]">Create a free draw</Link> — it takes about 30 seconds, and it&apos;s free forever.
        </p>
      </Section>
    </InfoPage>
  );
}
