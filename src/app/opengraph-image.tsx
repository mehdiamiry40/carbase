import { ImageResponse } from "next/og";
import { logoMarkSvg } from "@/lib/logo";

export const alt =
  "Carbase — Cash for old, damaged and junk cars across Brisbane and the Gold Coast";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const markSrc = `data:image/svg+xml;base64,${Buffer.from(logoMarkSvg()).toString("base64")}`;

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
          color: "#061a39",
          fontFamily: "sans-serif",
          padding: "72px 82px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          {/* Satori rasterises images but not arbitrary SVG elements, so the
              mark comes in as a data URI rather than being rebuilt in divs. */}
          <img src={markSrc} width={76} height={76} alt="" />
          <div
            style={{
              display: "flex",
              fontSize: 48,
              fontWeight: 700,
              letterSpacing: 4,
            }}
          >
            CAR<span style={{ color: "#b8123a" }}>BASE</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              maxWidth: 960,
              fontSize: 72,
              lineHeight: 1.02,
              fontWeight: 700,
              letterSpacing: -2,
              color: "#061a39",
            }}
          >
            We buy old, damaged and junk cars.
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 24,
              fontSize: 28,
              color: "#dc1f4b",
            }}
          >
            Free quote · Free pickup · Payment before collection
          </div>
        </div>

        <div
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "space-between",
            borderTop: "2px solid #ffcbd7",
            paddingTop: 24,
            fontSize: 22,
            color: "#244f84",
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
