import { OPEN_GRAPH_DEFAULTS, TWITTER_DEFAULTS } from "@/lib/page-metadata";
import { SITE_ORIGIN } from "@/lib/site";
import { shouldPreventIndexing } from "@/lib/deployment";
import type { Metadata, Viewport } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AnalyticsConsent } from "@/components/analytics-consent";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-inter", display: "swap" });
const ibmPlexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-ibm-plex-mono", display: "swap" });

export const metadata: Metadata = {
  robots: shouldPreventIndexing() ? { index: false, follow: false } : undefined,
  title: { default: "CheckMyBasket | Free Secret Santa generator with wishlists", template: "%s | CheckMyBasket" },
  description: "Draw names, share wishlists from any shop and ask anonymous questions. Organise a free Secret Santa draw and find UK gift ideas. No ads, ever.",
  keywords: ["Secret Santa","wishlist","gift exchange","Christmas","UK","free Secret Santa generator","Secret Santa gifts UK"],
  metadataBase: new URL(SITE_ORIGIN),
  openGraph: { ...OPEN_GRAPH_DEFAULTS,
    title: "CheckMyBasket | Free Secret Santa generator with wishlists",
    description: "Thoughtful gifts, no matter how well you know them. Free draws, wishlists and anonymous questions. No ads, ever.",
    type: "website", url: SITE_ORIGIN, siteName: "CheckMyBasket",
  },
  twitter: { ...TWITTER_DEFAULTS,  card: "summary_large_image", title: "CheckMyBasket | Free Secret Santa generator", description: "Draw names, share wishlists, ask anonymous questions. No ads, ever." },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#FFFFFF" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${inter.variable} ${ibmPlexMono.variable} h-full`}>
      <head>
        <link rel="manifest" href="/manifest.webmanifest" crossOrigin="use-credentials" />
        {/* impact.com requires a value attribute rather than Metadata API's content. */}
        <meta {...{ name: "impact-site-verification", value: "5bb17670-56ae-46ba-b997-a4d00d388e01" }} />
      </head>
      <body className="min-h-dvh flex flex-col antialiased">
        {children}
        <Toaster richColors position="top-center" />
        <AnalyticsConsent />
      </body>
    </html>
  );
}
