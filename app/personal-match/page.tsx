"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { formatBudget } from "@/lib/utils";

type Match = {
  group_name: string; participant_name: string; recipient_name: string;
  budget_amount: number | null; budget_currency: string; exchange_date: string | null;
  likes: string | null; dislikes: string | null; sizes: string | null;
  wishlist: { title: string; notes: string | null }[];
};
export default function PersonalMatch() {
  const secret = useRef<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [match, setMatch] = useState<Match | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!secret.current) {
      secret.current = new URLSearchParams(window.location.hash.slice(1)).get("token");
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);
  async function reveal() {
    if (busy) return;
    setBusy(true); setError("");
    try {
      if (!secret.current || !/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(secret.current))
        throw new Error("This personal link is unavailable. Ask your organiser to send your personal match link again.");
      const { data, error } = await createClient().rpc("read_guest_match", { p_token: secret.current });
      if (error) throw new Error("Could not load your match. Please try again.");
      if (!data) throw new Error("This personal link has expired or is unavailable. Ask your organiser for your link.");
      setMatch(data as Match);
    } catch (err) { setError(err instanceof Error ? err.message : "Could not load your match."); }
    finally { setBusy(false); }
  }
  return <main className="min-h-dvh bg-[var(--cmb-bg)] px-4 py-12">
    <div className="max-w-md mx-auto rounded-[var(--cmb-radius)] bg-[var(--cmb-surface)] border border-[var(--cmb-border)] p-6 space-y-5">
      <p className="font-semibold text-[var(--cmb-primary)]">CheckMyBasket</p>
      <h1 className="text-2xl font-bold font-display">Your private Secret Santa match</h1>
      {!match ? <>
        <p>Open the personal link your organiser sent you, then reveal your existing match. No email is needed.</p>
        <Button className="w-full min-h-12" disabled={busy} onClick={reveal}>{busy ? "Loading…" : "Reveal my match"}</Button>
      </> : <>
        <p>{match.group_name} · For {match.participant_name}</p>
        <p>You are buying for</p>
        <h2 className="text-3xl font-bold font-display break-words">{match.recipient_name}</h2>
        {match.budget_amount !== null && <p>Budget: {formatBudget(match.budget_amount, match.budget_currency)}</p>}
        {match.exchange_date && <p>Exchange date: {new Date(match.exchange_date + "T12:00:00").toLocaleDateString("en-GB")}</p>}
        {[{label:"Likes",text:match.likes},{label:"Things to avoid",text:match.dislikes},{label:"Sizes",text:match.sizes}].filter(item => item.text).map(item => <div key={item.label}><h3 className="font-semibold">{item.label}</h3><p className="whitespace-pre-wrap break-words">{item.text}</p></div>)}
        {match.wishlist.length > 0 && <div><h3 className="font-semibold">Wishlist ideas</h3><ul className="list-disc pl-5 space-y-2">{match.wishlist.map((wish,index) => <li key={index} className="break-words">{wish.title}{wish.notes && <p>{wish.notes}</p>}</li>)}</ul></div>}
        <p className="text-sm">Your original match is unchanged. This page provides read access to your match and gift ideas.</p>
      </>}
      {error && <p role="alert" className="text-sm">{error}</p>}
      <p className="text-xs text-[var(--cmb-text-secondary)]">Keep your full personal link somewhere private to reopen it. Anyone with it can see this match. Do not share it in the group chat. Links last 90 days from creation; your organiser can renew an expired link.</p>
    </div>
  </main>;
}
