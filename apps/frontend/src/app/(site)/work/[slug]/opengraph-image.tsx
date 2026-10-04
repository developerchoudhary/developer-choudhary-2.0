import { getProject, getSite } from "@/lib/data";
import { clip, OG_SIZE, shareCard } from "@/lib/og";
import { PROJECT_TYPE_LABELS, siteSettings } from "@/lib/site";

export const alt = "Project";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [project, site] = await Promise.all([getProject(slug).catch(() => null), getSite()]);
  return shareCard({
    theme: site.theme,
    siteName: siteSettings(site).name,
    kicker: project
      ? `Case study · ${PROJECT_TYPE_LABELS[project.projectType] ?? project.projectType}`
      : "Case study",
    title: project?.title ?? "Project",
    subtitle: clip(project?.subtitle || project?.summary || "", 120),
    footer: `${site.profile.fullName} · ${site.profile.headline}`,
  });
}
