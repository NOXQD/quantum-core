import { ImageResponse } from "next/og";

/**
 * Open Graph image — generated at edge using next/og.
 * Renders a stylized brand card matching the dark cinematic palette
 * (no 3D — this is a static share preview).
 */
export const runtime = "edge";
export const alt = "КВАНТОВОЕ ЯДРО — Lumina Quantum";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "80px",
          background: "#03020a",
          color: "#ffffff",
          fontFamily: "sans-serif",
          backgroundImage:
            "radial-gradient(ellipse at 70% 50%, rgba(138,92,255,0.45) 0%, transparent 60%), radial-gradient(ellipse at 30% 80%, rgba(54,232,255,0.3) 0%, transparent 55%)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            marginBottom: 36,
          }}
        >
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: 4,
              border: "2px solid rgba(138,92,255,0.8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                background: "#36e8ff",
                boxShadow: "0 0 16px #36e8ff",
              }}
            />
          </div>
          <span
            style={{
              fontSize: 18,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.85)",
            }}
          >
            Lumina · Quantum
          </span>
        </div>

        <div
          style={{
            fontSize: 112,
            fontWeight: 900,
            lineHeight: 1.0,
            letterSpacing: -2,
            color: "#ffffff",
            textShadow: "0 0 60px rgba(138,92,255,0.55)",
          }}
        >
          КВАНТОВОЕ
        </div>
        <div
          style={{
            fontSize: 112,
            fontWeight: 900,
            lineHeight: 1.0,
            letterSpacing: -2,
            color: "#36e8ff",
            textShadow: "0 0 60px rgba(54,232,255,0.6)",
          }}
        >
          ЯДРО
        </div>

        <div
          style={{
            marginTop: 42,
            fontSize: 26,
            color: "rgba(255,255,255,0.7)",
            maxWidth: 760,
          }}
        >
          Машина, считающая реальность. Войди внутрь — увидь, как
          вычисляется будущее.
        </div>
      </div>
    ),
    { ...size }
  );
}
