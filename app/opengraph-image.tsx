import { ImageResponse } from "next/og";

export const alt = "CheckMyBasket — Secret Santa, sorted.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Fraunces for the wordmark, fetched at build time (statically optimised).
// If the fetch fails the image still renders with ImageResponse's default font.
async function loadFraunces(): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      "https://fonts.googleapis.com/css2?family=Fraunces:wght@600&text=CheckMyBasketSecretSanta,sorted.FrewishlistsanonymousquestionsNoadsever"
    ).then(r => r.text());
    const url = css.match(/src: url\((.+?)\)/)?.[1];
    if (!url) return null;
    return await fetch(url).then(r => r.arrayBuffer());
  } catch {
    return null;
  }
}

export default async function Image() {
  const fraunces = await loadFraunces();
  const heading = { fontFamily: fraunces ? "Fraunces" : undefined };

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#1B4332",
          position: "relative",
        }}
      >
        {/* subtle corner snowflakes */}
        <div style={{ position: "absolute", top: 36, left: 48, fontSize: 40, opacity: 0.25 }}>❄</div>
        <div style={{ position: "absolute", top: 90, right: 80, fontSize: 28, opacity: 0.2 }}>❄</div>
        <div style={{ position: "absolute", bottom: 60, left: 110, fontSize: 30, opacity: 0.2 }}>❄</div>
        <div style={{ position: "absolute", bottom: 100, right: 60, fontSize: 44, opacity: 0.25 }}>❄</div>

        <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 28 }}>
          <div style={{ fontSize: 56 }}>🎁</div>
          <div style={{ ...heading, fontSize: 54, fontWeight: 600, color: "#FFF8F0" }}>CheckMyBasket</div>
        </div>

        <div
          style={{
            ...heading,
            fontSize: 96,
            fontWeight: 600,
            color: "#D4A574",
            marginBottom: 30,
            textAlign: "center",
          }}
        >
          Secret Santa, sorted.
        </div>

        <div style={{ fontSize: 34, color: "rgba(255,248,240,0.85)", textAlign: "center" }}>
          Free draws · wishlists · anonymous questions · no ads, ever
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fraunces
        ? [{ name: "Fraunces", data: fraunces, style: "normal" as const, weight: 600 as const }]
        : undefined,
    }
  );
}
