"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { ConfirmButton, FormCard, LinesInput, TagsInput } from "@/components/admin/bits";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Switch, Textarea } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/misc";
import { useItem, useRemove, useSave } from "@/lib/admin/hooks";
import type { Experience } from "@/lib/types";

interface FormValues {
  company: string;
  companyUrl: string;
  role: string;
  employmentType: string;
  location: string;
  isRemote: boolean;
  startedAt: string;
  endedAt: string;
  isCurrent: boolean;
  summary: string;
  responsibilities: string[];
  achievements: string[];
  technologies: string[];
  sortOrder: number;
  isPublished: boolean;
}

const empty: FormValues = {
  company: "",
  companyUrl: "",
  role: "",
  employmentType: "full-time",
  location: "",
  isRemote: false,
  startedAt: "",
  endedAt: "",
  isCurrent: false,
  summary: "",
  responsibilities: [],
  achievements: [],
  technologies: [],
  sortOrder: 0,
  isPublished: true,
};

export default function ExperienceEditor() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const isNew = id === "new";
  const { data, isLoading } = useItem<Experience>("/experience", id);
  const save = useSave<Record<string, unknown>, Experience>({
    path: "/experience",
    id,
    onSuccess: (x) => isNew && router.replace(`/admin/experience/${x.id}`),
  });
  const remove = useRemove("/experience");
  const { register, control, handleSubmit, reset, watch } = useForm<FormValues>({ defaultValues: empty });
  const isCurrent = watch("isCurrent");

  useEffect(() => {
    if (data) reset({ ...empty, ...data, endedAt: data.endedAt ?? "" });
  }, [data, reset]);

  if (!isNew && isLoading) return <Skeleton className="h-96" />;

  return (
    <form
      onSubmit={handleSubmit((v) =>
        save.mutate({ ...v, endedAt: v.isCurrent || !v.endedAt ? null : v.endedAt }),
      )}
      className="space-y-6"
    >
      <PageHeader
        title={isNew ? "Add role" : `${data?.role} · ${data?.company}`}
        actions={
          <>
            {!isNew && (
              <ConfirmButton
                onConfirm={() => remove.mutate(id, { onSuccess: () => router.replace("/admin/experience") })}
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
          <FormCard title="Role">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Job title" required>
                <Input {...register("role", { required: true })} />
              </Field>
              <Field label="Company" required>
                <Input {...register("company", { required: true })} />
              </Field>
              <Field label="Company URL">
                <Input {...register("companyUrl")} placeholder="https://" />
              </Field>
              <Field label="Employment type">
                <Select {...register("employmentType")}>
                  {["full-time", "part-time", "freelance", "contract", "internship"].map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Location">
                <Input {...register("location")} />
              </Field>
              <div className="flex items-end pb-2">
                <Controller
                  control={control}
                  name="isRemote"
                  render={({ field }) => (
                    <Switch checked={field.value} onChange={field.onChange} label="Remote" />
                  )}
                />
              </div>
            </div>
            <Field label="Summary" hint="one or two sentences">
              <Textarea rows={3} {...register("summary")} />
            </Field>
          </FormCard>
          <FormCard
            title="Responsibilities"
            description="One per line. Used as resume bullet points when there are no achievements."
          >
            <Controller
              control={control}
              name="responsibilities"
              render={({ field }) => (
                <LinesInput value={field.value ?? []} onChange={field.onChange} rows={6} />
              )}
            />
          </FormCard>
          <FormCard
            title="Achievements"
            description="Outcomes with numbers where possible. These lead the resume bullets."
          >
            <Controller
              control={control}
              name="achievements"
              render={({ field }) => (
                <LinesInput value={field.value ?? []} onChange={field.onChange} rows={5} />
              )}
            />
          </FormCard>
        </div>
        <div className="space-y-6">
          <FormCard title="Dates">
            <Field label="Started" required>
              <Input type="date" {...register("startedAt", { required: true })} />
            </Field>
            <Controller
              control={control}
              name="isCurrent"
              render={({ field }) => (
                <Switch checked={field.value} onChange={field.onChange} label="Current role" />
              )}
            />
            {!isCurrent && (
              <Field label="Ended" required>
                <Input type="date" {...register("endedAt")} />
              </Field>
            )}
          </FormCard>
          <FormCard title="Technologies">
            <Controller
              control={control}
              name="technologies"
              render={({ field }) => <TagsInput value={field.value ?? []} onChange={field.onChange} />}
            />
          </FormCard>
          <FormCard title="Publishing">
            <Controller
              control={control}
              name="isPublished"
              render={({ field }) => (
                <Switch checked={field.value} onChange={field.onChange} label="Published" />
              )}
            />
            <Field label="Sort order">
              <Input type="number" {...register("sortOrder", { valueAsNumber: true })} />
            </Field>
          </FormCard>
        </div>
      </div>
    </form>
  );
}
