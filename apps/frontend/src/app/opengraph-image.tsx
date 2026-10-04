import { ImageResponse } from "next/og";
import { DEFAULT_DESCRIPTION, SITE_NAME } from "@/lib/site";

export const alt = SITE_NAME;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const frame = {
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column" as const,
  justifyContent: "space-between",
  padding: 72,
  background: "#f7f5f0",
  color: "#15171b",
  fontFamily: "Georgia, serif",
};

export default function Image() {
  return new ImageResponse(
    <div style={frame}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          fontSize: 28,
          fontFamily: "sans-serif",
          color: "#5b6069",
        }}
      >
        <span style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 44, color: "#15171b" }}>
          DC.
        </span>
        <span>{SITE_NAME}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 18,
            fontSize: 76,
            lineHeight: 1,
            letterSpacing: -2,
          }}
        >
          <span>Websites, ERPs and CRMs</span>
          <span style={{ color: "#0e7c66", fontStyle: "italic" }}>built to last.</span>
        </div>
        <div style={{ fontFamily: "sans-serif", fontSize: 28, color: "#5b6069", maxWidth: 900 }}>
          {DEFAULT_DESCRIPTION}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "sans-serif",
          fontSize: 22,
          color: "#8a8f98",
        }}
      >
        <span>Aman Choudhary · Full-stack engineer</span>
        <span>developerchoudhary.com</span>
      </div>
    </div>,
    size,
  );
}
