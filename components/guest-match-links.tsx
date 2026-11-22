"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

type GuestLink = { member_id: string; participant_name: string; token: string; expires_at: string };
export function GuestMatchLinks({ groupId }: { groupId: string }) {
  const [links, setLinks] = useState<GuestLink[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function load() {
    setBusy(true); setMessage("");
    try {
      const { data, error } = await createClient().rpc("get_guest_match_links", { p_group_id: groupId });
      if (error) throw error;
      setLinks(data ?? []);
    } catch { setMessage("Could not load personal match links. Please try again."); }
    finally { setBusy(false); }
  }
  return <section aria-labelledby="guest-match-heading" className="space-y-3 rounded-[var(--cmb-radius)] p-5 bg-[var(--cmb-surface)] border border-[var(--cmb-border)]">
    <h2 id="guest-match-heading" className="font-semibold">Personal match links</h2>
    <p className="text-sm">For people who joined without a recovery email and cannot reopen their match. Send each link privately to the named person. Links show their existing match without changing the draw.</p>
    <p className="text-sm">Anyone with a personal link can see that person&apos;s match, including you. Do not open other people&apos;s links or share them in the group chat.</p>
    <Button variant="outline" onClick={load} disabled={busy}>{busy ? "Loading…" : "Show personal match links"}</Button>
    {links?.length === 0 && <p className="text-sm">No guest participants need a personal match link. Members with email recovery can use Return &amp; sign in.</p>}
    {links?.map(link => {
      const url = `${window.location.origin}/personal-match#token=${link.token}`;
      return <div key={link.member_id} className="space-y-2 border-t border-[var(--cmb-border)] pt-3">
        <label htmlFor={`guest-${link.member_id}`} className="font-medium text-sm">{link.participant_name}</label>
        <Input id={`guest-${link.member_id}`} value={url} readOnly onFocus={event => event.currentTarget.select()} aria-label={`Personal match link for ${link.participant_name}`} />
        <Button variant="outline" onClick={async () => {
          try { await navigator.clipboard.writeText(url); setMessage(`Link copied for ${link.participant_name}. Send it privately to them.`); }
          catch { document.getElementById(`guest-${link.member_id}`)?.focus(); setMessage("Copy the selected personal link manually."); }
        }}>Copy link for {link.participant_name}</Button>
      </div>;
    })}
    {message && <p role="status" className="text-sm">{message}</p>}
  </section>;
}
