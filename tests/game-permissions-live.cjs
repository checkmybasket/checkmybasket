// Disposable integration fixtures; explicit staging configuration is mandatory.
const assert = require("node:assert/strict");
const { createClient } = require("@supabase/supabase-js");
const { stagingEnv } = require("./helpers/staging-env.cjs");
const e = stagingEnv();
const client = () => createClient(e.NEXT_PUBLIC_SUPABASE_URL, e.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } });
async function ok(request) { const r = await request; assert.ifError(r.error); return r.data; }
async function denied(request) { const r = await request; assert.equal(r.error?.code, "42501"); }
(async () => {
  const owner = client(), member = client(), outsider = client();
  let group;
  try {
    const ids = [];
    for (const c of [owner, member, outsider]) ids.push((await ok(c.auth.signInAnonymously())).user.id);
    group = await ok(owner.rpc("create_group", { p_name: "Disposable game permissions", p_mode: "friends", p_organiser_name: "Local owner" }));
    await ok(member.rpc("join_group", { p_invite_code: group.invite_code, p_name: "Local participant" }));
    const round = await ok(owner.from("prediction_rounds").insert({ group_id: group.group_id }).select().single());
    await denied(member.from("prediction_rounds").insert({ group_id: group.group_id }));
    const attempted = await ok(member.from("prediction_rounds").update({ status: "revealed" }).eq("id", round.id).select());
    assert.deepEqual(attempted, []);
    assert.equal((await ok(owner.from("prediction_rounds").select("status").eq("id", round.id).single())).status, "open");
    await denied(outsider.from("actual_gifts").insert({ round_id: round.id, recipient_id: ids[2], logged_by: ids[2], actual_category: "mug" }));
    await denied(member.from("actual_gifts").insert({ round_id: round.id, recipient_id: ids[0], logged_by: ids[1], actual_category: "mug" }));
    await denied(member.from("predictions").insert({ round_id: round.id, predictor_id: ids[1], subject_id: ids[2], predicted_category: "mug" }));
    await denied(member.from("predictions").insert({ round_id: round.id, predictor_id: ids[0], subject_id: ids[1], predicted_category: "mug" }));
    assert.deepEqual(await ok(member.from("predictions").select("id").eq("round_id", round.id)), []);
    await ok(member.from("predictions").insert({ round_id: round.id, predictor_id: ids[1], subject_id: ids[0], predicted_category: "mug" }));
    assert.equal((await ok(member.from("predictions").select("id").eq("round_id", round.id))).length, 1);
    assert.deepEqual(await ok(owner.from("predictions").select("id").eq("round_id", round.id)), []);
    await ok(owner.from("prediction_rounds").update({ status: "closed" }).eq("id", round.id));
    await denied(owner.from("predictions").insert({ round_id: round.id, predictor_id: ids[0], subject_id: ids[1], predicted_category: "book" }));
    await ok(owner.from("prediction_rounds").update({ status: "revealed" }).eq("id", round.id));
    await denied(owner.from("predictions").insert({ round_id: round.id, predictor_id: ids[0], subject_id: ids[1], predicted_category: "book" }));
    const revealed = await ok(owner.from("predictions").select("predictor_id,subject_id,predicted_category").eq("round_id", round.id));
    assert.deepEqual(revealed, [{ predictor_id: ids[1], subject_id: ids[0], predicted_category: "mug" }]);
    assert.deepEqual(await ok(outsider.from("predictions").select("id").eq("round_id", round.id)), []);

    assert.deepEqual(await ok(owner.from("actual_gifts").select("id").eq("round_id", round.id)), []);
    await ok(member.from("actual_gifts").insert({ round_id: round.id, recipient_id: ids[1], logged_by: ids[1], actual_category: "book" }));
    const gifts = await ok(owner.from("actual_gifts").select("recipient_id,actual_category").eq("round_id", round.id));
    assert.deepEqual(gifts, [{ recipient_id: ids[1], actual_category: "book" }]);
    console.log("PASS: participant cannot start/reveal rounds; outsider/impersonated actual gifts denied without writes; member logs own gift; invalid prediction subjects and impersonation denied, valid predictions saved and private before reveal; closed/revealed writes denied without changes and revealed data hidden from outsiders.");
  } finally {
    if (group) await ok(owner.from("groups").delete().eq("id", group.group_id));
  }
})().catch(error => { console.error(error.message); process.exit(1); });
