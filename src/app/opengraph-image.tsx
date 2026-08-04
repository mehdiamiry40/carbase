import { ImageResponse } from "next/og";

export const alt = "Carbase — Cash for old, damaged and junk cars across Brisbane and the Gold Coast";
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
          background: "#f5f7fa",
          color: "#101827",
          fontFamily: "sans-serif",
          padding: "72px 82px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 48, fontWeight: 700, letterSpacing: 3 }}>
            CAR<span style={{ color: "#8f1710" }}>BASE</span>
          </div>
          <div style={{ display: "flex", width: 72, height: 6, marginTop: 14, background: "#8f1710" }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", maxWidth: 960, fontSize: 72, lineHeight: 1.02, fontWeight: 700, letterSpacing: -2, color: "#310005" }}>
            We buy old, damaged and junk cars.
          </div>
          <div style={{ display: "flex", marginTop: 24, fontSize: 28, color: "#8f1710" }}>
            Free quote · Free pickup · Payment before collection
          </div>
        </div>

        <div
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "space-between",
            borderTop: "2px solid #f3a097",
            paddingTop: 24,
            fontSize: 22,
            color: "#4b0507",
          }}
        >
          <span>Brisbane · Gold Coast · South East Queensland</span>
          <span>Old · Damaged · Unregistered · Not running</span>
        </div>
      </div>
    ),
    size,
  );
}
