"use client";
import { useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { userError } from "@/lib/user-errors";
import { createClient } from "@/lib/supabase/client";
import { ensureSession } from "@/lib/supabase/auth";
import { trackCreation } from "@/lib/analytics";
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
  const dateId = useId();
  const dateInput = useRef<HTMLInputElement>(null);
  const [allYearRound, setAllYearRound] = useState(list?.occasion === "All year round" && !list.event_date);
  const [occasion, setOccasion] = useState(list?.occasion === "All year round" ? "Birthday" : list?.occasion || "Birthday");
  const [eventDate, setEventDate] = useState(list?.event_date ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    const form = new FormData(e.currentTarget);
    form.set("occasion", allYearRound ? "All year round" : occasion);
    form.set("event_date", allYearRound ? "" : eventDate);
    try {
      await ensureSession();
      const { data, error } = await createClient().rpc(
        "save_personal_wishlist",
        { p_id: list?.id ?? null, p_data: Object.fromEntries(form) },
      );
      if (error) throw error;
      if (!list) trackCreation("wishlist_created");
      onSaved(data);
    } catch (err) {
      setError(userError(err, "save your wishlist"));
    } finally {
      setBusy(false);
    }
  }
  return (
    <form aria-label="Wishlist settings" onSubmit={submit} className={`${panel} space-y-4`}>
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
      <label className="flex items-center gap-3 min-h-11 text-sm font-medium">
        <input type="checkbox" checked={allYearRound} onChange={event => setAllYearRound(event.target.checked)} />
        All year round
      </label>
      {allYearRound && <p className="text-sm text-[var(--cmb-text-secondary)]">Save wishes throughout the year. Add a birthday or occasion date whenever you want occasion reminders.</p>}
      {!allYearRound && <div className="grid sm:grid-cols-2 gap-4">
        <label className="block text-sm font-medium">
          Occasion (optional)
          <input
            className={`${field} mt-1`}
            name="occasion"
            maxLength={80}
            value={occasion}
            onChange={event => setOccasion(event.target.value)}
            placeholder="Birthday, Christmas, everyday…"
          />
        </label>
        <div>
          <label htmlFor={dateId} className="block text-sm font-medium">
            {occasion.trim().toLowerCase() === "birthday" ? "Birthday date (optional)" : "Occasion date (optional)"}
          </label>
          <input
            ref={dateInput}
            id={dateId}
            className={`${field} mt-1`}
            name="event_date"
            type="date"
            value={eventDate}
            onChange={event => setEventDate(event.target.value)}
            aria-describedby={dateId + "-hint"}
          />
          <button type="button" className={secondary + " mt-2"} onClick={() => {
            dateInput.current?.focus();
            try { dateInput.current?.showPicker(); } catch { /* The date remains editable when a picker is unavailable. */ }
          }}>Choose date</button>
          <p id={dateId + "-hint"} className="text-xs mt-2 text-[var(--cmb-text-muted)]">Leave blank to save without a date. A date is needed for occasion reminders.</p>
        </div>
      </div>}
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
        <Button className="rounded-[var(--cmb-radius)] min-h-11" type="submit" disabled={busy}>
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
