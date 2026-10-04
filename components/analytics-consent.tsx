"use client";

import Script from "next/script";
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";

const MEASUREMENT_ID = "G-V29MEMTFL2";
const STORAGE_KEY = "cmb-analytics-consent-v1";
const CHANGE_EVENT = "cmb-analytics-consent-change";
type Consent = "accepted" | "rejected" | null;
type AnalyticsWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  "ga-disable-G-V29MEMTFL2"?: boolean;
};

function readConsent(): Consent {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "accepted" || value === "rejected" ? value : null;
  } catch {
    return null;
  }
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

// Private groups, shared-list tokens and recovery URLs must never be measured.
function isPublicPage(path: string) {
  return ["/", "/about", "/contact", "/privacy", "/terms", "/create", "/wishlists", "/gifts"].includes(path)
    || /^\/gifts\/[a-z0-9-]+$/.test(path);
}

export function AnalyticsConsent() {
  const consent = useSyncExternalStore(subscribe, readConsent, () => null);
  const pathname = usePathname();
  const [editing, setEditing] = useState(false);
  const initialized = useRef(false);
  const lastPage = useRef<string | null>(null);
  const enabled = consent === "accepted" && isPublicPage(pathname);

  useLayoutEffect(() => {
    const analytics = window as AnalyticsWindow;
    analytics[`ga-disable-${MEASUREMENT_ID}`] = !enabled;
    // Keep the configured location free of tokens, queries and fragment values.
    analytics.gtag?.("set", { page_location: `${window.location.origin}${isPublicPage(pathname) ? pathname : "/private"}`, page_referrer: "", page_title: "CheckMyBasket" });
  }, [enabled, pathname]);

  useEffect(() => {
    if (!enabled) {
      lastPage.current = null;
      return;
    }
    const analytics = window as AnalyticsWindow;
    if (!initialized.current) {
      analytics.dataLayer = analytics.dataLayer || [];
      // Google's command queue expects an Arguments object.
      // eslint-disable-next-line prefer-rest-params
      analytics.gtag = function () { analytics.dataLayer!.push(arguments); };
      analytics.gtag("consent", "default", {
        analytics_storage: "granted", ad_storage: "denied",
        ad_user_data: "denied", ad_personalization: "denied",
      });
      analytics.gtag("js", new Date());
      analytics.gtag("config", MEASUREMENT_ID, {
        send_page_view: false, allow_google_signals: false,
        allow_ad_personalization_signals: false,
        page_location: `${window.location.origin}${pathname}`,
        page_referrer: "", page_title: "CheckMyBasket",
      });
      initialized.current = true;
    }
    if (lastPage.current !== pathname) {
      analytics.gtag?.("event", "page_view", {
        send_to: MEASUREMENT_ID, page_location: `${window.location.origin}${pathname}`,
        page_referrer: "", page_title: "CheckMyBasket",
      });
      lastPage.current = pathname;
    }
  }, [enabled, pathname]);

  function choose(value: Exclude<Consent, null>) {
    const analytics = window as AnalyticsWindow;
    if (value === "rejected") {
      analytics[`ga-disable-${MEASUREMENT_ID}`] = true;
      // Remove analytics cookies without touching the member's sign-in cookie.
      for (const item of document.cookie.split(";")) {
        const name = item.split("=")[0].trim();
        if (name === "_ga" || name.startsWith("_ga_")) {
          for (const domain of ["", window.location.hostname, ".checkmybasket.co.uk"]) {
            document.cookie = `${name}=; Max-Age=0; Path=/;${domain ? ` Domain=${domain};` : ""} SameSite=Lax`;
          }
        }
      }
    }
    try { localStorage.setItem(STORAGE_KEY, value); } catch { /* Fail closed if storage is unavailable. */ }
    window.dispatchEvent(new Event(CHANGE_EVENT));
    setEditing(false);
  }

  return (
    <>
      {enabled ? <Script id="google-analytics" src={`https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`} strategy="afterInteractive" /> : null}
      {consent === null || editing ? (
        <section aria-label="Analytics cookie choices" className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-xl border border-black bg-white p-4 text-sm text-black shadow-lg">
          <p className="font-bold">Help us improve CheckMyBasket?</p>
          <p className="mt-2">With your permission, Google Analytics uses cookies to measure visits to our public pages. Private groups and shared wishlists are excluded. <a href="/privacy" className="underline">Privacy policy</a></p>
          <div className="mt-3 flex flex-wrap gap-3">
            <button type="button" onClick={() => choose("accepted")} className="border border-black px-4 py-2 font-semibold">Accept analytics</button>
            <button type="button" onClick={() => choose("rejected")} className="border border-black px-4 py-2 font-semibold">Reject analytics</button>
          </div>
        </section>
      ) : (
        <button type="button" onClick={() => setEditing(true)} className="mx-auto my-3 px-3 py-2 text-xs underline">Cookie settings</button>
      )}
    </>
  );
}
