export type PersonalWish = {
  id: string;
  title: string;
  url: string;
  image_url: string;
  price: number | null;
  currency: string;
  shop_name: string;
  notes: string;
  priority: "love" | "like" | "inspiration";
  position: number;
  reserved?: boolean;
  bought?: boolean;
  mine?: boolean;
};
export type PersonalList = {
  id: string;
  title: string;
  display_name: string;
  occasion: string;
  event_date: string | null;
  description: string;
  shared?: boolean;
  share_token?: string;
  items: PersonalWish[];
  is_owner?: boolean;
  item_count?: number;
};
export type PersonalReservation = {
  item_id: string;
  title: string;
  list_title: string;
  url: string;
  bought: boolean;
  shared: boolean;
  share_token: string | null;
};
export const priorities = {
  love: "Love",
  like: "Like",
  inspiration: "Inspiration",
};
export const currencies = ["GBP", "EUR", "USD", "AUD", "CAD"];
export function money(price: number | null, currency: string) {
  return price === null
    ? "Price not added"
    : new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(
        price / 100,
      );
}
export function priceInPence(input: string): number | null {
  if (!input.trim()) return null;
  if (!/^\d{1,7}(\.\d{1,2})?$/.test(input.trim()))
    throw new Error("Enter a price with up to two decimal places.");
  const [whole, fraction = ""] = input.trim().split(".");
  const price = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  if (price > 100000000) throw new Error("Enter a price up to 1,000,000.");
  return price;
}
export const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
