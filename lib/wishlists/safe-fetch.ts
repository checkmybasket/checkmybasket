import { lookup } from "node:dns/promises";
import type { LookupAddress } from "node:dns";
import type { LookupFunction } from "node:net";
import { BlockList, isIP } from "node:net";
import http from "node:http";
import https from "node:https";
import { webUrl } from "./urls";
const blocked = new BlockList();
for (const [address, prefix] of [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.0.2.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["198.51.100.0", 24],
  ["203.0.113.0", 24],
  ["224.0.0.0", 3],
] as const)
  blocked.addSubnet(address, prefix, "ipv4");
blocked.addSubnet("2001::", 23, "ipv6");
blocked.addSubnet("2001:db8::", 32, "ipv6");
blocked.addSubnet("2002::", 16, "ipv6");
export function publicAddress(address: string): boolean {
  const family = isIP(address);
  if (family === 4) return !blocked.check(address, "ipv4");
  // Only global unicast; excludes IPv4-mapped, loopback, link-local and ULA.
  return (
    family === 6 && /^[23]/.test(address) && !blocked.check(address, "ipv6")
  );
}
export function pinnedLookup(address: LookupAddress): LookupFunction {
  return (_host, options, callback) => {
    if (options.all) callback(null, [address]);
    else callback(null, address.address, address.family);
  };
}

export async function safeFetch(
  value: string,
  kind: "html" | "image" | "metadata",
  deadline = Date.now() + 10000,
  redirects = 0,
): Promise<{ body: Buffer; type: string; url: string }> {
  const url = new URL(webUrl(value));
  const host = url.hostname.replace(/^\[|\]$/g, "");
  const addresses = await Promise.race([
    lookup(host, { all: true }),
    new Promise<never>((_, reject) => {
      const timer = setTimeout(
        () => reject(new Error("Lookup timed out")),
        1500,
      );
      timer.unref();
    }),
  ]);
  if (!addresses.length || addresses.some((a) => !publicAddress(a.address)))
    throw new Error("Private destination blocked");
  if (Date.now() >= deadline) throw new Error("Timed out");
  const address = addresses.find((a) => a.family === 4) ?? addresses[0];
  const result = await new Promise<{
    body: Buffer;
    type: string;
    location?: string;
    status: number;
  }>((resolve, reject) => {
    // Pin the validated address into the actual socket: no DNS-rebinding window.
    const request = (url.protocol === "https:" ? https : http).request(
      url,
      {
        method: "GET",
        agent: false,
        lookup: pinnedLookup(address),
        headers: {
          "User-Agent": "CheckMyBasket/1.0 (wishlist preview)",
          Accept:
            kind !== "image"
              ? "text/html,application/xhtml+xml,image/png,image/jpeg,image/webp,image/gif,image/avif;q=0.8"
              : "image/png,image/jpeg,image/webp,image/gif,image/avif",
          "Accept-Encoding": "identity",
        },
      },
      (response) => {
        const status = response.statusCode ?? 0;
        if ([301, 302, 303, 307, 308].includes(status)) {
          response.destroy();
          resolve({
            body: Buffer.alloc(0),
            type: "",
            location: response.headers.location,
            status,
          });
          return;
        }
        const type = String(response.headers["content-type"] ?? "")
          .split(";")[0]
          .toLowerCase();
        const isHtml = type === "text/html" || type === "application/xhtml+xml";
        const isImage = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/avif"].includes(type);
        const accepted = kind === "metadata" ? isHtml || isImage : kind === "html" ? isHtml : isImage;
        if (status < 200 || status >= 300 || !accepted) {
          response.destroy();
          reject(new Error("Preview unavailable"));
          return;
        }
        const chunks: Buffer[] = [];
        let size = 0;
        const max = 2097152;
        response.on("data", (chunk: Buffer) => {
          size += chunk.length;
          if (size > max) {
            response.destroy(new Error("Response too large"));
            return;
          }
          chunks.push(chunk);
        });
        response.on("error", reject);
        response.on("end", () =>
          resolve({ body: Buffer.concat(chunks), type, status }),
        );
      },
    );
    const timer = setTimeout(
      () => request.destroy(new Error("Timed out")),
      Math.max(1, deadline - Date.now()),
    );
    request.on("close", () => clearTimeout(timer));
    request.on("error", reject);
    request.end();
  });
  if (result.location) {
    if (redirects >= 5) throw new Error("Too many redirects");
    return safeFetch(
      new URL(result.location, url).href,
      kind,
      deadline,
      redirects + 1,
    );
  }
  return { body: result.body, type: result.type, url: url.href };
}
function decode(value: string) {
  return value
    .replace(/&(?:amp|quot|apos|lt|gt|#\d+|#x[\da-f]+);/gi, (entity) => {
      const named: Record<string, string> = {
        "&amp;": "&",
        "&quot;": '"',
        "&apos;": "'",
        "&lt;": "<",
        "&gt;": ">",
      };
      if (named[entity.toLowerCase()]) return named[entity.toLowerCase()];
      const code = entity.toLowerCase().startsWith("&#x")
        ? parseInt(entity.slice(3), 16)
        : parseInt(entity.slice(2), 10);
      return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : "";
    })
    .replace(/<[^>]*>/g, "")
    .trim();
}
function attributes(tag: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  for (const match of tag.matchAll(
    /([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g,
  )) attrs[match[1].toLowerCase()] = decode(match[2] ?? match[3] ?? match[4] ?? "");
  return attrs;
}

function imageUrl(value: unknown, base: string): string {
  if (Array.isArray(value)) {
    for (const candidate of value) {
      const image = imageUrl(candidate, base);
      if (image) return image;
    }
    return "";
  }
  if (value && typeof value === "object") {
    const image = value as Record<string, unknown>;
    value = image.contentUrl ?? image.url ?? image["@id"];
  }
  if (typeof value !== "string" || !value.trim()) return "";
  try { return webUrl(new URL(value.trim(), base).href); } catch { return ""; }
}

function productData(html: string): Record<string, unknown> {
  for (const script of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)) {
    if (attributes(script[1]).type?.toLowerCase() !== "application/ld+json") continue;
    try {
      const queue: unknown[] = [JSON.parse(script[2])];
      // Bound traversal independently of the response size.
      for (let visited = 0; queue.length && visited < 1000; visited++) {
        const node = queue.shift();
        if (!node || typeof node !== "object") continue;
        if (Array.isArray(node)) { queue.push(...node.slice(0, 1000)); continue; }
        const object = node as Record<string, unknown>;
        const types = Array.isArray(object["@type"]) ? object["@type"] : [object["@type"]];
        if (types.some(type => typeof type === "string" && /(?:^|[/#])Product$/i.test(type))) return object;
        queue.push(...Object.values(object).filter(value => value && typeof value === "object").slice(0, 1000));
      }
    } catch { /* Other metadata can still provide details when a script is malformed. */ }
  }
  return {};
}

export function extractMetadata(html: string, base: string) {
  const meta: Record<string, string> = {};
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    if (tag.length > 8192) continue;
    const attrs = attributes(tag);
    const key = attrs.property ?? attrs.name ?? attrs.itemprop;
    if (key && attrs.content && !meta[key.toLowerCase()]) meta[key.toLowerCase()] = attrs.content;
  }
  const product = productData(html);
  const rawOffers = product.offers;
  const offers = (Array.isArray(rawOffers) ? rawOffers[0] : rawOffers) as Record<string, unknown> | undefined;
  let image = imageUrl(product.image, base) || imageUrl([
    meta["og:image:secure_url"], meta["og:image"], meta["twitter:image"], meta["twitter:image:src"], meta.image,
  ], base);
  if (!image) {
    for (const tag of html.match(/<link\b[^>]*>/gi) ?? []) {
      const attrs = attributes(tag);
      if (attrs.rel?.toLowerCase().split(/\s+/).includes("image_src")) {
        image = imageUrl(attrs.href, base);
        if (image) break;
      }
    }
  }
  const title = decode(
    (typeof product.name === "string" ? product.name : "") ||
    meta["og:title"] || meta["twitter:title"] ||
    html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ||
    html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "",
  ).slice(0, 200);
  if (!image) {
    for (const tag of html.match(/<img\b[^>]*>/gi) ?? []) {
      const attrs = attributes(tag);
      const alt = attrs.alt?.toLowerCase();
      const matchesTitle = alt && alt.length >= 5 && title && (alt.includes(title.toLowerCase()) || title.toLowerCase().includes(alt));
      if (attrs.itemprop?.split(/\s+/).includes("image") || matchesTitle) {
        image = imageUrl(attrs["data-src"] ?? attrs.src, base);
        if (image) break;
      }
    }
  }
  const rawPrice = offers?.price ?? offers?.lowPrice ?? meta["product:price:amount"] ?? meta["og:price:amount"] ?? meta.price;
  const price = typeof rawPrice === "number" || typeof rawPrice === "string" ? String(rawPrice) : "";
  const rawCurrency = offers?.priceCurrency ?? meta["product:price:currency"] ?? meta["og:price:currency"] ?? meta.pricecurrency;
  const currency = typeof rawCurrency === "string" ? rawCurrency.toUpperCase() : "";
  return {
    title,
    image_url: image,
    shop_name: (meta["og:site_name"] || new URL(base).hostname.replace(/^www\./, "")).slice(0, 100),
    price: price && /^\d{1,7}(\.\d{1,2})?$/.test(price) && Number(price) <= 1000000 ? price : "",
    currency: ["GBP", "USD", "EUR", "AUD", "CAD"].includes(currency) ? currency : "",
  };
}

export function extractFetchedMetadata(fetched: { body: Buffer; type: string; url: string }) {
  if (!fetched.type.startsWith("image/")) return extractMetadata(fetched.body.toString("utf8"), fetched.url);
  let title = "";
  try {
    title = decodeURIComponent(new URL(fetched.url).pathname.split("/").pop() ?? "")
      .replace(/\.(?:png|jpe?g|webp|gif|avif)$/i, "").replace(/[-_]+/g, " ").slice(0, 200);
  } catch {}
  return {
    title, image_url: fetched.url, shop_name: new URL(fetched.url).hostname.replace(/^www\./, ""),
    price: "", currency: "",
  };
}
