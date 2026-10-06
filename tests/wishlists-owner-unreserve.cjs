// Run against an isolated in-memory Postgres instance with PGlite available.
// PGLITE_MODULE can point to a temporary install; no live credentials are used.
const { PGlite } = require(process.env.PGLITE_MODULE || "@electric-sql/pglite");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
(async () => {
  const db = new PGlite();
  try {
    await db.exec(`
      create role anon; create role authenticated; create role service_role;
      create schema auth; create table auth.users(id uuid primary key);
      create function auth.uid() returns uuid language sql stable as $$
        select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
      $$;
      create type public.wishlist_priority as enum ('love', 'like', 'inspiration');
    `);
    for (const name of [
      "20261003185559_individual_wishlists.sql",
      "20261006190147_personal_wishlist_owner_unreserve.sql",
    ]) {
      await db.exec(
        fs.readFileSync(
          path.join(__dirname, "../supabase/migrations", name),
          "utf8",
        ),
      );
    }
    const owner = "00000000-0000-4000-8000-000000000001";
    const buyer = "00000000-0000-4000-8000-000000000002";
    const other = "00000000-0000-4000-8000-000000000003";
    await db.query("insert into auth.users values ($1), ($2), ($3)", [
      owner,
      buyer,
      other,
    ]);
    async function as(user, role = "authenticated") {
      await db.exec("reset role");
      await db.query("select set_config('request.jwt.claim.sub', $1, false)", [
        user || "",
      ]);
      await db.exec(`set role ${role}`);
    }
    async function rpc(name, args) {
      const placeholders = args.map((_, i) => `$${i + 1}`).join(",");
      return (
        await db.query(`select public.${name}(${placeholders}) as value`, args)
      ).rows[0].value;
    }
    await as(owner);
    const list = await rpc("save_personal_wishlist", [
      { title: "Backup test", display_name: "Owner" },
    ]);
    const secondList = await rpc("save_personal_wishlist", [
      { title: "Other list", display_name: "Owner" },
    ]);
    const item = await rpc("save_personal_wish", [list, { title: "Gift" }]);
    const sibling = await rpc("save_personal_wish", [
      list,
      { title: "Keep reservation" },
    ]);
    const foreignItem = await rpc("save_personal_wish", [
      secondList,
      { title: "Other gift" },
    ]);
    const { share_token: token } = await rpc("manage_personal_wishlist", [
      list,
      "enable",
    ]);
    await as(buyer);
    for (const gift of [item, sibling])
      await rpc("reserve_personal_wish", [token, gift, "reserve"]);
    await rpc("reserve_personal_wish", [token, item, "bought"]);
    await assert.rejects(
      rpc("manage_personal_wish", [list, item, "release"]),
      /Wishlist not available/,
    );
    await as(other);
    let shared = await rpc("shared_personal_wishlist", [token]);
    assert.equal(shared.items.find((i) => i.id === item).reserved, true);
    await assert.rejects(
      rpc("manage_personal_wish", [list, item, "release"]),
      /Wishlist not available/,
    );
    await assert.rejects(
      rpc("reserve_personal_wish", [token, item, "release"]),
      /Only the person/,
    );
    await as(null, "anon");
    await assert.rejects(
      rpc("manage_personal_wish", [list, item, "release"]),
      /permission denied/,
    );
    await as(null);
    await assert.rejects(
      rpc("manage_personal_wish", [list, item, "release"]),
      /Wishlist not available/,
    );
    await as(owner);
    await assert.rejects(
      rpc("manage_personal_wish", [list, foreignItem, "release"]),
      /Gift not available/,
    );
    await assert.rejects(
      rpc("manage_personal_wish", [list, item, "unknown"]),
      /Unknown action/,
    );
    const ownerItems = (await rpc("personal_wishlist_owner", [list])).items;
    assert(
      ownerItems.every(
        (i) => !("reserved" in i) && !("bought" in i) && !("mine" in i),
      ),
    );
    assert.equal(
      await rpc("manage_personal_wish", [list, item, "release"]),
      "",
    );
    assert.equal(
      await rpc("manage_personal_wish", [list, item, "release"]),
      "",
    );
    assert.equal(
      (await rpc("personal_wishlist_owner", [list])).items.length,
      2,
    );
    await as(other);
    shared = await rpc("shared_personal_wishlist", [token]);
    assert.equal(shared.items.find((i) => i.id === item).reserved, false);
    assert.equal(shared.items.find((i) => i.id === sibling).reserved, true);
    await rpc("reserve_personal_wish", [token, item, "reserve"]);
    await as(buyer);
    assert(
      !(await rpc("my_personal_reservations", [])).some(
        (i) => i.item_id === item,
      ),
    );
    await assert.rejects(
      rpc("reserve_personal_wish", [token, item, "release"]),
      /Only the person/,
    );
    await as(owner);
    await rpc("manage_personal_wishlist", [list, "disable"]);
    await rpc("manage_personal_wish", [list, item, "release"]);
    await rpc("manage_personal_wishlist", [list, "enable"]);
    await as(other);
    await rpc("reserve_personal_wish", [token, item, "reserve"]);
    await rpc("reserve_personal_wish", [token, item, "release"]);
    assert.equal(
      (await rpc("shared_personal_wishlist", [token])).items.find(
        (i) => i.id === item,
      ).reserved,
      false,
    );
    console.log(
      "PASS: owner-only backup, guest/anonymous denials, gift membership, bought reset, idempotence, gift retention, other reservations retained, re-reservation, former buyer denial, private-list backup and reserver release.",
    );
  } finally {
    await db.close();
  }
})().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
