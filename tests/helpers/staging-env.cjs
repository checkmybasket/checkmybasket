const PRODUCTION_REF = "nejkvrzabdetsnhpeqtl";

function stagingAppUrl(value) {
  if (!value) throw new Error("Set CMB_TEST_APP_URL to the isolated app URL.");
  const url = new URL(value);
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if (url.username || url.password || url.search || url.hash || url.pathname !== "/" ||
      /(^|\.)checkmybasket\.co\.uk$/.test(url.hostname) ||
      (url.protocol !== "https:" && !(local && url.protocol === "http:"))) {
    throw new Error("Integration tests require an isolated HTTPS app or local loopback URL.");
  }
  return url.origin;
}

function stagingEnv(env = process.env) {
  const value = env.CMB_TEST_SUPABASE_URL;
  const ref = env.CMB_TEST_PROJECT_REF;
  const key = env.CMB_TEST_SUPABASE_KEY;
  if (!value || !ref || !key) {
    throw new Error("Set CMB_TEST_SUPABASE_URL, CMB_TEST_PROJECT_REF and CMB_TEST_SUPABASE_KEY explicitly. Application .env.local is never used for integration writes.");
  }
  const url = new URL(value);
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if (ref === PRODUCTION_REF || url.hostname === `${PRODUCTION_REF}.supabase.co` ||
      url.username || url.password || url.pathname !== "/" || url.search || url.hash ||
      (local ? ref !== "local" || url.protocol !== "http:" :
        !/^[a-z0-9]{20}$/.test(ref) || url.hostname !== `${ref}.supabase.co` || url.protocol !== "https:")) {
    throw new Error("Refusing integration writes: configure the exact isolated staging project (never production), or local Supabase with project ref local.");
  }
  let publicKey = key.startsWith("sb_publishable_");
  if (!publicKey && !key.startsWith("sb_secret_")) {
    try { publicKey = JSON.parse(Buffer.from(key.split(".")[1], "base64url")).role === "anon"; }
    catch { /* Invalid or privileged keys must fail before any request. */ }
  }
  if (!publicKey) throw new Error("Integration clients require a publishable/anon key, never a privileged key.");
  return {
    NEXT_PUBLIC_SUPABASE_URL: url.origin,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: key,
    appUrl: env.CMB_TEST_APP_URL ? stagingAppUrl(env.CMB_TEST_APP_URL) : undefined,
  };
}
module.exports = { stagingEnv, stagingAppUrl };
