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
let calls: {
  url: string;
  method: string;
  body: Record<string, unknown> | null;
}[];
let sendFails = false;
let member = true;
let rateAllowed = true;
let authed = true;
let registered = false;
let wishlistAccess = false;
let savedOrganiser = false;
let savedEmail = "member@example.invalid";
let existingRecoveryEmail = "";
let authEmail = "";
function mock() {
  calls = [];
  sendFails = false;
  member = true;
  rateAllowed = true;
  authed = true;
  registered = false;
  wishlistAccess = false;
  savedOrganiser = false;
  savedEmail = "member@example.invalid";
  existingRecoveryEmail = "";
  authEmail = "";
  globalThis.fetch = async (input, init) => {
    const url = String(input),
      method = init?.method ?? "GET";
    const body = init?.body ? JSON.parse(String(init.body)) : null;
    calls.push({ url, method, body });
    const path = new URL(url).pathname;
    if (path === "/auth/v1/user") {
      return Response.json(
        authed
          ? { id: userId, email: "", is_anonymous: true }
          : { message: "Invalid token" },
        { status: authed ? 200 : 401 },
      );
    }
    if (path === "/rest/v1/rpc/personal_wishlist_recovery_access") {
      return Response.json(wishlistAccess);
    }
    if (path === "/rest/v1/rpc/recovery_rate_limit") {
      return Response.json(rateAllowed);
    }
    if (path === "/rest/v1/recovery_identities") {
      if (new URL(url).searchParams.has("user_id")) {
        return Response.json(
          existingRecoveryEmail ? [{ email: existingRecoveryEmail }] : [],
        );
      }
      return Response.json(
        registered
          ? [{ user_id: userId, email: "member@example.invalid" }]
          : [],
      );
    }
    if (path === "/rest/v1/groups") {
      return Response.json(savedOrganiser ? [{ organiser_id: userId }] : []);
    }
    if (path === "/rest/v1/profiles") {
      return Response.json(
        savedOrganiser ? [{ id: userId, email: savedEmail }] : [],
      );
    }
    if (path === "/auth/v1/admin/users/" + userId) {
      return Response.json({
        id: userId,
        email: authEmail,
        is_anonymous: !authEmail,
      });
    }
    if (path === "/rest/v1/group_members") {
      return Response.json(member ? [{ group_id: groupId }] : []);
    }
    if (path === "/rest/v1/recovery_tokens") {
      return Response.json([], { status: method === "POST" ? 201 : 200 });
    }
    if (url === "https://api.resend.com/emails") {
      return Response.json(
        sendFails ? { error: "provider error" } : { id: "test-message" },
        { status: sendFails ? 500 : 200 },
      );
    }
    throw new Error(`Unexpected request ${method} ${path}`);
  };
}
function request(body: unknown, bearer = true) {
  return new Request(
    "https://recovery-test.supabase.co/functions/v1/group-recovery",
    {
      method: "POST",
      headers: {
        Origin: "https://www.checkmybasket.co.uk",
        "Content-Type": "application/json",
        ...(bearer ? { Authorization: "Bearer test-member-token" } : {}),
      },
      body: JSON.stringify(body),
    },
  );
}
Deno.test(
  "setup sends a private expiring fragment link and stores only its hash",
  async () => {
    mock();
    try {
      const r = await handleRequest(
        request({
          action: "setup",
          email: " Member@Example.invalid ",
          group_id: groupId,
        }),
      );
      assertEquals(r.status, 200);
      const saved = calls.find(
        (c) => c.method === "POST" && c.url.includes("/recovery_tokens"),
      )!.body!;
      const sent = calls.find(
        (c) => c.url === "https://api.resend.com/emails",
      )!.body!;
      assertEquals(sent.to, "member@example.invalid");
      assertEquals(saved.email, "member@example.invalid");
      assertEquals(saved.user_id, userId);
      const token = String(sent.text).match(
        /\/return#token=([a-f0-9]{64})/,
      )?.[1];
      assert(token);
      const bytes = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(token),
      );
      const hashed = Array.from(
        new Uint8Array(bytes),
        (b) => b.toString(16).padStart(2, "0"),
      ).join("");
      assertEquals(saved.token_hash, hashed);
      assert(saved.token_hash !== token);
      assert(String(sent.text).includes("15 minutes and works once"));
      assert(!JSON.stringify(saved).includes(token));
      assert(!JSON.stringify(await r.json()).includes(token));
      assertEquals(r.headers.get("cache-control"), "no-store");
    } finally {
      globalThis.fetch = originalFetch;
    }
  },
);
Deno.test("failed delivery removes the undelivered credential", async () => {
  mock();
  sendFails = true;
  try {
    const r = await handleRequest(
      request({
        action: "setup",
        email: "member@example.invalid",
        group_id: groupId,
      }),
    );
    assertEquals(r.status, 503);
    assert(
      calls.some(
        (c) => c.method === "DELETE" && c.url.includes("/recovery_tokens"),
      ),
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
Deno.test(
  "nonmembers and unauthenticated users cannot send setup emails",
  async () => {
    mock();
    member = false;
    try {
      const denied = await handleRequest(
        request({
          action: "setup",
          email: "member@example.invalid",
          group_id: groupId,
        }),
      );
      assertEquals(denied.status, 403);
      assert(!calls.some((c) => c.url.includes("resend.com")));
      authed = false;
      const unauth = await handleRequest(
        request(
          {
            action: "setup",
            email: "member@example.invalid",
            group_id: groupId,
          },
          false,
        ),
      );
      assertEquals(unauth.status, 401);
    } finally {
      globalThis.fetch = originalFetch;
    }
  },
);
Deno.test(
  "unknown addresses and rate-limited addresses get identical responses without email",
  async () => {
    mock();
    try {
      const unknown = await handleRequest(
        request({ action: "request", email: "unknown@example.invalid" }, false),
      );
      const a = await unknown.json();
      rateAllowed = false;
      const limited = await handleRequest(
        request({ action: "request", email: "unknown@example.invalid" }, false),
      );
      assertEquals(limited.status, unknown.status);
      assertEquals(await limited.json(), a);
      assert(!calls.some((c) => c.url.includes("resend.com")));
    } finally {
      globalThis.fetch = originalFetch;
    }
  },
);
Deno.test("setup rate limits and malformed requests fail closed", async () => {
  mock();
  rateAllowed = false;
  try {
    assertEquals(
      (
        await handleRequest(
          request({
            action: "setup",
            email: "member@example.invalid",
            group_id: groupId,
          }),
        )
      ).status,
      429,
    );
    assertEquals(
      (
        await handleRequest(
          request({ action: "redeem", token: "wrong" }, false),
        )
      ).status,
      400,
    );
    assertEquals((await handleRequest(request(null, false))).status, 400);
    assert(!calls.some((c) => c.url.includes("resend.com")));
  } finally {
    globalThis.fetch = originalFetch;
  }
});

Deno.test(
  "registered, unknown and mail-provider failures do not reveal email registration",
  async () => {
    mock();
    try {
      const unknown = await handleRequest(
        request({ action: "request", email: "member@example.invalid" }, false),
      );
      const response = await unknown.json();
      registered = true;
      const known = await handleRequest(
        request({ action: "request", email: "member@example.invalid" }, false),
      );
      assertEquals(known.status, unknown.status);
      assertEquals(await known.json(), response);
      assert(calls.some((c) => c.url.includes("resend.com")));
      sendFails = true;
      const failed = await handleRequest(
        request({ action: "request", email: "member@example.invalid" }, false),
      );
      assertEquals(failed.status, unknown.status);
      assertEquals(await failed.json(), response);
    } finally {
      globalThis.fetch = originalFetch;
    }
  },
);

Deno.test(
  "wishlist owners and reservers can verify email without a group",
  async () => {
    mock();
    member = false;
    wishlistAccess = true;
    try {
      const r = await handleRequest(
        request({
          action: "setup",
          email: "member@example.invalid",
          wishlist: true,
        }),
      );
      assertEquals(r.status, 200);
      assert(calls.some((c) => c.url.includes("resend.com")));
      assertEquals(
        calls.find(
          (c) => c.method === "POST" && c.url.includes("/recovery_tokens"),
        )!.body!.group_id,
        null,
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  },
);
Deno.test(
  "unrelated browser identities cannot verify wishlist recovery",
  async () => {
    mock();
    member = false;
    try {
      const r = await handleRequest(
        request({
          action: "setup",
          email: "member@example.invalid",
          wishlist: true,
        }),
      );
      assertEquals(r.status, 403);
      assert(!calls.some((c) => c.url.includes("resend.com")));
    } finally {
      globalThis.fetch = originalFetch;
    }
  },
);
Deno.test(
  "verified wishlist-only identities can request fresh login links",
  async () => {
    mock();
    member = false;
    registered = true;
    wishlistAccess = true;
    try {
      const r = await handleRequest(
        request({ action: "request", email: "member@example.invalid" }, false),
      );
      assertEquals(r.status, 200);
      assert(calls.some((c) => c.url.includes("resend.com")));
      wishlistAccess = false;
      calls = [];
      const noAccess = await handleRequest(
        request({ action: "request", email: "member@example.invalid" }, false),
      );
      assertEquals(noAccess.status, 200);
      assert(!calls.some((c) => c.url.includes("resend.com")));
    } finally {
      globalThis.fetch = originalFetch;
    }
  },
);

Deno.test("saved organiser email can request verification for the exact group before recovery setup", async () => {
  mock();
  savedOrganiser = true;
  try {
    const response = await handleRequest(
      request({
        action: "request",
        email: " Member@Example.invalid ",
        group_id: groupId,
      }, false),
    );
    assertEquals(response.status, 200);
    const token = calls.find((call) =>
      call.method === "POST" && call.url.includes("/recovery_tokens")
    )!.body!;
    assertEquals(token.user_id, userId);
    assertEquals(token.group_id, groupId);
    assertEquals(token.purpose, "setup");
    assertEquals(token.email, "member@example.invalid");
    assert(calls.some((call) => call.url === "https://api.resend.com/emails"));
    assert(
      !calls.some((call) =>
        call.url.includes("/auth/v1/admin/users") && call.method === "PUT"
      ),
    );
    assert(!JSON.stringify(await response.json()).includes("access_token"));
  } finally {
    globalThis.fetch = originalFetch;
  }
});

Deno.test("saved organiser recovery refuses missing group, wrong email, nonmembers and existing different identities", async () => {
  for (
    const failure of [
      "no-group",
      "wrong-email",
      "missing-group",
      "not-organiser",
      "auth-conflict",
      "recovery-conflict",
      "rate-limit",
    ]
  ) {
    mock();
    savedOrganiser = true;
    const email = failure === "wrong-email"
      ? "other@example.invalid"
      : "member@example.invalid";
    if (failure === "missing-group") savedOrganiser = false;
    if (failure === "not-organiser") member = false;
    if (failure === "auth-conflict") authEmail = "other@example.invalid";
    if (failure === "recovery-conflict") {
      existingRecoveryEmail = "other@example.invalid";
    }
    if (failure === "rate-limit") rateAllowed = false;
    try {
      const response = await handleRequest(
        request({
          action: "request",
          email,
          ...(failure === "no-group" ? {} : { group_id: groupId }),
        }, false),
      );
      assertEquals(response.status, 200);
      assert(
        !calls.some((call) => call.url === "https://api.resend.com/emails"),
        failure,
      );
      assert(
        !calls.some((call) => call.url.includes("/recovery_tokens")),
        failure,
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  }
});

Deno.test("saved organiser recovery hides delivery failures and removes undelivered tokens", async () => {
  mock();
  savedOrganiser = true;
  sendFails = true;
  try {
    const response = await handleRequest(
      request({
        action: "request",
        email: "member@example.invalid",
        group_id: groupId,
      }, false),
    );
    assertEquals(response.status, 200);
    assert(
      calls.some((call) =>
        call.method === "DELETE" && call.url.includes("/recovery_tokens")
      ),
    );
    assert(!JSON.stringify(await response.json()).includes("provider"));
  } finally {
    globalThis.fetch = originalFetch;
  }
});

Deno.test("verified recovery cannot redirect a different account into the requested group", async () => {
  mock();
  registered = true;
  member = false;
  try {
    const response = await handleRequest(
      request({
        action: "request",
        email: "member@example.invalid",
        group_id: groupId,
      }, false),
    );
    assertEquals(response.status, 200);
    assert(!calls.some((call) => call.url === "https://api.resend.com/emails"));
  } finally {
    globalThis.fetch = originalFetch;
  }
});

Deno.test("emailed setup proof restores the same organiser identity once without changing group records", async () => {
  mock();
  const baseFetch = globalThis.fetch;
  let consumed = false;
  let confirmed = false;
  globalThis.fetch = async (input, init) => {
    const url = String(input);
    const path = new URL(url).pathname;
    const method = init?.method ?? "GET";
    const body = init?.body ? JSON.parse(String(init.body)) : null;
    if (path === "/rest/v1/rpc/consume_recovery_token") {
      const token = consumed ? [] : [{
        user_id: userId,
        email: "member@example.invalid",
        purpose: "setup",
        group_id: groupId,
      }];
      consumed = true;
      return Response.json(token);
    }
    if (path === "/auth/v1/admin/users/" + userId) {
      calls.push({ url, method, body });
      if (method === "PUT") confirmed = true;
      return Response.json({
        id: userId,
        email: confirmed ? "member@example.invalid" : "",
        email_confirmed_at: confirmed ? new Date().toISOString() : null,
      });
    }
    if (path === "/rest/v1/recovery_identities" && method === "POST") {
      calls.push({ url, method, body });
      return Response.json(null, { status: 201 });
    }
    if (path === "/auth/v1/admin/generate_link") {
      calls.push({ url, method, body });
      return Response.json({
        id: userId,
        email: "member@example.invalid",
        action_link: "https://test.supabase.co",
        email_otp: "123456",
        hashed_token: "fixture-hash",
        redirect_to: "https://www.checkmybasket.co.uk",
        verification_type: "magiclink",
      });
    }
    if (path === "/auth/v1/verify") {
      return Response.json({
        access_token: "fixture-access",
        refresh_token: "fixture-refresh",
        expires_in: 3600,
        token_type: "bearer",
        user: { id: userId, email: "member@example.invalid" },
      });
    }
    return baseFetch(input, init);
  };
  try {
    const response = await handleRequest(
      request({ action: "redeem", token: "a".repeat(64) }, false),
    );
    assertEquals(response.status, 200);
    const reply = await response.json();
    assertEquals(reply.group_id, groupId);
    assertEquals(reply.access_token, "fixture-access");
    const verified = calls.find((call) =>
      call.url.includes("/recovery_identities") && call.method === "POST"
    )!.body!;
    assertEquals(verified.user_id, userId);
    assertEquals(verified.auth_ready, true);
    assert(
      !calls.some((call) =>
        ["/rest/v1/groups", "/rest/v1/group_members", "/rest/v1/draws"].some(
          (path) => call.url.includes(path),
        ) && call.method !== "GET"
      ),
    );
    const replay = await handleRequest(
      request({ action: "redeem", token: "a".repeat(64) }, false),
    );
    assertEquals(replay.status, 400);
    assertEquals(
      calls.filter((call) =>
        call.url.includes("/auth/v1/admin/users/") && call.method === "PUT"
      ).length,
      1,
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
