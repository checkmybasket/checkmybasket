"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import {
  type PersonalList,
  type PersonalReservation,
} from "@/lib/wishlists/types";
import { EmailRecovery } from "@/components/email-recovery";
import { WishlistFaq } from "./faq";
import { ListForm } from "./list-form";
import { WishlistShell, panel, secondary } from "./shell";
export function WishlistDashboard() {
  const router = useRouter();
  const [lists, setLists] = useState<PersonalList[]>([]);
  const [reservations, setReservations] = useState<PersonalReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function load() {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      setLoading(false);
      return;
    }
    const [a, b] = await Promise.all([
      supabase.rpc("my_personal_wishlists"),
      supabase.rpc("my_personal_reservations"),
    ]);
    if (a.error || b.error)
      throw new Error("Could not load your wishlists. Try again.");
    setLists(a.data ?? []);
    setReservations(b.data ?? []);
    setLoading(false);
  }
  useEffect(() => {
    Promise.resolve()
      .then(load)
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);
  async function release(id: string) {
    setBusy(true);
    setError("");
    try {
      const { error } = await createClient().rpc(
        "release_personal_reservation",
        { p_item: id },
      );
      if (error) throw error;
      await load();
    } catch {
      setError("Could not release that reservation. Try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <WishlistShell>
      <h1 className="text-3xl sm:text-4xl font-display font-semibold mb-3">
        Your wishes. Any shop.
      </h1>
      <p className="text-[var(--cmb-text-secondary)] mb-6">
        Birthday, Christmas or just because. Add gifts from anywhere and share
        one simple list.
      </p>
      {loading ? (
        <p role="status">Loading your wishlists…</p>
      ) : (
        <>
          {creating ? (
            <ListForm
              onSaved={(id) => router.push(`/wishlists/${id}`)}
              onCancel={() => setCreating(false)}
            />
          ) : (
            <Button
              className="rounded-xl min-h-12 mb-6"
              onClick={() => setCreating(true)}
            >
              Create a wishlist
            </Button>
          )}
          {!lists.length && !creating && (
            <div className={panel}>
              <h2 className="text-xl font-semibold mb-2">
                Start with something you would love
              </h2>
              <p className="text-sm text-[var(--cmb-text-secondary)]">
                John Lewis, Amazon, Argos, Menkind or an independent shop—paste
                any product link. No group or email needed.
              </p>
            </div>
          )}
          {!!lists.length && (
            <ul className="grid sm:grid-cols-2 gap-4 mt-5">
              {lists.map((list) => (
                <li key={list.id} className={panel}>
                  <Link
                    className="block underline underline-offset-4 text-xl font-semibold break-words"
                    href={`/wishlists/${list.id}`}
                  >
                    {list.title}
                  </Link>
                  <p className="text-sm mt-2">
                    {list.item_count} gifts ·{" "}
                    {list.shared ? "Shared by link" : "Private"}
                  </p>
                </li>
              ))}
            </ul>
          )}
          {!!reservations.length && (
            <section className="mt-8" aria-labelledby="reservation-heading">
              <h2
                id="reservation-heading"
                className="text-2xl font-display mb-4"
              >
                Gifts you&apos;re giving
              </h2>
              <ul className="space-y-3">
                {reservations.map((r) => (
                  <li key={r.item_id} className={panel}>
                    <p className="font-semibold break-words">{r.title}</p>
                    <p className="text-sm mt-1">
                      {r.list_title} · {r.bought ? "Bought" : "Reserved"}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {r.shared && r.share_token ? (
                        <Link
                          className={secondary}
                          href={`/w/${r.share_token}`}
                        >
                          Open wishlist
                        </Link>
                      ) : (
                        <p className="text-sm">
                          The owner has stopped sharing this list.
                        </p>
                      )}
                      <button
                        className={secondary}
                        disabled={busy}
                        onClick={() => release(r.item_id)}
                      >
                        Release reservation
                        <span className="sr-only"> for {r.title}</span>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {(lists.length > 0 || reservations.length > 0) && (
            <EmailRecovery wishlist />
          )}
          <p className="text-sm mt-6 text-[var(--cmb-text-secondary)]">
            This browser remembers your access. Without verified email recovery,
            clearing browser data means losing access.{" "}
            <Link className="underline" href="/return">
              Return on another device
            </Link>
            .
          </p>
        </>
      )}
      {error && (
        <div role="alert" className="mt-5 text-red-700">
          <p>{error}</p>
          <button
            className={secondary}
            onClick={() =>
              load().catch(() =>
                setError("Still unable to load. Please try again shortly."),
              )
            }
          >
            Try again
          </button>
        </div>
      )}
      <WishlistFaq />
    </WishlistShell>
  );
}
