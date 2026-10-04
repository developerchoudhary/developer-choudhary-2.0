"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { ConfirmButton } from "@/components/admin/bits";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/misc";
import { useAll, useRemove, useSave } from "@/lib/admin/hooks";
import type { Category, Tag } from "@/lib/types";

type CatDraft = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  sortOrder: number;
};
type TagDraft = { id?: string; name: string; slug: string };

export default function TaxonomyPage() {
  const cats = useAll<Category>("/post-categories");
  const tags = useAll<Tag>("/post-tags");
  const [cat, setCat] = useState<CatDraft | null>(null);
  const [tag, setTag] = useState<TagDraft | null>(null);
  const saveCat = useSave<Omit<CatDraft, "id">>({
    path: "/post-categories",
    id: cat?.id,
    invalidate: ["/posts"],
    onSuccess: () => setCat(null),
  });
  const saveTag = useSave<Omit<TagDraft, "id">>({
    path: "/post-tags",
    id: tag?.id,
    invalidate: ["/posts"],
    onSuccess: () => setTag(null),
  });
  const removeCat = useRemove("/post-categories", ["/posts"]);
  const removeTag = useRemove("/post-tags", ["/posts"]);

  return (
    <>
      <PageHeader
        title="Categories & tags"
        description="Categories group articles into sections; tags are free-form keywords."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card">
          <div className="flex items-center justify-between border-b border-line px-5 py-3">
            <h2 className="text-sm font-semibold">Categories</h2>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setCat({ name: "", slug: "", description: "", color: "#0E7C66", sortOrder: 0 })}
            >
              <Plus className="size-4" /> Add
            </Button>
          </div>
          {cats.isLoading ? (
            <Skeleton className="m-4 h-32" />
          ) : (
            <ul className="divide-y divide-line">
              {(cats.data ?? []).map((c) => (
                <li key={c.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="size-3 rounded-full" style={{ background: c.color || "var(--accent)" }} />
                  <button
                    type="button"
                    onClick={() =>
                      setCat({
                        id: c.id,
                        name: c.name,
                        slug: c.slug,
                        description: c.description,
                        color: c.color,
                        sortOrder: c.sortOrder,
                      })
                    }
                    className="flex-1 text-left text-sm"
                  >
                    <span className="font-medium">{c.name}</span>{" "}
                    <span className="text-fg-subtle">· {c.postCount} posts</span>
                  </button>
                  <ConfirmButton
                    label=""
                    onConfirm={() => removeCat.mutate(c.id)}
                    pending={removeCat.isPending}
                  />
                </li>
              ))}
              {cats.data?.length === 0 && (
                <li className="px-5 py-8 text-center text-sm text-fg-muted">No categories yet</li>
              )}
            </ul>
          )}
        </section>
        <section className="card">
          <div className="flex items-center justify-between border-b border-line px-5 py-3">
            <h2 className="text-sm font-semibold">Tags</h2>
            <Button size="sm" variant="secondary" onClick={() => setTag({ name: "", slug: "" })}>
              <Plus className="size-4" /> Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 p-5">
            {(tags.data ?? []).map((t) => (
              <span
                key={t.id}
                className="inline-flex items-center gap-1 rounded-full border border-line pl-3 pr-1 text-sm"
              >
                <button type="button" onClick={() => setTag({ id: t.id, name: t.name, slug: t.slug })}>
                  #{t.name} <span className="text-fg-subtle">{t.postCount}</span>
                </button>
                <ConfirmButton
                  label=""
                  confirmLabel="Delete"
                  onConfirm={() => removeTag.mutate(t.id)}
                  pending={removeTag.isPending}
                  className="h-7 px-1.5"
                />
              </span>
            ))}
            {tags.data?.length === 0 && (
              <p className="w-full py-6 text-center text-sm text-fg-muted">
                Tags appear here as you add them to posts
              </p>
            )}
          </div>
        </section>
      </div>

      <Dialog
        open={Boolean(cat)}
        onClose={() => setCat(null)}
        title={cat?.id ? "Edit category" : "New category"}
      >
        {cat && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const { id: _id, ...body } = cat;
              saveCat.mutate(body);
            }}
            className="space-y-4"
          >
            <Field label="Name" required>
              <Input
                value={cat.name}
                onChange={(e) => setCat({ ...cat, name: e.target.value })}
                required
                autoFocus
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Slug">
                <Input
                  value={cat.slug}
                  onChange={(e) => setCat({ ...cat, slug: e.target.value })}
                  placeholder="auto"
                />
              </Field>
              <Field label="Colour">
                <Input
                  type="color"
                  value={cat.color || "#0E7C66"}
                  onChange={(e) => setCat({ ...cat, color: e.target.value })}
                  className="h-10 p-1"
                />
              </Field>
            </div>
            <Field label="Description">
              <Textarea
                rows={2}
                value={cat.description}
                onChange={(e) => setCat({ ...cat, description: e.target.value })}
              />
            </Field>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setCat(null)}>
                Cancel
              </Button>
              <Button type="submit" loading={saveCat.isPending}>
                Save
              </Button>
            </div>
          </form>
        )}
      </Dialog>
      <Dialog open={Boolean(tag)} onClose={() => setTag(null)} title={tag?.id ? "Edit tag" : "New tag"}>
        {tag && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const { id: _id, ...body } = tag;
              saveTag.mutate(body);
            }}
            className="space-y-4"
          >
            <Field label="Name" required>
              <Input
                value={tag.name}
                onChange={(e) => setTag({ ...tag, name: e.target.value })}
                required
                autoFocus
              />
            </Field>
            <Field label="Slug">
              <Input
                value={tag.slug}
                onChange={(e) => setTag({ ...tag, slug: e.target.value })}
                placeholder="auto"
              />
            </Field>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setTag(null)}>
                Cancel
              </Button>
              <Button type="submit" loading={saveTag.isPending}>
                Save
              </Button>
            </div>
          </form>
        )}
      </Dialog>
    </>
  );
}
