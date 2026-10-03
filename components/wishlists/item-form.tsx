"use client";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import {
  currencies,
  priorities,
  priceInPence,
  type PersonalWish,
} from "@/lib/wishlists/types";
import { webUrl } from "@/lib/wishlists/urls";
import { field, panel, secondary } from "./shell";
export function ItemForm({
  listId,
  item,
  onSaved,
  onCancel,
}: {
  listId: string;
  item?: PersonalWish;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [values, setValues] = useState({
    title: item?.title ?? "",
    url: item?.url ?? "",
    image_url: item?.image_url ?? "",
    price: item?.price == null ? "" : (item.price / 100).toFixed(2),
    currency: item?.currency ?? "GBP",
    shop_name: item?.shop_name ?? "",
    notes: item?.notes ?? "",
    priority: item?.priority ?? "like",
  });
  const [busy, setBusy] = useState(false);
  const [looking, setLooking] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const lookupRef = useRef<AbortController | null>(null);
  function update(key: keyof typeof values, value: string) {
    lookupRef.current?.abort();
    setLooking(false);
    setValues((v) => ({ ...v, [key]: value }));
  }
  async function preview() {
    if (looking || !values.url) return;
    setError("");
    setMessage("");
    let url: string;
    try {
      url = webUrl(values.url);
    } catch {
      setError("Enter a public http or https link.");
      return;
    }
    const controller = new AbortController();
    lookupRef.current = controller;
    setLooking(true);
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch("/api/wishlists/metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
        signal: controller.signal,
      });
      const data = await response.json();
      if (controller.signal.aborted) return;
      setValues((v) => ({
        ...v,
        ...Object.fromEntries(
          ["title", "image_url", "price", "shop_name"]
            .filter((k) => data[k] && !v[k as keyof typeof v])
            .map((k) => [k, data[k]]),
        ),
        ...(data.price && data.currency && !v.price
          ? { currency: data.currency }
          : {}),
      }));
      setMessage(
        data.message ??
          "Review the details below. You can change anything before saving.",
      );
    } catch {
      if (!controller.signal.aborted)
        setMessage(
          "No preview available. Your link can still be saved with a title.",
        );
      else
        setMessage(
          "Preview stopped. Add the details yourself and save your link.",
        );
    } finally {
      clearTimeout(timer);
      if (lookupRef.current === controller) setLooking(false);
    }
  }
  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    lookupRef.current?.abort();
    setBusy(true);
    setError("");
    try {
      const data = {
        ...values,
        title: values.title.trim(),
        url: webUrl(values.url),
        image_url: webUrl(values.image_url),
        price: priceInPence(values.price),
      };
      if (!data.title) throw new Error("Add a gift title.");
      const { error } = await createClient().rpc("save_personal_wish", {
        p_list: listId,
        p_id: item?.id ?? null,
        p_data: data,
      });
      if (error) throw error;
      onSaved();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : ((err as { message?: string })?.message ??
              "Could not save the gift."),
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className={`${panel} space-y-4 my-5`} onSubmit={save}>
      <h2 className="text-xl font-display font-semibold">
        {item ? "Edit gift" : "Add a gift"}
      </h2>
      <label className="block text-sm font-medium">
        Paste a link from any shop
        <input
          autoFocus
          className={`${field} mt-1`}
          type="url"
          maxLength={2048}
          value={values.url}
          onChange={(e) => update("url", e.target.value)}
          placeholder="https://…"
        />
      </label>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className={secondary}
          disabled={looking || !values.url}
          onClick={preview}
        >
          {looking ? "Getting details…" : "Get product details"}
        </button>
        <button
          type="button"
          className={secondary}
          onClick={() => {
            update("url", "");
            setMessage("No link needed. Describe your wish below.");
          }}
        >
          Add without a link
        </button>
      </div>
      {message && (
        <p role="status" className="text-sm text-[var(--cmb-text-secondary)]">
          {message}
        </p>
      )}
      <label className="block text-sm font-medium">
        Gift title
        <input
          className={`${field} mt-1`}
          required
          maxLength={200}
          value={values.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="What would you love?"
        />
      </label>
      <div className="grid grid-cols-2 gap-4">
        <label className="block text-sm font-medium">
          Estimated price
          <input
            className={`${field} mt-1`}
            inputMode="decimal"
            value={values.price}
            onChange={(e) => update("price", e.target.value)}
            placeholder="Optional"
          />
        </label>
        <label className="block text-sm font-medium">
          Currency
          <select
            className={`${field} mt-1`}
            value={values.currency}
            onChange={(e) => update("currency", e.target.value)}
          >
            {currencies.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block text-sm font-medium">
          Shop name (optional)
          <input
            className={`${field} mt-1`}
            maxLength={100}
            value={values.shop_name}
            onChange={(e) => update("shop_name", e.target.value)}
          />
        </label>
        <label className="block text-sm font-medium">
          Priority
          <select
            className={`${field} mt-1`}
            value={values.priority}
            onChange={(e) => update("priority", e.target.value)}
          >
            {Object.entries(priorities).map(([v, label]) => (
              <option key={v} value={v}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="block text-sm font-medium">
        Size, colour or other notes (optional)
        <textarea
          className={`${field} mt-1`}
          maxLength={1000}
          value={values.notes}
          onChange={(e) => update("notes", e.target.value)}
          placeholder="Size M, forest green…"
        />
      </label>
      <label className="block text-sm font-medium">
        Image link (optional)
        <input
          className={`${field} mt-1`}
          type="url"
          maxLength={2048}
          value={values.image_url}
          onChange={(e) => update("image_url", e.target.value)}
          placeholder="https://…"
        />
      </label>
      <p className="text-xs text-[var(--cmb-text-muted)]">
        Prices are estimates. Missing details or images won&apos;t stop you
        saving a gift.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button className="rounded-xl min-h-11" disabled={busy} type="submit">
          {busy ? "Saving…" : item ? "Save changes" : "Add to wishlist"}
        </Button>
        <button
          type="button"
          className={secondary}
          onClick={() => {
            lookupRef.current?.abort();
            onCancel();
          }}
        >
          Cancel
        </button>
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
    </form>
  );
}
