import { apiGet, apiGetOrNull, apiGetSafe, apiList } from "./api/public";
import type {
  Category,
  Certification,
  Education,
  Experience,
  Post,
  PostDetail,
  Project,
  ProjectDetail,
  Review,
  ReviewSummary,
  Service,
  SiteBundle,
  SitemapData,
  Tag,
} from "./types";

const empty: SiteBundle = {
  profile: {
    fullName: "Aman Choudhary",
    headline: "Full-stack engineer",
    bioShort: "",
    bioLong: "",
    email: "",
    phone: "",
    whatsapp: "",
    locationCity: "Sri Ganganagar",
    locationRegion: "Rajasthan",
    locationCountry: "India",
    timezone: "Asia/Kolkata",
    avatarFileId: null,
    avatarUrl: "/aman-choudhary.jpg",
    availabilityStatus: "available",
    availabilityNote: "",
    yearsExperience: 0,
    projectsCompleted: 0,
    clientsServed: 0,
    socials: [],
    resumeSummary: "",
    updatedAt: "",
  },
  settings: {},
  taglines: [],
  skills: [],
  reviews: { average: 0, count: 0, distribution: {} },
  resume: null,
};

export const getSite = () => apiGetSafe<SiteBundle>("/site", empty, { tags: ["site"] });

export function setting<T>(site: SiteBundle, key: string, fallback: T): T {
  const value = site.settings[key];
  return value === undefined || value === null ? fallback : (value as T);
}

export const getServices = () => apiGetSafe<Service[]>("/services", [], { tags: ["services"] });
export const getService = (slug: string) =>
  apiGetOrNull<Service>(`/services/${slug}`, { tags: ["services"] });

export const getFeaturedProjects = (limit = 6) =>
  apiGetSafe<Project[]>("/projects/featured", [], { tags: ["projects"], query: { limit } });
export const getProjects = (page: number, projectType?: string, status?: string[] | string, pageSize = 12) =>
  apiList<Project>("/projects", {
    tags: ["projects"],
    query: {
      page,
      pageSize,
      projectType,
      status: Array.isArray(status) ? status.join(",") : status,
      sortBy: "sortOrder",
      sortOrder: "asc",
    },
  });
export const getProject = (slug: string) =>
  apiGetOrNull<ProjectDetail>(`/projects/${slug}`, { tags: ["projects"] });

export const getExperience = () => apiGetSafe<Experience[]>("/experience", [], { tags: ["experience"] });
export const getEducation = () => apiGetSafe<Education[]>("/education", [], { tags: ["education"] });
export const getCertifications = () =>
  apiGetSafe<Certification[]>("/certifications", [], { tags: ["certifications"] });

export const getPosts = (page: number, filters: { category?: string; tag?: string; search?: string } = {}) =>
  apiList<Post>("/posts", { tags: ["posts"], query: { page, pageSize: 9, ...filters } });
export const getRecentPosts = (limit = 3) =>
  apiGetSafe<Post[]>("/posts/recent", [], { tags: ["posts"], query: { limit } });
export const getPost = (slug: string) => apiGetOrNull<PostDetail>(`/posts/${slug}`, { tags: ["posts"] });
export const getCategories = () => apiGetSafe<Category[]>("/post-categories", [], { tags: ["posts"] });
export const getCategory = (slug: string) =>
  apiGetOrNull<Category>(`/post-categories/${slug}`, { tags: ["posts"] });
export const getTag = (slug: string) => apiGetOrNull<Tag>(`/post-tags/${slug}`, { tags: ["posts"] });

export const getReviews = (featured = false, limit = 0) =>
  apiGetSafe<Review[]>("/reviews", [], { tags: ["reviews"], query: { featured, limit } });
export const getReviewSummary = () =>
  apiGetSafe<ReviewSummary>(
    "/reviews/summary",
    { average: 0, count: 0, distribution: {} },
    { tags: ["reviews"] },
  );

export const getSitemap = () => apiGet<SitemapData>("/sitemap", { tags: ["sitemap"], revalidate: 600 });
