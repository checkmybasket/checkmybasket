"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Gift, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { recoveryRequest } from "@/lib/supabase/recovery";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
type Group = { id: string; name: string };
export function ReturnToGroup() {
  const initialLocation = useRef<{ secret: string | null; target: string | undefined } | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [groupId, setGroupId] = useState<string | undefined>();
  const [groups, setGroups] = useState<Group[]>([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    if (!initialLocation.current) {
      const secret = new URLSearchParams(window.location.hash.slice(1)).get("token");
      const requested = new URLSearchParams(window.location.search).get("group");
      const target = requested && uuidPattern.test(requested) ? requested : undefined;
      initialLocation.current = { secret, target };
      // Retain the secret in memory across React's development effect replay,
      // while removing it from the address bar before any requests or links.
      if (window.location.hash) window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
    const { secret, target } = initialLocation.current;
    (async () => {
      try {
        const supabase = createClient();
        const user = await supabase.auth.getUser().then(({ data }) => data.user).catch(() => null);
        if (!active) return;
        setGroupId(target);
        if (secret) { setToken(secret); return; }
        if (!user) return;
        const { data, error: loadError } = await supabase.from("groups").select("id,name").order("created_at", { ascending: false });
        if (loadError) throw loadError;
        if (!active) return;
        if (target && data?.some(group => group.id === target)) { window.location.replace(`/g/${target}`); return; }
        setGroups(data ?? []);
      } catch { if (active) setError("Could not load your groups. You can request a sign-in link below."); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, []);

  async function request(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const reply = await recoveryRequest({ action: "request", email, group_id: groupId });
      setMessage(reply.message ?? "Check your inbox for a sign-in link.");
    } catch (err) { setError(err instanceof Error ? err.message : "Couldn't send a sign-in link."); }
    finally { setBusy(false); }
  }
  async function redeem() {
    if (!token || busy) return;
    setBusy(true); setError("");
    try {
      const reply = await recoveryRequest({ action: "redeem", token });
      if (!reply.access_token || !reply.refresh_token) throw new Error("Couldn't restore your session. Request a new link.");
      const { error: sessionError } = await createClient().auth.setSession({ access_token: reply.access_token, refresh_token: reply.refresh_token });
      if (sessionError) throw new Error("Couldn't save your sign-in. Enable browser cookies and request a new link.");
      const target = reply.group_id && uuidPattern.test(reply.group_id) ? `/g/${reply.group_id}` : "/return";
      window.location.replace(target);
    } catch (err) {
      setError(err instanceof Error ? err.message : "This link could not be used. Request a new one.");
      setToken(null); setBusy(false);
    }
  }
  return (
    <main className="min-h-dvh flex items-center justify-center px-4 py-12 bg-[var(--cmb-bg)]">
      <div className="w-full max-w-md rounded-2xl bg-[var(--cmb-surface)] border border-[var(--cmb-border)] p-6 sm:p-8">
        <Link href="/" className="flex gap-2 items-center font-semibold text-[var(--cmb-primary)] mb-6"><Gift size={20} aria-hidden />CheckMyBasket</Link>
        <h1 className="text-2xl font-bold font-display mb-3">Return to your group</h1>
        {loading ? <p role="status">Checking your access…</p> : token ? <>
          <p className="text-sm mb-5 text-[var(--cmb-text-secondary)]">Continue to verify your email or sign in as the member who requested this link. This replaces any CheckMyBasket sign-in currently open in this browser.</p>
          <Button onClick={redeem} disabled={busy} className="w-full h-12 rounded-xl">{busy ? "Opening your group…" : "Continue to my group"}</Button>
          <p className="text-xs mt-3 text-[var(--cmb-text-muted)]">Only continue if you requested this email. Links expire after 15 minutes and work once.</p>
        </> : <>
          {groups.length > 0 && <section className="mb-6" aria-label="Your groups">
            <p className="text-sm mb-3 text-[var(--cmb-text-secondary)]">Your groups in this browser:</p>
            <ul className="space-y-2">{groups.map(group => <li key={group.id}><Link href={`/g/${group.id}`} className="block rounded-xl border border-[var(--cmb-border)] p-3 font-medium underline underline-offset-4">{group.name}</Link></li>)}</ul>
          </section>}
          <p className="text-sm mb-5 text-[var(--cmb-text-secondary)]">Enter the email you verified for group access. We&apos;ll send a private sign-in link. No password needed.</p>
          <form onSubmit={request} className="space-y-3">
            <Label htmlFor="recovery-email">Your verified email</Label>
            <Input id="recovery-email" type="email" required maxLength={254} autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
            <Button type="submit" disabled={busy} className="w-full h-12 rounded-xl"><Mail size={16} className="mr-2" aria-hidden />{busy ? "Sending…" : "Email me a sign-in link"}</Button>
          </form>
          <p className="text-xs mt-4 text-[var(--cmb-text-muted)]">Saved a notification email but haven&apos;t verified it? Open your group in the original browser and choose &ldquo;Save access to your group&rdquo;. Without a verified email, we can&apos;t restore your original member identity on another device.</p>
        </>}
        {message && <p role="status" className="text-sm mt-4 text-[var(--cmb-primary)]">{message}</p>}
        {error && <p role="alert" className="text-sm mt-4 text-[var(--cmb-error)]">{error}</p>}
      </div>
    </main>
  );
}
