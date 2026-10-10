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
