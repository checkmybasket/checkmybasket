import cadbury from "@/data/cadbury-products.json";
import { GIFT_CATEGORIES } from "@/lib/gift-categories";

export const catalogueUpdatedAt = cadbury.updatedAt;
export const availableGifts = cadbury.products.filter(product => product.inStock);

export function getGiftsForCategory(slug: string) {
  const category = GIFT_CATEGORIES.find(item => item.slug === slug);
  const budget = category?.budget;
  return budget !== undefined
    ? availableGifts.filter(product => product.price < budget)
    : availableGifts.filter(product => product.categories.includes(slug));
}

const FEATURED_IDS = ["4327336", "4316497", "4320089", "ZCBAPOST", "OREOSB", "4327298"];
export const featuredGifts = FEATURED_IDS.flatMap(id => {
  const product = availableGifts.find(item => item.merchantProductId === id);
  return product ? [product] : [];
});
