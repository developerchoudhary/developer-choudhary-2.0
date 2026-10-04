import { Clock } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlockRenderer } from "@/components/site/block-renderer";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { PostCard } from "@/components/site/cards";
import { CtaBand } from "@/components/site/cta-band";
import { JsonLd } from "@/components/site/json-ld";
import { PostView } from "@/components/site/post-view";
import { Reveal } from "@/components/site/reveal";
import { ShareButtons } from "@/components/site/share-buttons";
import { Avatar } from "@/components/ui/misc";
import { getPost, getSite } from "@/lib/data";
import { articleJsonLd, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import { formatDate } from "@/lib/utils";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Article not found" };
  const meta = pageMetadata({
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    path: `/blog/${post.slug}`,
    image: post.coverUrl || `/blog/${post.slug}/opengraph-image`,
    type: "article",
    publishedTime: post.publishedAt ?? undefined,
    modifiedTime: post.updatedAt,
  });
  if (post.canonicalUrl) meta.alternates = { canonical: post.canonicalUrl };
  return meta;
}

export default async function PostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const [post, site] = await Promise.all([getPost(slug), getSite()]);
  if (!post) notFound();
  const url = `${SITE_URL}/blog/${post.slug}`;
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog" },
    { name: post.title, path: `/blog/${post.slug}` },
  ];

  return (
    <>
      <JsonLd data={[articleJsonLd(post, site.profile), breadcrumbJsonLd(crumbs)]} />
      <PostView slug={post.slug} />
      <article className="container-dc pt-10 sm:pt-16">
        <div className="mx-auto max-w-3xl">
          <Breadcrumbs items={crumbs.slice(0, 2)} />
          <Reveal>
            <div className="mt-8 flex flex-wrap items-center gap-2 font-mono text-xs uppercase tracking-wider text-fg-subtle">
              {post.category && (
                <Link href={`/blog/category/${post.category.slug}`} className="text-accent hover:underline">
                  {post.category.name}
                </Link>
              )}
              <span>{formatDate(post.publishedAt)}</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3" /> {post.readingTimeMinutes} min read
              </span>
            </div>
            <h1 className="display mt-5 text-balance text-4xl sm:text-5xl lg:text-6xl">{post.title}</h1>
            {post.excerpt && <p className="mt-6 text-pretty text-xl text-fg-muted">{post.excerpt}</p>}
            <div className="mt-8 flex items-center justify-between gap-4 border-y border-line py-4">
              <div className="flex items-center gap-3">
                <Avatar src={site.profile.avatarUrl} name={site.profile.fullName} className="size-9" />
                <div className="text-sm">
                  <p className="font-medium">{site.profile.fullName}</p>
                  <p className="text-fg-subtle">{site.profile.headline}</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
        {post.coverUrl && (
          <Reveal className="mx-auto mt-10 max-w-5xl">
            <div className="relative aspect-[2/1] overflow-hidden rounded-3xl border border-line bg-bg-muted">
              <Image
                src={post.coverUrl}
                alt={post.coverAlt || post.title}
                fill
                priority
                sizes="(min-width: 1024px) 1024px, 100vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        )}
        <div className="mx-auto mt-12 max-w-3xl">
          <BlockRenderer blocks={post.content} />
          {post.tags.length > 0 && (
            <div className="mt-12 flex flex-wrap gap-2">
              {post.tags.map((t) => (
                <Link
                  key={t.id}
                  href={`/blog/tag/${t.slug}`}
                  className="rounded-full border border-line px-3 py-1 text-sm text-fg-muted transition hover:border-line-strong hover:text-fg"
                >
                  #{t.name}
                </Link>
              ))}
            </div>
          )}
          <div className="mt-10 border-t border-line pt-8">
            <p className="eyebrow mb-3">Share this article</p>
            <ShareButtons url={url} title={post.title} />
          </div>
        </div>
      </article>
      {post.related.length > 0 && (
        <section className="container-dc mt-20">
          <h2 className="display mb-6 text-3xl">Keep reading</h2>
          <div className="grid gap-5 md:grid-cols-3">
            {post.related.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        </section>
      )}
      <CtaBand
        text="Working on something like this? I can help."
        whatsapp={site.profile.whatsapp}
        email={site.profile.email}
      />
    </>
  );
}
