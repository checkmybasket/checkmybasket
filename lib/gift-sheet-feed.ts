import type { GiftProduct } from "@/lib/gift-selection";

const HEADERS = ["id", "title", "price", "shop", "tags", "url", "image", "description", "deliveryNote", "categories", "interests", "priceCheckedAt"];
const RETAILERS = ["www.waterstones.com", "www.notonthehighstreet.com", "www.johnlewis.com", "thelittlebotanical.com", "www.dunelm.com"];
const IMAGES = ["cdn.waterstones.com", "cdn.notonthehighstreet.com", "media.johnlewiscontent.com", "thelittlebotanical.com", "www.dunelm.com", "images.dunelm.com"];
export function parseCsv(input: string): string[][] {
  const rows: string[][] = []; let row: string[] = [], cell = "", quoted = false;
  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    if (c === '"') {
      if (quoted && input[i + 1] === '"') { cell += '"'; i++; }
      else if (!quoted && cell) throw Error("Invalid CSV quote");
      else quoted = !quoted;
    } else if (c === "," && !quoted) { row.push(cell); cell = ""; }
    else if (c === "\n" && !quoted) { row.push(cell.replace(/\r$/, "")); rows.push(row); row = []; cell = ""; }
    else cell += c;
  }
  if (quoted) throw Error("Incomplete CSV");
  if (cell || row.length) { row.push(cell.replace(/\r$/, "")); rows.push(row); }
  return rows;
}
function safeUrl(value: string, hosts: string[]) {
  try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password && !url.port && hosts.includes(url.hostname) ? url.href : ""; }
  catch { return ""; }
}
export function parseGiftFeed(csv: string, now = Date.now()): GiftProduct[] {
  const [headers, ...rows] = parseCsv(csv.replace(/^\uFEFF/, ""));
  if (JSON.stringify(headers) !== JSON.stringify(HEADERS) || rows.length > 500) throw Error("Unexpected gift feed schema or size");
  const ids = new Set<string>();
  return rows.filter(r => r.some(Boolean)).flatMap(r => {
    if (r.length !== HEADERS.length) return [];
    const [id, title, rawPrice, shop, tags, rawUrl, rawImage, description, deliveryNote, categories, interests, priceCheckedAt] = r;
    const price = Number(rawPrice), checked = Date.parse(priceCheckedAt), url = safeUrl(rawUrl, RETAILERS);
    if (!/^CMB-GIFT-\d{4}$/.test(id) || ids.has(id) || !title.trim() || title.length > 250 || !description.trim() || description.length > 2000 || !shop || !url || !/^\d+$/.test(rawPrice) || !Number.isSafeInteger(price) || price <= 0 || !Number.isFinite(checked) || now - checked > 36 * 3600000 || checked > now + 300000) return [];
    ids.add(id);
    const tokens = (s: string) => s.split(";").map(v => v.trim().toLowerCase()).filter(Boolean).slice(0, 20);
    return [{ id, title, price, shop, tags: tokens(tags), url, image: safeUrl(rawImage, IMAGES), description, deliveryNote, categories: tokens(categories), interests: tokens(interests), priceCheckedAt }];
  });
}
