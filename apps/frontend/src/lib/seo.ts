import type { Metadata } from "next";
import { versioned } from "./brand";
import { getSite } from "./data";
import { SITE_URL, siteSettings } from "./site";
import type { Post, Profile, Project, ReviewSummary, Service } from "./types";
import { absoluteUrl } from "./utils";

/** The site-wide share card, drawn in the active theme (src/app/og-image.png/route.ts). */
export const DEFAULT_SHARE_IMAGE = "/og-image.png";

interface PageMeta {
  title: string;
  description?: string;
  path: string;
  /**
   * Share image. A URL uses that image; `undefined` falls back to the site-wide share card;
   * `null` sets nothing so the segment's own opengraph-image route is used (projects, posts).
   */
  image?: string | null;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  noIndex?: boolean;
  /** Use the title as-is instead of applying the "%s · Site name" template. */
  absoluteTitle?: boolean;
}

/** Page metadata with canonical URL, Open Graph and Twitter cards, using the site name set in the admin. */
export async function pageMetadata(meta: PageMeta): Promise<Metadata> {
  const site = await getSite();
  const settings = siteSettings(site);
  const url = `${SITE_URL}${meta.path}`;
  const description = meta.description || settings.seoDescription;
  const images =
    meta.image === null
      ? undefined
      : [
          {
            // The version changes with the theme, so networks fetch the new card instead of a cached one.
            url: absoluteUrl(meta.image || versioned(DEFAULT_SHARE_IMAGE, site.theme), SITE_URL),
            width: 1200,
            height: 630,
            alt: meta.title,
          },
        ];
  return {
    title: meta.absoluteTitle ? { absolute: meta.title } : meta.title,
    description,
    alternates: { canonical: url },
    robots: meta.noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      title: meta.title,
      description,
      url,
      siteName: settings.name,
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
      creator: settings.twitterHandle || undefined,
      ...(images ? { images: images.map((i) => i.url) } : {}),
    },
  };
}

export function personJsonLd(profile: Profile, siteName: string, summary?: ReviewSummary) {
  const sameAs = profile.socials.map((s) => s.url);
  const address = {
    "@type": "PostalAddress",
    addressLocality: profile.locationCity,
    addressRegion: profile.locationRegion,
    addressCountry: profile.locationCountry,
  };
  const person: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${SITE_URL}/#person`,
    name: profile.fullName,
    url: SITE_URL,
    image: profile.avatarUrl ? absoluteUrl(profile.avatarUrl, SITE_URL) : undefined,
    jobTitle: profile.headline,
    description: profile.bioShort,
    email: profile.email ? `mailto:${profile.email}` : undefined,
    telephone: profile.phone || undefined,
    address,
    sameAs,
  };
  const business: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${SITE_URL}/#business`,
    name: siteName,
    url: SITE_URL,
    image: `${SITE_URL}${DEFAULT_SHARE_IMAGE}`,
    logo: `${SITE_URL}/brand/icon-512.png`,
    founder: { "@id": `${SITE_URL}/#person` },
    areaServed: "Worldwide",
    address,
    sameAs,
  };
  if (summary && summary.count > 0) {
    business.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: summary.average,
      reviewCount: summary.count,
      bestRating: 5,
      worstRating: 1,
    };
  }
  return [person, business];
}

export function websiteJsonLd(siteName: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
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
    image: [absoluteUrl(post.coverUrl || DEFAULT_SHARE_IMAGE, SITE_URL)],
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: { "@type": "Person", name: profile.fullName, url: SITE_URL },
    publisher: { "@type": "Person", name: profile.fullName, url: SITE_URL },
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
    keywords: post.tags.map((t) => t.name).join(", "),
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
    image: absoluteUrl(project.coverUrl || DEFAULT_SHARE_IMAGE, SITE_URL),
    creator: { "@type": "Person", name: profile.fullName, url: SITE_URL },
    dateCreated: project.startedAt ?? undefined,
    keywords: project.technologies.join(", "),
  };
}
