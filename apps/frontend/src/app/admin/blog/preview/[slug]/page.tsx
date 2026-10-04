"use client";

import { useParams } from "next/navigation";
import { BlockPreview } from "@/components/admin/block-preview";
import { Skeleton } from "@/components/ui/misc";
import { useItem } from "@/lib/admin/hooks";
import type { PostDetail } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function PostPreviewPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, error } = useItem<PostDetail>("/posts/preview", slug);
  if (isLoading) return <Skeleton className="mx-auto h-96 max-w-3xl" />;
  if (error || !data) return <p className="text-fg-muted">Post not found.</p>;
  return (
    <article className="mx-auto max-w-3xl py-8">
      <p className="eyebrow mb-4">
        Preview · {data.status}
        {data.publishedAt ? ` · ${formatDate(data.publishedAt)}` : ""}
      </p>
      <h1 className="display text-4xl sm:text-5xl">{data.title}</h1>
      {data.excerpt && <p className="mt-5 text-xl text-fg-muted">{data.excerpt}</p>}
      {data.coverUrl && (
        <img
          src={data.coverUrl}
          alt={data.coverAlt || data.title}
          className="mt-8 w-full rounded-3xl border border-line"
        />
      )}
      <div className="mt-10">
        <BlockPreview blocks={data.content ?? []} />
      </div>
    </article>
  );
}
