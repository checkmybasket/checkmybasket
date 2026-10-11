import { GIFT_GUIDES } from "@/lib/gift-guides";
import { GIFT_CATEGORIES } from "@/lib/gift-categories";
import { readGiftFilters } from "@/lib/gift-selection";

export const MEASUREMENT_ID = "G-V29MEMTFL2";
export const STORAGE_KEY = "cmb-analytics-consent-v1";
export const CHANGE_EVENT = "cmb-analytics-consent-change";
export type Consent = "accepted" | "rejected" | null;
export type AnalyticsWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  "ga-disable-G-V29MEMTFL2"?: boolean;
};

export function readConsent(): Consent {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "accepted" || value === "rejected" ? value : null;
  } catch { return null; }
}

export function isPublicPage(path: string) {
  return ["/", "/about", "/contact", "/privacy", "/terms", "/create", "/wishlists", "/gifts", "/secret-santa-whatsapp", "/office-secret-santa"].includes(path)
    || GIFT_GUIDES.some(guide => path === `/${guide.slug}`)
    || /^\/gifts\/[a-z0-9-]+$/.test(path);
}

// Only fixed event names and fixed public routes; never accept user data.
const creationPaths = { draw_created: "/create", wishlist_created: "/wishlists" } as const;
export function trackCreation(event: keyof typeof creationPaths) {
  try {
    if (typeof window === "undefined" || readConsent() !== "accepted") return;
    const analytics = window as AnalyticsWindow;
    const path = creationPaths[event];
    if (!path || window.location.pathname !== path || analytics[`ga-disable-${MEASUREMENT_ID}`] || !analytics.gtag) return;
    analytics.gtag("event", event, {
      send_to: MEASUREMENT_ID,
      page_location: `${window.location.origin}${path}`,
      page_referrer: "",
      page_title: "CheckMyBasket",
    });
  } catch { /* Measurement must never interrupt creation. */ }
}

// Only allowlisted aggregate catalogue values; never product titles or URLs.
export function trackGiftInteraction(event: "gift_retailer_click" | "gift_filters_applied", input: Record<string, string>) {
  try {
    if (typeof window === "undefined" || readConsent() !== "accepted") return;
    const analytics = window as AnalyticsWindow;
    const path = window.location.pathname;
    const category = GIFT_CATEGORIES.find(c => path === `/gifts/${c.slug}`)?.slug;
    const guide = GIFT_GUIDES.find(guide => path === `/${guide.slug}`);
    if ((path !== "/gifts" && !category && !guide) || analytics[`ga-disable-${MEASUREMENT_ID}`] || !analytics.gtag) return;
    let parameters: Record<string, string | number>;
    if (event === "gift_retailer_click") {
      const retailers = ["Dunelm", "Not On The High Street", "Waterstones", "John Lewis", "The Little Botanical", "Cadbury Gifts Direct", "Craft Buddy", "MORiSH"];
      if (!retailers.includes(input.retailer)) return;
      parameters = { retailer: input.retailer, gift_category: category || guide?.category || "all" };
    } else if (event === "gift_filters_applied") {
      const filters = readGiftFilters(input);
      parameters = { gift_category: category || filters.category || "all", budget_gbp: (filters.budget || 0) / 100, recipient_interest: filters.interest || "any" };
    } else return;
    analytics.gtag("event", event, { ...parameters, send_to: MEASUREMENT_ID,
      page_location: `${window.location.origin}${path}`, page_referrer: "", page_title: "CheckMyBasket", transport_type: "beacon" });
  } catch { /* Measurement must never interrupt shopping. */ }
}
