import "server-only";
import { getAvailableGifts } from "@/lib/gift-catalogue";
import type { CatalogueWishDraft } from "@/lib/wishlists/types";

export async function catalogueWishDraft(value: string | string[] | undefined): Promise<CatalogueWishDraft | undefined> {
  if (typeof value !== "string" || !/^[a-zA-Z0-9_-]{1,80}$/.test(value)) return undefined;
  const gift = (await getAvailableGifts()).find(item => item.id === value);
  if (!gift) return undefined;
  return {
    giftId: gift.id, title: gift.title.slice(0, 200), url: gift.url,
    image_url: gift.image, price: gift.price, currency: "GBP", shop_name: gift.shop.slice(0, 100),
    notes: "Check the selected size, colour or personalisation, current price and delivery before buying.",
  };
}
