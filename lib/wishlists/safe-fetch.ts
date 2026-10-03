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
  kind: "html" | "image",
  deadline = Date.now() + 6500,
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
            kind === "html"
              ? "text/html"
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
        const accepted =
          kind === "html"
            ? type === "text/html" || type === "application/xhtml+xml"
            : [
                "image/png",
                "image/jpeg",
                "image/webp",
                "image/gif",
                "image/avif",
              ].includes(type);
        if (status < 200 || status >= 300 || !accepted) {
          response.destroy();
          reject(new Error("Preview unavailable"));
          return;
        }
        const chunks: Buffer[] = [];
        let size = 0;
        const max = kind === "html" ? 524288 : 2097152;
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
    if (redirects >= 3) throw new Error("Too many redirects");
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
      if (named[entity]) return named[entity];
      const code = entity.startsWith("&#x")
        ? parseInt(entity.slice(3), 16)
        : parseInt(entity.slice(2), 10);
      return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : "";
    })
    .replace(/<[^>]*>/g, "")
    .trim();
}
export function extractMetadata(html: string, base: string) {
  const meta: Record<string, string> = {};
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    if (tag.length > 8192) continue;
    const attrs: Record<string, string> = {};
    for (const match of tag.matchAll(
      /([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g,
    ))
      attrs[match[1].toLowerCase()] = decode(
        match[2] ?? match[3] ?? match[4] ?? "",
      );
    const key = attrs.property ?? attrs.name;
    if (key && attrs.content) meta[key.toLowerCase()] = attrs.content;
  }
  let image = "";
  try {
    image = webUrl(
      new URL(meta["og:image"] ?? meta["twitter:image"] ?? "", base).href,
    );
  } catch {}
  if (!meta["og:image"] && !meta["twitter:image"]) image = "";
  const price = meta["product:price:amount"] ?? meta["og:price:amount"];
  const currency = meta["product:price:currency"] ?? meta["og:price:currency"];
  return {
    title: (
      meta["og:title"] ??
      meta["twitter:title"] ??
      decode(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "")
    ).slice(0, 200),
    image_url: image,
    shop_name: new URL(base).hostname.replace(/^www\./, "").slice(0, 100),
    price:
      price && /^\d{1,7}(\.\d{1,2})?$/.test(price) && Number(price) <= 1000000
        ? price
        : "",
    currency:
      currency &&
      ["GBP", "USD", "EUR", "AUD", "CAD"].includes(currency.toUpperCase())
        ? currency.toUpperCase()
        : "",
  };
}
