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
import { WishlistShell, panel, secondary } from "./shell";
export function SharedWishlist({ token }: { token: string }) {
  const [list, setList] = useState<PersonalList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [view, setView] = useState<"list" | "cards">("list");
  const [collapsed, setCollapsed] = useState<string[]>([]);
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
  const priorityOrder = ["love", "like", "inspiration"] as const;
  const items = [...list.items].sort(
    (a, b) =>
      priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority) ||
      a.position - b.position,
  );
  const groups = priorityOrder.filter((priority) =>
    items.some((item) => item.priority === priority),
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
      <div className="flex flex-wrap items-center justify-between gap-3 my-5">
        <p className="text-sm text-[var(--cmb-text-secondary)]">
          Highest priorities first
        </p>
        <div className="flex flex-wrap gap-2">
          <div className="flex gap-1" role="group" aria-label="Gift view">
            <button
              className={`${secondary} aria-pressed:bg-[var(--cmb-primary)] aria-pressed:text-white`}
              aria-pressed={view === "list"}
              onClick={() => setView("list")}
            >
              List view
            </button>
            <button
              className={`${secondary} aria-pressed:bg-[var(--cmb-primary)] aria-pressed:text-white`}
              aria-pressed={view === "cards"}
              onClick={() => setView("cards")}
            >
              Card view
            </button>
          </div>
          {groups.length > 0 && (
            <button
              className={secondary}
              onClick={() =>
                setCollapsed(
                  collapsed.length === groups.length ? [] : [...groups],
                )
              }
            >
              {collapsed.length === groups.length
                ? "Expand all"
                : "Collapse all"}
            </button>
          )}
        </div>
      </div>
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
        <div className="space-y-5">
          {groups.map((priority) => (
            <section key={priority}>
              <h2>
                <button
                  className="flex w-full items-center justify-between gap-3 min-h-11 mb-2 text-base font-semibold"
                  aria-expanded={!collapsed.includes(priority)}
                  aria-controls={`priority-${priority}`}
                  onClick={() =>
                    setCollapsed((current) =>
                      current.includes(priority)
                        ? current.filter((value) => value !== priority)
                        : [...current, priority],
                    )
                  }
                >
                  <span>
                    {priorities[priority]}{" "}
                    <span className="font-normal text-[var(--cmb-text-secondary)]">
                      (
                      {
                        items.filter((item) => item.priority === priority)
                          .length
                      }
                      )
                    </span>
                  </span>
                  <span aria-hidden>
                    {collapsed.includes(priority) ? "+" : "−"}
                  </span>
                </button>
              </h2>
              <div
                id={`priority-${priority}`}
                hidden={collapsed.includes(priority)}
              >
                <div
                  className={
                    view === "cards"
                      ? "grid sm:grid-cols-2 gap-3"
                      : "grid gap-3"
                  }
                >
                  {items
                    .filter((item) => item.priority === priority)
                    .map((item) => (
                      <ItemCard
                        key={`${item.id}:${item.image_url}`}
                        item={item}
                        shareToken={token}
                        layout={view === "list" ? "list" : "compact"}
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
                                    <span className="sr-only">
                                      : {item.title}
                                    </span>
                                  </button>
                                )}
                                <button
                                  className={secondary}
                                  disabled={busy}
                                  onClick={() => reserve(item.id, "release")}
                                >
                                  Unreserve gift
                                  <span className="sr-only">
                                    : {item.title}
                                  </span>
                                </button>
                              </>
                            ) : (
                              <button
                                className={secondary}
                                disabled={busy || item.reserved}
                                onClick={() => reserve(item.id, "reserve")}
                              >
                                {item.reserved
                                  ? "Already reserved"
                                  : "Reserve gift"}
                                <span className="sr-only">: {item.title}</span>
                              </button>
                            )}
                          </div>
                        )}
                      </ItemCard>
                    ))}
                </div>
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className={panel}>
          <p>No gifts added yet. Check back soon.</p>
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
