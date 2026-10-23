"use client";
import { userError } from "@/lib/user-errors";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import {
  type CatalogueWishDraft,
  type PersonalList,
  type PersonalReservation,
} from "@/lib/wishlists/types";
import { EmailRecovery } from "@/components/email-recovery";
import { WishlistFaq } from "./faq";
import { ListForm } from "./list-form";
import { WishlistShell, panel, secondary } from "./shell";

function EmptyWishlist() {
  return <div className={panel}>
    <h2 className="text-xl font-semibold mb-2">Start with something you would love</h2>
    <p className="text-sm text-[var(--cmb-text-secondary)]">John Lewis, Amazon, Argos, Menkind or an independent shop—paste any product link. No group or email needed.</p>
  </div>;
}

export function WishlistDashboard({ draft, giftUnavailable }: { draft?: CatalogueWishDraft; giftUnavailable?: boolean }) {
  const router = useRouter();
  const giftQuery = draft ? `?gift=${encodeURIComponent(draft.giftId)}` : "";
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
        setError(userError(e, "load your wishlists"));
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
      <p className="mb-6"><Link href="/secret-santa-wishlist-ideas" className="underline">What to put on your Secret Santa wishlist</Link></p>
      {draft ? <section className={`${panel} mb-6`} aria-labelledby="chosen-gift-heading">
        <h2 id="chosen-gift-heading" className="font-semibold">Save {draft.title}</h2>
        <p className="text-sm mt-2">Choose one of your wishlists below or create a new one. You can review and edit the gift before saving it.</p>
        <Link href="/gifts" className="inline-flex min-h-11 items-center underline text-sm">Keep browsing gifts</Link>
      </section> : null}
      {giftUnavailable ? <p role="status" className="mb-6">This gift is no longer available in our current catalogue. <Link href="/gifts" className="underline">Browse current gift ideas</Link> or add your own product link.</p> : null}
      {creating ? (
        <ListForm
          onSaved={(id) => router.push(`/wishlists/${id}${giftQuery}`)}
          onCancel={() => setCreating(false)}
        />
      ) : (
        <Button
          className="rounded-[var(--cmb-radius)] min-h-12 mb-6"
          disabled={loading}
          onClick={() => setCreating(true)}
        >
          Create a wishlist
        </Button>
      )}
      {loading ? (
        <div className="relative">
          <div className="invisible" aria-hidden="true"><EmptyWishlist /></div>
          <p role="status" className="absolute inset-0 flex items-center p-5 sm:p-6">Loading your wishlists…</p>
        </div>
      ) : (
        <>
          {!lists.length && !creating && (
            <EmptyWishlist />
          )}
          {!!lists.length && (
            <ul className="grid sm:grid-cols-2 gap-4 mt-5">
              {lists.map((list) => (
                <li key={list.id} className={panel}>
                  <Link prefetch={false}
                    className="block underline underline-offset-4 text-xl font-semibold break-words"
                    href={`/wishlists/${list.id}${giftQuery}`}
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
        </>
      )}
      <p className="text-sm mt-6 text-[var(--cmb-text-secondary)]">
        This browser remembers your access. Without verified email recovery,
        clearing browser data means losing access.{" "}
        <Link prefetch={false} className="underline" href="/return">
          Return on another device
        </Link>
        .
      </p>
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
      <section className={`${panel} mt-8`} aria-labelledby="wishlist-ideas-heading">
        <h2 id="wishlist-ideas-heading" className="font-display text-xl font-semibold">Need gift ideas?</h2>
        <p className="text-sm mt-2 text-[var(--cmb-text-secondary)]">Browse by budget and interest, then use Save to wishlist on any catalogue gift to review it before adding.</p>
        <nav aria-label="Wishlist inspiration" className="flex flex-wrap gap-x-5 mt-2 text-sm">
          <Link href="/gifts" className="inline-flex min-h-11 items-center underline">Find gifts by budget and interest</Link>
          <Link href="/guides" className="inline-flex min-h-11 items-center underline">Browse gift choosing guides</Link>
        </nav>
      </section>
    </WishlistShell>
  );
}
