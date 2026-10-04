import { ImageResponse } from "next/og";
import { getProject } from "@/lib/data";
import { PROJECT_TYPE_LABELS, SITE_NAME } from "@/lib/site";

export const alt = "Project";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProject(slug).catch(() => null);
  const title = project?.title ?? "Project";
  const subtitle = (project?.subtitle || project?.summary || "").slice(0, 140);
  const type = project ? (PROJECT_TYPE_LABELS[project.projectType] ?? project.projectType) : "";
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: "#09090b",
        color: "#f4f4f2",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "sans-serif",
          fontSize: 24,
          color: "#a0a0a8",
        }}
      >
        <span>{`${SITE_NAME} · Work`}</span>
        <span style={{ textTransform: "uppercase", letterSpacing: 4, color: "#f97316" }}>{type}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ fontSize: 80, lineHeight: 1, letterSpacing: -2 }}>{title}</div>
        <div style={{ fontFamily: "sans-serif", fontSize: 30, color: "#a0a0a8", maxWidth: 950 }}>
          {subtitle}
        </div>
      </div>
      <div style={{ fontFamily: "sans-serif", fontSize: 22, color: "#6a6a73" }}>developerchoudhary.com</div>
    </div>,
    size,
  );
}
