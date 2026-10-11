"use client";

import { useState } from "react";

export function EngravingPreview() {
  const [wording, setWording] = useState("Always in your corner");
  const count = Array.from(wording).length;
  return <div className="rounded-xl border border-[var(--cmb-border)] p-5 space-y-4">
    <label htmlFor="engraving-wording" className="block font-semibold">Your proposed wording</label>
    <textarea id="engraving-wording" value={wording} onChange={event => setWording(event.target.value)} rows={3} aria-describedby="engraving-count engraving-note" className="w-full rounded-lg border border-[var(--cmb-border)] bg-[var(--cmb-bg)] p-3 text-base focus-visible:outline-2 focus-visible:outline-offset-2" />
    <p id="engraving-count" role="status">{count} {count === 1 ? "character" : "characters"}, including spaces and line breaks.</p>
    <div className="rounded-lg bg-[var(--cmb-surface)] border border-[var(--cmb-border)] p-5 text-center">
      <p className="text-xs mb-2">Wording preview</p>
      <p className="whitespace-pre-wrap break-words font-semibold">{wording || "Type your wording above"}</p>
    </div>
    <p id="engraving-note">The count is a planning aid. Symbols can be counted differently by sellers; confirm their limits, supported characters, font and placement. Text stays in this page and is not submitted to the shop or saved.</p>
  </div>;
}
