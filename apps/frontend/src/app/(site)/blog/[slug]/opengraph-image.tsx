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
        background: "linear-gradient(135deg, #09090b 0%, #121214 60%, #1a120c 100%)",
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
        <span style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <svg width="40" height="40" viewBox="0 0 64 64">
            <rect width="64" height="64" rx="16" fill="#f97316" />
            <path d="M18 14h9a18 18 0 0 1 0 36h-9z" fill="#0b0b0d" />
            <path
              d="M38.36 27.4a6 6 0 1 0 0 9.2"
              fill="none"
              stroke="#f97316"
              strokeWidth="5"
              strokeLinecap="round"
            />
          </svg>
          {`${SITE_NAME} · Blog`}
        </span>
        <span style={{ color: "#f97316", textTransform: "uppercase", letterSpacing: 4 }}>
          {post?.category?.name ?? ""}
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ fontSize: title.length > 60 ? 60 : 76, lineHeight: 1.05, letterSpacing: -2 }}>
          {title}
        </div>
        <div style={{ fontFamily: "sans-serif", fontSize: 28, color: "#a0a0a8", maxWidth: 950 }}>
          {excerpt}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "sans-serif",
          fontSize: 22,
          color: "#6a6a73",
        }}
      >
        <span>Aman Choudhary</span>
        <span>{footer}</span>
      </div>
    </div>,
    size,
  );
}
