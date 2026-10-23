"use client";
import { userError } from "@/lib/user-errors";

import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { recoveryRequest } from "@/lib/supabase/recovery";

type Status = { email: string | null; verified_email: string | null; state: "off" | "pending" | "verified" };
export function NotificationEmail({ groupId }: { groupId: string }) {
  const id = useId();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    const refresh = async (initial: boolean) => {
      const { data, error } = await createClient().rpc("get_notification_status");
      if (!active) return;
      if (error) { setError("Could not check notification settings. Please refresh and try again."); return; }
      setStatus(data as Status);
      if (initial) setEmail(data.email ?? "");
    };
    void refresh(true);
    const focus = () => { void refresh(false); };
    window.addEventListener("focus", focus);
    return () => { active = false; window.removeEventListener("focus", focus); };
  }, [groupId]);

  async function save(value: string) {
    if (busy) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const { error } = await createClient().rpc("set_my_email", { p_email: value.trim() });
      if (error) throw error;
      const reply = await createClient().rpc("get_notification_status");
      if (reply.error) throw reply.error;
      setStatus(reply.data as Status); setEmail(reply.data.email ?? "");
      setMessage(reply.data.state === "off" ? "Draw notifications are off. Your sign-in recovery is unchanged." : reply.data.state === "verified" ? "Saved and verified for future draw notifications." : "Address saved. Verify ownership before draw notifications can be sent.");
    } catch (err) { setError(userError(err, "save notification settings")); }
    finally { setBusy(false); }
  }
  async function verify() {
    if (busy || !status?.email) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const reply = await recoveryRequest({ action: "setup", email: status.email, group_id: groupId });
      setMessage(reply.message ?? "Check your inbox and open the verification link to confirm this email.");
    } catch (err) { setError(userError(err, "request email verification")); }
    finally { setBusy(false); }
  }
  const unsaved = email.trim().toLowerCase() !== (status?.email ?? "").toLowerCase();
  return <section className="rounded-[var(--cmb-radius)] p-5 mt-6 bg-[var(--cmb-surface)] border border-[var(--cmb-border)]" aria-labelledby={`${id}-title`}>
    <h2 id={`${id}-title`} className="font-semibold text-sm mb-2">Optional draw notification email</h2>
    <p className="text-xs mb-3 text-[var(--cmb-text-secondary)]">Email is optional. Save and verify an address for future draws across your groups, or turn notifications off. Neither action changes your matches or sends an email for this draw.</p>
    <form onSubmit={event => { event.preventDefault(); void save(email); }} className="space-y-3">
      <Label htmlFor={`${id}-email`}>Notification email</Label>
      <Input id={`${id}-email`} type="email" maxLength={254} autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} disabled={busy || !status} aria-describedby={`${id}-state`} placeholder="you@example.com" />
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={busy || !status}>{busy ? "Working…" : "Save address"}</Button>
        <Button type="button" variant="outline" disabled={busy || !status || status.state === "off"} onClick={() => { void save(""); }}>Turn off notifications</Button>
      </div>
    </form>
    <p id={`${id}-state`} role="status" className="text-sm mt-3">
      {!status ? "Checking notification settings…" : unsaved ? "You have unsaved changes." : status.state === "off" ? "Notifications are off." : status.state === "verified" ? "Your saved notification address is verified." : "Your saved address is awaiting verification. No draw emails will be sent to it yet."}
    </p>
    {status?.state === "pending" && !unsaved && (status.verified_email ? <div className="mt-3 space-y-2">
      <p className="text-xs">This identity already has a verified sign-in email. Use it for notifications; contact us if you need to change your sign-in address.</p>
      <Button type="button" variant="outline" disabled={busy} onClick={() => { void save(status.verified_email!); }}>Use verified email</Button>
    </div> : <Button type="button" variant="outline" className="mt-3" disabled={busy} onClick={() => { void verify(); }}>Verify email and save access</Button>)}
    <p className="text-xs mt-3 text-[var(--cmb-text-muted)]">Verification also enables password-free access on another device. Group features remain available without email. Opting out stops new delivery claims; emails already handed to the provider cannot be recalled.</p>
    {message && <p role="status" className="text-sm mt-3">{message}</p>}
    {error && <p role="alert" className="text-sm mt-3 text-[var(--cmb-error)]">{error}</p>}
  </section>;
}
