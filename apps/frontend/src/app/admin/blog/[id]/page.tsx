"use client";

import { ExternalLink } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ConfirmButton,
  FormCard,
  fromDatetimeLocal,
  SeoFields,
  TagsInput,
  toDatetimeLocal,
} from "@/components/admin/bits";
import { BlockEditor } from "@/components/admin/block-editor";
import { ImagePicker } from "@/components/admin/media-library";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Switch, Textarea } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/misc";
import { useAll, useItem, useRemove, useSave } from "@/lib/admin/hooks";
import type { Block } from "@/lib/blocks";
import type { Category, Post, PostStatus, Tag } from "@/lib/types";
import { slugify } from "@/lib/utils";

interface FormValues {
  slug: string;
  title: string;
  excerpt: string;
  content: Block[];
  coverFileId: string | null;
  coverUrl: string;
  coverAlt: string;
  categoryId: string;
  tagNames: string[];
  status: PostStatus;
  scheduledFor: string;
  isFeatured: boolean;
  seoTitle: string;
  seoDescription: string;
  canonicalUrl: string;
}

const empty: FormValues = {
  slug: "",
  title: "",
  excerpt: "",
  content: [],
  coverFileId: null,
  coverUrl: "",
  coverAlt: "",
  categoryId: "",
  tagNames: [],
  status: "draft",
  scheduledFor: "",
  isFeatured: false,
  seoTitle: "",
  seoDescription: "",
  canonicalUrl: "",
};

export default function PostEditor() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const isNew = id === "new";
  const { data, isLoading } = useItem<Post>("/posts", id);
  const categories = useAll<Category>("/post-categories");
  const tags = useAll<Tag>("/post-tags");
  const save = useSave<Record<string, unknown>, Post>({
    path: "/posts",
    id,
    invalidate: ["/post-tags"],
    onSuccess: (p) => isNew && router.replace(`/admin/blog/${p.id}`),
  });
  const remove = useRemove("/posts");
  const { register, control, handleSubmit, reset, watch, setValue } = useForm<FormValues>({
    defaultValues: empty,
  });
  const status = watch("status");
  const content = watch("content");

  useEffect(() => {
    if (data) {
      reset({
        ...empty,
        ...data,
        content: data.content ?? [],
        categoryId: data.category?.id ?? "",
        tagNames: data.tags.map((t) => t.name),
        scheduledFor: toDatetimeLocal(data.scheduledFor),
      });
    }
  }, [data, reset]);

  if (!isNew && isLoading) return <Skeleton className="h-96" />;

  const submit = (v: FormValues) => {
    const known = new Map((tags.data ?? []).map((t) => [t.name.toLowerCase(), t.id]));
    const tagIds: string[] = [];
    const newTags: string[] = [];
    for (const name of v.tagNames) {
      const idFor = known.get(name.toLowerCase());
      if (idFor) tagIds.push(idFor);
      else newTags.push(name);
    }
    save.mutate({
      slug: v.slug,
      title: v.title,
      excerpt: v.excerpt,
      content: v.content,
      coverFileId: v.coverFileId,
      coverUrl: v.coverUrl,
      coverAlt: v.coverAlt,
      categoryId: v.categoryId || null,
      tagIds,
      newTags,
      status: v.status,
      scheduledFor: v.status === "scheduled" ? fromDatetimeLocal(v.scheduledFor) : undefined,
      isFeatured: v.isFeatured,
      seoTitle: v.seoTitle,
      seoDescription: v.seoDescription,
      canonicalUrl: v.canonicalUrl,
    });
  };

  const words = (content ?? []).reduce((n, b) => n + JSON.stringify(b.data).split(/\s+/).length, 0);

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-6">
      <PageHeader
        title={isNew ? "New post" : (data?.title ?? "Post")}
        description={isNew ? undefined : `~${words} words · ${Math.max(1, Math.ceil(words / 200))} min read`}
        actions={
          <>
            {!isNew && data && (
              <a
                href={`/admin/blog/preview/${data.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-fg-muted hover:text-fg"
              >
                Preview <ExternalLink className="size-3.5" />
              </a>
            )}
            {!isNew && (
              <ConfirmButton
                onConfirm={() => remove.mutate(id, { onSuccess: () => router.replace("/admin/blog") })}
                pending={remove.isPending}
              />
            )}
            <Button type="submit" loading={save.isPending}>
              {status === "published" ? "Save & publish" : "Save"}
            </Button>
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[1.5fr_0.5fr]">
        <div className="space-y-6">
          <FormCard title="Article">
            <Field label="Title" required>
              <Input
                className="text-lg font-medium"
                {...register("title", {
                  required: true,
                  onBlur: (e) => !watch("slug") && setValue("slug", slugify(e.target.value)),
                })}
                placeholder="A clear, specific headline"
              />
            </Field>
            <Field label="Slug" hint="/blog/…">
              <Input {...register("slug")} placeholder="auto from title" />
            </Field>
            <Field label="Excerpt" hint="shown on cards and in search results; auto-generated if blank">
              <Textarea rows={3} {...register("excerpt")} />
            </Field>
          </FormCard>
          <FormCard title="Content">
            <Controller
              control={control}
              name="content"
              render={({ field }) => <BlockEditor value={field.value ?? []} onChange={field.onChange} />}
            />
          </FormCard>
        </div>
        <div className="space-y-6">
          <FormCard title="Publishing">
            <Field label="Status">
              <Select {...register("status")}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
                <option value="archived">Archived</option>
              </Select>
            </Field>
            {status === "scheduled" && (
              <Field label="Publish at" required hint="your local time">
                <Input
                  type="datetime-local"
                  {...register("scheduledFor", { required: status === "scheduled" })}
                />
              </Field>
            )}
            <Controller
              control={control}
              name="isFeatured"
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onChange={field.onChange}
                  label="Featured"
                  description="Pinned to the top of the blog"
                />
              )}
            />
          </FormCard>
          <FormCard title="Organise">
            <Field label="Category">
              <Select {...register("categoryId")}>
                <option value="">No category</option>
                {(categories.data ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Controller
              control={control}
              name="tagNames"
              render={({ field }) => (
                <Field label="Tags" hint="new tags are created on save">
                  <TagsInput
                    value={field.value ?? []}
                    onChange={field.onChange}
                    suggestions={(tags.data ?? []).map((t) => t.name)}
                    placeholder="Add a tag"
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
                  hint="1600×900 works best"
                  value={
                    field.value
                      ? { fileId: watch("coverFileId") ?? "", url: field.value, alt: watch("coverAlt") }
                      : null
                  }
                  onChange={(img) => {
                    field.onChange(img?.url ?? "");
                    setValue("coverFileId", img?.fileId ?? null);
                    setValue("coverAlt", img?.alt ?? "");
                  }}
                />
              )}
            />
            <SeoFields
              title={watch("seoTitle") ?? ""}
              description={watch("seoDescription") ?? ""}
              onTitle={(v) => setValue("seoTitle", v)}
              onDescription={(v) => setValue("seoDescription", v)}
              canonical={watch("canonicalUrl")}
              onCanonical={(v) => setValue("canonicalUrl", v)}
            />
          </FormCard>
        </div>
      </div>
    </form>
  );
}
