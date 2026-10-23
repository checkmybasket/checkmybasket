// Real local Auth/Edge/Postgres/Mailpit acceptance; never sends to an external inbox.
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const { createClient } = require("@supabase/supabase-js");
const { stagingEnv } = require("./helpers/staging-env.cjs");
const e = stagingEnv();
if (process.env.CMB_TEST_PROJECT_REF !== "local" || e.NEXT_PUBLIC_SUPABASE_URL !== "http://127.0.0.1:54321") {
  throw new Error("This mail acceptance suite runs only against the isolated local stack.");
}
const client = () => createClient(e.NEXT_PUBLIC_SUPABASE_URL, e.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } });
async function rpc(c, name, args) { const r = await c.rpc(name, args); assert.ifError(r.error); return r.data; }
async function inbox() { return (await fetch("http://127.0.0.1:54324/api/v1/messages")).json(); }
(async () => {
  const owner = client(), restored = client();
  let list, group;
  try {
    const a = await owner.auth.signInAnonymously(); assert.ifError(a.error);
    list = await rpc(owner, "save_personal_wishlist", { p_data: { title: "Local mail acceptance", display_name: "Disposable owner" } });
    const email = `local-${crypto.randomUUID()}@example.invalid`;
    const before = await inbox();
    const setup = await owner.functions.invoke("group-recovery", { body: { action: "setup", email, wishlist: true } });
    assert.ifError(setup.error);
    const messages = await inbox();
    assert.equal(messages.total, before.total + 1);
    const message = messages.messages.find(m => m.To.some(t => t.Address === email)); assert(message);
    const body = await (await fetch(`http://127.0.0.1:54324/api/v1/message/${message.ID}`)).json();
    const token = body.Text.match(/http:\/\/localhost:3101\/return#token=([a-f0-9]{64})/)?.[1];
    assert(token, "Recovery links must target the local app");
    const redeemed = await restored.functions.invoke("group-recovery", { body: { action: "redeem", token } });
    assert.ifError(redeemed.error); assert.equal(redeemed.data.verified, true);
    const session = await restored.auth.setSession(redeemed.data); assert.ifError(session.error);
    assert.equal(session.data.user.id, a.data.user.id);
    const ownList = await rpc(restored, "personal_wishlist_owner", { p_id: list }); assert.equal(ownList.id, list);
    const reused = await client().functions.invoke("group-recovery", { body: { action: "redeem", token } });
    assert.equal(reused.error?.context?.status, 400, "Recovery token is single use");
    await rpc(restored, "set_my_email", { p_email: email });
    const status = await rpc(restored, "get_notification_status"); assert.equal(status.state, "verified");
    group = await rpc(restored, "create_group", { p_name: "Local notification acceptance", p_mode: "friends", p_organiser_name: "Disposable owner" });
    for (const name of ["Disposable member one", "Disposable member two"]) {
      const c = client(); const signup = await c.auth.signInAnonymously(); assert.ifError(signup.error);
      await rpc(c, "join_group", { p_invite_code: group.invite_code, p_name: name });
    }
    await rpc(restored, "execute_draw", { p_group_id: group.group_id });
    const beforeDrawMail = await inbox();
    const send = await restored.functions.invoke("send-draw-emails", { body: { group_id: group.group_id } });
    assert.ifError(send.error); assert.equal(send.data.sent, 1); assert.equal(send.data.failed, 0);
    const once = await inbox(); assert.equal(once.total, beforeDrawMail.total + 1);
    const again = await restored.functions.invoke("send-draw-emails", { body: { group_id: group.group_id } });
    assert.ifError(again.error); assert.equal(again.data.sent, 0); assert.equal((await inbox()).total, once.total);
    console.log("PASS: real local recovery setup, captured link, identity restoration, single-use token, verified notification preference, captured draw email and duplicate suppression.");
  } finally {
    const cleanup = (await restored.auth.getSession()).data.session ? restored : owner;
    if (group) { const r = await cleanup.from("groups").delete().eq("id", group.group_id); assert.ifError(r.error); }
    if (list) await rpc(cleanup, "manage_personal_wishlist", { p_id: list, p_action: "delete" });
    console.log("Disposable feature records cleaned; all mail remains in local capture.");
  }
})().catch(error => { console.error(error.message); process.exit(1); });
