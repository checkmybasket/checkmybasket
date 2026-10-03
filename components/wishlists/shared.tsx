"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ensureSession } from "@/lib/supabase/auth";
import {
  type PersonalList,
  priorities,
  uuidPattern,
} from "@/lib/wishlists/types";
import { EmailRecovery } from "@/components/email-recovery";
import { ItemCard } from "./item-card";
import { WishlistShell, field, panel, secondary } from "./shell";
export function SharedWishlist({ token }: { token: string }) {
  const [list, setList] = useState<PersonalList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [priority, setPriority] = useState("");
  const [budget, setBudget] = useState("");
  const [currency, setCurrency] = useState("GBP");
  const [sort, setSort] = useState("list");
  const load = useCallback(async () => {
    if (!uuidPattern.test(token)) {
      setLoading(false);
      return;
    }
    const { data, error } = await createClient().rpc(
      "shared_personal_wishlist",
      { p_token: token },
    );
    if (error)
      throw new Error("Could not load this wishlist. Please try again.");
    setList(data);
    setLoading(false);
  }, [token]);
  useEffect(() => {
    let active = true;
    Promise.resolve()
      .then(load)
      .catch((e) => {
        if (active) {
          setError(e.message);
          setLoading(false);
        }
      });
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") load().catch(() => {});
    }, 30000);
    const refresh = () => load().catch(() => {});
    window.addEventListener("focus", refresh);
    return () => {
      active = false;
      clearInterval(timer);
      window.removeEventListener("focus", refresh);
    };
  }, [load]);
  async function reserve(id: string, action: string) {
    if (busy) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await ensureSession();
      const { error } = await createClient().rpc("reserve_personal_wish", {
        p_token: token,
        p_item: id,
        p_action: action,
      });
      if (error) throw error;
      await load();
      setMessage(
        action === "reserve"
          ? "Gift reserved for you. Visit the shop to buy it; no purchase has been made here."
          : action === "release"
            ? "Your reservation has been released."
            : "Marked as bought. Thank you!",
      );
    } catch (err) {
      setError(
        (err as { message?: string })?.message ??
          "Could not update the reservation.",
      );
      await load().catch(() => {});
    } finally {
      setBusy(false);
    }
  }
  if (loading)
    return (
      <WishlistShell>
        <p role="status">Opening wishlist…</p>
      </WishlistShell>
    );
  if (!list)
    return (
      <WishlistShell>
        <h1 className="font-display text-2xl mb-3">
          This wishlist isn&apos;t available
        </h1>
        <p>
          The owner may have stopped sharing it or replaced the link. Ask them
          for a fresh link.
        </p>
        {error && (
          <p role="alert" className="mt-4 text-red-700">
            {error}
          </p>
        )}
        <Link className={`${secondary} mt-5`} href="/wishlists">
          Create your own wishlist
        </Link>
      </WishlistShell>
    );
  const items = list.items
    .filter(
      (i) =>
        (!priority || i.priority === priority) &&
        (!budget ||
          (i.currency === currency &&
            i.price !== null &&
            i.price <= Number(budget) * 100)),
    )
    .sort((a, b) =>
      sort === "price"
        ? a.price === null
          ? 1
          : b.price === null
            ? -1
            : a.currency.localeCompare(b.currency) || a.price - b.price
        : sort === "priority"
          ? ["love", "like", "inspiration"].indexOf(a.priority) -
            ["love", "like", "inspiration"].indexOf(b.priority)
          : a.position - b.position,
    );
  return (
    <WishlistShell>
      <p className="text-sm text-[var(--cmb-text-secondary)] mb-2">
        {list.display_name}&apos;s wishlist
      </p>
      <h1 className="font-display font-semibold text-3xl sm:text-4xl break-words">
        {list.title}
      </h1>
      {(list.occasion || list.event_date) && (
        <p className="mt-3 text-sm">
          {list.occasion}
          {list.event_date
            ? ` · ${new Date(list.event_date + "T12:00:00").toLocaleDateString("en-GB")}`
            : ""}
        </p>
      )}
      {list.description && (
        <p className="my-4 whitespace-pre-wrap break-words text-[var(--cmb-text-secondary)]">
          {list.description}
        </p>
      )}
      {list.is_owner ? (
        <div className={`${panel} mt-5`}>
          <p className="text-sm">
            This is your list. Reservations stay hidden in your owner view.
          </p>
          <Link className={`${secondary} mt-3`} href={`/wishlists/${list.id}`}>
            Edit my wishlist
          </Link>
        </div>
      ) : (
        <p className="text-sm mt-5 text-[var(--cmb-text-secondary)]">
          Reserve a gift to help avoid duplicates. No registration needed.
          Buying happens at the shop.
        </p>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6">
        <label className="text-sm">
          Priority
          <select
            className={`${field} mt-1`}
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="">All wishes</option>
            {Object.entries(priorities).map(([v, label]) => (
              <option value={v} key={v}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Maximum price
          <input
            className={`${field} mt-1`}
            type="number"
            min="0"
            step="0.01"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="Any price"
          />
        </label>
        <label className="text-sm">
          Budget currency
          <select
            className={`${field} mt-1`}
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            {["GBP", "EUR", "USD", "AUD", "CAD"].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Sort by
          <select
            className={`${field} mt-1`}
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="list">List order</option>
            <option value="priority">Priority</option>
            <option value="price">Price (per currency)</option>
          </select>
        </label>
      </div>
      {budget && (
        <p className="text-xs mb-4 text-[var(--cmb-text-muted)]">
          Showing gifts with a known {currency} price within your budget.
        </p>
      )}
      {message && (
        <p role="status" className="mb-4 text-sm text-[var(--cmb-primary)]">
          {message}
        </p>
      )}
      {error && (
        <p role="alert" className="mb-4 text-sm text-red-700">
          {error}
        </p>
      )}
      {items.length ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {items.map((item) => (
            <ItemCard
              key={`${item.id}:${item.image_url}`}
              item={item}
              shareToken={token}
            >
              {!list.is_owner && (
                <div className="flex flex-wrap gap-2">
                  {item.mine ? (
                    <>
                      {!item.bought && (
                        <button
                          className={secondary}
                          disabled={busy}
                          onClick={() => reserve(item.id, "bought")}
                        >
                          Mark bought
                          <span className="sr-only">: {item.title}</span>
                        </button>
                      )}
                      <button
                        className={secondary}
                        disabled={busy}
                        onClick={() => reserve(item.id, "release")}
                      >
                        Release reservation
                        <span className="sr-only">: {item.title}</span>
                      </button>
                    </>
                  ) : (
                    <button
                      className={secondary}
                      disabled={busy || item.reserved}
                      onClick={() => reserve(item.id, "reserve")}
                    >
                      {item.reserved ? "Already reserved" : "Reserve gift"}
                      <span className="sr-only">: {item.title}</span>
                    </button>
                  )}
                </div>
              )}
            </ItemCard>
          ))}
        </div>
      ) : (
        <div className={panel}>
          <p>
            {list.items.length
              ? "No gifts match these filters. Try a higher budget or another priority."
              : "No gifts added yet. Check back soon."}
          </p>
        </div>
      )}
      {!list.is_owner && list.items.some((i) => i.mine) && (
        <>
          <EmailRecovery wishlist />
          <p className="text-sm mt-4 text-[var(--cmb-text-secondary)]">
            Your reservation is saved in this browser. Optional verified email
            lets you manage it on another device.{" "}
            <Link className="underline" href="/wishlists">
              See your reservations
            </Link>
            .
          </p>
        </>
      )}
      <p className="text-xs mt-6 text-[var(--cmb-text-muted)]">
        Prices are estimates; check the shop before buying. Reservations stay
        hidden from the owner&apos;s normal view, though anyone with the shared
        link can view it using another browser.
      </p>
    </WishlistShell>
  );
}
