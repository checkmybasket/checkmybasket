import { ImageResponse } from "next/og";
import { BasketMark } from "@/components/receipt/logo";

export function brandIcon(size: number) {
  return new ImageResponse(<div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#FFFFFF" }}><BasketMark size={Math.round(size * 0.7)} /></div>, { width: size, height: size });
}
