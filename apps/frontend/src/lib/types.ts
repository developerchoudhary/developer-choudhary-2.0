import type { Block } from "./blocks";

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: PageMeta;
}

export interface PageMeta {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  sortBy?: string;
  sortDirection?: string;
}

export interface Paginated<T> {
  items: T[];
  meta: PageMeta;
}

export interface SocialLink {
  label: string;
  url: string;
  icon: string;
}

export interface Profile {
  fullName: string;
  headline: string;
  bioShort: string;
  bioLong: string;
  email: string;
  phone: string;
  whatsapp: string;
  locationCity: string;
  locationRegion: string;
  locationCountry: string;
  timezone: string;
  avatarFileId: string | null;
  avatarUrl: string;
  availabilityStatus: "available" | "limited" | "unavailable";
  availabilityNote: string;
  yearsExperience: number;
  projectsCompleted: number;
  clientsServed: number;
  socials: SocialLink[];
  resumeSummary: string;
  updatedAt: string;
}

export interface Tagline {
  id: string;
  text: string;
  context: "hero" | "cta" | "footer" | "about";
  sortOrder?: number;
  isActive?: boolean;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  proficiency: number;
  years: number;
  icon: string;
  color: string;
  description: string;
  isFeatured: boolean;
  isPublished: boolean;
  sortOrder: number;
}

export interface SkillGroup {
  category: string;
  skills: Skill[];
}

export interface ReviewSummary {
  average: number;
  count: number;
  distribution: Record<string, number>;
}

export interface ResumePublic {
  version: number;
  title: string;
  fileUrl: string;
  downloadUrl: string;
  fileSize: number;
  updatedAt: string;
}

export interface SiteBundle {
  profile: Profile;
  settings: Record<string, unknown>;
  taglines: Tagline[];
  skills: SkillGroup[];
  reviews: ReviewSummary;
  resume: ResumePublic | null;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface Service {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  summary: string;
  description: Block[];
  icon: string;
  deliverables: string[];
  techStack: string[];
  idealFor: string[];
  startingPriceLabel: string;
  timelineLabel: string;
  faqs: FAQ[];
  coverFileId: string | null;
  coverUrl: string;
  seoTitle: string;
  seoDescription: string;
  sortOrder: number;
  isFeatured: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GalleryItem {
  fileId?: string;
  url: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
}

export interface Highlight {
  label: string;
  value: string;
}

export type ProjectStatus = "upcoming" | "in-progress" | "completed";

export interface Project {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  summary: string;
  description?: Block[];
  clientName: string;
  clientIndustry: string;
  projectType: string;
  status: ProjectStatus;
  liveUrl: string;
  repoUrl: string;
  coverFileId: string | null;
  coverUrl: string;
  gallery: GalleryItem[];
  technologies: string[];
  serviceSlugs: string[];
  highlights: Highlight[];
  role: string;
  startedAt: string | null;
  completedAt: string | null;
  isFeatured: boolean;
  isPublished: boolean;
  sortOrder: number;
  seoTitle: string;
  seoDescription: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectDetail extends Project {
  related: Project[];
}

export interface Experience {
  id: string;
  company: string;
  companyUrl: string;
  role: string;
  employmentType: string;
  location: string;
  isRemote: boolean;
  startedAt: string;
  endedAt: string | null;
  isCurrent: boolean;
  summary: string;
  responsibilities: string[];
  achievements: string[];
  technologies: string[];
  logoFileId: string | null;
  logoUrl: string;
  sortOrder: number;
  isPublished: boolean;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  location: string;
  startedAt: string | null;
  endedAt: string | null;
  grade: string;
  description: string;
  sortOrder: number;
  isPublished: boolean;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issuedAt: string | null;
  expiresAt: string | null;
  credentialId: string;
  credentialUrl: string;
  sortOrder: number;
  isPublished: boolean;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  color: string;
  sortOrder: number;
  postCount: number;
}

export interface Tag {
  id: string;
  slug: string;
  name: string;
  postCount: number;
}

export type PostStatus = "draft" | "scheduled" | "published" | "archived";

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content?: Block[];
  coverFileId: string | null;
  coverUrl: string;
  coverAlt: string;
  category: Category | null;
  tags: Tag[];
  status: PostStatus;
  publishedAt: string | null;
  scheduledFor: string | null;
  readingTimeMinutes: number;
  viewCount: number;
  isFeatured: boolean;
  seoTitle: string;
  seoDescription: string;
  canonicalUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface PostDetail extends Post {
  related: Post[];
}

export interface Review {
  id: string;
  authorName: string;
  authorRole: string;
  authorCompany: string;
  authorEmail?: string;
  authorWebsite: string;
  authorAvatarFileId?: string | null;
  authorAvatarUrl: string;
  rating: number;
  title: string;
  body: string;
  projectId: string | null;
  serviceSlug: string;
  source: string;
  status?: "pending" | "approved" | "rejected";
  isFeatured: boolean;
  reviewedAt: string | null;
  approvedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface LeadNote {
  id: string;
  body: string;
  createdBy: string | null;
  createdAt: string;
}

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  website: string;
  serviceInterest: string;
  projectType: string;
  budgetRange: string;
  timeline: string;
  message: string;
  sourcePage: string;
  referrer: string;
  utm: Record<string, string>;
  consentLocation: boolean;
  latitude: number | null;
  longitude: number | null;
  locationAccuracy: number | null;
  city: string;
  region: string;
  country: string;
  timezone: string;
  ipAddress: string;
  userAgent: string;
  status: "new" | "contacted" | "qualified" | "proposal" | "won" | "lost" | "spam";
  priority: "low" | "normal" | "high";
  notifiedAt: string | null;
  contactedAt: string | null;
  closedAt: string | null;
  notes?: LeadNote[];
  createdAt: string;
  updatedAt: string;
}

export interface DayCount {
  day: string;
  count: number;
}

export interface LeadStats {
  total: number;
  last7Days: number;
  last30Days: number;
  byStatus: Record<string, number>;
  bySource: CountItem[];
  daily: DayCount[];
}

export interface Visit {
  id: string;
  visitorId: string;
  path: string;
  referrer: string;
  device: string;
  country: string;
  region: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  consentLocation: boolean;
  durationMs: number | null;
  createdAt: string;
}

export interface CountItem {
  label: string;
  count: number;
}

export interface VisitStats {
  rangeDays: number;
  views: number;
  visitors: number;
  prevViews: number;
  prevVisitors: number;
  viewsToday: number;
  visitorsToday: number;
  consentRate: number;
  avgDurationMs: number;
  topPages: CountItem[];
  topCountries: CountItem[];
  topCities: CountItem[];
  topReferrers: CountItem[];
  devices: CountItem[];
  daily: Array<{ day: string; views: number; visitors: number }>;
  hourly: Array<{ hour: number; views: number }>;
  locationPoints: Array<{
    latitude: number;
    longitude: number;
    city: string;
    country: string;
    count: number;
  }>;
}

export interface MediaFile {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  visibility: "public" | "private";
  category: "images" | "documents" | "videos" | "gifs";
  url: string;
  altText: string;
  width: number | null;
  height: number | null;
  folder: string;
  createdAt: string;
}

export interface ResumeOptions {
  includeProjects: boolean;
  includeCertifications: boolean;
  includeEducation: boolean;
  includeStats: boolean;
  includePhoto: boolean;
  maxProjects: number;
  maxExperience: number;
  customSummary: string;
  targetRole: string;
}

export interface Resume {
  id: string;
  version: number;
  template: "modern" | "classic" | "compact";
  title: string;
  label: string;
  accentColor: string;
  options: ResumeOptions;
  fileId: string;
  fileUrl: string;
  downloadUrl: string;
  fileSize: number;
  isCurrent: boolean;
  downloadCount: number;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "editor";
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface Setting {
  key: string;
  value: unknown;
  isPublic: boolean;
  description: string;
  updatedAt: string;
}

export interface Dashboard {
  leads: LeadStats;
  recentLeads: Lead[];
  reviewsPending: number;
  visits: VisitStats;
  content: { postsPublished: number; postsDraft: number; postsScheduled: number; projectsPublished: number };
  outbox: { pending: number; failed: number; sent24h: number };
}

export interface SitemapEntry {
  slug: string;
  updatedAt?: string;
}

export interface SitemapData {
  services: SitemapEntry[];
  projects: SitemapEntry[];
  posts: SitemapEntry[];
  categories: SitemapEntry[];
  tags: SitemapEntry[];
}
