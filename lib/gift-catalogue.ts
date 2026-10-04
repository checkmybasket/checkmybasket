import partners from "@/data/partner-products.json";
import cadbury from "@/data/cadbury-products.json";
import { GIFT_CATEGORIES } from "@/lib/gift-categories";

export const catalogueUpdatedAt = cadbury.updatedAt;
export const availableGifts = [...cadbury.products, ...partners.products].filter(product => product.inStock);

export function getGiftsForCategory(slug: string) {
  const category = GIFT_CATEGORIES.find(item => item.slug === slug);
  const budget = category?.budget;
  return budget !== undefined
    ? availableGifts.filter(product => product.price < budget)
    : availableGifts.filter(product => product.categories.includes(slug));
}

const FEATURED_IDS = [
  "awin:45747:CA-31HPSALBWEB",
  "awin:126437:50043261878600",
  "awin:736:4327336",
  "awin:126437:50043262009672",
  "awin:736:ZCBAPOST",
  "awin:736:4316497",
];
export const featuredGifts = FEATURED_IDS.flatMap(id => {
  const product = availableGifts.find(item => item.id === id);
  return product ? [product] : [];
});
