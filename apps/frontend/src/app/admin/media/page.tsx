"use client";

import { MediaGrid } from "@/components/admin/media-library";
import { PageHeader } from "@/components/admin/page-header";

export default function MediaPage() {
  return (
    <>
      <PageHeader
        title="Media library"
        description="Images and files stored in MinIO. Public URLs are served from /uploads and cached forever."
      />
      <MediaGrid />
    </>
  );
}
