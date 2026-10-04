export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
export const SITE_NAME = "Developer Choudhary";
export const AUTHOR_NAME = "Aman Choudhary";
export const DEFAULT_DESCRIPTION =
  "Aman Choudhary builds high-performance websites, ERP systems and CRM portals with Next.js, Go and PostgreSQL, self-hosted on Kubernetes.";

export const NAV = [
  { href: "/work", label: "Work" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
] as const;

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
