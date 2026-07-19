import { ImageResponse } from "next/og";

export const alt = "Carbase — Cash for Cars, Brisbane & Gold Coast";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
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
          background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #3b82f6 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 96, fontWeight: 800, letterSpacing: -2 }}>
          car
          <span style={{ color: "#93c5fd" }}>base</span>
        </div>
        <div style={{ display: "flex", fontSize: 36, marginTop: 16, color: "#dbeafe" }}>
          Cash for cars · Brisbane &amp; Gold Coast
        </div>
        <div
          style={{
            display: "flex",
            gap: 24,
            marginTop: 48,
            fontSize: 24,
            color: "#bfdbfe",
          }}
        >
          <span>Free pickup</span>
          <span>·</span>
          <span>Paid on the spot</span>
          <span>·</span>
          <span>Any condition</span>
        </div>
      </div>
    ),
    size,
  );
}
