"use client";

import { Check, Copy, ImageIcon, Trash2, Upload } from "lucide-react";
import { type ChangeEvent, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Select } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/misc";
import { errorMessage, useAction, useAll, useList } from "@/lib/admin/hooks";
import { admin } from "@/lib/api/admin";
import type { MediaFile } from "@/lib/types";
import { cn, formatBytes } from "@/lib/utils";

export interface PickedImage {
  fileId: string;
  url: string;
  alt: string;
  width?: number | null;
  height?: number | null;
}

interface MediaGridProps {
  onPick?: (file: MediaFile) => void;
  selectable?: boolean;
  category?: string;
}

export function MediaGrid({ onPick, selectable, category }: MediaGridProps) {
  const [page, setPage] = useState(1);
  const [folder, setFolder] = useState("");
  const [search, setSearch] = useState("");
  const [uploadFolder, setUploadFolder] = useState("general");
  const fileInput = useRef<HTMLInputElement>(null);
  const files = useList<MediaFile>("/media", {
    page,
    pageSize: 24,
    folder: folder || undefined,
    search: search || undefined,
    category,
  });
  const folders = useAll<string>("/media/folders");

  const upload = useAction(
    async (list: FileList) => {
      for (const file of Array.from(list)) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("folder", uploadFolder);
        fd.append("visibility", "public");
        await admin.upload("/media", fd);
      }
    },
    { invalidate: ["/media"], success: "Uploaded" },
  );
  const remove = useAction((id: string) => admin.delete(`/media/${id}`), {
    invalidate: ["/media"],
    success: "Deleted",
  });
  const saveAlt = useAction(
    ({ id, altText }: { id: string; altText: string }) => admin.put(`/media/${id}`, { altText }),
    { invalidate: ["/media"], success: "Alt text saved" },
  );

  const onFiles = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) upload.mutate(e.target.files);
    e.target.value = "";
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <Field label="Search" className="sm:w-56">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filename or alt text"
          />
        </Field>
        <Field label="Folder" className="sm:w-44">
          <Select value={folder} onChange={(e) => setFolder(e.target.value)}>
            <option value="">All folders</option>
            {(folders.data ?? []).map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </Select>
        </Field>
        <div className="flex-1" />
        <Field label="Upload to" className="sm:w-40">
          <Input
            value={uploadFolder}
            onChange={(e) => setUploadFolder(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
          />
        </Field>
        <input
          ref={fileInput}
          type="file"
          multiple
          accept="image/*,video/*,.pdf"
          className="hidden"
          onChange={onFiles}
        />
        <Button type="button" onClick={() => fileInput.current?.click()} loading={upload.isPending}>
          <Upload className="size-4" /> Upload
        </Button>
      </div>
      {files.isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
            <Skeleton key={i} className="aspect-square" />
          ))}
        </div>
      ) : files.data?.items.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 p-12 text-center text-fg-muted">
          <ImageIcon className="size-8" />
          <p>No files yet. Upload images for projects, posts and your profile.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {files.data?.items.map((file) => (
            <MediaTile
              key={file.id}
              file={file}
              selectable={selectable}
              onPick={onPick}
              onDelete={() => remove.mutate(file.id)}
              onAlt={(altText) => saveAlt.mutate({ id: file.id, altText })}
            />
          ))}
        </div>
      )}
      {files.data && files.data.meta.totalPages > 1 && (
        <div className="flex items-center justify-end gap-2 text-sm">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-fg-muted">
            {page} / {files.data.meta.totalPages}
          </span>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={page >= files.data.meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
      {upload.isError && <p className="text-sm text-danger">{errorMessage(upload.error)}</p>}
    </div>
  );
}

function MediaTile({
  file,
  selectable,
  onPick,
  onDelete,
  onAlt,
}: {
  file: MediaFile;
  selectable?: boolean;
  onPick?: (f: MediaFile) => void;
  onDelete: () => void;
  onAlt: (alt: string) => void;
}) {
  const [alt, setAlt] = useState(file.altText);
  const [copied, setCopied] = useState(false);
  const isImage = file.category === "images" || file.category === "gifs";
  const copy = async () => {
    await navigator.clipboard.writeText(file.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="group card overflow-hidden">
      <button
        type="button"
        onClick={() => onPick?.(file)}
        className={cn(
          "relative block aspect-square w-full bg-bg-muted",
          selectable && "cursor-pointer hover:opacity-90",
        )}
        disabled={!selectable}
      >
        {isImage ? (
          // biome-ignore lint/performance/noImgElement: admin thumbnails
          <img
            src={file.url}
            alt={file.altText || file.filename}
            className="size-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-1 p-3 text-center text-xs text-fg-muted">
            <span className="font-mono uppercase">{file.contentType.split("/")[1]}</span>
            <span className="truncate w-full">{file.filename}</span>
          </div>
        )}
        {selectable && (
          <span className="absolute inset-x-0 bottom-0 bg-fg/80 py-1 text-center text-xs text-bg opacity-0 transition group-hover:opacity-100">
            Select
          </span>
        )}
      </button>
      <div className="space-y-2 p-2">
        <p className="truncate text-xs text-fg-muted" title={file.filename}>
          {file.filename} · {formatBytes(file.size)}
        </p>
        {isImage && (
          <input
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            onBlur={() => alt !== file.altText && onAlt(alt)}
            placeholder="Alt text"
            className="w-full rounded-md border border-line bg-transparent px-2 py-1 text-xs focus:border-accent focus:outline-none"
          />
        )}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={copy}
            className="inline-flex items-center gap-1 text-xs text-fg-muted hover:text-fg"
          >
            {copied ? <Check className="size-3 text-success" /> : <Copy className="size-3" />} URL
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="text-fg-subtle hover:text-danger"
            aria-label="Delete file"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

interface ImagePickerProps {
  value: PickedImage | null;
  onChange: (v: PickedImage | null) => void;
  label?: string;
  hint?: string;
}

export function ImagePicker({ value, onChange, label = "Image", hint }: ImagePickerProps) {
  const [open, setOpen] = useState(false);
  return (
    <Field label={label} hint={hint}>
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-line-strong bg-bg-muted text-fg-subtle hover:border-accent"
        >
          {value?.url ? (
            // biome-ignore lint/performance/noImgElement: admin preview
            <img src={value.url} alt={value.alt} className="size-full object-cover" />
          ) : (
            <ImageIcon className="size-6" />
          )}
        </button>
        <div className="flex-1 space-y-2">
          <Input
            value={value?.alt ?? ""}
            placeholder="Alt text"
            onChange={(e) => value && onChange({ ...value, alt: e.target.value })}
            disabled={!value}
          />
          <div className="flex gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setOpen(true)}>
              {value ? "Change" : "Choose"}
            </Button>
            {value && (
              <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>
                Remove
              </Button>
            )}
          </div>
        </div>
      </div>
      <Dialog open={open} onClose={() => setOpen(false)} title="Media library" className="sm:max-w-5xl">
        <MediaGrid
          selectable
          onPick={(file) => {
            if (file.category !== "images" && file.category !== "gifs") {
              toast.error("Please choose an image");
              return;
            }
            onChange({
              fileId: file.id,
              url: file.url,
              alt: file.altText,
              width: file.width,
              height: file.height,
            });
            setOpen(false);
          }}
        />
      </Dialog>
    </Field>
  );
}
