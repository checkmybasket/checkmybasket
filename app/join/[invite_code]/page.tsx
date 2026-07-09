"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Gift, Users, ChevronLeft, ArrowRight, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { ensureSession } from "@/lib/supabase/auth";
import type { GroupMode, DrawStatus } from "@/lib/types";

interface GroupPreview {
  group_id: string;
  name: string;
  mode: GroupMode;
  budget_amount: number | null;
  exchange_date: string | null;
  draw_status: DrawStatus;
  member_count: number;
  organiser_name: string | null;
}

export default function JoinPage({ params }: { params: Promise<{ invite_code: string }> }) {
  const { invite_code } = use(params);
  const router = useRouter();
  const [group, setGroup] = useState<GroupPreview | null>(null);
  const [loadState, setLoadState] = useState<"loading"|"ready"|"notfound">("loading");
  const [step, setStep] = useState<"join"|"onboard">("join");
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [likes, setLikes] = useState("");
  const [dislikes, setDislikes] = useState("");
  const [wishItems, setWishItems] = useState<string[]>([""]);

  useEffect(() => {
    const supabase = createClient();
    supabase.rpc("get_group_preview", { p_invite_code: invite_code }).then(({ data, error }) => {
      if (error || !data) { setLoadState("notfound"); return; }
      setGroup(data as GroupPreview);
      setLoadState("ready");
    });
  }, [invite_code]);

  async function handleJoin() {
    if (!name.trim()) { setNameError("Please enter your name"); return; }
    if (busy || !group) return;
    setNameError(""); setBusy(true);
    try {
      await ensureSession();
      const supabase = createClient();
      const { error } = await supabase.rpc("join_group", { p_invite_code: invite_code, p_name: name });
      if (error) throw new Error(error.message);
      toast.success(`Welcome, ${name.trim()}!`);
      setStep("onboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not join — please try again");
    } finally {
      setBusy(false);
    }
  }

  async function saveOnboarding() {
    if (busy || !group) return;
    setBusy(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Session expired — please rejoin");
      if (likes.trim() || dislikes.trim()) {
        const { error } = await supabase.from("group_members")
          .update({ likes: likes.trim() || null, dislikes: dislikes.trim() || null })
          .eq("group_id", group.group_id).eq("user_id", user.id);
        if (error) throw new Error(error.message);
      }
      const items = wishItems.map(t => t.trim()).filter(Boolean);
      if (items.length) {
        const { error } = await supabase.from("wishlist_items")
          .insert(items.map(title => ({ title, user_id: user.id, group_id: group.group_id })));
        if (error) throw new Error(error.message);
      }
      toast.success("Saved");
      router.push(`/g/${group.group_id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save — please try again");
      setBusy(false);
    }
  }

  const exchangeDate = group?.exchange_date
    ? new Date(group.exchange_date).toLocaleDateString("en-GB", { day:"numeric", month:"long" }) : null;

  if (loadState === "loading") return (
    <div className="min-h-dvh flex items-center justify-center" style={{ background:"var(--gc-bg)" }}>
      <div className="w-full max-w-md px-4 space-y-4">
        <div className="rounded-2xl h-40 skeleton" />
        <div className="rounded-2xl h-56 skeleton" />
      </div>
    </div>
  );

  if (loadState === "notfound" || !group) return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 text-center" style={{ background:"var(--gc-bg)" }}>
      <Gift size={40} strokeWidth={1.5} className="mb-4" style={{ color:"var(--gc-text-muted)" }} />
      <h1 className="text-xl font-bold mb-2" style={{ fontFamily:"var(--font-fraunces)" }}>Invite link not recognised</h1>
      <p className="text-sm mb-6 max-w-sm" style={{ color:"var(--gc-text-secondary)" }}>
        Double-check the link you were sent, or ask your organiser to share it again.
      </p>
      <Link href="/"><Button variant="outline" className="rounded-xl h-11 px-6" style={{ borderColor:"var(--gc-border-strong)" }}>Back to home</Button></Link>
    </div>
  );

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
          <Button variant="outline" size="lg" disabled={busy} onClick={() => router.push(`/g/${group.group_id}`)} className="h-12 flex-1 rounded-xl" style={{ borderColor:"var(--gc-border-strong)" }}>
            Skip for now
          </Button>
          <Button size="lg" disabled={busy} onClick={saveOnboarding} className="h-12 flex-1 rounded-xl font-semibold" style={{ background:"var(--gc-primary)", color:"var(--gc-text-inverse)" }}>
            {busy ? "Saving…" : <>Save and go <ArrowRight size={16} strokeWidth={1.5} className="ml-1"/></>}
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
              <Gift size={12} strokeWidth={1.5}/> {group.mode.charAt(0).toUpperCase()+group.mode.slice(1)} Secret Santa
            </div>
            <h1 className="text-xl font-bold mb-1" style={{ fontFamily:"var(--font-fraunces)" }}>{group.name}</h1>
            {group.organiser_name && <p className="text-sm mb-4" style={{ color:"var(--gc-text-secondary)" }}>Created by {group.organiser_name}</p>}
            <div className="flex gap-4 flex-wrap">
              <div className="flex items-center gap-1.5 text-sm" style={{ color:"var(--gc-text-secondary)" }}>
                <Users size={14} strokeWidth={1.5}/> {group.member_count} {group.member_count === 1 ? "person" : "people"} joined
              </div>
              {group.budget_amount != null && <div className="text-sm font-medium" style={{ color:"var(--gc-primary)" }}>Budget: £{group.budget_amount/100}</div>}
              {exchangeDate && <div className="text-sm" style={{ color:"var(--gc-text-secondary)" }}>{exchangeDate}</div>}
            </div>
          </div>
          <div className="rounded-2xl p-6 animate-fade-up" style={{ background:"var(--gc-surface)", border:"1px solid var(--gc-border)", boxShadow:"var(--shadow-md)" }}>
            <h2 className="text-lg font-semibold mb-4">Join this Secret Santa</h2>
            {group.draw_status !== "pending" ? (
              <p className="text-sm" style={{ color:"var(--gc-text-secondary)" }}>
                Names have already been drawn for this group. If you&apos;re already a member,{" "}
                <Link href={`/g/${group.group_id}`} className="underline" style={{ color:"var(--gc-primary)" }}>open your group</Link>.
              </p>
            ) : (
              <>
                <div className="mb-5">
                  <Label htmlFor="name" className="text-base font-medium mb-1.5 block">Your name</Label>
                  <Input id="name" autoFocus placeholder="What should we call you?" value={name}
                    onChange={e => setName(e.target.value)} onKeyDown={e => e.key==="Enter" && handleJoin()}
                    className="h-12 text-base rounded-xl" style={{ borderColor:nameError?"var(--gc-error)":"var(--gc-border-strong)" }}/>
                  {nameError && <p className="mt-1 text-sm" style={{ color:"var(--gc-error)" }}>{nameError}</p>}
                </div>
                <Button onClick={handleJoin} disabled={busy} size="lg" className="w-full h-12 text-base rounded-xl font-semibold" style={{ background:"var(--gc-primary)", color:"var(--gc-text-inverse)" }}>
                  {busy ? "Joining…" : <>Join this Secret Santa <ArrowRight size={18} strokeWidth={1.5} className="ml-2"/></>}
                </Button>
                <p className="text-center text-xs mt-3" style={{ color:"var(--gc-text-muted)" }}>No account needed. Joining is free.</p>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
