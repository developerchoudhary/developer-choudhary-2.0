"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { FormCard, Repeatable } from "@/components/admin/bits";
import { ImagePicker } from "@/components/admin/media-library";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/misc";
import { useOne, useSave } from "@/lib/admin/hooks";
import type { Profile } from "@/lib/types";

type FormValues = Omit<Profile, "updatedAt">;

export default function ProfilePage() {
  const { data, isLoading } = useOne<Profile>("/profile");
  const save = useSave<FormValues, Profile>({
    path: "/profile",
    id: "singleton",
    successMessage: "Profile saved",
  });
  const form = useForm<FormValues>();
  const { register, control, handleSubmit, reset, watch } = form;

  useEffect(() => {
    if (data) reset(data);
  }, [data, reset]);

  if (isLoading) return <Skeleton className="h-96" />;

  return (
    <form onSubmit={handleSubmit((v) => save.mutate(v))} className="space-y-6">
      <PageHeader
        title="Profile"
        description="Your name, bio, contact details and stats shown across the site and the resume."
        actions={
          <Button type="submit" loading={save.isPending}>
            Save profile
          </Button>
        }
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <FormCard title="Identity">
          <Field label="Full name" required>
            <Input {...register("fullName", { required: true })} />
          </Field>
          <Field label="Headline" hint={`${watch("headline")?.length ?? 0}/200`}>
            <Input {...register("headline")} />
          </Field>
          <Controller
            control={control}
            name="avatarUrl"
            render={({ field }) => (
              <ImagePicker
                label="Profile photo"
                value={
                  field.value
                    ? { fileId: watch("avatarFileId") ?? "", url: field.value, alt: watch("fullName") ?? "" }
                    : null
                }
                onChange={(img) => {
                  field.onChange(img?.url ?? "");
                  form.setValue("avatarFileId", img?.fileId || null);
                }}
              />
            )}
          />
          <Field label="Short bio" hint="hero and cards">
            <Textarea rows={3} {...register("bioShort")} />
          </Field>
          <Field label="Long bio" hint="about page · blank line between paragraphs">
            <Textarea rows={10} {...register("bioLong")} />
          </Field>
          <Field label="Resume summary" hint="used at the top of generated resumes">
            <Textarea rows={4} {...register("resumeSummary")} />
          </Field>
        </FormCard>
        <div className="space-y-6">
          <FormCard title="Contact">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Email">
                <Input type="email" {...register("email")} />
              </Field>
              <Field label="Phone">
                <Input {...register("phone")} />
              </Field>
              <Field label="WhatsApp number" hint="digits only, with country code">
                <Input {...register("whatsapp")} placeholder="919530363236" />
              </Field>
              <Field label="Timezone">
                <Input {...register("timezone")} placeholder="Asia/Kolkata" />
              </Field>
              <Field label="City">
                <Input {...register("locationCity")} />
              </Field>
              <Field label="Region">
                <Input {...register("locationRegion")} />
              </Field>
              <Field label="Country">
                <Input {...register("locationCountry")} />
              </Field>
            </div>
          </FormCard>
          <FormCard title="Availability & stats">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Availability">
                <Select {...register("availabilityStatus")}>
                  <option value="available">Available</option>
                  <option value="limited">Limited</option>
                  <option value="unavailable">Unavailable</option>
                </Select>
              </Field>
              <Field label="Availability note">
                <Input {...register("availabilityNote")} />
              </Field>
              <Field label="Years of experience">
                <Input type="number" min={0} {...register("yearsExperience", { valueAsNumber: true })} />
              </Field>
              <Field label="Projects completed">
                <Input type="number" min={0} {...register("projectsCompleted", { valueAsNumber: true })} />
              </Field>
              <Field label="Clients served">
                <Input type="number" min={0} {...register("clientsServed", { valueAsNumber: true })} />
              </Field>
            </div>
          </FormCard>
          <FormCard title="Social links">
            <Controller
              control={control}
              name="socials"
              render={({ field }) => (
                <Repeatable
                  value={field.value ?? []}
                  onChange={field.onChange}
                  blank={() => ({ label: "", url: "", icon: "" })}
                  addLabel="Add link"
                  render={(item, update) => (
                    <div className="grid gap-2 sm:grid-cols-[1fr_2fr_1fr]">
                      <Input
                        value={item.label}
                        onChange={(e) => update({ label: e.target.value })}
                        placeholder="GitHub"
                      />
                      <Input
                        value={item.url}
                        onChange={(e) => update({ url: e.target.value })}
                        placeholder="https://"
                      />
                      <Input
                        value={item.icon}
                        onChange={(e) => update({ icon: e.target.value })}
                        placeholder="github"
                      />
                    </div>
                  )}
                />
              )}
            />
          </FormCard>
        </div>
      </div>
    </form>
  );
}
