"use client";

import { useEffect } from "react";

export function PostView({ slug }: { slug: string }) {
  useEffect(() => {
    const key = `dc_viewed_${slug}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    fetch(`/api/v1/public/posts/${slug}/view`, { method: "POST", keepalive: true }).catch(() => {});
  }, [slug]);
  return null;
}
