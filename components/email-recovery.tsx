"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { recoveryRequest } from "@/lib/supabase/recovery";

export function EmailRecovery({ groupId }: { groupId: string }) {
  const id = useId();
  const [email, setEmail] = useState("");
  const [verified, setVerified] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    Promise.all([recoveryRequest({ action: "status" }), createClient().rpc("get_my_email")])
      .then(([status, saved]) => {
        if (!active) return;
        setVerified(status.verified_email ?? null);
        if (typeof saved.data === "string") setEmail(saved.data);
      }).catch(() => { if (active) setError("Could not check email recovery. You can still request a verification link below."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [groupId]);

  async function setup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const reply = await recoveryRequest({ action: "setup", email, group_id: groupId });
      setMessage(reply.message ?? "Check your inbox for your verification link.");
      if (reply.verified_email) setVerified(reply.verified_email);
    } catch (err) { setError(err instanceof Error ? err.message : "Couldn't send the verification email."); }
    finally { setBusy(false); }
  }
  if (loading) return null;
  return (
    <section className="rounded-2xl p-5 mt-6 mb-6 bg-[var(--cmb-surface)] border border-[var(--cmb-border)]" aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className="font-semibold text-sm flex gap-2 items-center mb-2">
        {verified ? <CheckCircle2 size={16} aria-hidden /> : <Mail size={16} aria-hidden />} Save access to your group
      </h2>
      {verified ? <>
        <p className="text-sm text-[var(--cmb-text-secondary)] break-words">Email recovery is enabled for <strong>{verified}</strong>.</p>
        <p className="text-xs mt-2 text-[var(--cmb-text-muted)]">On another device, choose <Link href={`/return?group=${groupId}`} className="underline">Return to your group</Link> and request a sign-in link. Your notification email is managed separately.</p>
      </> : <>
        <p className="text-sm mb-3 text-[var(--cmb-text-secondary)]">Verify an email to reopen your groups, wishlists and private match on another device. Optional, with no password.</p>
        <form onSubmit={setup} className="space-y-3">
          <Label htmlFor={`${id}-email`}>Email for signing in</Label>
          <Input id={`${id}-email`} type="email" autoComplete="email" required maxLength={254} value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" aria-describedby={`${id}-help`} />
          <Button type="submit" disabled={busy} className="w-full rounded-xl h-11">{busy ? "Sending…" : message ? "Send another verification link" : "Verify email and save access"}</Button>
          <p id={`${id}-help`} className="text-xs text-[var(--cmb-text-muted)]">Your email stays private from your group. This enables sign-in for all groups you joined with this member identity. <Link href="/privacy" className="underline">Privacy policy</Link></p>
        </form>
      </>}
      {message && <p role="status" className="text-sm mt-3 text-[var(--cmb-primary)]">{message}</p>}
      {error && <p role="alert" className="text-sm mt-3 text-[var(--cmb-error)]">{error}</p>}
    </section>
  );
}
