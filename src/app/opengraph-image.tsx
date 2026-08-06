import { ImageResponse } from "next/og";

export const alt =
  "Carbase — Cash for old, damaged and junk cars across Brisbane and the Gold Coast";
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
          color: "#061a39",
          fontFamily: "sans-serif",
          padding: "72px 82px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          {/* Tow-truck mark (OG-friendly blocks) */}
          <div
            style={{
              display: "flex",
              width: 72,
              height: 72,
              background: "#0a2f68",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Cab */}
            <div
              style={{
                position: "absolute",
                top: 28,
                left: 9,
                width: 24,
                height: 16,
                background: "#ffffff",
                display: "flex",
              }}
            />
            {/* Bed */}
            <div
              style={{
                position: "absolute",
                top: 37,
                left: 33,
                width: 24,
                height: 6,
                background: "#ffffff",
                display: "flex",
              }}
            />
            {/* Boom mast */}
            <div
              style={{
                position: "absolute",
                top: 12,
                left: 52,
                width: 6,
                height: 24,
                background: "#ffffff",
                display: "flex",
              }}
            />
            {/* Boom arm */}
            <div
              style={{
                position: "absolute",
                top: 12,
                left: 35,
                width: 23,
                height: 5,
                background: "#ffffff",
                display: "flex",
              }}
            />
            {/* Hook cable */}
            <div
              style={{
                position: "absolute",
                top: 17,
                left: 37,
                width: 3,
                height: 12,
                background: "#dc1f4b",
                display: "flex",
              }}
            />
            {/* Wheels */}
            <div
              style={{
                position: "absolute",
                top: 44,
                left: 14,
                width: 12,
                height: 12,
                borderRadius: 999,
                border: "3px solid #ffffff",
                background: "#0a2f68",
                display: "flex",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 44,
                left: 44,
                width: 12,
                height: 12,
                borderRadius: 999,
                border: "3px solid #ffffff",
                background: "#0a2f68",
                display: "flex",
              }}
            />
            {/* Ground */}
            <div
              style={{
                position: "absolute",
                bottom: 6,
                left: 10,
                width: 52,
                height: 5,
                background: "#dc1f4b",
                display: "flex",
              }}
            />
          </div>
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
