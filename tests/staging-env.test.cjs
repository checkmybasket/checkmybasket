const test = require("node:test");
const assert = require("node:assert/strict");
const { stagingEnv, stagingAppUrl } = require("./helpers/staging-env.cjs");
const ref = "abcdefghijklmnopqrst";
const valid = { CMB_TEST_SUPABASE_URL: `https://${ref}.supabase.co`, CMB_TEST_PROJECT_REF: ref, CMB_TEST_SUPABASE_KEY: "sb_publishable_disposable_test_fixture" };
test("integration tests never fall back to application environment credentials", () => {
  assert.throws(() => stagingEnv({ NEXT_PUBLIC_SUPABASE_URL: valid.CMB_TEST_SUPABASE_URL }), /explicitly/);
});
test("production, mismatched projects and privileged keys are refused", () => {
  for (const change of [
    { CMB_TEST_SUPABASE_URL: "https://nejkvrzabdetsnhpeqtl.supabase.co", CMB_TEST_PROJECT_REF: "nejkvrzabdetsnhpeqtl" },
    { CMB_TEST_PROJECT_REF: "anotherstagingrefhere" },
    { CMB_TEST_SUPABASE_KEY: "sb_secret_test" },
    { CMB_TEST_SUPABASE_KEY: `x.${Buffer.from(JSON.stringify({role:"service_role"})).toString("base64url")}.x` },
  ]) assert.throws(() => stagingEnv({ ...valid, ...change }));
});
test("an explicitly selected staging project and local backend are accepted", () => {
  assert.equal(stagingEnv(valid).NEXT_PUBLIC_SUPABASE_URL, valid.CMB_TEST_SUPABASE_URL);
  assert.equal(stagingEnv({ ...valid, CMB_TEST_SUPABASE_URL: "http://127.0.0.1:54321", CMB_TEST_PROJECT_REF: "local" }).NEXT_PUBLIC_SUPABASE_URL, "http://127.0.0.1:54321");
});
test("app integration targets reject production and unsafe origins", () => {
  for (const value of [undefined, "https://www.checkmybasket.co.uk", "https://checkmybasket.co.uk", "https://user:pass@staging.test", "http://remote.test"]) assert.throws(() => stagingAppUrl(value));
  assert.equal(stagingAppUrl("http://localhost:3101"), "http://localhost:3101");
});
