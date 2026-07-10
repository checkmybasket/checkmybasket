import Link from "next/link";
import { Gift, Users, MessageCircle, ShoppingBag, Gamepad2, ShieldOff, ArrowRight, Star, CheckCircle2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  { icon: Users,         title: "Draw names privately",           body: "Fair, private matching. Set exclusions so couples don't draw each other." },
  { icon: Gift,          title: "Share wishlists from any shop",  body: "Add gift ideas from Etsy, John Lewis, Amazon — anywhere. No more guessing." },
  { icon: MessageCircle, title: "Ask anonymous questions",        body: "Buying for someone you barely know? Ask what they like without giving yourself away." },
  { icon: ShoppingBag,   title: "Find UK gifts under budget",     body: "Curated ideas from UK shops, filtered by budget. No ads, just good gifts." },
  { icon: Gamepad2,      title: "Play festive group games",       body: "Predict what everyone's getting, earn Stereotype Awards, and settle scores after the exchange." },
  { icon: ShieldOff,     title: "No ads, ever",                   body: "We earn from affiliate gift links, not ads. Your experience stays clean." },
];

const steps = [
  { num: "01", title: "Create a free draw",    body: "Name your group, set a budget, pick a date. Takes 30 seconds." },
  { num: "02", title: "Share the invite link", body: "Send it via WhatsApp or copy it. People join by tapping — no app needed." },
  { num: "03", title: "Draw names",            body: "Names are matched fairly and privately. Each person only sees who they're buying for." },
  { num: "04", title: "Find the perfect gift", body: "Browse wishlists, ask anonymous questions, and shop from curated UK gift ideas." },
];

const budgetLinks = [
  { label: "Gifts under £5",  href: "/gifts/under-5" },
  { label: "Gifts under £10", href: "/gifts/under-10" },
  { label: "Gifts under £15", href: "/gifts/under-15" },
  { label: "Gifts under £20", href: "/gifts/under-20" },
  { label: "Gifts under £25", href: "/gifts/under-25" },
  { label: "Funny gifts",     href: "/gifts/funny" },
  { label: "Cosy gifts",      href: "/gifts/cosy" },
  { label: "Safe for work",   href: "/gifts/colleague" },
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-dvh" style={{ background: "var(--gc-bg)" }}>
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b" style={{ borderColor: "var(--gc-border)", background: "rgba(255,248,240,0.92)", backdropFilter: "blur(12px)" }}>
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2" style={{ color: "var(--gc-primary)" }}>
            <Gift strokeWidth={1.5} size={22} />
            <span className="font-semibold text-lg" style={{ fontFamily: "var(--font-fraunces)" }}>CheckMyBasket</span>
          </Link>
          <nav className="hidden sm:flex items-center gap-6 text-sm" style={{ color: "var(--gc-text-secondary)" }}>
            <Link href="/gifts" className="hover:text-[var(--gc-primary)] transition-colors duration-150">Gift ideas</Link>
            <Link href="#how-it-works" className="hover:text-[var(--gc-primary)] transition-colors duration-150">How it works</Link>
          </nav>
          <Link href="/create">
            <Button size="sm" className="h-9 px-4 rounded-lg text-sm font-semibold" style={{ background: "var(--gc-primary)", color: "var(--gc-text-inverse)" }}>
              Create a free draw
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="noise-bg relative overflow-hidden" style={{ background: "var(--gc-primary)" }}>
        <div className="relative z-10 max-w-5xl mx-auto px-4 py-20 sm:py-28 text-center">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm mb-6 animate-fade-in"
            style={{ background: "rgba(255,248,240,0.1)", color: "var(--gc-warm)", border: "1px solid rgba(212,165,116,0.3)" }}>
            <Star size={14} strokeWidth={1.5} />
            <span>Hate buying for someone you barely know?</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-5 animate-fade-up"
            style={{ color: "var(--gc-text-inverse)", fontFamily: "var(--font-fraunces)", lineHeight: 1.15 }}>
            Secret Santa<br />made simple
          </h1>
          <p className="text-lg sm:text-xl max-w-xl mx-auto mb-8 animate-fade-up animate-delay-100"
            style={{ color: "rgba(255,248,240,0.8)", lineHeight: 1.6 }}>
            Draw names, share wishlists, ask anonymous questions and find gifts people actually want.{" "}
            <strong style={{ color: "var(--gc-warm)" }}>No ads, ever.</strong>
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center animate-fade-up animate-delay-200">
            <Link href="/create">
              <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-base rounded-xl font-semibold"
                style={{ background: "var(--gc-accent)", color: "#fff" }}>
                Create a free draw <ArrowRight size={18} strokeWidth={1.5} className="ml-2" />
              </Button>
            </Link>
            <Link href="/gifts">
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 text-base rounded-xl"
                style={{ borderColor: "rgba(255,248,240,0.3)", color: "var(--gc-text-inverse)", background: "transparent" }}>
                View gift ideas
              </Button>
            </Link>
          </div>
          <p className="mt-5 text-sm animate-fade-up animate-delay-300" style={{ color: "rgba(255,248,240,0.5)" }}>
            Free forever. No account needed. Takes 30 seconds.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-16 sm:py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-medium mb-2" style={{ color: "var(--gc-accent)" }}>How it works</p>
            <h2 className="text-3xl sm:text-4xl font-bold" style={{ fontFamily: "var(--font-fraunces)" }}>From group to gifts in minutes</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map((step) => (
              <div key={step.num} className="rounded-2xl p-6" style={{ background: "var(--gc-surface)", boxShadow: "var(--shadow-md)", border: "1px solid var(--gc-border)" }}>
                <div className="text-4xl font-bold mb-3" style={{ color: "var(--gc-border)", fontFamily: "var(--font-fraunces)" }}>{step.num}</div>
                <h3 className="font-semibold text-base mb-2">{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--gc-text-secondary)" }}>{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-24 px-4" style={{ background: "var(--gc-surface)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-medium mb-2" style={{ color: "var(--gc-accent)" }}>Everything included</p>
            <h2 className="text-3xl sm:text-4xl font-bold" style={{ fontFamily: "var(--font-fraunces)" }}>The app your group actually needs</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-2xl p-6" style={{ background: "var(--gc-bg)", border: "1px solid var(--gc-border)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: "var(--gc-primary)", color: "var(--gc-text-inverse)" }}>
                  <Icon size={20} strokeWidth={1.5} />
                </div>
                <h3 className="font-semibold text-base mb-1.5">{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--gc-text-secondary)" }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gift ideas strip */}
      <section className="py-16 sm:py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3" style={{ fontFamily: "var(--font-fraunces)" }}>Need inspiration?</h2>
            <p style={{ color: "var(--gc-text-secondary)" }}>Curated gifts from UK shops, filtered by budget. No ads.</p>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            {budgetLinks.map((l) => (
              <Link key={l.href} href={l.href}
                className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-150 hover:scale-105"
                style={{ background: "var(--gc-surface)", border: "1px solid var(--gc-border)", color: "var(--gc-text-primary)", boxShadow: "var(--shadow-sm)" }}>
                {l.label} <ChevronRight size={14} strokeWidth={2} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 px-4" style={{ background: "var(--gc-primary)" }}>
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-sm font-medium mb-3" style={{ color: "var(--gc-warm)" }}>Secret Santa, sorted.</p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ fontFamily: "var(--font-fraunces)", color: "var(--gc-text-inverse)" }}>
            Ready to sort Secret Santa?
          </h2>
          <p className="mb-8 text-lg" style={{ color: "rgba(255,248,240,0.75)" }}>Free, ad-free, and takes 30 seconds to set up.</p>
          <div className="flex flex-wrap gap-4 justify-center mb-8">
            {["Free forever","No account needed","Works on any phone"].map((t) => (
              <div key={t} className="flex items-center gap-2 text-sm" style={{ color: "rgba(255,248,240,0.8)" }}>
                <CheckCircle2 size={16} strokeWidth={1.5} style={{ color: "var(--gc-warm)" }} /> {t}
              </div>
            ))}
          </div>
          <Link href="/create">
            <Button size="lg" className="h-14 px-10 text-base rounded-xl font-semibold" style={{ background: "var(--gc-accent)", color: "#fff" }}>
              Create a free draw <ArrowRight size={18} strokeWidth={1.5} className="ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 border-t" style={{ borderColor: "var(--gc-border)", background: "var(--gc-surface)" }}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm" style={{ color: "var(--gc-text-muted)" }}>
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="flex items-center gap-2">
              <Gift size={16} strokeWidth={1.5} style={{ color: "var(--gc-primary)" }} />
              <span style={{ fontFamily: "var(--font-fraunces)", color: "var(--gc-primary)", fontWeight: 600 }}>CheckMyBasket</span>
            </div>
            <span className="hidden sm:inline">·</span>
            <span>Free Secret Santa with wishlists, anonymous messaging, and group games. No ads, ever.</span>
          </div>
          <div className="flex gap-5 flex-wrap justify-center">
            <Link href="/gifts" className="hover:text-[var(--gc-primary)] transition-colors">Gift ideas</Link>
            <Link href="/create" className="hover:text-[var(--gc-primary)] transition-colors">Create draw</Link>
            <Link href="/about" className="hover:text-[var(--gc-primary)] transition-colors">About</Link>
            <Link href="/privacy" className="hover:text-[var(--gc-primary)] transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-[var(--gc-primary)] transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-[var(--gc-primary)] transition-colors">Contact</Link>
          </div>
        </div>
        <div className="max-w-5xl mx-auto mt-5 pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
          style={{ borderColor: "var(--gc-border)", color: "var(--gc-text-muted)" }}>
          <p>Some gift links may earn us a small commission at no extra cost to you. This is how we keep CheckMyBasket free and ad-free.</p>
          <p className="flex-shrink-0">Made in the UK 🇬🇧 · © 2026 CheckMyBasket</p>
        </div>
      </footer>
    </div>
  );
}
