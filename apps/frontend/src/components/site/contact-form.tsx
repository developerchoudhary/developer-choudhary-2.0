"use client";

import { CheckCircle2, MessageCircle } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { BUDGET_RANGES, TIMELINES } from "@/lib/site";
import type { Service } from "@/lib/types";
import { storedLocation } from "@/lib/visitor";
import { Field, Input, Select, Textarea } from "../ui/field";
import { buttonClass } from "./ui";

interface FormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  serviceInterest: string;
  budgetRange: string;
  timeline: string;
  message: string;
  nickname: string;
}

export function ContactForm({
  services,
  whatsapp,
  responseTime,
}: {
  services: Service[];
  whatsapp?: string;
  responseTime: string;
}) {
  const pathname = usePathname();
  const params = useSearchParams();
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState("");
  const requested = params.get("service") ?? "";
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: { serviceInterest: services.some((s) => s.title === requested) ? requested : "" },
  });

  const onSubmit = async (values: FormValues) => {
    setServerError("");
    const utm: Record<string, string> = {};
    params.forEach((v, k) => {
      if (k.startsWith("utm_")) utm[k] = v;
    });
    const loc = storedLocation();
    const payload = {
      ...values,
      sourcePage: pathname,
      referrer: document.referrer,
      utm,
      consentLocation: Boolean(loc?.granted),
      location: loc?.granted
        ? {
            latitude: loc.latitude,
            longitude: loc.longitude,
            accuracy: loc.accuracy,
            city: loc.city,
            region: loc.region,
            country: loc.country,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          }
        : undefined,
    };
    try {
      const res = await fetch("/api/v1/public/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setServerError(body?.error || body?.message || "Something went wrong. Please try again.");
        return;
      }
      setDone(true);
    } catch {
      setServerError("Could not reach the server. Check your connection and try again.");
    }
  };

  if (done) {
    return (
      <div className="card flex flex-col items-center px-6 py-14 text-center sm:px-10" aria-live="polite">
        <CheckCircle2 className="size-10 text-success" />
        <h2 className="mt-5 text-2xl font-semibold tracking-tight">Thanks, your message is in.</h2>
        <p className="mt-3 max-w-sm text-fg-muted">
          I will reply {responseTime}. A copy of your message is on its way to your inbox.
        </p>
        {whatsapp && (
          <a
            href={`https://wa.me/${whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClass("secondary", "md", "mt-8")}
          >
            <MessageCircle className="size-4" /> Urgent? Message on WhatsApp
          </a>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card space-y-5 p-6 sm:p-8" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="First name" required error={errors.firstName?.message}>
          <Input
            autoComplete="given-name"
            aria-invalid={Boolean(errors.firstName)}
            {...register("firstName", {
              required: "Please tell me your name",
              minLength: { value: 2, message: "That looks too short" },
            })}
          />
        </Field>
        <Field label="Last name">
          <Input autoComplete="family-name" {...register("lastName")} />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Email" required error={errors.email?.message}>
          <Input
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            {...register("email", {
              required: "I need an email to reply",
              pattern: { value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/, message: "That email looks off" },
            })}
          />
        </Field>
        <Field label="Phone or WhatsApp" hint="Optional">
          <Input type="tel" placeholder="+91" autoComplete="tel" {...register("phone")} />
        </Field>
      </div>
      <Field label="Company" hint="Optional">
        <Input autoComplete="organization" {...register("company")} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="What do you need?">
          <Select {...register("serviceInterest")}>
            <option value="">Choose…</option>
            {services.map((s) => (
              <option key={s.id} value={s.title}>
                {s.title}
              </option>
            ))}
            <option value="Something else">Something else</option>
          </Select>
        </Field>
        <Field label="Budget">
          <Select {...register("budgetRange")}>
            <option value="">Choose…</option>
            {BUDGET_RANGES.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Timeline">
          <Select {...register("timeline")}>
            <option value="">Choose…</option>
            {TIMELINES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label="About the project" required error={errors.message?.message}>
        <Textarea
          rows={5}
          placeholder="What are you building, who is it for, and what would success look like?"
          aria-invalid={Boolean(errors.message)}
          {...register("message", {
            required: "A few lines about the project help me reply properly",
            minLength: { value: 10, message: "A little more detail, please" },
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
        {...register("nickname")}
      />
      {serverError && (
        <p className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger" role="alert">
          {serverError}
        </p>
      )}
      <div className="flex flex-col-reverse gap-4 pt-1 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-fg-subtle">
          By sending this you agree to the{" "}
          <Link href="/privacy" className="underline underline-offset-2 hover:text-fg">
            privacy policy
          </Link>
          .
        </p>
        <button
          type="submit"
          disabled={isSubmitting}
          className={buttonClass("primary", "lg", "disabled:opacity-60")}
        >
          {isSubmitting && (
            <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          )}
          Send message
        </button>
      </div>
    </form>
  );
}
