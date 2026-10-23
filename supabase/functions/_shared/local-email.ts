/** Explicit acceptance-test transport. Hosted projects can never activate it. */
export function localEmailFetch(
  env: { enabled?: string; supabaseUrl?: string },
  fetcher: typeof fetch = fetch,
): typeof fetch {
  if (env.enabled !== "true") return fetcher;
  const backend = new URL(env.supabaseUrl ?? "");
  if (backend.protocol !== "http:" ||
      !["kong", "supabase_kong_checkmybasket-local"].includes(backend.hostname)) {
    throw new Error("Local mail capture requires the isolated local Supabase stack.");
  }
  return async (input, init) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    if (url !== "https://api.resend.com/emails") return fetcher(input, init);
    const payload = JSON.parse(String(init?.body ?? "{}"));
    if (typeof payload.to !== "string" || !/^[^@\s]+@example\.invalid$/.test(payload.to)) {
      throw new Error("Local mail capture accepts only disposable example.invalid recipients.");
    }
    const from = String(payload.from ?? "");
    const address = from.match(/<([^>]+)>/)?.[1] ?? from;
    // Never forward provider credentials or Authorization headers to the capture service.
    return fetcher("http://supabase_inbucket_checkmybasket-local:8025/api/v1/send", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        From: { Email: address, Name: "CheckMyBasket local staging" },
        To: [{ Email: payload.to }], Subject: payload.subject,
        HTML: payload.html, Text: payload.text,
      }),
    });
  };
}
