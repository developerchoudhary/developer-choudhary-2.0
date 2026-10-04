import { ImageResponse } from "next/og";
import { DEFAULT_DESCRIPTION, SITE_NAME } from "@/lib/site";

export const alt = SITE_NAME;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: "linear-gradient(135deg, #09090b 0%, #121214 60%, #1a120c 100%)",
        color: "#f4f4f2",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 28, color: "#a0a0a8" }}>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 56,
            height: 56,
            borderRadius: 14,
            background: "#f97316",
            color: "#0b0b0d",
            fontWeight: 700,
            fontSize: 26,
          }}
        >
          DC
        </span>
        <span>{SITE_NAME}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 18,
            fontSize: 80,
            lineHeight: 1,
            letterSpacing: -3,
            fontWeight: 600,
          }}
        >
          <span>Websites, ERPs and CRMs</span>
          <span style={{ color: "#f97316" }}>built to last.</span>
        </div>
        <div style={{ fontSize: 28, color: "#a0a0a8", maxWidth: 900, lineHeight: 1.4 }}>
          {DEFAULT_DESCRIPTION}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, color: "#6a6a73" }}>
        <span>developerchoudhary.com</span>
        <span>Next.js · Go · PostgreSQL · Kubernetes</span>
      </div>
    </div>,
    size,
  );
}
