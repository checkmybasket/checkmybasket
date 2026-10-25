type Delivery = {
  id: string;
  list_id: string;
  title: string;
  email: string;
  kind: "before" | "after";
  event_date: string;
  unsubscribe_token: string;
};
type Result = { data: unknown; error: unknown };
type Dependencies = {
  rpc: (name: string, args?: Record<string, unknown>) => PromiseLike<Result>;
  apiKey?: string;
  from?: string;
  appUrl: string;
  fetcher: typeof fetch;
};
export function reminderMessage(job: Delivery, appUrl: string) {
  const before = job.kind === "before";
  const subject = before
    ? "Is your wishlist ready for your next occasion?"
    : "Time to refresh your wishlist after your occasion?";
  const copy = before
    ? "Check that your wishes are still wanted, update any details and confirm your review before sharing your list."
    : "Mark gifts you received, archive things you no longer want and keep the wishes you are still hoping for.";
  const url = `${appUrl}/wishlists/${job.list_id}`;
  const unsubscribe =
    `${appUrl}/wishlist-reminders#token=${job.unsubscribe_token}`;
  const escape = (s: string) =>
    s.replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c]!,
    );
  return {
    subject,
    text:
      `${subject}\n\n${job.title}\n\n${copy}\n\nReview your wishlist: ${url}\n\nYou chose occasion reminders for this wishlist. Purchase activity does not trigger these emails.\nTurn off reminders: ${unsubscribe}\n\nOn another device, use Return & sign in with your verified recovery email.`,
    html:
      `<div style="font-family:system-ui;max-width:520px;margin:auto;color:#171717"><h1>${subject}</h1><p>${
        escape(job.title)
      }</p><p>${copy}</p><p><a href="${url}">Review your wishlist</a></p><p>You chose occasion reminders for this wishlist. Purchase activity does not trigger these emails.</p><p><a href="${unsubscribe}">Turn off reminders</a></p><p>On another device, use Return &amp; sign in with your verified recovery email.</p></div>`,
  };
}
export async function handleReminderRequest(
  req: Request,
  deps: Dependencies,
): Promise<Response> {
  const json = (data: unknown, status = 200) =>
    Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const key = req.headers.get("x-wishlist-worker-token");
  if (!key || key.length > 256) return json({ error: "Unauthorised" }, 401);
  const auth = await deps.rpc("authenticate_wishlist_reminder_worker", {
    p_key: key,
  });
  if (auth.error || auth.data !== true) {
    return json({ error: "Unauthorised" }, 401);
  }
  if (!deps.apiKey || !deps.from) {
    return json({ error: "Email delivery unavailable" }, 503);
  }
  const claimed = await deps.rpc("claim_wishlist_reminders");
  if (claimed.error || !Array.isArray(claimed.data)) {
    return json({ error: "Reminder queue unavailable" }, 503);
  }
  let sent = 0, failed = 0, cancelled = 0;
  const started = Date.now();
  for (const id of claimed.data) {
    if (Date.now() - started > 45000) break;
    const delivery = await deps.rpc("wishlist_reminder_delivery", { p_id: id });
    if (delivery.error) {
      await deps.rpc("finish_wishlist_reminder", {
        p_id: id,
        p_status: "retry",
      });
      failed++;
      continue;
    }
    if (!delivery.data) {
      await deps.rpc("finish_wishlist_reminder", {
        p_id: id,
        p_status: "cancelled",
      });
      cancelled++;
      continue;
    }
    const job = delivery.data as Delivery;
    try {
      const response = await deps.fetcher("https://api.resend.com/emails", {
        method: "POST",
        signal: AbortSignal.timeout(15000),
        headers: {
          Authorization: `Bearer ${deps.apiKey}`,
          "Content-Type": "application/json",
          "Idempotency-Key": `wishlist-reminder/${job.id}`,
        },
        body: JSON.stringify({
          from: deps.from,
          to: job.email,
          ...reminderMessage(job, deps.appUrl),
        }),
      });
      if (!response.ok) throw new Error("Delivery rejected");
      const result = await deps.rpc("finish_wishlist_reminder", {
        p_id: id,
        p_status: "sent",
      });
      if (result.error) throw new Error("Delivery acknowledgement failed");
      sent++;
      await new Promise((resolve) => setTimeout(resolve, 600));
    } catch {
      await deps.rpc("finish_wishlist_reminder", {
        p_id: id,
        p_status: "retry",
      });
      failed++;
    }
  }
  return json({ sent, failed, cancelled }, failed ? 503 : 200);
}
