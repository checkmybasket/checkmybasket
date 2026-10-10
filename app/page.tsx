import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/receipt/header";
import {
  Button,
  Receipt,
  StepStrip,
  FeatureList,
  BudgetChips,
  CtaBand,
  Footer,
} from "@/components/receipt/sections";
import "./receipt.css";

export const metadata: Metadata = {
  title: { absolute: "Free Secret Santa Generator & Organiser | CheckMyBasket" },
  description: "Organise a free Secret Santa draw. Share your invite on WhatsApp, draw names privately, add wishlists from any shop and ask anonymous questions. No ads.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <div className="receipt-home">
      <a className="receipt-skip-link" href="#main-content">
        Skip to content
      </a>
      <Header />
      <main id="main-content">
        <section
          className="receipt-container receipt-hero"
          aria-labelledby="hero-heading"
        >
          <div className="receipt-hero-copy">
            <h1 id="hero-heading">Free Secret Santa generator</h1>
            <p className="receipt-tagline">
              Thoughtful gifts, no matter how well you know them.
            </p>
            <p className="receipt-lead">
              Organise a Secret Santa draw for friends, family or colleagues.
              Share an invite on WhatsApp, draw names privately and add wishlists
              from any shop. Free to use. No ads, ever.
            </p>
            <div className="receipt-hero-buttons">
              <Button href="/create">Create a free draw</Button>
              <Button href="/wishlists" variant="secondary">
                Create a wishlist
              </Button>
            </div>
          </div>
          <div className="receipt-hero-card">
            <Receipt />
          </div>
        </section>
        <StepStrip />
        <p className="receipt-container receipt-guide-link">
          Planning your draw in a group chat?{" "}
          <Link href="/secret-santa-whatsapp">Read our WhatsApp Secret Santa guide</Link>.
        </p>
        <FeatureList />
        <BudgetChips />
        <section
          className="receipt-container receipt-faq"
          aria-labelledby="faq-heading"
        >
          <h2 id="faq-heading">Your Secret Santa questions, answered</h2>
          <div className="receipt-faq-list">
            <details>
              <summary><h3>How many people do we need for a Secret Santa draw?</h3></summary>
              <p>
                At least three people need to have joined your group before you
                can draw names. Wait until everyone who wants to take part has
                joined, then the organiser can start the draw.
              </p>
            </details>
            <details>
              <summary><h3>Does everyone need to give an email address?</h3></summary>
              <p>
                No. You can create or join a draw without an email address or
                password. A notification email is optional. To return on another
                device, you need to set up and verify an email for recovery
                separately.
              </p>
            </details>
            <details>
              <summary><h3>Can we stop couples or certain people drawing each other?</h3></summary>
              <p>
                Yes. Before drawing names, the organiser can add exclusion pairs
                so those two people will not draw each other. Too many exclusions
                can make a valid draw impossible; if that happens, adjust the
                pairs and try again.
              </p>
            </details>
            <details>
              <summary><h3>Who can see my Secret Santa match?</h3></summary>
              <p>
                Each participant can see their own assigned recipient. The
                organiser does not get a list of everyone&apos;s matches. Keep
                your match to yourself to preserve the surprise.
              </p>
            </details>
            <details>
              <summary><h3>Can I return to my group on another device?</h3></summary>
              <p>
                Yes, if you have verified a recovery email. In your original
                browser, use &ldquo;Save access to your group&rdquo; and follow
                the verification email. On another device, use{" "}
                <Link href="/return">Return to your group</Link> to request a
                sign-in link. Adding a notification email alone does not enable
                recovery. Without a verified recovery email, we cannot restore
                your original member identity on another device.
              </p>
            </details>
          </div>
        </section>
        <CtaBand />
      </main>
      <Footer />
    </div>
  );
}
