import { handleReminderRequest, reminderMessage } from "./handler.ts";
function check(ok: unknown, msg: string) {
  if (!ok) throw new Error(msg);
}
const job = {
  id: "job-1",
  list_id: "list-1",
  title: '<script>alert("x")</script>',
  email: "test@example.invalid",
  kind: "before" as const,
  event_date: "2026-12-25",
  unsubscribe_token: "opt-out",
};
Deno.test("message escapes content and never includes purchase details", () => {
  const mail = reminderMessage(job, "https://www.checkmybasket.co.uk");
  check(!mail.html.includes("<script>"), "unsafe HTML");
  check(mail.html.includes("&lt;script&gt;"), "missing escaping");
  check(
    mail.text.includes("/wishlist-reminders#token=opt-out"),
    "missing unsubscribe",
  );
  const after = reminderMessage(
    { ...job, kind: "after" },
    "https://www.checkmybasket.co.uk",
  );
  check(after.text.includes("Mark gifts you received"), "missing cleanup");
});
Deno.test("worker denies unauthorised requests without claiming or sending", async () => {
  let calls = 0;
  const response = await handleReminderRequest(
    new Request("https://worker", { method: "POST" }),
    {
      rpc: () => {
        calls++;
        return Promise.resolve({ data: null, error: null });
      },
      appUrl: "https://www.checkmybasket.co.uk",
      fetcher: fetch,
    },
  );
  check(response.status === 401 && calls === 0, "unauthorised worker ran");
});
Deno.test("worker uses provider idempotency and acknowledges delivery", async () => {
  const calls: string[] = [];
  let key = "";
  const response = await handleReminderRequest(
    new Request("https://worker", {
      method: "POST",
      headers: { "x-wishlist-worker-token": "local-test" },
    }),
    {
      apiKey: "test",
      from: "test@example.invalid",
      appUrl: "https://www.checkmybasket.co.uk",
      rpc: (name, args) => {
        calls.push(`${name}:${args?.p_status ?? ""}`);
        return Promise.resolve({
          error: null,
          data: name === "authenticate_wishlist_reminder_worker"
            ? true
            : name === "claim_wishlist_reminders"
            ? ["job-1"]
            : name === "wishlist_reminder_delivery"
            ? job
            : null,
        });
      },
      fetcher: ((_url, init) => {
        key = new Headers(init?.headers).get("Idempotency-Key") ?? "";
        return Promise.resolve(new Response("{}", { status: 200 }));
      }) as typeof fetch,
    },
  );
  check(
    response.status === 200 && key === "wishlist-reminder/job-1",
    "missing idempotency",
  );
  check(
    calls.includes("finish_wishlist_reminder:sent"),
    "missing acknowledgement",
  );
});
Deno.test("opted-out jobs are cancelled without provider calls", async () => {
  let sent = false;
  const response = await handleReminderRequest(
    new Request("https://worker", {
      method: "POST",
      headers: { "x-wishlist-worker-token": "local" },
    }),
    {
      apiKey: "test",
      from: "test",
      appUrl: "https://www.checkmybasket.co.uk",
      rpc: (n) =>
        Promise.resolve({
          error: null,
          data: n === "authenticate_wishlist_reminder_worker"
            ? true
            : n === "claim_wishlist_reminders"
            ? ["job-1"]
            : null,
        }),
      fetcher: (() => {
        sent = true;
        return Promise.resolve(new Response());
      }) as typeof fetch,
    },
  );
  check(response.status === 200 && !sent, "opt-out sent email");
});
Deno.test("provider failure retries without leaking recipient data", async () => {
  let status = "";
  const response = await handleReminderRequest(
    new Request("https://worker", {
      method: "POST",
      headers: { "x-wishlist-worker-token": "local" },
    }),
    {
      apiKey: "test",
      from: "test",
      appUrl: "https://www.checkmybasket.co.uk",
      rpc: (n, a) => {
        if (n === "finish_wishlist_reminder") status = String(a?.p_status);
        return Promise.resolve({
          error: null,
          data: n === "authenticate_wishlist_reminder_worker"
            ? true
            : n === "claim_wishlist_reminders"
            ? ["job-1"]
            : n === "wishlist_reminder_delivery"
            ? job
            : null,
        });
      },
      fetcher:
        (() =>
          Promise.resolve(new Response("no", { status: 429 }))) as typeof fetch,
    },
  );
  check(response.status === 503 && status === "retry", "failed job lost");
  check(!(await response.text()).includes(job.email), "PII leaked");
});
