import { ImageResponse } from "next/og";
import { BasketMark } from "@/components/receipt/logo";

export const alt = "CheckMyBasket | Gifting made simple";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function loadSpaceGrotesk(): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch("https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&text=CheckMyBasketGiftingmadesimpleThoughtfulgifts,nomatterhowwellyouknowthem.Free.NoAds.").then(r => r.text());
    const url = css.match(/src: url\((.+?)\)/)?.[1];
    if (!url) return null;
    const response = await fetch(url);
    if (!response.ok) return null;
    return response.arrayBuffer();
  } catch { return null; }
}

export default async function Image() {
  const font = await loadSpaceGrotesk();
  return new ImageResponse(<div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", padding: "64px 72px", background: "#FFFFFF", color: "#141414", fontFamily: font ? "Space Grotesk" : undefined }}>
    <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 36, fontWeight: 700, paddingBottom: 28, borderBottom: "2px solid #141414" }}><BasketMark /><span>CheckMyBasket</span></div>
    <div style={{ display: "flex", fontSize: 100, fontWeight: 700, letterSpacing: "-5px", lineHeight: .95, marginTop: 56 }}>Gifting made simple</div>
    <div style={{ display: "flex", fontSize: 30, marginTop: 32 }}>Thoughtful gifts, no matter how well you know them.</div>
    <div style={{ display: "flex", fontSize: 28, fontWeight: 700, color: "#D42A24", marginTop: 36 }}>Free. No ads.</div>
  </div>, { ...size, fonts: font ? [{ name: "Space Grotesk", data: font, style: "normal", weight: 700 }] : undefined });
}
