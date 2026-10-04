import { ImageResponse } from "next/og";
import { getPost } from "@/lib/data";
import { SITE_NAME } from "@/lib/site";

export const alt = "Article";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug).catch(() => null);
  const title = post?.title ?? "Article";
  const excerpt = (post?.excerpt ?? "").slice(0, 160);
  const footer = post
    ? `${post.readingTimeMinutes} min read · developerchoudhary.com`
    : "developerchoudhary.com";
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: "#f7f5f0",
        color: "#09090b",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "sans-serif",
          fontSize: 24,
          color: "#5b6069",
        }}
      >
        <span>{`${SITE_NAME} · Blog`}</span>
        <span style={{ color: "#0e7c66", textTransform: "uppercase", letterSpacing: 4 }}>
          {post?.category?.name ?? ""}
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ fontSize: title.length > 60 ? 60 : 76, lineHeight: 1.05, letterSpacing: -2 }}>
          {title}
        </div>
        <div style={{ fontFamily: "sans-serif", fontSize: 28, color: "#5b6069", maxWidth: 950 }}>
          {excerpt}
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
        <span>Aman Choudhary</span>
        <span>{footer}</span>
      </div>
    </div>,
    size,
  );
}
