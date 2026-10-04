import type { SiteBundle } from "./types";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
export const SITE_NAME = "Developer Choudhary";
export const DEFAULT_DESCRIPTION =
  "Aman Choudhary is a full-stack developer building fast websites, ERP systems and CRM portals with Next.js, Go and PostgreSQL.";

export const NAV = [
  { href: "/work", label: "Work" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
] as const;

export interface LinkSetting {
  label: string;
  href: string;
}

/**
 * Every setting the public site reads, with the value used when the admin has not set it.
 * The backend owns the same list (internal/modules/settings/registry.go) and rejects unknown keys.
 */
export interface SiteSettings {
  name: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  twitterHandle: string;
  heroPrimary: LinkSetting;
  heroSecondary: LinkSetting;
  ctaTitle: string;
  ctaText: string;
  responseTime: string;
  calendarUrl: string;
  footerNote: string;
  showBlog: boolean;
  showReviews: boolean;
  showResume: boolean;
  askLocation: boolean;
}

const DEFAULTS: SiteSettings = {
  name: SITE_NAME,
  seoTitle: `${SITE_NAME} · Full-stack developer`,
  seoDescription: DEFAULT_DESCRIPTION,
  seoKeywords: [],
  twitterHandle: "",
  heroPrimary: { label: "Hire me", href: "/contact" },
  heroSecondary: { label: "View my work", href: "/work" },
  ctaTitle: "Have a project in mind?",
  ctaText: "Tell me what you are building. I reply personally, usually within a day.",
  responseTime: "within one working day",
  calendarUrl: "",
  footerNote: "",
  showBlog: true,
  showReviews: true,
  showResume: true,
  askLocation: true,
};

function pick<T>(raw: Record<string, unknown>, key: string, fallback: T): T {
  const value = raw[key];
  if (value === undefined || value === null) return fallback;
  if (typeof fallback === "string")
    return (typeof value === "string" && value.trim() ? value : fallback) as T;
  if (typeof fallback === "boolean") return (typeof value === "boolean" ? value : fallback) as T;
  if (Array.isArray(fallback)) return (Array.isArray(value) ? value : fallback) as T;
  const link = value as Partial<LinkSetting>;
  return (link.label && link.href ? { label: link.label, href: link.href } : fallback) as T;
}

export function siteSettings(site: Pick<SiteBundle, "settings">): SiteSettings {
  const s = site.settings;
  return {
    name: pick(s, "site.name", DEFAULTS.name),
    seoTitle: pick(s, "seo.defaultTitle", DEFAULTS.seoTitle),
    seoDescription: pick(s, "seo.defaultDescription", DEFAULTS.seoDescription),
    seoKeywords: pick(s, "seo.keywords", DEFAULTS.seoKeywords),
    twitterHandle: pick(s, "seo.twitterHandle", DEFAULTS.twitterHandle),
    heroPrimary: pick(s, "hero.ctaPrimary", DEFAULTS.heroPrimary),
    heroSecondary: pick(s, "hero.ctaSecondary", DEFAULTS.heroSecondary),
    ctaTitle: pick(s, "cta.title", DEFAULTS.ctaTitle),
    ctaText: pick(s, "cta.text", DEFAULTS.ctaText),
    responseTime: pick(s, "contact.responseTime", DEFAULTS.responseTime),
    calendarUrl: pick(s, "contact.calendarUrl", DEFAULTS.calendarUrl),
    footerNote: pick(s, "footer.note", DEFAULTS.footerNote),
    showBlog: pick(s, "features.blog", DEFAULTS.showBlog),
    showReviews: pick(s, "features.reviews", DEFAULTS.showReviews),
    showResume: pick(s, "features.resume", DEFAULTS.showResume),
    askLocation: pick(s, "features.locationConsent", DEFAULTS.askLocation),
  };
}

export const AVAILABILITY_LABELS = {
  available: "Available for new projects",
  limited: "Limited availability",
  unavailable: "Fully booked right now",
} as const;

export const PROJECT_TYPE_LABELS: Record<string, string> = {
  website: "Website",
  erp: "ERP",
  crm: "CRM",
  "web-app": "Web app",
  ecommerce: "E-commerce",
  api: "API",
  mobile: "Mobile",
  devops: "DevOps",
  other: "Other",
};

export const PROJECT_STATUS_LABELS: Record<string, string> = {
  upcoming: "Upcoming",
  "in-progress": "In progress",
  completed: "Completed",
};

export const SKILL_CATEGORY_LABELS: Record<string, string> = {
  frontend: "Frontend",
  backend: "Backend",
  database: "Databases",
  devops: "DevOps",
  cloud: "Cloud & hosting",
  tools: "Tools",
  design: "Design",
  other: "Other",
};

export const BUDGET_RANGES = ["Under ₹50k", "₹50k – ₹1.5L", "₹1.5L – ₹5L", "₹5L+", "Not sure yet"];
export const TIMELINES = ["ASAP", "Within a month", "1–3 months", "Flexible"];
