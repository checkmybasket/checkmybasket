"use client";
import { use, useState } from "react";
import Link from "next/link";
import { Gift, Users, ChevronLeft, ArrowRight, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const MOCK_GROUP = { name:"Marketing Team Secret Santa 2026", mode:"workplace" as const, budget:1500, exchange_date:"2026-12-19", organiser_name:"Priya", member_count:6 };

export default function JoinPage({ params }: { params: Promise<{ invite_code: string }> }) {
  const { invite_code } = use(params); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [step, setStep] = useState<"join"|"onboard">("join");
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [likes, setLikes] = useState("");
  const [dislikes, setDislikes] = useState("");
  const [wishItems, setWishItems] = useState<string[]>([""]);

  function handleJoin() {
    if (!name.trim()) { setNameError("Please enter your name"); return; }
    setNameError(""); toast.success(`Welcome, ${name}!`); setStep("onboard");
  }

  const exchangeDate = MOCK_GROUP.exchange_date
    ? new Date(MOCK_GROUP.exchange_date).toLocaleDateString("en-GB", { day:"numeric", month:"long" }) : null;

  if (step === "onboard") return (
    <div className="min-h-dvh" style={{ background:"var(--gc-bg)" }}>
      <div className="max-w-md mx-auto px-4 py-8 pb-28 space-y-5">
        <div className="rounded-2xl p-4 flex items-center gap-3 animate-scale-in"
          style={{ background:"rgba(27,67,50,0.08)", border:"1px solid rgba(27,67,50,0.15)" }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ background:"var(--gc-primary)", color:"var(--gc-text-inverse)" }}>🎉</div>
          <div>
            <p className="font-semibold text-sm">You&apos;re in, {name}!</p>
            <p className="text-xs" style={{ color:"var(--gc-text-secondary)" }}>While you wait for the draw, help your Secret Santa out:</p>
          </div>
        </div>
        {[
          { title:"Your likes", hint:"Hobbies, interests, things you love", ph:"e.g. Coffee, hiking, 90s films, plants...", val:likes, set:setLikes, ta:true },
          { title:"Things to avoid", hint:"Allergies, dislikes, things you have plenty of", ph:"e.g. No candles, allergic to nuts...", val:dislikes, set:setDislikes, ta:true },
        ].map(({ title, hint, ph, val, set }) => (
          <div key={title} className="rounded-2xl p-5 animate-fade-up" style={{ background:"var(--gc-surface)", border:"1px solid var(--gc-border)", boxShadow:"var(--shadow-sm)" }}>
            <h2 className="font-semibold mb-1">{title}</h2>
            <p className="text-sm mb-3" style={{ color:"var(--gc-text-muted)" }}>{hint}</p>
            <Textarea placeholder={ph} value={val} onChange={e => set(e.target.value)} className="min-h-[72px] rounded-xl text-base resize-none" style={{ borderColor:"var(--gc-border-strong)" }}/>
          </div>
        ))}
        <div className="rounded-2xl p-5 animate-fade-up animate-delay-200" style={{ background:"var(--gc-surface)", border:"1px solid var(--gc-border)", boxShadow:"var(--shadow-sm)" }}>
          <h2 className="font-semibold mb-1">Wishlist items</h2>
          <p className="text-sm mb-3" style={{ color:"var(--gc-text-muted)" }}>Add links from any shop</p>
          <div className="space-y-2">
            {wishItems.map((item, idx) => (
              <div key={idx} className="flex gap-2">
                <Input placeholder="e.g. Heated blanket..." value={item}
                  onChange={e => { const n=[...wishItems]; n[idx]=e.target.value; setWishItems(n); }}
                  className="h-11 text-base rounded-xl flex-1" style={{ borderColor:"var(--gc-border-strong)" }}/>
                {wishItems.length>1 && (
                  <Button variant="ghost" size="sm" className="h-11 w-11 p-0 rounded-xl"
                    onClick={() => setWishItems(wishItems.filter((_,i)=>i!==idx))} aria-label="Remove">
                    <Trash2 size={16} strokeWidth={1.5} style={{ color:"var(--gc-text-muted)" }}/>
                  </Button>
                )}
              </div>
            ))}
            <Button variant="ghost" onClick={() => setWishItems([...wishItems,""])} className="h-10 text-sm rounded-xl w-full" style={{ color:"var(--gc-primary)" }}>
              <Plus size={16} strokeWidth={1.5} className="mr-1"/> Add another item
            </Button>
          </div>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 z-20 px-4 pt-4 border-t safe-bottom" style={{ background:"var(--gc-bg)", borderColor:"var(--gc-border)" }}>
        <div className="max-w-md mx-auto flex gap-3">
          <Button variant="outline" size="lg" onClick={() => { window.location.href="/g/demo-group-id"; }} className="h-12 flex-1 rounded-xl" style={{ borderColor:"var(--gc-border-strong)" }}>
            Skip for now
          </Button>
          <Button size="lg" onClick={() => { toast.success("Saved"); window.location.href="/g/demo-group-id"; }} className="h-12 flex-1 rounded-xl font-semibold" style={{ background:"var(--gc-primary)", color:"var(--gc-text-inverse)" }}>
            Save and go <ArrowRight size={16} strokeWidth={1.5} className="ml-1"/>
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh flex flex-col" style={{ background:"var(--gc-bg)" }}>
      <header className="sticky top-0 z-30 border-b" style={{ borderColor:"var(--gc-border)", background:"rgba(255,248,240,0.92)", backdropFilter:"blur(12px)" }}>
        <div className="max-w-md mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/"><Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-lg"><ChevronLeft size={20} strokeWidth={1.5}/></Button></Link>
          <div className="flex items-center gap-2" style={{ color:"var(--gc-primary)" }}>
            <Gift size={20} strokeWidth={1.5}/><span className="font-semibold" style={{ fontFamily:"var(--font-fraunces)" }}>CheckMyBasket</span>
          </div>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-5">
          <div className="rounded-2xl p-6 animate-scale-in" style={{ background:"var(--gc-surface)", border:"1px solid var(--gc-border)", boxShadow:"var(--shadow-lg)" }}>
            <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium mb-4"
              style={{ background:"rgba(27,67,50,0.08)", color:"var(--gc-primary)" }}>
              <Gift size={12} strokeWidth={1.5}/> {MOCK_GROUP.mode.charAt(0).toUpperCase()+MOCK_GROUP.mode.slice(1)} Secret Santa
            </div>
            <h1 className="text-xl font-bold mb-1" style={{ fontFamily:"var(--font-fraunces)" }}>{MOCK_GROUP.name}</h1>
            <p className="text-sm mb-4" style={{ color:"var(--gc-text-secondary)" }}>Created by {MOCK_GROUP.organiser_name}</p>
            <div className="flex gap-4 flex-wrap">
              <div className="flex items-center gap-1.5 text-sm" style={{ color:"var(--gc-text-secondary)" }}>
                <Users size={14} strokeWidth={1.5}/> {MOCK_GROUP.member_count} people joined
              </div>
              <div className="text-sm font-medium" style={{ color:"var(--gc-primary)" }}>Budget: £{MOCK_GROUP.budget/100}</div>
              {exchangeDate && <div className="text-sm" style={{ color:"var(--gc-text-secondary)" }}>{exchangeDate}</div>}
            </div>
          </div>
          <div className="rounded-2xl p-6 animate-fade-up" style={{ background:"var(--gc-surface)", border:"1px solid var(--gc-border)", boxShadow:"var(--shadow-md)" }}>
            <h2 className="text-lg font-semibold mb-4">Join this Secret Santa</h2>
            <div className="mb-5">
              <Label htmlFor="name" className="text-base font-medium mb-1.5 block">Your name</Label>
              <Input id="name" autoFocus placeholder="What should we call you?" value={name}
                onChange={e => setName(e.target.value)} onKeyDown={e => e.key==="Enter" && handleJoin()}
                className="h-12 text-base rounded-xl" style={{ borderColor:nameError?"var(--gc-error)":"var(--gc-border-strong)" }}/>
              {nameError && <p className="mt-1 text-sm" style={{ color:"var(--gc-error)" }}>{nameError}</p>}
            </div>
            <Button onClick={handleJoin} size="lg" className="w-full h-12 text-base rounded-xl font-semibold" style={{ background:"var(--gc-primary)", color:"var(--gc-text-inverse)" }}>
              Join this Secret Santa <ArrowRight size={18} strokeWidth={1.5} className="ml-2"/>
            </Button>
            <p className="text-center text-xs mt-3" style={{ color:"var(--gc-text-muted)" }}>No account needed. Joining is free.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
