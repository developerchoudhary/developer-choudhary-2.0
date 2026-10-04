"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { ConfirmButton, FormCard, Repeatable, SeoFields, TagsInput } from "@/components/admin/bits";
import { BlockEditor } from "@/components/admin/block-editor";
import { ImagePicker } from "@/components/admin/media-library";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Switch, Textarea } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/misc";
import { useAll, useItem, useRemove, useSave } from "@/lib/admin/hooks";
import type { Block } from "@/lib/blocks";
import { PROJECT_STATUS_LABELS, PROJECT_TYPE_LABELS } from "@/lib/site";
import type { GalleryItem, Highlight, Project, Service } from "@/lib/types";
import { slugify } from "@/lib/utils";

interface FormValues {
  slug: string;
  title: string;
  subtitle: string;
  summary: string;
  description: Block[];
  clientName: string;
  clientIndustry: string;
  projectType: string;
  status: string;
  liveUrl: string;
  repoUrl: string;
  coverFileId: string | null;
  coverUrl: string;
  gallery: GalleryItem[];
  technologies: string[];
  serviceSlugs: string[];
  highlights: Highlight[];
  role: string;
  startedAt: string;
  completedAt: string;
  isFeatured: boolean;
  isPublished: boolean;
  sortOrder: number;
  seoTitle: string;
  seoDescription: string;
}

const empty: FormValues = {
  slug: "",
  title: "",
  subtitle: "",
  summary: "",
  description: [],
  clientName: "",
  clientIndustry: "",
  projectType: "website",
  status: "completed",
  liveUrl: "",
  repoUrl: "",
  coverFileId: null,
  coverUrl: "",
  gallery: [],
  technologies: [],
  serviceSlugs: [],
  highlights: [],
  role: "",
  startedAt: "",
  completedAt: "",
  isFeatured: false,
  isPublished: true,
  sortOrder: 0,
  seoTitle: "",
  seoDescription: "",
};

export default function ProjectEditor() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const isNew = id === "new";
  const { data, isLoading } = useItem<Project>("/projects", id);
  const services = useAll<Service>("/services");
  const save = useSave<FormValues, Project>({
    path: "/projects",
    id,
    onSuccess: (p) => isNew && router.replace(`/admin/projects/${p.id}`),
  });
  const remove = useRemove("/projects");
  const { register, control, handleSubmit, reset, watch, setValue } = useForm<FormValues>({
    defaultValues: empty,
  });

  useEffect(() => {
    if (data)
      reset({
        ...empty,
        ...data,
        description: data.description ?? [],
        startedAt: data.startedAt ?? "",
        completedAt: data.completedAt ?? "",
      });
  }, [data, reset]);

  if (!isNew && isLoading) return <Skeleton className="h-96" />;

  const submit = (v: FormValues) =>
    save.mutate({
      ...v,
      startedAt: v.startedAt || (null as unknown as string),
      completedAt: v.completedAt || (null as unknown as string),
    });

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-6">
      <PageHeader
        title={isNew ? "New project" : (data?.title ?? "Project")}
        actions={
          <>
            {!isNew && data && (
              <a
                href={`/work/${data.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-fg-muted hover:text-fg"
              >
                View page
              </a>
            )}
            {!isNew && (
              <ConfirmButton
                onConfirm={() => remove.mutate(id, { onSuccess: () => router.replace("/admin/projects") })}
                pending={remove.isPending}
              />
            )}
            <Button type="submit" loading={save.isPending}>
              Save
            </Button>
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="space-y-6">
          <FormCard title="Basics">
            <Field label="Title" required>
              <Input
                {...register("title", {
                  required: true,
                  onBlur: (e) => !watch("slug") && setValue("slug", slugify(e.target.value)),
                })}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Slug">
                <Input {...register("slug")} placeholder="auto from title" />
              </Field>
              <Field label="Type">
                <Select {...register("projectType")}>
                  {Object.entries(PROJECT_TYPE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <Field label="Status" hint="upcoming and in-progress projects are highlighted on the site">
              <Select {...register("status")}>
                {Object.entries(PROJECT_STATUS_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Subtitle" hint="one line">
              <Input {...register("subtitle")} />
            </Field>
            <Field label="Summary" hint="2–3 sentences, shown at the top of the case study">
              <Textarea rows={3} {...register("summary")} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Client name">
                <Input {...register("clientName")} />
              </Field>
              <Field label="Client industry">
                <Input {...register("clientIndustry")} />
              </Field>
              <Field label="Your role">
                <Input {...register("role")} placeholder="Architecture, backend, deployment" />
              </Field>
              <Field label="Live URL">
                <Input {...register("liveUrl")} placeholder="https://" />
              </Field>
              <Field label="Repository URL">
                <Input {...register("repoUrl")} placeholder="https://github.com/…" />
              </Field>
            </div>
          </FormCard>
          <FormCard title="Case study" description="The full story: problem, approach, result.">
            <Controller
              control={control}
              name="description"
              render={({ field }) => <BlockEditor value={field.value ?? []} onChange={field.onChange} />}
            />
          </FormCard>
          <FormCard title="Gallery">
            <Controller
              control={control}
              name="gallery"
              render={({ field }) => (
                <Repeatable
                  value={field.value ?? []}
                  onChange={field.onChange}
                  blank={() => ({ url: "", alt: "", caption: "" })}
                  addLabel="Add image"
                  max={24}
                  render={(item, update) => (
                    <>
                      <ImagePicker
                        label="Image"
                        value={
                          item.url
                            ? {
                                fileId: item.fileId ?? "",
                                url: item.url,
                                alt: item.alt ?? "",
                                width: item.width,
                                height: item.height,
                              }
                            : null
                        }
                        onChange={(img) =>
                          update(
                            img
                              ? {
                                  fileId: img.fileId,
                                  url: img.url,
                                  alt: img.alt,
                                  width: img.width ?? undefined,
                                  height: img.height ?? undefined,
                                }
                              : { url: "" },
                          )
                        }
                      />
                      <Input
                        value={item.caption ?? ""}
                        onChange={(e) => update({ caption: e.target.value })}
                        placeholder="Caption"
                      />
                    </>
                  )}
                />
              )}
            />
          </FormCard>
        </div>
        <div className="space-y-6">
          <FormCard title="Publishing">
            <Controller
              control={control}
              name="isPublished"
              render={({ field }) => (
                <Switch checked={field.value} onChange={field.onChange} label="Published" />
              )}
            />
            <Controller
              control={control}
              name="isFeatured"
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onChange={field.onChange}
                  label="Featured"
                  description="Shown on the home page"
                />
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Started">
                <Input type="date" {...register("startedAt")} />
              </Field>
              <Field label="Completed">
                <Input type="date" {...register("completedAt")} />
              </Field>
            </div>
            <Field label="Sort order">
              <Input type="number" {...register("sortOrder", { valueAsNumber: true })} />
            </Field>
          </FormCard>
          <FormCard title="Details">
            <Controller
              control={control}
              name="technologies"
              render={({ field }) => (
                <Field label="Technologies">
                  <TagsInput value={field.value ?? []} onChange={field.onChange} />
                </Field>
              )}
            />
            <Controller
              control={control}
              name="serviceSlugs"
              render={({ field }) => (
                <Field label="Related services">
                  <TagsInput
                    value={field.value ?? []}
                    onChange={field.onChange}
                    suggestions={(services.data ?? []).map((s) => s.slug)}
                    placeholder="Pick service slugs"
                  />
                </Field>
              )}
            />
            <Controller
              control={control}
              name="highlights"
              render={({ field }) => (
                <Field label="Highlights" hint="small stat tiles">
                  <Repeatable
                    value={field.value ?? []}
                    onChange={field.onChange}
                    blank={() => ({ label: "", value: "" })}
                    addLabel="Add highlight"
                    max={8}
                    render={(item, update) => (
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          value={item.value}
                          onChange={(e) => update({ value: e.target.value })}
                          placeholder="40%"
                        />
                        <Input
                          value={item.label}
                          onChange={(e) => update({ label: e.target.value })}
                          placeholder="Faster"
                        />
                      </div>
                    )}
                  />
                </Field>
              )}
            />
          </FormCard>
          <FormCard title="Cover & SEO">
            <Controller
              control={control}
              name="coverUrl"
              render={({ field }) => (
                <ImagePicker
                  label="Cover image"
                  value={
                    field.value
                      ? { fileId: watch("coverFileId") ?? "", url: field.value, alt: watch("title") }
                      : null
                  }
                  onChange={(img) => {
                    field.onChange(img?.url ?? "");
                    setValue("coverFileId", img?.fileId ?? null);
                  }}
                />
              )}
            />
            <SeoFields
              title={watch("seoTitle") ?? ""}
              description={watch("seoDescription") ?? ""}
              onTitle={(v) => setValue("seoTitle", v)}
              onDescription={(v) => setValue("seoDescription", v)}
            />
          </FormCard>
        </div>
      </div>
    </form>
  );
}
