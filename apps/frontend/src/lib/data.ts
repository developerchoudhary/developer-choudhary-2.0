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
  ProjectFacets,
  Review,
  Service,
  SiteBundle,
  SitemapData,
  Tag,
} from "./types";

const empty: SiteBundle = {
  profile: {
    fullName: "Aman Choudhary",
    headline: "Full-stack developer",
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
    avatarUrl: "/portraits/aman-portrait-4x5.webp",
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
  theme: null,
  skills: [],
  reviews: { average: 0, count: 0, distribution: {} },
  resume: null,
};

export const getSite = () => apiGetSafe<SiteBundle>("/site", empty, { tags: ["site"] });

export const getServices = () => apiGetSafe<Service[]>("/services", [], { tags: ["services"] });
export const getService = (slug: string) =>
  apiGetOrNull<Service>(`/services/${slug}`, { tags: ["services"] });

export const getFeaturedProjects = (limit = 3) =>
  apiGetSafe<Project[]>("/projects/featured", [], { tags: ["projects"], query: { limit } });

export const getProjects = (filters: {
  page?: number;
  type?: string;
  status?: string;
  service?: string;
  pageSize?: number;
}) =>
  apiList<Project>("/projects", {
    tags: ["projects"],
    query: {
      page: filters.page ?? 1,
      pageSize: filters.pageSize ?? 12,
      projectType: filters.type,
      status: filters.status,
      service: filters.service,
      sortBy: "sortOrder",
      sortOrder: "asc",
    },
  });

export const getProjectFacets = () =>
  apiGetSafe<ProjectFacets>("/projects/facets", { types: [] }, { tags: ["projects"] });

export const getProject = (slug: string) =>
  apiGetOrNull<ProjectDetail>(`/projects/${slug}`, { tags: ["projects"] });

export const getExperience = () => apiGetSafe<Experience[]>("/experience", [], { tags: ["experience"] });
export const getEducation = () => apiGetSafe<Education[]>("/education", [], { tags: ["education"] });
export const getCertifications = () =>
  apiGetSafe<Certification[]>("/certifications", [], { tags: ["certifications"] });

export const getPosts = (page: number, filters: { category?: string; tag?: string; search?: string } = {}) =>
  apiList<Post>("/posts", { tags: ["posts"], query: { page, pageSize: 9, ...filters } });
export const getPost = (slug: string) => apiGetOrNull<PostDetail>(`/posts/${slug}`, { tags: ["posts"] });
export const getCategories = () => apiGetSafe<Category[]>("/post-categories", [], { tags: ["posts"] });
export const getCategory = (slug: string) =>
  apiGetOrNull<Category>(`/post-categories/${slug}`, { tags: ["posts"] });
export const getTag = (slug: string) => apiGetOrNull<Tag>(`/post-tags/${slug}`, { tags: ["posts"] });

export const getReviews = (featured = false, limit = 0) =>
  apiGetSafe<Review[]>("/reviews", [], { tags: ["reviews"], query: { featured, limit } });

export const getSitemap = () => apiGet<SitemapData>("/sitemap", { tags: ["sitemap"], revalidate: 600 });
