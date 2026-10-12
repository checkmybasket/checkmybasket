export interface Claim {
  outcome: string;
  id?: string;
  lease?: string;
  attempt?: number;
}
export interface DeliveryStore {
  claim(drawId: string, payloadHash: string, email: string): Promise<Claim>;
  finish(id: string, lease: string, result: "sent" | "retry" | "failed"): Promise<boolean>;
}
export interface EmailPayload {
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
}
export type Outcome = "sent" | "failed" | "skipped";

// Pure/injectable delivery logic. Provider responses/bodies and addresses never
// escape into logs or client results. No new background sender is introduced.
export async function deliver(
  drawId: string,
  payload: EmailPayload,
  key: string,
  store: DeliveryStore,
  fetcher: typeof fetch = fetch,
  sleep: (ms: number) => Promise<void> = (ms) => new Promise(r => setTimeout(r, ms)),
): Promise<Outcome> {
  const body = JSON.stringify(payload);
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(body));
  const hash = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, "0")).join("");
  for (let round = 0; round < 3; round++) {
    const job = await store.claim(drawId, hash, payload.to);
    if (job.outcome !== "claimed") return round ? "failed" : "skipped";
    if (!job.id || !job.lease || !job.attempt) throw new Error("Delivery guard unavailable");
    let result: "sent" | "retry" | "failed" = "retry";
    try {
      const response = await fetcher("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
          "Idempotency-Key": `draw-notice/${job.id}`,
        },
        body,
        signal: AbortSignal.timeout(10000),
      });
      // HTTP acceptance is not inbox delivery. Unknown/network outcomes retry
      // with the SAME body/key, within the database's <24h safety window.
      result = response.ok ? "sent" : response.status === 429 || response.status >= 500
        ? "retry" : "failed";
      await response.body?.cancel();
    } catch {
      result = "retry";
    }
    if (!await store.finish(job.id, job.lease, result)) throw new Error("Delivery acknowledgement unavailable");
    if (result === "sent") return "sent";
    if (result === "failed" || job.attempt >= 3) return "failed";
    await sleep(2000 * 2 ** (job.attempt - 1));
  }
  return "failed";
}

export function emailPayload(from: string, appUrl: string, groupId: string,
  groupName: string, name: string, email: string): EmailPayload {
  const escape = (value: string) => value.replace(/[&<>"']/g, char =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]!));
  const first = name.split(" ")[0];
  const url = `${appUrl}/return?group=${encodeURIComponent(groupId)}`;
  return {
    from, to: email,
    subject: "Names have been drawn! 🎅 Open CheckMyBasket to see your match",
    html: `<div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;color:#1B4332">
      <h1>Names have been drawn! 🎅</h1>
      <p>Hi ${escape(first)}, the draw for <strong>${escape(groupName)}</strong> is done — your Secret Santa match is ready.</p>
      <p><a href="${escape(url)}">Open CheckMyBasket to see your match</a></p>
      <p>You're receiving this because you joined a Secret Santa group on CheckMyBasket.
      Unsubscribe anytime by removing your notification email in the group.</p></div>`,
    text: `Names have been drawn! 🎅\n\nHi ${first}, the draw for ${groupName} is done — your Secret Santa match is ready.\n\nOpen CheckMyBasket to see your match:\n${url}\n\nYou're receiving this because you joined a Secret Santa group on CheckMyBasket. Unsubscribe anytime by removing your notification email in the group.`,
  };
}
