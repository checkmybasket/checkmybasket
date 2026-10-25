"use client";
import { useCallback, useEffect, useId, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { userError } from "@/lib/user-errors";
import { panel, secondary } from "./shell";

export function WishlistReminders(
  { id, eventDate }: { id: string; eventDate: string | null },
) {
  const heading = useId();
  const [enabled, setEnabled] = useState(false);
  const [yearly, setYearly] = useState(false);
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const load = useCallback(async () => {
    const { data, error } = await createClient().rpc(
      "wishlist_reminder_settings",
      { p_id: id },
    );
    if (error || !data) throw new Error("Could not load reminder settings.");
    setEnabled(data.enabled);
    setYearly(data.yearly);
    setVerified(data.verified);
    setLoading(false);
    setError("");
  }, [id]);
  useEffect(() => {
    Promise.resolve().then(load).catch(() => {
      setLoading(false);
      setError("Could not load reminder settings. Try checking again.");
    });
  }, [load]);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      if (enabled && (!verified || !eventDate)) {
        throw new Error(
          "Add an occasion date in Edit list and verify your email below before turning reminders on.",
        );
      }
      const { error } = await createClient().rpc("set_wishlist_reminders", {
        p_id: id,
        p_enabled: enabled,
        p_yearly: yearly,
      });
      if (error) throw error;
      setMessage(
        enabled
          ? "Reminders saved. We’ll email your verified recovery address before and after this occasion."
          : "Reminders are off for this wishlist.",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : userError(err, "save reminder settings"),
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className={`${panel} mt-6`} aria-labelledby={heading}>
      <h2 id={heading} className="text-xl font-semibold">Occasion reminders</h2>
      <p className="text-sm mt-2">
        One email 21 days before your occasion to review your wishes, and one 3
        days afterwards to mark gifts received. No purchase details are
        included. Off until you choose them.
      </p>
      {loading
        ? <p role="status" className="mt-3 text-sm">Checking reminders…</p>
        : (
          <form onSubmit={save} className="space-y-3 mt-4">
            {!eventDate && (
              <p className="text-sm">
                Add an occasion date using Edit list first.
              </p>
            )}
            {!verified && (
              <p className="text-sm">
                Verify your recovery email below, then choose Check email
                status. Email stays private.
              </p>
            )}
            <label className="flex items-center gap-3 min-h-11 text-sm">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                disabled={busy}
              />Email me before and after this occasion
            </label>
            <label className="flex items-center gap-3 min-h-11 text-sm">
              <input
                type="checkbox"
                checked={yearly}
                onChange={(e) => setYearly(e.target.checked)}
                disabled={busy}
              />Repeat every year on this month and day
            </label>
            <p className="text-xs text-[var(--cmb-text-muted)]">
              For 29 February, reminders use 28 February in other years.
              Reminders are checked daily, with up to six days of catch-up if
              delivery is delayed. You can turn them off here or unsubscribe
              from any reminder.
            </p>
            <div className="flex flex-wrap gap-3">
              <button className={secondary} disabled={busy} type="submit">
                {busy ? "Saving…" : "Save reminders"}
              </button>
              <button
                className={secondary}
                disabled={busy}
                type="button"
                onClick={() =>
                  load().catch(() =>
                    setError("Could not check email status. Try again.")
                  )}
              >
                Check email status
              </button>
            </div>
          </form>
        )}
      {message && <p role="status" className="text-sm mt-3">{message}</p>}
      {error && (
        <p role="alert" className="text-sm mt-3 text-[var(--cmb-error)]">
          {error}
        </p>
      )}
    </section>
  );
}
