import type { NextConfig } from "next";
import path from "node:path";
import { shouldPreventIndexing } from "./lib/deployment";
import { supabaseConnectSources } from "./lib/supabase/origins";

// Supabase project origin the browser must be allowed to reach (REST + Realtime).
const SUPABASE_SOURCES = supabaseConnectSources(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://nejkvrzabdetsnhpeqtl.supabase.co",
);

// Content-Security-Policy. Next.js injects inline bootstrap scripts and the app uses
// inline style attributes throughout, so 'unsafe-inline' is required for script/style;
// external access is limited to Supabase and consented Google Analytics. frame-ancestors 'none' blocks
// clickjacking (mirrored by X-Frame-Options for older browsers).
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.google-analytics.com https://www.googletagmanager.com",
  "font-src 'self' data:",
  `connect-src 'self' ${SUPABASE_SOURCES} https://*.google-analytics.com https://www.googletagmanager.com`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
];

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.resolve(__dirname),
  turbopack: { root: path.resolve(__dirname) },
  images: {
    remotePatterns: [
      ...["cdn.waterstones.com", "cdn.notonthehighstreet.com", "media.johnlewiscontent.com", "thelittlebotanical.com", "www.dunelm.com", "images.dunelm.com", "i.etsystatic.com"].map(hostname => ({ protocol: "https" as const, hostname, pathname: "/**" })),
      { protocol: "https", hostname: "www.cadburygiftsdirect.co.uk", pathname: "/media/catalog/product/**", search: "" },
      { protocol: "https", hostname: "cdn.shopify.com", pathname: "/s/files/1/0331/0528/1083/files/**" },
      { protocol: "https", hostname: "cdn.shopify.com", pathname: "/s/files/1/0883/3587/6424/files/**" },
    ],
    maximumRedirects: 0,
  },
  async headers() {
    return [{ source: "/:path*", headers: [...securityHeaders, ...(shouldPreventIndexing() ? [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] : [])] }];
  },
};

export default nextConfig;
