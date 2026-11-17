const { test } = require("node:test");
const assert = require("node:assert/strict");
const ts = require("typescript");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "wishlist-unit-"));
for (const name of ["types", "urls", "safe-fetch"])
  fs.writeFileSync(
    path.join(tmp, `${name}.js`),
    ts.transpileModule(
      fs.readFileSync(
        path.join(__dirname, `../lib/wishlists/${name}.ts`),
        "utf8",
      ),
      {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          target: ts.ScriptTarget.ES2022,
          esModuleInterop: true,
        },
      },
    ).outputText,
  );
const { priceInPence } = require(path.join(tmp, "types.js"));
const { webUrl } = require(path.join(tmp, "urls.js"));
const { publicAddress, safeFetch, extractMetadata, extractFetchedMetadata, pinnedLookup } = require(
  path.join(tmp, "safe-fetch.js"),
);
test("prices remain exact in pence and unknown is distinct from zero", () => {
  assert.equal(priceInPence(""), null);
  assert.equal(priceInPence("0"), 0);
  assert.equal(priceInPence("19.99"), 1999);
  assert.equal(priceInPence("0.29"), 29);
  for (const bad of ["-1", "1.234", "NaN", "1e2", "1000001"])
    assert.throws(() => priceInPence(bad));
});
test("universal retailer links preserve destinations without allowlists", () => {
  for (const host of [
    "www.johnlewis.com",
    "www.amazon.co.uk",
    "www.argos.co.uk",
    "www.menkind.co.uk",
    "independent-shop.co.uk",
  ]) {
    const value = `https://${host}/gift?variant=green`;
    assert.equal(webUrl(value), value);
  }
  assert.equal(webUrl(""), "");
  for (const bad of [
    "javascript:alert(1)",
    "file:///etc/passwd",
    "https://me:secret@shop.com/",
    "http://localhost/",
    "https://shop.internal/",
    "https://shop.com:3000/",
  ])
    assert.throws(() => webUrl(bad));
});
test("server rejects private, special, mapped and metadata IP addresses", () => {
  for (const ip of [
    "127.0.0.1",
    "10.1.2.3",
    "172.16.0.1",
    "192.168.1.1",
    "169.254.169.254",
    "100.64.0.1",
    "0.0.0.0",
    "192.0.2.1",
    "198.18.0.1",
    "224.0.0.1",
    "255.255.255.255",
    "::1",
    "fc00::1",
    "fe80::1",
    "::ffff:127.0.0.1",
    "2001:db8::1",
    "2002:7f00:1::",
  ])
    assert.equal(publicAddress(ip), false, ip);
  assert.equal(publicAddress("8.8.8.8"), true);
  assert.equal(publicAddress("2606:4700:4700::1111"), true);
});
test("private destinations cannot be fetched even with alternate IP spelling", async () => {
  for (const url of [
    "http://127.0.0.1/",
    "http://2130706433/",
    "http://0x7f000001/",
    "http://169.254.169.254/latest/meta-data/",
    "http://[::1]/",
  ])
    await assert.rejects(safeFetch(url, "html"));
});
test("metadata stays plain editable text and never includes unsafe image links", () => {
  const meta = extractMetadata(
    `<meta property="og:title" content="Tea &amp; biscuits"><meta property="og:image" content="/photo.png"><meta property="product:price:amount" content="12.99"><meta property="product:price:currency" content="GBP">`,
    "https://shop.co.uk/gift",
  );
  assert.equal(meta.title, "Tea & biscuits");
  assert.equal(meta.image_url, "https://shop.co.uk/photo.png");
  assert.equal(meta.price, "12.99");
  const missing = extractMetadata(
    "<title>Handmade wish</title>",
    "https://shop.co.uk/",
  );
  assert.equal(missing.title, "Handmade wish");
  assert.equal(missing.price, "");
  assert.equal(missing.image_url, "");
  const hostile = extractMetadata(
    `<meta property="og:title" content="&lt;script&gt;bad&lt;/script&gt;"><meta property="og:image" content="javascript:alert(1)">`,
    "https://shop.co.uk/",
  );
  assert.equal(hostile.title, "bad");
  assert.equal(hostile.image_url, "");
});
process.on("exit", () => fs.rmSync(tmp, { recursive: true, force: true }));

test("pinned DNS callback supports both single-address and modern all-address socket requests", () => {
  const address = { address: "8.8.8.8", family: 4 };
  const lookup = pinnedLookup(address);
  lookup("shop.com", {}, (error, ip, family) => {
    assert.equal(error, null);
    assert.equal(ip, address.address);
    assert.equal(family, 4);
  });
  lookup("shop.com", { all: true }, (error, ips) => {
    assert.equal(error, null);
    assert.deepEqual(ips, [address]);
  });
});


test("structured product details support graph arrays, image objects and aggregate offers", () => {
  const html = `<script type='application/ld+json'>{"@graph":[{"@type":"WebPage"},{"@type":["Thing","Product"],"name":"Tea &amp; biscuits","image":[{"url":"//cdn.shop.co.uk/tea.jpg"}],"offers":{"@type":"AggregateOffer","lowPrice":12.99,"priceCurrency":"gbp"}}]}</script>`;
  const result = extractMetadata(html, "https://shop.co.uk/gift");
  assert.equal(result.title, "Tea & biscuits");
  assert.equal(result.image_url, "https://cdn.shop.co.uk/tea.jpg");
  assert.equal(result.price, "12.99");
  assert.equal(result.currency, "GBP");
});

test("malformed product markup falls back to page details and a matching product image", () => {
  const result = extractMetadata(`<script type="application/ld+json">{invalid}</script><h1>Handmade <em>tea cup</em></h1><img src="/logo.png" alt="Store logo"><img src="/cup.jpg" alt="Handmade tea cup">`, "https://shop.co.uk/products/cup");
  assert.equal(result.title, "Handmade tea cup");
  assert.equal(result.image_url, "https://shop.co.uk/cup.jpg");
  assert.equal(extractMetadata('<meta property="og:image" content="javascript:alert(1)"><h1>Gift</h1>', "https://shop.co.uk/").image_url, "");
});

test("direct image links produce editable wishlist metadata", () => {
  const result = extractFetchedMetadata({body:Buffer.from("image fixture"), type:"image/jpeg", url:"https://cdn.shop.co.uk/gifts/Blue-tea_cup.jpg?size=large"});
  assert.equal(result.title, "Blue tea cup");
  assert.equal(result.image_url, "https://cdn.shop.co.uk/gifts/Blue-tea_cup.jpg?size=large");
  assert.equal(result.price, "");
});

test("metadata fetching accepts larger product pages, redirects and direct images", async () => {
  const https = require("node:https");
  const dns = require("node:dns/promises");
  const { PassThrough } = require("node:stream");
  const { EventEmitter } = require("node:events");
  const oldRequest = https.request;
  const oldLookup = dns.lookup;
  const body = '<!--' + ' '.repeat(600000) + '--><h1>Large product page</h1>';
  dns.lookup = async () => [{address:"8.8.8.8",family:4}];
  https.request = (url, options, callback) => {
    assert.equal(typeof options.lookup, "function");
    const request = new EventEmitter();
    request.destroy = error => request.emit("error", error);
    request.end = () => {
      const response = new PassThrough();
      response.statusCode = url.pathname === "/redirect" ? 302 : 200;
      response.headers = url.pathname === "/redirect"
        ? {location:"/page"}
        : {"content-type":url.pathname === "/image.jpg" ? "image/jpeg" : "text/html"};
      callback(response);
      if (response.statusCode === 200) response.end(url.pathname === "/image.jpg" ? "image" : body);
      request.emit("close");
    };
    return request;
  };
  try {
    const page = await safeFetch("https://shop.co.uk/redirect", "metadata");
    assert.equal(page.url, "https://shop.co.uk/page");
    assert.equal(extractFetchedMetadata(page).title, "Large product page");
    const image = await safeFetch("https://shop.co.uk/image.jpg", "metadata");
    assert.equal(extractFetchedMetadata(image).image_url, "https://shop.co.uk/image.jpg");
    await assert.rejects(safeFetch("https://shop.co.uk/image.jpg", "html"), /Preview unavailable/);
  } finally {
    https.request = oldRequest;
    dns.lookup = oldLookup;
  }
});
