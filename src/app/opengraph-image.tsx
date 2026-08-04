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
          alignItems: "flex-start",
          justifyContent: "space-between",
          background: "#1d2747",
          color: "white",
          fontFamily: "sans-serif",
          padding: "72px 82px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              display: "flex",
              width: 72,
              height: 72,
              border: "4px solid white",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              fontWeight: 700,
            }}
          >
            C
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 46, fontWeight: 700, letterSpacing: 2 }}>
              CARBASE
            </div>
            <div style={{ display: "flex", marginTop: 8, fontSize: 16, letterSpacing: 5, color: "#d8dce4" }}>
              CASH FOR CARS · SEQ
            </div>
          </div>
        </div>

        <div style={{ display: "flex", maxWidth: 900, fontSize: 68, lineHeight: 1.05, fontWeight: 700, letterSpacing: -2 }}>
          Sell your car without the runaround.
        </div>

        <div
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "space-between",
            borderTop: "2px solid #7582a4",
            paddingTop: 24,
            fontSize: 22,
            color: "#d8dce4",
          }}
        >
          <span>Brisbane · Gold Coast · South East Queensland</span>
          <span>Free quote · Free pickup</span>
        </div>
      </div>
    ),
    size,
  );
}
