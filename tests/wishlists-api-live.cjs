const fs = require("node:fs"),
  path = require("node:path"),
  assert = require("node:assert/strict");
const { createClient } = require("@supabase/supabase-js");
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
(async () => {
  const c = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const { data, error } = await c.auth.signInAnonymously();
  if (error) throw error;
  fs.writeFileSync(
    "/tmp/wishlist-api-user.json",
    JSON.stringify({ id: data.user.id }),
    { mode: 0o600 },
  );
  const project = new URL(env.NEXT_PUBLIC_SUPABASE_URL).hostname.split(".")[0];
  const cookie = `sb-${project}-auth-token=base64-${Buffer.from(JSON.stringify(data.session)).toString("base64url")}`;
  const base = process.env.WISHLIST_TEST_URL ?? "http://localhost:3101";
  const headers = { "Content-Type": "application/json", Cookie: cookie };
  try {
    const unauth = await fetch(`${base}/api/wishlists/metadata`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "https://www.johnlewis.com" }),
    });
    assert.equal(unauth.status, 401);
    for (const url of [
      "http://127.0.0.1/",
      "http://169.254.169.254/",
      "javascript:alert(1)",
      "https://www.argos.co.uk/not-a-real-product",
    ]) {
      const r = await fetch(`${base}/api/wishlists/metadata`, {
        method: "POST",
        headers,
        body: JSON.stringify({ url }),
      });
      assert.equal(r.status, 200);
      const d = await r.json();
      assert(d.message);
      assert(!d.title);
    }
    const r = await fetch(`${base}/api/wishlists/metadata`, {
      method: "POST",
      headers,
      body: JSON.stringify({ url: "https://www.checkmybasket.co.uk" }),
    });
    assert.equal(r.status, 200);
    const d = await r.json();
    assert(d.title && d.title.includes("CheckMyBasket"), JSON.stringify(d));
    const image = await fetch(
      `${base}/api/wishlists/image?url=https://www.checkmybasket.co.uk/icon`,
    );
    assert.equal(image.status, 404);
    const itemId = "11111111-1111-4111-8111-111111111111";
    assert.equal(
      (await fetch(`${base}/api/wishlists/image?item=${itemId}`)).status,
      404,
    );
    for (const route of [
      "/wishlists",
      "/wishlists/" + itemId,
      "/w/" + itemId,
      "/return",
    ]) {
      const response = await fetch(base + route);
      assert.equal(response.status, 200);
      const html = await response.text();
      assert(html.includes("noindex"));
      assert(html.includes("CheckMyBasket"));
      assert(!html.includes(data.session.access_token));
    }
    console.log(
      "PASS: rendered routes, no-index pages, authenticated metadata, safe public preview, private URL rejection, manual fallback and restricted image proxy.",
    );
  } finally {
    await c.auth.signOut();
  }
})().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
