import { SITE_ORIGIN } from "@/lib/site";
import { GuideIntro, GuideScreenshot } from "@/components/guide-intro";
import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage, Section } from "@/components/info-page";
import { OrganiserGuideLinks } from "@/components/organiser-guide-links";
import { ORGANISER_GUIDES } from "@/lib/organiser-guides";

const guide = ORGANISER_GUIDES.find(item => item.slug === "secret-santa-wishlist-ideas")!;
export const metadata: Metadata = {
  title: { absolute: "What to Put on a Secret Santa Wishlist | CheckMyBasket" }, description: guide.description,
  alternates: { canonical: `/${guide.slug}` },
  openGraph: { title: guide.title, description: guide.description, url: `${SITE_ORIGIN}/${guide.slug}` },
  twitter: { card: "summary_large_image", title: guide.title, description: guide.description },
};

export default function WishlistGuide() {
  return <InfoPage title="What to put on a Secret Santa wishlist" updated="11 October 2026">
    <GuideIntro answer="Add three to five gifts you would enjoy, all within the agreed budget, with at least one cheaper option. Include useful sizes, colours, editions or hobbies, say whether alternatives are welcome, and check delivery costs before adding a product link." contents={[
      { id: "start-with-three-to-five-useful-ideas", label: "Choosing your ideas" },
      { id: "wishlist-ideas-for-different-budgets", label: "Ideas by budget" },
      { id: "completed-wishlist-examples", label: "Three completed examples" },
      { id: "create-and-share-your-list-in-checkmybasket", label: "Create and share your list" },
    ]} />
    <p className="text-lg leading-relaxed">Put a few things you would actually enjoy on your Secret Santa wishlist, with enough detail for someone else to choose confidently. Include options below the spending limit, explain your preferences and leave room for the buyer to surprise you.</p>
    <Link prefetch={false} href="/wishlists" className="inline-flex min-h-11 items-center rounded-[var(--cmb-radius)] bg-[var(--cmb-primary)] px-5 py-3 font-semibold text-[var(--cmb-text-inverse)]">Create a wishlist</Link>
    <Section id="start-with-three-to-five-useful-ideas" heading="Start with three to five useful ideas">
      <p>A short list is easier to use than dozens of unrelated links. Try one practical item, one hobby idea and one small treat, provided each fits the agreed budget. Include a lower-priced option so the buyer has room for postage or wrapping.</p>
      <p>For example, a reader could add a particular paperback, a bookmark and a note saying they enjoy historical fiction. A stationery fan could specify an A5 notebook with dotted pages rather than simply writing “notebook”. These details help even when the exact item is unavailable.</p>
    </Section>
    <Section id="wishlist-ideas-for-different-budgets" heading="Wishlist ideas for different budgets">
      <p>These are types of gifts to explore, rather than promises that a particular product is available at a fixed price. Check the retailer’s current item price, selected options and delivery before adding a link.</p>
      <div className="space-y-4">
        <div><h3 className="font-semibold">Under £10</h3><p>A bookmark, small notebook, favourite snack, puzzle book or simple keyring can give your Santa a clear starting point. For food, state relevant preferences rather than assuming everyone knows what you can eat. <Link href="/gifts/under-10" className="underline">Browse current ideas under £10</Link>.</p></div>
        <div><h3 className="font-semibold">Under £20</h3><p>Consider a book, small game, mug or accessory related to a hobby. Specify the edition, style or colour if it matters. If your group’s total limit is £20 including delivery, choose an item comfortably below it. <Link href="/gifts/under-20" className="underline">Browse current ideas under £20</Link>.</p></div>
        <div><h3 className="font-semibold">Under £30</h3><p>A complete craft kit, a game or a personalised keepsake may suit this budget. Check what is included: an accessory or refill is not always a complete gift. Add any personalisation details the buyer will need. <Link href="/gifts/under-30" className="underline">Browse current ideas under £30</Link>.</p></div>
      </div>
    </Section>
    <Section id="add-the-details-that-prevent-guesswork" heading="Add the details that prevent guesswork">
      <ul className="list-disc pl-5 space-y-2">
        <li><strong>Books:</strong> title, author, edition or format, and whether you already own it.</li>
        <li><strong>Clothing or accessories:</strong> preferred size, colour and style, if you are comfortable sharing them.</li>
        <li><strong>Crafts or games:</strong> your experience level and any equipment or extra parts required.</li>
        <li><strong>Personalised items:</strong> exact spelling, initials and any preferred wording.</li>
        <li><strong>Food or fragrance:</strong> relevant preferences and anything you want the buyer to avoid.</li>
      </ul>
      <p>Keep sensitive health information out of a shared list. You can describe suitable choices or speak privately with the organiser. For dietary requirements, the buyer should still check the actual product label and retailer information.</p>
    </Section>
    <Section id="completed-wishlist-examples" heading="Completed wishlist examples for colleagues, friends and family">
      <p>These fictional examples show useful wording rather than verified product offers. The amounts are spending limits, not quoted prices. Check current prices, postage and options before choosing a product.</p>
      <div className="space-y-4">
        <div className="rounded-[var(--cmb-radius)] border border-[var(--cmb-border)] p-5">
          <h3 className="font-semibold mb-2">Alex: a colleague with a £10 total budget</h3>
          <p><strong>Interests:</strong> stationery, sudoku and reading at lunchtime.</p>
          <ul className="list-disc pl-5 space-y-2"><li>An A5 dotted notebook with a plain navy or green cover. No dated planner pages, please.</li><li>A medium-difficulty sudoku book, in a small format for my commute. I already have a pencil.</li><li>A slim fabric or metal bookmark. Any simple design is fine; no initials needed.</li></ul>
          <p><strong>Note to my Santa:</strong> any one of these would be lovely. Please keep the total, including delivery, under £10. A simple alternative is welcome.</p>
        </div>
        <div className="rounded-[var(--cmb-radius)] border border-[var(--cmb-border)] p-5">
          <h3 className="font-semibold mb-2">Sam: a friend with a £20 total budget</h3>
          <p><strong>Interests:</strong> fantasy books, board games and drawing.</p>
          <ul className="list-disc pl-5 space-y-2"><li><em>Piranesi</em> by Susanna Clarke, in paperback. I have not read or bought it yet.</li><li>A small game for two adults that takes about 20 minutes. I already own UNO, so please choose something different.</li><li>An A5 sketchbook with plain pages for pencil sketches. I have pencils and do not need a paint set.</li></ul>
          <p><strong>Note to my Santa:</strong> choose one idea within £20 including delivery. Secondhand books in good condition are welcome, and a lower-priced gift is absolutely fine.</p>
        </div>
        <div className="rounded-[var(--cmb-radius)] border border-[var(--cmb-border)] p-5">
          <h3 className="font-semibold mb-2">Jamie: a family exchange with a £30 total budget</h3>
          <p><strong>Interests:</strong> beginner embroidery, wildlife and practical keepsakes.</p>
          <ul className="list-disc pl-5 space-y-2"><li>A beginner embroidery kit with a woodland design. Please choose a complete kit with a hoop, fabric, needle and thread.</li><li>A wildlife jigsaw of around 500 pieces. A landscape or bird illustration would be ideal.</li><li>A simple personalised keyring, engraved “Jamie”. Silver-coloured is my preference; no date or extra message needed.</li></ul>
          <p><strong>Note to my Santa:</strong> any one idea is enough, with a total of no more than £30 including delivery. Please check the dispatch time for anything personalised. If it will arrive late, a non-personalised alternative is welcome.</p>
        </div>
      </div>
    </Section>
    <Section id="create-and-share-your-list-in-checkmybasket" heading="Create and share your list in CheckMyBasket">
      <p>If you are in a Secret Santa group, add ideas to your wishlist there so your Santa can use them. You can also <Link prefetch={false} href="/wishlists" className="underline">create a personal wishlist</Link> without a group, add product links from different shops or describe a gift without a link.</p>
      <GuideScreenshot src="/guides/wishlist-setup.jpg" width={1280} height={1470} alt="CheckMyBasket wishlist creation form with an example display name, wishlist title and a £20 budget note" caption="Actual personal wishlist setup screen, filled with fictional example details without saving a list. Add a short budget and interests note here; the wishlist starts private." />
      <p>A personal wishlist is private until you enable sharing. Once shared, anyone with its link can view it, reserve gifts and forward the link. Share it with your intended audience and leave delivery addresses and private details out of the list. You can turn sharing off in the editor.</p>
      <p>On personal wishlists, a reservation helps visitors avoid duplicates; it does not buy the gift or take payment. Buyers still need to order at the retailer. Reservations stay hidden in your normal owner view, so you can keep the surprise.</p>
      <p>Your browser remembers your editing access. To return on another device, set up and verify recovery using “Save your wishlist access”. A shared viewing link does not give you editing access. Without verified recovery, clearing browser data can mean losing access.</p>
    </Section>
    <Section id="keep-it-helpful-without-turning-it-into-a-shopping-demand" heading="Keep it helpful, without turning it into a shopping demand">
      <p>Update links that are sold out and remove items you have already bought. Offer alternatives and avoid asking the buyer to exceed the group’s limit. Your list should help them understand your taste, while leaving the final choice with them.</p>
      <OrganiserGuideLinks current={guide.slug}/>
      <p><Link href="/gifts" className="underline">Find ideas by category, budget and interest</Link> · <Link href="/personalised-secret-santa-gifts" className="underline">Choosing a personalised gift</Link></p>
    </Section>
  </InfoPage>;
}
