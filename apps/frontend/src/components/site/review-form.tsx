"use client";

import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { Service } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Field, Input, Select, Textarea } from "../ui/field";
import { buttonClass } from "./ui";

interface FormValues {
  authorName: string;
  authorRole: string;
  authorCompany: string;
  authorEmail: string;
  rating: number;
  title: string;
  body: string;
  serviceSlug: string;
  website: string;
}

export function ReviewForm({ services }: { services: Service[] }) {
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ defaultValues: { rating: 5 } });
  const rating = watch("rating");

  const onSubmit = async (values: FormValues) => {
    setError("");
    try {
      const res = await fetch("/api/v1/public/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, rating: Number(values.rating) }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setError(body?.error || body?.message || "Could not submit the review right now.");
        return;
      }
      setDone(true);
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    }
  };

  if (done) {
    return (
      <div className="card flex flex-col items-center px-6 py-12 text-center" aria-live="polite">
        <CheckCircle2 className="size-10 text-success" />
        <h3 className="mt-4 text-xl font-semibold tracking-tight">Thank you!</h3>
        <p className="mt-2 text-fg-muted">Your review will appear here once I have approved it.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card space-y-5 p-6 sm:p-8" noValidate>
      <fieldset>
        <legend className="mb-2 text-sm font-medium">Your rating</legend>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setValue("rating", n)}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              aria-pressed={n === rating}
              className="rounded-md p-0.5"
            >
              <svg
                viewBox="0 0 20 20"
                className={cn(
                  "size-7 transition-colors",
                  n <= rating ? "fill-highlight" : "fill-line-strong hover:fill-highlight/60",
                )}
                aria-hidden="true"
              >
                <path d="M10 1.5l2.6 5.4 5.9.8-4.3 4.1 1.1 5.9L10 14.9l-5.3 2.8 1.1-5.9L1.5 7.7l5.9-.8z" />
              </svg>
            </button>
          ))}
        </div>
        <input type="hidden" {...register("rating", { valueAsNumber: true })} />
      </fieldset>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your name" required error={errors.authorName?.message}>
          <Input
            autoComplete="name"
            {...register("authorName", {
              required: "Please add your name",
              minLength: { value: 2, message: "That looks too short" },
            })}
          />
        </Field>
        <Field label="Email" hint="Never shown" error={errors.authorEmail?.message}>
          <Input
            type="email"
            autoComplete="email"
            {...register("authorEmail", {
              pattern: { value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/, message: "That email looks off" },
            })}
          />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Role">
          <Input placeholder="Founder" {...register("authorRole")} />
        </Field>
        <Field label="Company">
          <Input autoComplete="organization" {...register("authorCompany")} />
        </Field>
        <Field label="Service">
          <Select {...register("serviceSlug")}>
            <option value="">Choose…</option>
            {services.map((s) => (
              <option key={s.id} value={s.slug}>
                {s.title}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label="Headline" hint="Optional">
        <Input placeholder="Delivered ahead of schedule" {...register("title")} />
      </Field>
      <Field label="Your review" required error={errors.body?.message}>
        <Textarea
          rows={5}
          placeholder="What did we build together, and how did it go?"
          {...register("body", {
            required: "Please write a few words",
            minLength: { value: 20, message: "A little more detail, please (20+ characters)" },
          })}
        />
      </Field>
      {/* Honeypot: real visitors never see or fill this field. */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
        {...register("website")}
      />
      {error && (
        <p className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={isSubmitting}
        className={buttonClass("primary", "lg", "disabled:opacity-60")}
      >
        {isSubmitting && (
          <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        Submit review
      </button>
    </form>
  );
}
