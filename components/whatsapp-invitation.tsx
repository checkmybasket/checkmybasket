"use client";

import { useState } from "react";

const defaultInvitation = `Hi everyone! We're organising a Secret Santa 🎁

Budget: [amount]
Gift exchange: [date and location]
Please join by: [joining deadline]

Join our draw here: [paste your CheckMyBasket group invitation link]

Add your name and a few wishlist ideas. Once everyone has joined, we'll draw names and you can privately reveal who you're buying for. Please keep your match a surprise!`;

export function WhatsAppInvitation() {
  return <InvitationMessage invitation={defaultInvitation} />;
}

export function InvitationMessage({ invitation }: { invitation: string }) {
  const [message, setMessage] = useState("");

  async function copy() {
    try {
      await navigator.clipboard.writeText(invitation);
      setMessage("Invitation copied. Replace the placeholders before sending it.");
    } catch {
      setMessage("Could not copy automatically. Select and copy the message below.");
    }
  }

  return (
    <div className="rounded-2xl border border-[var(--cmb-border)] bg-[var(--cmb-surface)] p-5">
      <p className="mb-3 text-sm">Replace the bracketed placeholders with your details and your group invitation link.</p>
      <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed select-text">{invitation}</pre>
      <button type="button" onClick={copy} className="mt-4 min-h-11 rounded-xl bg-[var(--cmb-primary)] px-5 py-3 font-semibold text-[var(--cmb-text-inverse)] focus-visible:outline-2 focus-visible:outline-offset-4">
        Copy invitation message
      </button>
      <p role="status" className="mt-3 text-sm">{message}</p>
    </div>
  );
}
