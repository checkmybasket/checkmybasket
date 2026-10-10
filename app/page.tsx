import type { Metadata } from "next";
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
        <FeatureList />
        <BudgetChips />
        <CtaBand />
      </main>
      <Footer />
    </div>
  );
}
