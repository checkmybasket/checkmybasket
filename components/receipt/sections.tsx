import Link from "next/link";
import type { ReactNode } from "react";
import { GIFT_CATEGORIES } from "@/lib/gift-categories";

export function Button({ href, children, variant = "primary" }: { href: string; children: ReactNode; variant?: "primary" | "secondary" | "inverse" }) {
  return <Link href={href} className={`receipt-button receipt-button-${variant}`}>{children}</Link>;
}

const receiptBlocks = [
  [["Group", "Office party"], ["People", "12"], ["Budget", "£20.00"], ["Swap date", "19 Dec"]],
  [["Names drawn", "12/12"], ["Wishlists", "9"], ["Questions asked", "17"]],
  [["Ads shown", "0"], ["You pay", "£0.00"]],
];
export function Receipt() {
  return <div className="receipt-sample" role="img" aria-label="Example draw summary: 12 people, £20 budget, no ads, free">
    <div aria-hidden="true">
      <div className="receipt-sample-title">CheckMyBasket</div><div className="receipt-sample-centre">Draw no. 0412</div>
      {receiptBlocks.map((rows, i) => <div key={i} className={`receipt-sample-block ${i === 2 ? "receipt-sample-totals" : ""}`}>
        {rows.map(([label, value]) => <div className="receipt-sample-row" key={label}><span>{label}</span><span>{value}</span></div>)}
      </div>)}
      <div className="receipt-sample-centre receipt-sample-thanks">Thank you for gifting well</div>
    </div>
  </div>;
}
const steps = [
  ["Create a draw", "Group name, budget, date. 30 seconds."],
  ["Share the link", "WhatsApp or copy. People join with a tap."],
  ["Draw names", "Fair, private, with exclusions for couples."],
  ["Buy the gift", "Wishlists, anonymous questions, UK gift ideas."],
];
export function StepStrip() {
  return <section id="how-it-works" className="receipt-steps-section" aria-labelledby="steps-heading">
    <div className="receipt-container"><h2 id="steps-heading">From group to gifts in minutes</h2>
      <ol className="receipt-steps">{steps.map(([title, body], i) => <li key={title}><span className="receipt-step-number" aria-hidden="true">{i + 1}</span><h3>{title}</h3><p>{body}</p></li>)}</ol>
    </div>
  </section>;
}
const features = [
  ["M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5", "Private draws", "Each person only ever sees their own match."],
  ["M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01", "Wishlists from any shop", "Paste links from Etsy, John Lewis, Amazon or anywhere."],
  ["M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z", "Anonymous questions", "Find out what they like without giving yourself away."],
  ["M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z", "Gifts under budget", "Browse UK gift ideas by budget."],
  ["M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z", "Group games", "Predictions and Stereotype Awards after the swap."],
  ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z", "No ads, ever", "Funded by affiliate gift links, not by ads."],
];
export function FeatureList() {
  return <section className="receipt-container receipt-features" aria-labelledby="features-heading">
    <h2 id="features-heading">Everything your group needs. All of it free.</h2>
    <ul>{features.map(([path, title, body]) => <li key={title}><svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter"><path d={path} /></svg><div><h3>{title}</h3><p>{body}</p></div></li>)}</ul>
  </section>;
}
export function BudgetChips() {
  return <section id="gifts" className="receipt-budget" aria-labelledby="budget-heading"><div className="receipt-container">
    <h2 id="budget-heading">Shop by budget</h2><p>Browse gift ideas from UK shops by budget or recipient.</p>
    <nav aria-label="Gift categories">{GIFT_CATEGORIES.map(({ slug, label }) => <Link key={slug} href={`/gifts/${slug}`}>{label}</Link>)}</nav>
  </div></section>;
}
export function CtaBand() {
  return <section className="receipt-container receipt-closing" aria-labelledby="closing-heading"><h2 id="closing-heading">Ready to organise your gift exchange?</h2><Button href="/create" variant="inverse">Create a free draw</Button></section>;
}
export function Footer() {
  return <footer className="receipt-footer"><div className="receipt-container receipt-footer-row"><p>Some gift links may earn us a small commission at no extra cost to you. That keeps CheckMyBasket free and free of ads.</p><div><nav aria-label="Footer navigation">{[["/about", "About"], ["/privacy", "Privacy"], ["/terms", "Terms"], ["/contact", "Contact"]].map(([href, label]) => <Link href={href} key={href}>{label}</Link>)}</nav><p>© 2026 CheckMyBasket</p></div></div></footer>;
}
