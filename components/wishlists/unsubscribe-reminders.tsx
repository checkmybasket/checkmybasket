"use client";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { uuidPattern } from "@/lib/wishlists/types";
import { secondary } from "./shell";

export function UnsubscribeReminders() {
  const [token, setToken] = useState("");
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const loaded = useRef(false);
  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    const value =
      new URLSearchParams(window.location.hash.slice(1)).get("token") ?? "";
    setToken(uuidPattern.test(value) ? value : "");
    setReady(true);
    window.history.replaceState(null, "", window.location.pathname);
  }, []);
  async function stop() {
    if (!token || busy) return;
    setBusy(true);
    setError("");
    const { error } = await createClient().rpc(
      "unsubscribe_wishlist_reminders",
      { p_token: token },
    );
    if (error) setError("Could not turn off reminders. Please try again.");
    else setDone(true);
    setBusy(false);
  }
  return (
    <div className="mt-5">
      {!ready
        ? <p role="status">Opening reminder settings…</p>
        : done
        ? (
          <p role="status">
            Reminders are off for this wishlist. You can turn them on again in
            its editor.
          </p>
        )
        : token
        ? (
          <>
            <p>
              Turn off occasion reminders for this wishlist. Your wishlist and
              email recovery will stay saved.
            </p>
            <button
              className={`${secondary} mt-4`}
              disabled={busy}
              onClick={stop}
            >
              {busy ? "Turning off…" : "Turn off wishlist reminders"}
            </button>
          </>
        )
        : (
          <p>
            Open the unsubscribe link from your reminder email, or turn
            reminders off in your wishlist editor.
          </p>
        )}
      {error && (
        <p role="alert" className="mt-4 text-[var(--cmb-error)]">{error}</p>
      )}
    </div>
  );
}
