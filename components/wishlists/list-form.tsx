"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { ensureSession } from "@/lib/supabase/auth";
import type { PersonalList } from "@/lib/wishlists/types";
import { field, panel, secondary } from "./shell";
export function ListForm({
  list,
  onSaved,
  onCancel,
}: {
  list?: PersonalList;
  onSaved: (id: string) => void;
  onCancel?: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    const form = new FormData(e.currentTarget);
    try {
      await ensureSession();
      const { data, error } = await createClient().rpc(
        "save_personal_wishlist",
        { p_id: list?.id ?? null, p_data: Object.fromEntries(form) },
      );
      if (error) throw error;
      onSaved(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : ((err as { message?: string })?.message ??
              "Could not save your wishlist."),
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className={`${panel} space-y-4`}>
      <h2 className="font-display font-semibold text-xl">
        {list ? "Edit your wishlist" : "Name your wishlist"}
      </h2>
      <label className="block text-sm font-medium">
        Your display name
        <input
          className={`${field} mt-1`}
          name="display_name"
          required
          maxLength={80}
          defaultValue={list?.display_name}
          autoComplete="given-name"
          placeholder="Hassan"
        />
      </label>
      <label className="block text-sm font-medium">
        Wishlist title
        <input
          className={`${field} mt-1`}
          name="title"
          required
          maxLength={100}
          defaultValue={list?.title}
          placeholder="My birthday wishlist"
        />
      </label>
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block text-sm font-medium">
          Occasion (optional)
          <input
            className={`${field} mt-1`}
            name="occasion"
            maxLength={80}
            defaultValue={list?.occasion}
            placeholder="Birthday, Christmas, everyday…"
          />
        </label>
        <label className="block text-sm font-medium">
          Date (optional)
          <input
            className={`${field} mt-1`}
            name="event_date"
            type="date"
            defaultValue={list?.event_date ?? ""}
          />
        </label>
      </div>
      <label className="block text-sm font-medium">
        A note for friends (optional)
        <textarea
          className={`${field} mt-1`}
          name="description"
          maxLength={1000}
          defaultValue={list?.description}
          placeholder="A few things I would love…"
        />
      </label>
      <p className="text-sm text-[var(--cmb-text-secondary)]">
        Your list starts private. No email or group needed.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button className="rounded-xl min-h-11" type="submit" disabled={busy}>
          {busy ? "Saving…" : list ? "Save changes" : "Create my wishlist"}
        </Button>
        {onCancel && (
          <button type="button" className={secondary} onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
    </form>
  );
}
