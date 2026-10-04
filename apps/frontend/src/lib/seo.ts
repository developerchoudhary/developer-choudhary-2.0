import type { Metadata } from "next";
import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL } from "./site";
import type { Post, Profile, Project, ReviewSummary, Service } from "./types";
import { absoluteUrl } from "./utils";

interface PageMeta {
  title: string;
  description?: string;
  path: string;
  /**
   * Share image. A URL uses that image; `undefined` falls back to the site-wide portrait composite;
   * `null` sets nothing so the segment's own opengraph-image route is used (projects, posts).
   */
  image?: string | null;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  noIndex?: boolean;
}

export function pageMetadata(meta: PageMeta): Metadata {
  const url = `${SITE_URL}${meta.path}`;
  const description = meta.description || DEFAULT_DESCRIPTION;
  const images =
    meta.image === null
      ? undefined
      : [
          {
            url: absoluteUrl(meta.image || "/og-image.png", SITE_URL),
            width: 1200,
            height: 630,
            alt: meta.title,
          },
        ];
  // `images` is omitted only when a page passes `image: null`, so its segment's opengraph-image route wins.
  return {
    title: meta.title,
    description,
    alternates: { canonical: url },
    robots: meta.noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      title: meta.title,
      description,
      url,
      siteName: SITE_NAME,
      type: meta.type ?? "website",
      locale: "en_IN",
      ...(images ? { images } : {}),
      publishedTime: meta.publishedTime,
      modifiedTime: meta.modifiedTime,
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description,
      ...(images ? { images: images.map((i) => i.url) } : {}),
    },
  };
}

export function personJsonLd(profile: Profile, summary?: ReviewSummary) {
  const sameAs = profile.socials.map((s) => s.url);
  const base: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${SITE_URL}/#person`,
    name: profile.fullName,
    url: SITE_URL,
    image: absoluteUrl(profile.avatarUrl || "/aman-choudhary.jpg", SITE_URL),
    jobTitle: profile.headline,
    description: profile.bioShort,
    email: profile.email ? `mailto:${profile.email}` : undefined,
    telephone: profile.phone || undefined,
    address: {
      "@type": "PostalAddress",
      addressLocality: profile.locationCity,
      addressRegion: profile.locationRegion,
      addressCountry: profile.locationCountry,
    },
    sameAs,
  };
  const service: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${SITE_URL}/#business`,
    name: SITE_NAME,
    url: SITE_URL,
    image: `${SITE_URL}/opengraph-image`,
    founder: { "@id": `${SITE_URL}/#person` },
    areaServed: "Worldwide",
    address: base.address,
    sameAs,
    priceRange: "₹₹",
  };
  if (summary && summary.count > 0) {
    service.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: summary.average,
      reviewCount: summary.count,
      bestRating: 5,
      worstRating: 1,
    };
  }
  return [base, service];
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/blog?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

export function articleJsonLd(post: Post, profile: Profile) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.seoDescription || post.excerpt,
    image: post.coverUrl
      ? [absoluteUrl(post.coverUrl, SITE_URL)]
      : [`${SITE_URL}/blog/${post.slug}/opengraph-image`],
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: { "@type": "Person", name: profile.fullName, url: SITE_URL },
    publisher: { "@type": "Person", name: profile.fullName, url: SITE_URL },
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
    keywords: post.tags.map((t) => t.name).join(", "),
    wordCount: undefined,
    timeRequired: `PT${post.readingTimeMinutes}M`,
  };
}

export function serviceJsonLd(service: Service, profile: Profile) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.seoDescription || service.summary,
    serviceType: service.title,
    url: `${SITE_URL}/services/${service.slug}`,
    provider: { "@type": "Person", name: profile.fullName, url: SITE_URL },
    areaServed: "Worldwide",
    offers: service.startingPriceLabel
      ? { "@type": "Offer", description: service.startingPriceLabel }
      : undefined,
  };
}

export function faqJsonLd(faqs: Array<{ question: string; answer: string }>) {
  if (!faqs.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function projectJsonLd(project: Project, profile: Profile) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.seoDescription || project.summary,
    url: `${SITE_URL}/work/${project.slug}`,
    image: project.coverUrl ? absoluteUrl(project.coverUrl, SITE_URL) : undefined,
    creator: { "@type": "Person", name: profile.fullName, url: SITE_URL },
    dateCreated: project.startedAt ?? undefined,
    keywords: project.technologies.join(", "),
  };
}
