import type { Metadata, Viewport } from "next";
import { Fraunces, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap", axes: ["opsz","SOFT","WONK"] });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans", display: "swap" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono", display: "swap" });

export const metadata: Metadata = {
  title: { default: "CheckMyBasket — Free Secret Santa Generator with Wishlists and Gift Ideas", template: "%s — CheckMyBasket" },
  description: "Draw names, share wishlists from any shop, ask anonymous questions and find gifts people actually want. Free Secret Santa generator with no ads. Made in the UK.",
  keywords: ["Secret Santa","wishlist","gift exchange","Christmas","UK","free Secret Santa generator","Secret Santa gifts UK"],
  metadataBase: new URL("https://www.checkmybasket.co.uk"),
  openGraph: {
    title: "CheckMyBasket — Free Secret Santa Generator with Wishlists and Gift Ideas",
    description: "Draw names, share wishlists, ask anonymous questions and find gifts people actually want. No ads, no account needed. Made in the UK.",
    type: "website", url: "https://www.checkmybasket.co.uk", siteName: "CheckMyBasket",
  },
  twitter: { card: "summary_large_image", title: "CheckMyBasket — Free Secret Santa Generator", description: "Draw names, share wishlists, ask anonymous questions. No ads, ever." },
  alternates: { canonical: "https://www.checkmybasket.co.uk" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#1B4332" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${dmSans.variable} ${jetbrainsMono.variable} h-full`}>
      <body className="min-h-dvh flex flex-col antialiased">
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
