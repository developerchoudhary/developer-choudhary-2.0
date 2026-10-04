import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlockRenderer } from "@/components/site/block-renderer";
import { CategoryDot, PostRow } from "@/components/site/cards";
import { Cta } from "@/components/site/cta";
import { JsonLd } from "@/components/site/json-ld";
import { PostView } from "@/components/site/post-view";
import { ShareButtons } from "@/components/site/share-buttons";
import { BackLink } from "@/components/site/ui";
import { getPost, getSite } from "@/lib/data";
import { articleJsonLd, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { SITE_URL, siteSettings } from "@/lib/site";
import { formatDate } from "@/lib/utils";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Article not found" };
  const meta = await pageMetadata({
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    path: `/blog/${post.slug}`,
    image: post.coverUrl || null, // no cover: the segment's opengraph-image route renders a titled card
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
  const settings = siteSettings(site);
  if (!post || !settings.showBlog) notFound();
  const { profile } = site;
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog" },
    { name: post.title, path: `/blog/${post.slug}` },
  ];

  return (
    <>
      <JsonLd data={[articleJsonLd(post, profile), breadcrumbJsonLd(crumbs)]} />
      <PostView slug={post.slug} />
      <article className="pt-12 sm:pt-16">
        <header className="container-dc">
          <div className="mx-auto max-w-[44rem]">
            <BackLink href="/blog">Blog</BackLink>
            <p className="rise mt-10 flex flex-wrap items-center gap-x-2 text-sm text-fg-subtle">
              {post.category && (
                <>
                  <Link
                    href={`/blog/category/${post.category.slug}`}
                    className="inline-flex items-center gap-2 font-semibold text-fg hover:underline"
                  >
                    <CategoryDot color={post.category.color} />
                    {post.category.name}
                  </Link>
                  <span aria-hidden="true">·</span>
                </>
              )}
              <time dateTime={post.publishedAt ?? undefined}>{formatDate(post.publishedAt)}</time>
              <span aria-hidden="true">·</span>
              <span>{post.readingTimeMinutes} min read</span>
            </p>
            <h1 className="display rise mt-4 text-balance text-[2.2rem] sm:text-[2.9rem]">{post.title}</h1>
            {post.excerpt && (
              <p className="rise mt-5 text-pretty text-xl leading-relaxed text-fg-muted">{post.excerpt}</p>
            )}
            <div className="rise mt-8 flex items-center gap-3 border-t border-line pt-6">
              {profile.avatarUrl && (
                <Image
                  src={profile.avatarUrl}
                  alt=""
                  width={40}
                  height={40}
                  className="photo-backdrop size-10 rounded-full object-cover object-top"
                />
              )}
              <div className="text-sm">
                <p className="font-semibold">{profile.fullName}</p>
                <p className="text-fg-subtle">{profile.headline}</p>
              </div>
            </div>
          </div>
        </header>

        {post.coverUrl && (
          <div className="container-dc mt-10">
            <div className="relative mx-auto aspect-[2/1] max-w-4xl overflow-hidden rounded-2xl border border-line bg-bg-muted">
              <Image
                src={post.coverUrl}
                alt={post.coverAlt || post.title}
                fill
                priority
                sizes="(min-width: 960px) 896px, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        )}

        <div className="container-dc mt-12">
          <div className="mx-auto max-w-[44rem]">
            <BlockRenderer blocks={post.content} />
            {post.tags.length > 0 && (
              <ul className="mt-12 flex flex-wrap gap-2">
                {post.tags.map((t) => (
                  <li key={t.id}>
                    <Link
                      href={`/blog/tag/${t.slug}`}
                      className="inline-flex rounded-lg border border-line bg-bg-elevated px-2.5 py-1 text-sm text-fg-muted transition-colors hover:border-line-strong hover:text-fg"
                    >
                      #{t.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-10 flex flex-col gap-4 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold">Share this article</p>
              <ShareButtons url={`${SITE_URL}/blog/${post.slug}`} title={post.title} />
            </div>
          </div>
        </div>
      </article>

      {post.related.length > 0 && (
        <section className="container-dc pt-20">
          <div className="mx-auto max-w-4xl">
            <h2 className="display mb-2 text-2xl">Keep reading</h2>
            <div className="border-b border-line">
              {post.related.map((p) => (
                <PostRow key={p.id} post={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      <Cta
        title={settings.ctaTitle}
        text={settings.ctaText}
        whatsapp={profile.whatsapp}
        primary={settings.heroPrimary}
      />
    </>
  );
}
