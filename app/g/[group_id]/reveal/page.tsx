"use client";

import { useState } from "react";
import Link from "next/link";
import { Gift, MessageCircle, ShoppingBag, CheckCircle2, Lock, ChevronLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBudget } from "@/lib/utils";
import { toast } from "sonner";

// Mock — in a real app, fetched server-side for the current user only
const MOCK_MATCH = {
  name: "James O'Brien",
  likes: "Coffee, hiking, 90s films, board games, anything spicy",
  dislikes: "Candles (has too many), anything lime-flavoured",
  wishlist: [
    { id: "w1", title: "Coffee subscription box", url: "https://example.com", price: 1800, shop: "Onyx Coffee" },
    { id: "w2", title: "Moleskine notebook — A5, plain", price: 1299, shop: "Amazon" },
    { id: "w3", title: "Nice hot sauce set", price: 1500 },
  ],
  budget: 1500,
  totalMatched: 6,
};

type Stage = "pre" | "animating" | "revealed";

export default function RevealPage() {
  const [stage, setStage] = useState<Stage>("pre");
  const [giftBought, setGiftBought] = useState(false);

  function handleReveal() {
    setStage("animating");
    setTimeout(() => setStage("revealed"), 2600);
  }

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: "var(--gc-bg)" }}>
      {/* Header */}
      <header className="sticky top-0 z-30 border-b" style={{ borderColor: "var(--gc-border)", background: "rgba(255,248,240,0.92)", backdropFilter: "blur(12px)" }}>
        <div className="max-w-xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/g/demo-group-id" aria-label="Back to group">
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-lg">
              <ChevronLeft size={20} strokeWidth={1.5} />
            </Button>
          </Link>
          <div className="flex items-center gap-2" style={{ color: "var(--gc-primary)" }}>
            <Gift size={20} strokeWidth={1.5} />
            <span className="font-semibold" style={{ fontFamily: "var(--font-fraunces)" }}>Your match</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          {stage === "pre" && <PreReveal onReveal={handleReveal} />}
          {stage === "animating" && <AnimatingReveal />}
          {stage === "revealed" && (
            <RevealedScreen
              match={MOCK_MATCH}
              giftBought={giftBought}
              onToggleBought={() => {
                setGiftBought((b) => !b);
                toast.success(giftBought ? "Unmarked as bought" : "Marked as bought — only you can see this");
              }}
            />
          )}
        </div>
      </main>
    </div>
  );
}

function PreReveal({ onReveal }: { onReveal: () => void }) {
  return (
    <div className="text-center animate-fade-in">
      <div
        className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse-warm"
        style={{ background: "var(--gc-primary)", boxShadow: "var(--shadow-xl)" }}
      >
        <Gift size={40} strokeWidth={1.5} style={{ color: "var(--gc-warm)" }} />
      </div>
      <h1 className="text-3xl font-bold mb-3" style={{ fontFamily: "var(--font-fraunces)" }}>
        Ready to find out who you&apos;re buying for?
      </h1>
      <p className="mb-10" style={{ color: "var(--gc-text-secondary)" }}>
        Your match has been made. Tap below to reveal.
      </p>
      <Button
        size="lg"
        onClick={onReveal}
        className="h-14 px-10 text-base rounded-xl font-semibold"
        style={{ background: "var(--gc-primary)", color: "var(--gc-text-inverse)" }}
      >
        Reveal my match
        <ArrowRight size={18} strokeWidth={1.5} className="ml-2" />
      </Button>
      <div className="mt-6 flex items-center gap-2 justify-center text-sm" style={{ color: "var(--gc-text-muted)" }}>
        <Lock size={14} strokeWidth={1.5} />
        <span>Only you can see this</span>
      </div>
    </div>
  );
}

function AnimatingReveal() {
  return (
    <div className="text-center">
      {/* Envelope animation */}
      <div className="relative mx-auto mb-8" style={{ width: 160, height: 120 }}>
        {/* Envelope body */}
        <div
          className="absolute inset-0 rounded-xl flex items-end justify-center pb-4"
          style={{ background: "var(--gc-primary)", boxShadow: "var(--shadow-xl)" }}
        >
          <div
            className="w-full h-1 rounded"
            style={{ background: "rgba(255,248,240,0.2)", margin: "0 16px" }}
          />
        </div>
        {/* Envelope flap (animates open) */}
        <div
          className="absolute top-0 left-0 right-0"
          style={{
            height: "50%",
            background: "var(--gc-primary-light)",
            clipPath: "polygon(0 0, 50% 55%, 100% 0)",
            animation: "envelope-flap 1.2s cubic-bezier(0.68,-0.55,0.265,1.55) 0.8s forwards",
            transformOrigin: "top center",
            borderRadius: "12px 12px 0 0",
          }}
        />
        {/* Card rising from envelope */}
        <div
          className="absolute left-4 right-4 rounded-lg flex items-center justify-center"
          style={{
            background: "#fff",
            boxShadow: "var(--shadow-lg)",
            top: 8,
            bottom: 16,
            animation: "card-rise 1s ease-out 1.4s both",
            zIndex: 10,
          }}
        >
          <Gift size={28} strokeWidth={1.5} style={{ color: "var(--gc-warm)" }} />
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-2 animate-pulse" style={{ fontFamily: "var(--font-fraunces)", color: "var(--gc-text-secondary)" }}>
        Drawing your match...
      </h2>
      <div className="flex justify-center gap-1 mt-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full"
            style={{
              background: "var(--gc-primary)",
              animation: `pulse 0.9s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function RevealedScreen({
  match,
  giftBought,
  onToggleBought,
}: {
  match: typeof MOCK_MATCH;
  giftBought: boolean;
  onToggleBought: () => void;
}) {
  return (
    <div className="animate-fade-in">
      {/* Name reveal */}
      <div
        className="rounded-3xl p-8 text-center mb-6 animate-card-rise"
        style={{ background: "var(--gc-primary)", boxShadow: "var(--shadow-xl)" }}
      >
        <p className="text-sm mb-2" style={{ color: "rgba(255,248,240,0.6)" }}>
          You&apos;re buying for...
        </p>
        <h1
          className="text-4xl font-bold mb-1"
          style={{ fontFamily: "var(--font-fraunces)", color: "var(--gc-text-inverse)" }}
        >
          {match.name}
        </h1>
        <div className="text-3xl my-3" role="img" aria-label="gift">🎁</div>
        <p className="text-sm" style={{ color: "rgba(255,248,240,0.7)" }}>
          Budget: {formatBudget(match.budget)}
        </p>
      </div>

      {/* Trust signals */}
      <div className="space-y-2 mb-6">
        {[
          "Your match is private. Nobody else can see who you picked.",
          "The organiser cannot see individual matches.",
          `All ${match.totalMatched} people matched successfully`,
        ].map((t, i) => (
          <div key={i} className="flex items-center gap-2 text-sm" style={{ color: "var(--gc-text-secondary)" }}>
            <CheckCircle2 size={14} strokeWidth={2} style={{ color: "var(--gc-success)", flexShrink: 0 }} />
            {t}
          </div>
        ))}
      </div>

      {/* Likes / dislikes */}
      {(match.likes || match.dislikes) && (
        <div
          className="rounded-2xl p-5 mb-4"
          style={{ background: "var(--gc-surface)", border: "1px solid var(--gc-border)", boxShadow: "var(--shadow-sm)" }}
        >
          {match.likes && (
            <div className="mb-3">
              <p className="text-xs font-semibold uppercase mb-1" style={{ color: "var(--gc-text-muted)" }}>They like</p>
              <p className="text-sm">{match.likes}</p>
            </div>
          )}
          {match.dislikes && (
            <div>
              <p className="text-xs font-semibold uppercase mb-1" style={{ color: "var(--gc-text-muted)" }}>Avoid</p>
              <p className="text-sm">{match.dislikes}</p>
            </div>
          )}
        </div>
      )}

      {/* Wishlist */}
      {match.wishlist.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-semibold mb-2">{match.name.split(" ")[0]}&apos;s wishlist</p>
          <div className="space-y-2">
            {match.wishlist.map((item) => (
              <div
                key={item.id}
                className="rounded-xl px-4 py-3 flex items-center gap-3"
                style={{ background: "var(--gc-surface)", border: "1px solid var(--gc-border)" }}
              >
                <Gift size={16} strokeWidth={1.5} style={{ color: "var(--gc-primary)", flexShrink: 0 }} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.title}</p>
                  {item.price && (
                    <p className="text-xs" style={{ color: "var(--gc-text-muted)" }}>~{formatBudget(item.price)}</p>
                  )}
                </div>
                {item.url && (
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg" aria-label="View product">
                      <ArrowRight size={14} strokeWidth={1.5} />
                    </Button>
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="space-y-3">
        <Link href="/g/demo-group-id?tab=messages">
          <Button
            variant="outline"
            className="w-full h-12 rounded-xl font-medium"
            style={{ borderColor: "var(--gc-border-strong)" }}
          >
            <MessageCircle size={18} strokeWidth={1.5} className="mr-2" />
            Ask {match.name.split(" ")[0]} a question
          </Button>
        </Link>
        <Link href={`/gifts?budget=${match.budget}`}>
          <Button
            variant="outline"
            className="w-full h-12 rounded-xl font-medium"
            style={{ borderColor: "var(--gc-border-strong)" }}
          >
            <ShoppingBag size={18} strokeWidth={1.5} className="mr-2" />
            Find gifts under {formatBudget(match.budget)}
          </Button>
        </Link>
        <Button
          onClick={onToggleBought}
          className="w-full h-12 rounded-xl font-medium"
          style={{
            background: giftBought ? "var(--gc-success)" : "var(--gc-surface)",
            color: giftBought ? "#fff" : "var(--gc-text-primary)",
            border: `1px solid ${giftBought ? "var(--gc-success)" : "var(--gc-border-strong)"}`,
          }}
        >
          <CheckCircle2 size={18} strokeWidth={giftBought ? 2 : 1.5} className="mr-2" />
          {giftBought ? "Gift marked as bought" : "Mark gift as bought"}
        </Button>
      </div>
    </div>
  );
}
