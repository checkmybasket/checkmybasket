const { createClient } = require("@supabase/supabase-js");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const env = Object.fromEntries(
  fs
    .readFileSync(path.join(__dirname, "../.env.local"), "utf8")
    .split("\n")
    .filter((l) => /^NEXT_PUBLIC_SUPABASE_\w+=/.test(l))
    .map((l) => {
      const at = l.indexOf("=");
      return [l.slice(0, at), l.slice(at + 1).replace(/^['"]|['"]$/g, "")];
    }),
);
const client = () =>
  createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
async function rpc(c, name, args) {
  const r = await c.rpc(name, args);
  if (r.error) throw Error(r.error.message);
  return r.data;
}
async function recovery(body) {
  const r = await fetch(
    `${env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/group-recovery`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        Origin: "http://localhost:3101",
      },
      body: JSON.stringify(body),
    },
  );
  const data = await r.json();
  return { r, data };
}
const file = "/tmp/wishlist-recovery-test.json";
(async () => {
  if (process.argv[2] === "prepare") {
    const owner = client(),
      giver = client();
    const a = await owner.auth.signInAnonymously(),
      b = await giver.auth.signInAnonymously();
    if (a.error || b.error) throw Error("Could not create test identities");
    const list = await rpc(owner, "save_personal_wishlist", {
      p_data: { title: "Recovery acceptance test", display_name: "Test" },
    });
    const item = await rpc(owner, "save_personal_wish", {
      p_list: list,
      p_data: { title: "A test gift" },
    });
    const shared = await rpc(owner, "manage_personal_wishlist", {
      p_id: list,
      p_action: "enable",
    });
    await rpc(giver, "reserve_personal_wish", {
      p_token: shared.share_token,
      p_item: item,
      p_action: "reserve",
    });
    const subjects = [a.data, b.data].map((data, i) => ({
      id: data.user.id,
      session: data.session,
      email: `wishlist-test-${crypto.randomUUID()}@example.invalid`,
      token: crypto.randomBytes(32).toString("hex"),
    }));
    const expired = crypto.randomBytes(32).toString("hex");
    fs.writeFileSync(file, JSON.stringify({ subjects, list, item, expired }), {
      mode: 0o600,
    });
    console.log(
      JSON.stringify({
        subjects: subjects.map((s) => ({
          id: s.id,
          email: s.email,
          hash: crypto.createHash("sha256").update(s.token).digest("hex"),
        })),
        expiredHash: crypto.createHash("sha256").update(expired).digest("hex"),
      }),
    );
    return;
  }
  const state = JSON.parse(fs.readFileSync(file, "utf8"));
  let cleanupClient;
  try {
    for (const [i, subject] of state.subjects.entries()) {
      const { r, data } = await recovery({
        action: "redeem",
        token: subject.token,
      });
      assert.equal(r.status, 200, JSON.stringify(data));
      assert(data.access_token && data.refresh_token);
      const restored = client();
      await restored.auth.setSession({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      });
      const {
        data: { user },
      } = await restored.auth.getUser();
      assert.equal(user.id, subject.id);
      if (i === 0)
        assert.equal(
          (await rpc(restored, "my_personal_wishlists"))[0].id,
          state.list,
        );
      else
        assert.equal(
          (await rpc(restored, "my_personal_reservations"))[0].item_id,
          state.item,
        );
      assert.equal(
        (await recovery({ action: "redeem", token: subject.token })).r.status,
        400,
      );
      if (i === 0) cleanupClient = restored;
      else await restored.auth.signOut({ scope: "local" });
    }
    assert.equal(
      (await recovery({ action: "redeem", token: state.expired })).r.status,
      400,
    );
    console.log(
      "PASS: deployed recovery restores original wishlist ownership and reservation identity on fresh clients; token replay and expiry rejected. No external email sent.",
    );
  } finally {
    const owner = cleanupClient ?? client();
    if (!cleanupClient) await owner.auth.setSession(state.subjects[0].session);
    await rpc(owner, "manage_personal_wishlist", {
      p_id: state.list,
      p_action: "delete",
    });
    await owner.auth.signOut();
    console.log("Recovery test list removed.");
  }
})().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
