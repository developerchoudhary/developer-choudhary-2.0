import { Download } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/site/json-ld";
import { ButtonLink, Empty, PageHeader } from "@/components/site/ui";
import { getSite } from "@/lib/data";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { siteSettings } from "@/lib/site";
import { formatBytes, formatDate } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const { profile } = await getSite();
  return pageMetadata({
    title: "Resume",
    description: `The latest resume of ${profile.fullName}, ${profile.headline}.`,
    path: "/resume",
  });
}

export default async function ResumePage() {
  const site = await getSite();
  if (!siteSettings(site).showResume) notFound();
  const resume = site.resume;
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Resume", path: "/resume" },
        ])}
      />
      <PageHeader
        title="Resume"
        lede="Generated from the same data that powers this site, so it is always current."
      >
        {resume ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <ButtonLink href="/api/v1/public/resume/download">
              <Download className="size-4" /> Download PDF
            </ButtonLink>
            <p className="text-sm text-fg-subtle">
              {formatBytes(resume.fileSize)} · updated {formatDate(resume.updatedAt)}
            </p>
          </div>
        ) : null}
      </PageHeader>
      <section className="container-dc pb-16">
        {resume ? (
          <div className="overflow-hidden rounded-2xl border border-line bg-bg-elevated shadow-card">
            <iframe
              src={`${resume.fileUrl}#toolbar=0&view=FitH`}
              title="Resume preview"
              className="h-[80vh] w-full"
              loading="lazy"
            />
          </div>
        ) : (
          <Empty title="The resume is being updated">Check back soon, or get in touch for a copy.</Empty>
        )}
      </section>
    </>
  );
}
