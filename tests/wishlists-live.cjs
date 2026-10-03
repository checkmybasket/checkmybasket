// Uses three disposable anonymous identities, deletes feature data in finally.
// Writes only their IDs to a local cleanup file; never prints session credentials.
const { createClient } = require("@supabase/supabase-js");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
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
const options = { auth: { persistSession: false, autoRefreshToken: false } };
const client = () =>
  createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    options,
  );
async function call(c, name, args) {
  const r = await c.rpc(name, args);
  if (r.error) throw new Error(`${name}: ${r.error.message}`);
  return r.data;
}
async function denied(c, name, args) {
  const r = await c.rpc(name, args);
  assert(r.error, `${name} must deny this request`);
}
(async () => {
  const clients = [client(), client(), client()];
  const ids = [];
  let listId;
  try {
    for (const c of clients) {
      const { data, error } = await c.auth.signInAnonymously();
      if (error) throw error;
      ids.push(data.user.id);
      fs.writeFileSync("/tmp/wishlist-test-users.json", JSON.stringify(ids));
    }
    const [owner, a, b] = clients;
    const guest = client();
    listId = await call(owner, "save_personal_wishlist", {
      p_data: {
        title: "Disposable acceptance list",
        display_name: "Test owner",
      },
    });
    const privateList = await call(owner, "personal_wishlist_owner", {
      p_id: listId,
    });
    assert.equal(privateList.shared, false);
    assert.equal(
      await call(guest, "shared_personal_wishlist", {
        p_token: privateList.share_token,
      }),
      null,
    );
    assert.equal(
      await call(a, "personal_wishlist_owner", { p_id: listId }),
      null,
    );
    await denied(a, "manage_personal_wishlist", {
      p_id: listId,
      p_action: "enable",
    });
    await denied(a, "save_personal_wish", {
      p_list: listId,
      p_data: { title: "intruder" },
    });
    const items = [];
    for (const shop of [
      "www.johnlewis.com",
      "www.amazon.co.uk",
      "www.argos.co.uk",
      "www.menkind.co.uk",
      "independent-shop.co.uk",
    ])
      items.push(
        await call(owner, "save_personal_wish", {
          p_list: listId,
          p_data: {
            title: `Wish from ${shop}`,
            url: `https://${shop}/gift?variant=green`,
            price: null,
            image_url: "https://shop.co.uk/photo.png",
          },
        }),
      );
    await call(owner, "save_personal_wish", {
      p_list: listId,
      p_data: {
        title: "A handmade gift",
        url: "",
        price: 0,
        notes: "Size M, green",
        priority: "love",
      },
    });
    let current = await call(owner, "personal_wishlist_owner", {
      p_id: listId,
    });
    assert.equal(current.items.length, 6);
    assert.equal(current.items[0].price, null);
    assert.equal(current.items[5].price, 0);
    await call(owner, "manage_personal_wish", {
      p_list: listId,
      p_id: items[1],
      p_action: "up",
    });
    current = await call(owner, "personal_wishlist_owner", { p_id: listId });
    assert.equal(current.items[0].id, items[1]);
    await call(owner, "manage_personal_wishlist", {
      p_id: listId,
      p_action: "enable",
    });
    let token = privateList.share_token;
    let view = await call(guest, "shared_personal_wishlist", {
      p_token: token,
    });
    assert.equal(view.items.length, 6);
    assert.equal(
      await call(guest, "personal_wish_image", {
        p_item: items[0],
        p_token: token,
      }),
      "https://shop.co.uk/photo.png",
    );
    assert.equal(
      await call(a, "personal_wish_image", { p_item: items[0] }),
      null,
    );
    assert.equal(
      await call(owner, "personal_wish_image", { p_item: items[0] }),
      "https://shop.co.uk/photo.png",
    );
    assert(!("owner_id" in view));
    assert(!("share_token" in view));
    assert(!JSON.stringify(view).includes(ids[0]));
    await denied(owner, "reserve_personal_wish", {
      p_token: token,
      p_item: items[0],
      p_action: "reserve",
    });
    const races = await Promise.all(
      [a, b].map((c) =>
        c.rpc("reserve_personal_wish", {
          p_token: token,
          p_item: items[0],
          p_action: "reserve",
        }),
      ),
    );
    assert.equal(races.filter((r) => !r.error).length, 1);
    const win = races[0].error ? b : a;
    const lose = win === a ? b : a;
    await call(win, "reserve_personal_wish", {
      p_token: token,
      p_item: items[0],
      p_action: "reserve",
    });
    await denied(lose, "reserve_personal_wish", {
      p_token: token,
      p_item: items[0],
      p_action: "release",
    });
    await denied(lose, "reserve_personal_wish", {
      p_token: token,
      p_item: items[0],
      p_action: "bought",
    });
    view = await call(guest, "shared_personal_wishlist", { p_token: token });
    assert.equal(view.items.find((i) => i.id === items[0]).reserved, true);
    for (const i of view.items) assert(!("user_id" in i));
    assert(!JSON.stringify(view).includes(ids[1]));
    const ownerView = await call(owner, "shared_personal_wishlist", {
      p_token: token,
    });
    assert.equal(
      ownerView.items.find((i) => i.id === items[0]).reserved,
      false,
    );
    const editorView = await call(owner, "personal_wishlist_owner", {
      p_id: listId,
    });
    assert(!("reserved" in editorView.items[0]));
    await call(win, "reserve_personal_wish", {
      p_token: token,
      p_item: items[0],
      p_action: "bought",
    });
    const reservations = await call(win, "my_personal_reservations");
    assert.equal(reservations[0].bought, true);
    await call(owner, "manage_personal_wishlist", {
      p_id: listId,
      p_action: "rotate",
    });
    assert.equal(
      await call(guest, "shared_personal_wishlist", { p_token: token }),
      null,
    );
    current = await call(owner, "personal_wishlist_owner", { p_id: listId });
    assert.equal(
      await call(guest, "personal_wish_image", {
        p_item: items[0],
        p_token: token,
      }),
      null,
    );
    token = current.share_token;
    assert.equal(
      (await call(win, "my_personal_reservations"))[0].share_token,
      token,
    );
    await call(owner, "manage_personal_wishlist", {
      p_id: listId,
      p_action: "disable",
    });
    assert.equal(
      await call(guest, "shared_personal_wishlist", { p_token: token }),
      null,
    );
    await denied(a, "reserve_personal_wish", {
      p_token: token,
      p_item: items[2],
      p_action: "reserve",
    });
    await call(lose, "release_personal_reservation", { p_item: items[0] });
    assert.equal((await call(win, "my_personal_reservations")).length, 1);
    await call(win, "release_personal_reservation", { p_item: items[0] });
    assert.equal((await call(win, "my_personal_reservations")).length, 0);
    await denied(owner, "personal_wishlist_recovery_access", {
      p_user: ids[1],
    });
    const table = await owner
      .schema("personal_wishlist")
      .from("lists")
      .select("*");
    assert(table.error);
    for (let i = 0; i < 20; i++)
      assert.equal(
        await call(owner, "personal_wishlist_metadata_allowed"),
        true,
      );
    assert.equal(
      await call(owner, "personal_wishlist_metadata_allowed"),
      false,
    );
    await call(owner, "manage_personal_wish", {
      p_list: listId,
      p_id: items[0],
      p_action: "delete",
    });
    assert.equal(
      (await call(owner, "personal_wishlist_owner", { p_id: listId })).items
        .length,
      5,
    );
    console.log(
      "PASS: universal links, manual wishes, ownership, private storage, public field boundaries, reordering, atomic reservations, owner-hidden claims, bought/release permissions, link revocation, reservation return access and metadata rate limiting.",
    );
  } finally {
    if (listId)
      await clients[0].rpc("manage_personal_wishlist", {
        p_id: listId,
        p_action: "delete",
      });
    for (const c of clients) await c.auth.signOut();
    console.log("Disposable list removed; test user IDs saved for cleanup.");
  }
})().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
