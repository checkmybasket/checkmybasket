"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Gift, MessageCircle, ShoppingBag, CheckCircle2, Lock, ChevronLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBudget } from "@/lib/utils";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

interface Match {
  drawId: string;
  name: string;
  likes: string | null;
  dislikes: string | null;
  sizes: string | null;
  wishlist: { id:string; title:string; url:string|null; price:number|null; shop_name:string|null }[];
  budget: number | null;
  totalMatched: number;
  giftBought: boolean;
}

type Stage = "loading" | "nodraw" | "pre" | "animating" | "revealed";

export default function RevealPage({ params }: { params: Promise<{ group_id: string }> }) {
  const { group_id } = use(params);
  const [stage, setStage] = useState<Stage>("loading");
  const [match, setMatch] = useState<Match | null>(null);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setStage("nodraw"); return; }

      const { data: draw } = await supabase.from("draws")
        .select("id,recipient_id,gift_bought").eq("group_id", group_id).maybeSingle();
      if (!draw) { setStage("nodraw"); return; }

      const [{ data: group }, { data: member }, { data: wishlist }, { count }] = await Promise.all([
        supabase.from("groups").select("budget_amount").eq("id", group_id).maybeSingle(),
        supabase.from("group_members").select("name,likes,dislikes,sizes").eq("group_id", group_id).eq("user_id", draw.recipient_id).maybeSingle(),
        supabase.from("wishlist_items").select("id,title,url,price,shop_name").eq("group_id", group_id).eq("user_id", draw.recipient_id).order("created_at"),
        // draws rows are giver-visible only, so count members for "All N matched"
        supabase.from("group_members").select("id", { count: "exact", head: true }).eq("group_id", group_id),
      ]);

      setMatch({
        drawId: draw.id,
        name: member?.name ?? "Your match",
        likes: member?.likes ?? null,
        dislikes: member?.dislikes ?? null,
        sizes: member?.sizes ?? null,
        wishlist: wishlist ?? [],
        budget: group?.budget_amount ?? null,
        totalMatched: count ?? 0,
        giftBought: draw.gift_bought,
      });
      setStage("pre");
    })();
  }, [group_id]);

  function handleReveal() {
    setStage("animating");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setTimeout(() => setStage("revealed"), reduced ? 300 : 2600);
  }

  async function toggleBought() {
    if (!match) return;
    const supabase = createClient();
    const next = !match.giftBought;
    const { error } = await supabase.from("draws").update({ gift_bought: next }).eq("id", match.drawId);
    if (error) { toast.error(error.message); return; }
    setMatch(m => m ? { ...m, giftBought: next } : m);
    toast.success(next ? "Marked as bought — only you can see this" : "Unmarked as bought");
  }

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: "var(--cmb-bg)" }}>
      {/* Header */}
      <header className="sticky top-0 z-30 border-b" style={{ borderColor: "var(--cmb-border)", background: "rgba(255,248,240,0.92)", backdropFilter: "blur(12px)" }}>
        <div className="max-w-xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href={`/g/${group_id}`} aria-label="Back to group">
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-lg">
              <ChevronLeft size={20} strokeWidth={1.5} />
            </Button>
          </Link>
          <div className="flex items-center gap-2" style={{ color: "var(--cmb-primary)" }}>
            <Gift size={20} strokeWidth={1.5} />
            <span className="font-semibold" style={{ fontFamily: "var(--font-fraunces)" }}>Your match</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          {stage === "loading" && <div className="rounded-3xl h-64 skeleton" />}
          {stage === "nodraw" && (
            <div className="text-center">
              <Lock size={36} strokeWidth={1.5} className="mx-auto mb-4" style={{ color: "var(--cmb-text-muted)" }} />
              <h1 className="text-xl font-bold mb-2" style={{ fontFamily: "var(--font-fraunces)" }}>No match to show yet</h1>
              <p className="text-sm mb-6" style={{ color: "var(--cmb-text-secondary)" }}>
                Either names haven&apos;t been drawn, or you joined after the draw.
              </p>
              <Link href={`/g/${group_id}`}>
                <Button variant="outline" className="rounded-xl h-11 px-6" style={{ borderColor: "var(--cmb-border-strong)" }}>Back to group</Button>
              </Link>
            </div>
          )}
          {stage === "pre" && <PreReveal onReveal={handleReveal} />}
          {stage === "animating" && <AnimatingReveal />}
          {stage === "revealed" && match && (
            <RevealedScreen groupId={group_id} match={match} onToggleBought={toggleBought} />
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
        style={{ background: "var(--cmb-primary)", boxShadow: "var(--shadow-xl)" }}
      >
        <Gift size={40} strokeWidth={1.5} style={{ color: "var(--cmb-warm)" }} />
      </div>
      <h1 className="text-3xl font-bold mb-3" style={{ fontFamily: "var(--font-fraunces)" }}>
        Ready to find out who you&apos;re buying for?
      </h1>
      <p className="mb-10" style={{ color: "var(--cmb-text-secondary)" }}>
        Your match has been made. Tap below to reveal.
      </p>
      <Button
        size="lg"
        onClick={onReveal}
        className="h-14 px-10 text-base rounded-xl font-semibold"
        style={{ background: "var(--cmb-primary)", color: "var(--cmb-text-inverse)" }}
      >
        Reveal my match
        <ArrowRight size={18} strokeWidth={1.5} className="ml-2" />
      </Button>
      <div className="mt-6 flex items-center gap-2 justify-center text-sm" style={{ color: "var(--cmb-text-muted)" }}>
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
          style={{ background: "var(--cmb-primary)", boxShadow: "var(--shadow-xl)" }}
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
            background: "var(--cmb-primary-light)",
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
          <Gift size={28} strokeWidth={1.5} style={{ color: "var(--cmb-warm)" }} />
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-2 animate-pulse" style={{ fontFamily: "var(--font-fraunces)", color: "var(--cmb-text-secondary)" }}>
        Drawing your match...
      </h2>
      <div className="flex justify-center gap-1 mt-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full"
            style={{
              background: "var(--cmb-primary)",
              animation: `pulse 0.9s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function RevealedScreen({
  groupId,
  match,
  onToggleBought,
}: {
  groupId: string;
  match: Match;
  onToggleBought: () => void;
}) {
  const firstName = match.name.split(" ")[0];
  return (
    <div className="animate-fade-in">
      {/* Name reveal */}
      <div
        className="rounded-3xl p-8 text-center mb-6 animate-card-rise"
        style={{ background: "var(--cmb-primary)", boxShadow: "var(--shadow-xl)" }}
      >
        <p className="text-sm mb-2" style={{ color: "rgba(255,248,240,0.6)" }}>
          You&apos;re buying for...
        </p>
        <h1
          className="text-4xl font-bold mb-1"
          style={{ fontFamily: "var(--font-fraunces)", color: "var(--cmb-text-inverse)" }}
        >
          {match.name}
        </h1>
        <div className="text-3xl my-3" role="img" aria-label="gift">🎁</div>
        {match.budget != null && (
          <p className="text-sm" style={{ color: "rgba(255,248,240,0.7)" }}>
            Budget: {formatBudget(match.budget)}
          </p>
        )}
      </div>

      {/* Trust signals */}
      <div className="space-y-2 mb-6">
        {[
          "Your match is private. Nobody else can see who you picked.",
          "The organiser cannot see individual matches.",
          `All ${match.totalMatched} people matched successfully`,
        ].map((t, i) => (
          <div key={i} className="flex items-center gap-2 text-sm" style={{ color: "var(--cmb-text-secondary)" }}>
            <CheckCircle2 size={14} strokeWidth={2} style={{ color: "var(--cmb-success)", flexShrink: 0 }} />
            {t}
          </div>
        ))}
      </div>

      {/* Likes / dislikes / sizes */}
      {(match.likes || match.dislikes || match.sizes) && (
        <div
          className="rounded-2xl p-5 mb-4"
          style={{ background: "var(--cmb-surface)", border: "1px solid var(--cmb-border)", boxShadow: "var(--shadow-sm)" }}
        >
          {match.likes && (
            <div className="mb-3">
              <p className="text-xs font-semibold uppercase mb-1" style={{ color: "var(--cmb-text-muted)" }}>They like</p>
              <p className="text-sm">{match.likes}</p>
            </div>
          )}
          {match.dislikes && (
            <div className="mb-3 last:mb-0">
              <p className="text-xs font-semibold uppercase mb-1" style={{ color: "var(--cmb-text-muted)" }}>Avoid</p>
              <p className="text-sm">{match.dislikes}</p>
            </div>
          )}
          {match.sizes && (
            <div>
              <p className="text-xs font-semibold uppercase mb-1" style={{ color: "var(--cmb-text-muted)" }}>Sizes</p>
              <p className="text-sm">{match.sizes}</p>
            </div>
          )}
        </div>
      )}

      {/* Wishlist */}
      {match.wishlist.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-semibold mb-2">{firstName}&apos;s wishlist</p>
          <div className="space-y-2">
            {match.wishlist.map((item) => (
              <div
                key={item.id}
                className="rounded-xl px-4 py-3 flex items-center gap-3"
                style={{ background: "var(--cmb-surface)", border: "1px solid var(--cmb-border)" }}
              >
                <Gift size={16} strokeWidth={1.5} style={{ color: "var(--cmb-primary)", flexShrink: 0 }} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.title}</p>
                  {item.price != null && (
                    <p className="text-xs" style={{ color: "var(--cmb-text-muted)" }}>~{formatBudget(item.price)}</p>
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
        <Link href={`/g/${groupId}`}>
          <Button
            variant="outline"
            className="w-full h-12 rounded-xl font-medium"
            style={{ borderColor: "var(--cmb-border-strong)" }}
          >
            <MessageCircle size={18} strokeWidth={1.5} className="mr-2" />
            Ask {firstName} a question
          </Button>
        </Link>
        <Link href={match.budget != null ? `/gifts?budget=${match.budget}` : "/gifts"}>
          <Button
            variant="outline"
            className="w-full h-12 rounded-xl font-medium"
            style={{ borderColor: "var(--cmb-border-strong)" }}
          >
            <ShoppingBag size={18} strokeWidth={1.5} className="mr-2" />
            {match.budget != null ? `Find gifts under ${formatBudget(match.budget)}` : "Browse gift ideas"}
          </Button>
        </Link>
        <Button
          onClick={onToggleBought}
          className="w-full h-12 rounded-xl font-medium"
          style={{
            background: match.giftBought ? "var(--cmb-success)" : "var(--cmb-surface)",
            color: match.giftBought ? "#fff" : "var(--cmb-text-primary)",
            border: `1px solid ${match.giftBought ? "var(--cmb-success)" : "var(--cmb-border-strong)"}`,
          }}
        >
          <CheckCircle2 size={18} strokeWidth={match.giftBought ? 2 : 1.5} className="mr-2" />
          {match.giftBought ? "Gift marked as bought" : "Mark gift as bought"}
        </Button>
      </div>
    </div>
  );
}
