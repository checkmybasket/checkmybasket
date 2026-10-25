"use client";
import { userError } from "@/lib/user-errors";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import {
  type CatalogueWishDraft,
  type PersonalList,
  type PersonalWish,
  uuidPattern,
} from "@/lib/wishlists/types";
import { EmailRecovery } from "@/components/email-recovery";
import { ListForm } from "./list-form";
import { ItemForm } from "./item-form";
import { ItemCard } from "./item-card";
import { WishlistShell, panel, secondary } from "./shell";
import { WishlistReminders } from "./reminders";
export function WishlistEditor({ id, draft }: { id: string; draft?: CatalogueWishDraft }) {
  const router = useRouter();
  const [list, setList] = useState<PersonalList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [editList, setEditList] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [editing, setEditing] = useState<PersonalWish | null | undefined>(draft ? null : undefined);
  const [pendingDraft, setPendingDraft] = useState(!!draft);
  const [confirm, setConfirm] = useState<{
    action: string;
    item?: PersonalWish;
  } | null>(null);
  const [base, setBase] = useState("");
  const load = useCallback(async () => {
    if (!uuidPattern.test(id)) {
      setList(null);
      setLoading(false);
      return;
    }
    const { data, error } = await createClient().rpc(
      "personal_wishlist_owner",
      { p_id: id },
    );
    if (error)
      throw new Error("Could not load your wishlist. Please try again.");
    setList(data);
    setLoading(false);
  }, [id]);
  useEffect(() => {
    Promise.resolve()
      .then(() => {
        setBase(window.location.origin);
        return load();
      })
      .catch((e) => {
        setError(userError(e, "load your wishlist"));
        setLoading(false);
      });
  }, [load]);
  async function mutate(action: string, item?: PersonalWish) {
    if (busy) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const { error } = item
        ? await createClient().rpc(["archive", "received", "restore", "again", "repeat", "oneoff"].includes(action) ? "set_personal_wish_state" : "manage_personal_wish", {
            p_list: id,
            p_id: item.id,
            p_action: action,
          })
        : await createClient().rpc("manage_personal_wishlist", {
            p_id: id,
            p_action: action,
          });
      if (error) throw error;
      setConfirm(null);
      if (!item && action === "delete") {
        router.push("/wishlists");
        return;
      }
      await load();
      setMessage(
        action === "release"
          ? "Any reservation for this gift has been cleared. The gift stays on your wishlist."
          : action === "received" ? "Marked as received. Find it in Received and archived; you can add it back for another occasion."
          : action === "archive" ? "Gift archived. Restore it below if you change your mind."
          : action === "again" ? "Gift added back. Its old reservation has been cleared for the next occasion."
          : action === "rotate"
            ? "New sharing link ready. The old link no longer works."
            : action === "disable"
              ? "Sharing is off. Your list is private."
              : action === "enable"
                ? "Sharing is on. Anyone with the link can view your list."
                : "Wishlist updated.",
      );
    } catch (err) {
      setError(
        (err as { message?: string })?.message ?? "Could not make that change.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function finishReview() {
    if (busy) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const { error } = await createClient().rpc("review_personal_wishlist", { p_id: id });
      if (error) throw error;
      await load(); setReviewing(false); setMessage("Wishlist reviewed. Friends can see when you last checked it.");
    } catch (err) { setError(userError(err, "confirm your wishlist review")); }
    finally { setBusy(false); }
  }
  const shareUrl =
    list?.share_token && base ? `${base}/w/${list.share_token}` : "";
  async function share() {
    if (!shareUrl) return;
    setMessage("");
    try {
      if (navigator.share) {
        await navigator.share({ title: list?.title, url: shareUrl });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setMessage(
          "Wishlist link copied. Paste it into a message to share it.",
        );
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setMessage(
        "Sharing isn't available here. Copy the link from the box above.",
      );
    }
  }
  if (loading)
    return (
      <WishlistShell>
        <p role="status">Loading your wishlist…</p>
      </WishlistShell>
    );
  if (!list)
    return (
      <WishlistShell>
        <h1 className="text-2xl font-display mb-3">
          Wishlist not available in this browser
        </h1>
        <p className="mb-4">
          Open it in the browser where you created it, or use your verified
          email to sign in.
        </p>
        <Link prefetch={false} className={secondary} href="/return">
          Return &amp; sign in
        </Link>
        {error && (
          <p role="alert" className="text-red-700 mt-4">
            {error}
          </p>
        )}
      </WishlistShell>
    );
  const activeItems = list.items.filter(item => !item.state || item.state === "active");
  const savedItems = list.items.filter(item => item.state === "received" || item.state === "archived");
  return (
    <WishlistShell>
      <div className="flex flex-wrap justify-between items-start gap-4">
        <div className="min-w-0">
          <p className="text-sm mb-2 text-[var(--cmb-text-secondary)]">
            {list.display_name}&apos;s wishlist ·{" "}
            {list.shared ? "Shared by link" : "Private"}
          </p>
          <h1 className="text-3xl font-display font-semibold break-words">
            {list.title}
          </h1>
          {(list.occasion || list.event_date) && (
            <p className="text-sm mt-2">
              {list.occasion}
              {list.event_date
                ? ` · ${new Date(list.event_date + "T12:00:00").toLocaleDateString("en-GB")}`
                : ""}
            </p>
          )}
        </div>
        <button className={secondary} onClick={() => setEditList(!editList)}>
          {editList ? "Close settings" : "Edit list"}
        </button>
      </div>
      {list.description && (
        <p className="mt-4 whitespace-pre-wrap break-words text-[var(--cmb-text-secondary)]">
          {list.description}
        </p>
      )}
      <section className={`${panel} mt-5`} aria-labelledby="review-heading">
        <h2 id="review-heading" className="text-xl font-semibold">Still hoping for these?</h2>
        <p className="text-sm mt-2">{list.reviewed_at ? `Last reviewed ${new Date(list.reviewed_at).toLocaleDateString("en-GB", { timeZone: "Europe/London" })}.` : "Not reviewed yet, or changed since your last review."} Check your wishes before sharing for your next occasion.</p>
        {reviewing ? <>
          <p className="text-sm my-3">Keep the gifts you still want, edit any details, and archive wishes you no longer need. Mark gifts you already have as received. When you have checked the active list, confirm below.</p>
          <div className="flex flex-wrap gap-3"><button className={secondary} disabled={busy} onClick={finishReview}>{busy ? "Saving…" : "Everything here is still wanted"}</button><button className={secondary} disabled={busy} onClick={() => setReviewing(false)}>Review later</button></div>
        </> : <button className={`${secondary} mt-3`} onClick={() => setReviewing(true)}>Review my wishlist</button>}
      </section>
      {editList && (
        <div className="mt-5">
          <ListForm
            list={list}
            onSaved={() => {
              setEditList(false);
              load().catch((e) => setError(userError(e, "load your wishlist")));
            }}
            onCancel={() => setEditList(false)}
          />
        </div>
      )}
      <div className="my-6 flex flex-wrap gap-3">
        <Button
          className="rounded-[var(--cmb-radius)] min-h-11"
          onClick={() => setEditing(null)}
        >
          Add a gift
        </Button>
        {!list.shared && (
          <button
            className={secondary}
            disabled={busy}
            onClick={() => mutate("enable")}
          >
            Enable sharing
          </button>
        )}
      </div>
      {editing !== undefined && (
        <ItemForm
          key={editing?.id ?? "new"}
          listId={id}
          item={editing ?? undefined}
          draft={pendingDraft && editing === null ? draft : undefined}
          onSaved={() => {
            setEditing(undefined);
            if (pendingDraft) { setPendingDraft(false); router.replace(`/wishlists/${id}`, { scroll: false }); }
            load().catch((e) => setError(userError(e, "load your wishlist")));
            setMessage("Gift saved.");
          }}
          onCancel={() => { setEditing(undefined); if (pendingDraft) { setPendingDraft(false); router.replace(`/wishlists/${id}`, { scroll: false }); } }}
        />
      )}
      {list.shared && (
        <section className={`${panel} mb-6`} aria-labelledby="share-heading">
          <h2 id="share-heading" className="text-xl font-semibold mb-2">
            Share your wishlist
          </h2>
          <p className="text-sm mb-3 text-[var(--cmb-text-secondary)]">
            Anyone with this link can view it and reserve gifts. They can
            forward it, too. Your editing access and email stay private.
          </p>
          <label className="block text-sm">
            Your sharing link
            <input
              className="mt-1 w-full p-3 rounded-[var(--cmb-radius)] border border-[var(--cmb-border)] text-sm"
              value={shareUrl}
              readOnly
              onFocus={(e) => e.target.select()}
            />
          </label>
          <div className="flex flex-wrap gap-2 mt-3">
            <button className={secondary} onClick={share} disabled={!shareUrl}>
              Share wishlist
            </button>
            <button
              className={secondary}
              disabled={busy}
              onClick={() => mutate("disable")}
            >
              Stop sharing
            </button>
          </div>
        </section>
      )}
      <p className="text-xs mb-4 text-[var(--cmb-text-muted)]">
        Reservations are hidden from your owner view to keep gifts a surprise.
        Prices are estimates.
      </p>
      {activeItems.length ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {activeItems.map((item, index) => (
            <ItemCard key={`${item.id}:${item.image_url}`} item={item}>
              <div className="flex flex-wrap gap-2">
                <button
                  className={secondary}
                  disabled={busy}
                  onClick={() => setEditing(item)}
                >
                  Edit<span className="sr-only"> {item.title}</span>
                </button>
                <button
                  className={secondary}
                  disabled={busy || index === 0}
                  onClick={() => mutate("up", item)}
                  aria-label={`Move ${item.title} up`}
                >
                  ↑
                </button>
                <button
                  className={secondary}
                  disabled={busy || index === activeItems.length - 1}
                  onClick={() => mutate("down", item)}
                  aria-label={`Move ${item.title} down`}
                >
                  ↓
                </button>
                <button
                  className={secondary}
                  disabled={busy}
                  onClick={() => setConfirm({ action: "release", item })}
                >
                  Unreserve gift<span className="sr-only">: {item.title}</span>
                </button>
                <button className={secondary} disabled={busy} onClick={() => mutate("received", item)}>Received<span className="sr-only"> {item.title}</span></button>
                <button className={secondary} disabled={busy} onClick={() => mutate("archive", item)}>Archive<span className="sr-only"> {item.title}</span></button>
                <button className={secondary} disabled={busy} aria-pressed={!!item.repeatable} onClick={() => mutate(item.repeatable ? "oneoff" : "repeat", item)}>Happy to receive again<span className="sr-only">: {item.title}</span></button>
                <button
                  className={secondary}
                  disabled={busy}
                  onClick={() => setConfirm({ action: "delete", item })}
                >
                  Remove<span className="sr-only"> {item.title}</span>
                </button>
              </div>
            </ItemCard>
          ))}
        </div>
      ) : (
        <div className={panel}>
          <h2 className="text-lg font-semibold mb-2">
            Your first wish goes here
          </h2>
          <p className="text-sm">
            Add a link from any shop, or describe something you would love.
          </p>
          <Button
            type="button"
            className="mt-4 rounded-[var(--cmb-radius)] min-h-11"
            onClick={() => setEditing(null)}
          >
            Add a gift
          </Button>
        </div>
      )}
      {savedItems.length > 0 && <section className="mt-6" aria-labelledby="saved-gifts-heading">
        <h2 id="saved-gifts-heading" className="text-xl font-semibold mb-3">Received and archived</h2>
        <p className="text-sm mb-3">Hidden from your shared list. Restoring an archived gift keeps any reservation. Adding a received gift back clears its old reservation.</p>
        <div className="grid sm:grid-cols-2 gap-4">{savedItems.map(item => <ItemCard key={item.id} item={item} headingLevel={3}>
          <p className="text-sm mb-3">{item.state === "received" ? "Received" : "Archived"}</p>
          <button className={secondary} disabled={busy} onClick={() => item.state === "received" ? setConfirm({action:"again",item}) : mutate("restore",item)}>{item.state === "received" ? "Add back for another occasion" : "Restore gift"}<span className="sr-only">: {item.title}</span></button>
        </ItemCard>)}</div>
      </section>}
      {confirm && (
        <section
          className={`${panel} mt-6`}
          role="alertdialog"
          aria-labelledby="confirm-heading"
          aria-describedby="confirm-description"
        >
          <h2 id="confirm-heading" className="font-semibold text-lg">
            {confirm.action === "again" ? "Want this gift again?" : confirm.action === "release"
              ? `Unreserve “${confirm.item?.title}”?`
              : confirm.action === "rotate"
                ? "Replace your sharing link?"
                : confirm.item
                  ? "Remove this gift?"
                  : "Delete your wishlist?"}
          </h2>
          <p id="confirm-description" className="text-sm my-3">
            {confirm.action === "again" ? "Only continue if you have received this gift and want another. This makes it available again and clears its old reservation, including bought status." : confirm.action === "release"
              ? "This clears any reservation, including one marked as bought, and lets someone else reserve the gift. The gift stays on your list."
              : confirm.action === "rotate"
                ? "The old link and QR code will stop working. Existing reservations stay saved."
                : confirm.item
                  ? "This removes the gift and any reservation for it."
                  : "This permanently removes the list, its gifts and reservations."}
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              className={secondary}
              autoFocus
              disabled={busy}
              onClick={() => setConfirm(null)}
            >
              Cancel
            </button>
            <Button
              className="rounded-[var(--cmb-radius)] min-h-11"
              disabled={busy}
              onClick={() => mutate(confirm.action, confirm.item)}
            >
              {busy
                ? "Updating…"
                : confirm.action === "release"
                  ? "Unreserve gift"
                  : "Confirm"}
            </Button>
          </div>
        </section>
      )}
      {message && (
        <p role="status" className="mt-4 text-sm text-[var(--cmb-primary)]">
          {message}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-4 text-sm text-red-700">
          {error}
        </p>
      )}
      <WishlistReminders key={`${id}:${list.event_date}`} id={id} eventDate={list.event_date} />
      <EmailRecovery wishlist />
      <p className="text-xs text-[var(--cmb-text-muted)] mb-5">
        Without verified email recovery, clearing browser data means losing
        editing access.
      </p>
      <button
        className={`${secondary} text-red-700`}
        disabled={busy}
        onClick={() => setConfirm({ action: "delete" })}
      >
        Delete wishlist
      </button>
    </WishlistShell>
  );
}
