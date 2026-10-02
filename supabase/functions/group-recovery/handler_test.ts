import { assert, assertEquals } from "jsr:@std/assert@1.0.19";

Deno.env.set("SUPABASE_URL", "https://recovery-test.supabase.co");
Deno.env.set("SUPABASE_ANON_KEY", "test-anon-key");
Deno.env.set("SUPABASE_SERVICE_ROLE_KEY", "test-service-key");
Deno.env.set("RESEND_API_KEY", "test-resend-key");
Deno.env.set("EMAIL_FROM", "CheckMyBasket <noreply@example.invalid>");
const { handleRequest } = await import("./handler.ts");
const originalFetch = globalThis.fetch;
const userId = "11111111-1111-4111-8111-111111111111";
const groupId = "22222222-2222-4222-8222-222222222222";
let calls: { url: string; method: string; body: Record<string, unknown> | null }[];
let sendFails = false;
let member = true;
let rateAllowed = true;
let authed = true;
let registered = false;
function mock() {
  calls = []; sendFails = false; member = true; rateAllowed = true; authed = true; registered = false;
  globalThis.fetch = async (input, init) => {
    const url = String(input), method = init?.method ?? "GET";
    const body = init?.body ? JSON.parse(String(init.body)) : null;
    calls.push({ url, method, body });
    const path = new URL(url).pathname;
    if (path === "/auth/v1/user") return Response.json(authed ? { id: userId, email: "", is_anonymous: true } : { message: "Invalid token" }, { status: authed ? 200 : 401 });
    if (path === "/rest/v1/rpc/recovery_rate_limit") return Response.json(rateAllowed);
    if (path === "/rest/v1/recovery_identities") return Response.json(registered ? [{ user_id: userId, email: "member@example.invalid" }] : []);
    if (path === "/rest/v1/group_members") return Response.json(member ? [{ group_id: groupId }] : []);
    if (path === "/rest/v1/recovery_tokens") return Response.json([], { status: method === "POST" ? 201 : 200 });
    if (url === "https://api.resend.com/emails") return Response.json(sendFails ? { error: "provider error" } : { id: "test-message" }, { status: sendFails ? 500 : 200 });
    throw new Error(`Unexpected request ${method} ${path}`);
  };
}
function request(body: unknown, bearer = true) {
  return new Request("https://recovery-test.supabase.co/functions/v1/group-recovery", {
    method: "POST", headers: { Origin: "https://www.checkmybasket.co.uk", "Content-Type": "application/json", ...(bearer ? { Authorization: "Bearer test-member-token" } : {}) }, body: JSON.stringify(body),
  });
}
Deno.test("setup sends a private expiring fragment link and stores only its hash", async () => {
  mock();
  try {
    const r = await handleRequest(request({ action: "setup", email: " Member@Example.invalid ", group_id: groupId }));
    assertEquals(r.status, 200);
    const saved = calls.find(c => c.method === "POST" && c.url.includes("/recovery_tokens"))!.body!;
    const sent = calls.find(c => c.url === "https://api.resend.com/emails")!.body!;
    assertEquals(sent.to, "member@example.invalid");
    assertEquals(saved.email, "member@example.invalid");
    assertEquals(saved.user_id, userId);
    const token = String(sent.text).match(/\/return#token=([a-f0-9]{64})/)?.[1]; assert(token);
    const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
    const hashed = Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, "0")).join("");
    assertEquals(saved.token_hash, hashed); assert(saved.token_hash !== token);
    assert(String(sent.text).includes("15 minutes and works once"));
    assert(!JSON.stringify(saved).includes(token));
    assert(!JSON.stringify(await r.json()).includes(token));
    assertEquals(r.headers.get("cache-control"), "no-store");
  } finally { globalThis.fetch = originalFetch; }
});
Deno.test("failed delivery removes the undelivered credential", async () => {
  mock(); sendFails = true;
  try {
    const r = await handleRequest(request({ action: "setup", email: "member@example.invalid", group_id: groupId }));
    assertEquals(r.status, 503);
    assert(calls.some(c => c.method === "DELETE" && c.url.includes("/recovery_tokens")));
  } finally { globalThis.fetch = originalFetch; }
});
Deno.test("nonmembers and unauthenticated users cannot send setup emails", async () => {
  mock(); member = false;
  try {
    const denied = await handleRequest(request({ action: "setup", email: "member@example.invalid", group_id: groupId }));
    assertEquals(denied.status, 403); assert(!calls.some(c => c.url.includes("resend.com")));
    authed = false;
    const unauth = await handleRequest(request({ action: "setup", email: "member@example.invalid", group_id: groupId }, false));
    assertEquals(unauth.status, 401);
  } finally { globalThis.fetch = originalFetch; }
});
Deno.test("unknown addresses and rate-limited addresses get identical responses without email", async () => {
  mock();
  try {
    const unknown = await handleRequest(request({ action: "request", email: "unknown@example.invalid" }, false));
    const a = await unknown.json();
    rateAllowed = false;
    const limited = await handleRequest(request({ action: "request", email: "unknown@example.invalid" }, false));
    assertEquals(limited.status, unknown.status); assertEquals(await limited.json(), a);
    assert(!calls.some(c => c.url.includes("resend.com")));
  } finally { globalThis.fetch = originalFetch; }
});
Deno.test("setup rate limits and malformed requests fail closed", async () => {
  mock(); rateAllowed = false;
  try {
    assertEquals((await handleRequest(request({ action: "setup", email: "member@example.invalid", group_id: groupId }))).status, 429);
    assertEquals((await handleRequest(request({ action: "redeem", token: "wrong" }, false))).status, 400);
    assertEquals((await handleRequest(request(null, false))).status, 400);
    assert(!calls.some(c => c.url.includes("resend.com")));
  } finally { globalThis.fetch = originalFetch; }
});

Deno.test("registered, unknown and mail-provider failures do not reveal email registration", async () => {
  mock();
  try {
    const unknown = await handleRequest(request({ action: "request", email: "member@example.invalid" }, false));
    const response = await unknown.json();
    registered = true;
    const known = await handleRequest(request({ action: "request", email: "member@example.invalid" }, false));
    assertEquals(known.status, unknown.status); assertEquals(await known.json(), response);
    assert(calls.some(c => c.url.includes("resend.com")));
    sendFails = true;
    const failed = await handleRequest(request({ action: "request", email: "member@example.invalid" }, false));
    assertEquals(failed.status, unknown.status); assertEquals(await failed.json(), response);
  } finally { globalThis.fetch = originalFetch; }
});
