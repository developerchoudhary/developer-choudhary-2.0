"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { ConfirmButton, FormCard, Repeatable, SeoFields, TagsInput } from "@/components/admin/bits";
import { BlockEditor } from "@/components/admin/block-editor";
import { ImagePicker } from "@/components/admin/media-library";
import { PageHeader } from "@/components/admin/page-header";
import { SERVICE_ICON_NAMES } from "@/components/site/service-icon";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Switch, Textarea } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/misc";
import { useItem, useRemove, useSave } from "@/lib/admin/hooks";
import type { Block } from "@/lib/blocks";
import type { FAQ, Service } from "@/lib/types";
import { slugify } from "@/lib/utils";

interface FormValues {
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
}

const empty: FormValues = {
  slug: "",
  title: "",
  tagline: "",
  summary: "",
  description: [],
  icon: "sparkles",
  deliverables: [],
  techStack: [],
  idealFor: [],
  startingPriceLabel: "",
  timelineLabel: "",
  faqs: [],
  coverFileId: null,
  coverUrl: "",
  seoTitle: "",
  seoDescription: "",
  sortOrder: 0,
  isFeatured: false,
  isPublished: true,
};

export default function ServiceEditor() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const isNew = id === "new";
  const { data, isLoading } = useItem<Service>("/services", id);
  const save = useSave<FormValues, Service>({
    path: "/services",
    id,
    onSuccess: (s) => isNew && router.replace(`/admin/services/${s.id}`),
  });
  const remove = useRemove("/services");
  const form = useForm<FormValues>({ defaultValues: empty });
  const { register, control, handleSubmit, reset, watch, setValue } = form;

  useEffect(() => {
    if (data) reset({ ...empty, ...data, description: data.description ?? [] });
  }, [data, reset]);

  if (!isNew && isLoading) return <Skeleton className="h-96" />;

  return (
    <form onSubmit={handleSubmit((v) => save.mutate(v))} className="space-y-6">
      <PageHeader
        title={isNew ? "New service" : (data?.title ?? "Service")}
        actions={
          <>
            {!isNew && (
              <ConfirmButton
                onConfirm={() => remove.mutate(id, { onSuccess: () => router.replace("/admin/services") })}
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
              <Field label="Slug" hint="URL path">
                <Input {...register("slug")} placeholder="auto from title" />
              </Field>
              <Field label="Icon">
                <Select {...register("icon")}>
                  {SERVICE_ICON_NAMES.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <Field label="Tagline" hint="one line, shown on cards">
              <Input {...register("tagline")} />
            </Field>
            <Field label="Summary">
              <Textarea rows={3} {...register("summary")} />
            </Field>
          </FormCard>
          <FormCard title="Detailed description" description="Rich content for the service page.">
            <Controller
              control={control}
              name="description"
              render={({ field }) => <BlockEditor value={field.value ?? []} onChange={field.onChange} />}
            />
          </FormCard>
          <FormCard title="FAQs" description="Shown on the service page and as FAQ structured data.">
            <Controller
              control={control}
              name="faqs"
              render={({ field }) => (
                <Repeatable
                  value={field.value ?? []}
                  onChange={field.onChange}
                  blank={() => ({ question: "", answer: "" })}
                  addLabel="Add question"
                  render={(item, update) => (
                    <>
                      <Input
                        value={item.question}
                        onChange={(e) => update({ question: e.target.value })}
                        placeholder="Question"
                      />
                      <Textarea
                        rows={2}
                        value={item.answer}
                        onChange={(e) => update({ answer: e.target.value })}
                        placeholder="Answer"
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
                <Switch checked={field.value} onChange={field.onChange} label="Featured on home page" />
              )}
            />
            <Field label="Sort order">
              <Input type="number" {...register("sortOrder", { valueAsNumber: true })} />
            </Field>
          </FormCard>
          <FormCard title="Offer">
            <Field label="Starting price label">
              <Input {...register("startingPriceLabel")} placeholder="From ₹25,000" />
            </Field>
            <Field label="Timeline label">
              <Input {...register("timelineLabel")} placeholder="2–4 weeks" />
            </Field>
            <Controller
              control={control}
              name="deliverables"
              render={({ field }) => (
                <Field label="Deliverables">
                  <TagsInput
                    value={field.value ?? []}
                    onChange={field.onChange}
                    placeholder="Add a deliverable"
                  />
                </Field>
              )}
            />
            <Controller
              control={control}
              name="techStack"
              render={({ field }) => (
                <Field label="Tech stack">
                  <TagsInput value={field.value ?? []} onChange={field.onChange} />
                </Field>
              )}
            />
            <Controller
              control={control}
              name="idealFor"
              render={({ field }) => (
                <Field label="Ideal for">
                  <TagsInput value={field.value ?? []} onChange={field.onChange} />
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
