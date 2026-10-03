import { Header } from "@/components/receipt/header";
import { Button, Receipt, StepStrip, FeatureList, BudgetChips, CtaBand, Footer } from "@/components/receipt/sections";
import "./receipt.css";

export default function HomePage() {
  return <div className="receipt-home">
    <a className="receipt-skip-link" href="#main-content">Skip to content</a>
    <Header />
    <main id="main-content">
      <section className="receipt-container receipt-hero" aria-labelledby="hero-heading">
        <div className="receipt-hero-copy">
          <h1 id="hero-heading">Gifting made simple</h1>
          <p className="receipt-tagline">Thoughtful gifts, no matter how well you know them.</p>
          <p className="receipt-lead">Draw names, share wishlists from any shop and ask anonymous questions. Find gifts people actually want. No ads, ever.</p>
          <div className="receipt-hero-buttons"><Button href="/create">Create a free draw</Button><Button href="/gifts" variant="secondary">Gift ideas</Button></div>
        </div>
        <div className="receipt-hero-card"><Receipt /></div>
      </section>
      <StepStrip /><FeatureList /><BudgetChips /><CtaBand />
    </main>
    <Footer />
  </div>;
}
