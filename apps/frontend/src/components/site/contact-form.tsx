"use client";

import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { BUDGET_RANGES, TIMELINES } from "@/lib/site";
import type { Service } from "@/lib/types";
import { storedLocation } from "@/lib/visitor";
import { Button } from "../ui/button";
import { Field, Input, Select, Textarea } from "../ui/field";

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
  defaultService,
}: {
  services: Service[];
  whatsapp?: string;
  defaultService?: string;
}) {
  const pathname = usePathname();
  const params = useSearchParams();
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: { serviceInterest: defaultService ?? params.get("service") ?? "" },
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
    const res = await fetch("/api/v1/public/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await res.json().catch(() => null);
    if (!res.ok) {
      setServerError(
        body?.error || body?.message || "Something went wrong. Please try again or message me on WhatsApp.",
      );
      return;
    }
    setDone(true);
  };

  if (done) {
    return (
      <div className="card p-8 text-center">
        <CheckCircle2 className="mx-auto size-10 text-success" />
        <h3 className="mt-4 text-2xl font-semibold tracking-tight">Thanks, your message is in.</h3>
        <p className="mt-2 text-fg-muted">
          I reply personally, usually within a few hours. If it&apos;s urgent, WhatsApp is the fastest way to
          reach me.
        </p>
        {whatsapp && (
          <a
            href={`https://wa.me/${whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-fg px-5 text-sm font-medium text-bg"
          >
            Message on WhatsApp <ArrowUpRight className="size-4" />
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
            placeholder="Aman"
            autoComplete="given-name"
            {...register("firstName", {
              required: "Please tell me your name",
              minLength: { value: 2, message: "Too short" },
            })}
          />
        </Field>
        <Field label="Last name">
          <Input placeholder="Choudhary" autoComplete="family-name" {...register("lastName")} />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Email" required error={errors.email?.message}>
          <Input
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            {...register("email", {
              required: "I need an email to reply",
              pattern: { value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/, message: "That email looks off" },
            })}
          />
        </Field>
        <Field label="Phone / WhatsApp" hint="optional">
          <Input type="tel" placeholder="+91 ..." autoComplete="tel" {...register("phone")} />
        </Field>
      </div>
      <Field label="Company or project name" hint="optional">
        <Input placeholder="Acme Traders" autoComplete="organization" {...register("company")} />
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
      <Field label="Tell me about the project" required error={errors.message?.message}>
        <Textarea
          rows={6}
          placeholder="What are you building, who is it for, and what does success look like?"
          {...register("message", {
            required: "A few lines about the project help me reply properly",
            minLength: { value: 10, message: "A little more detail, please" },
          })}
        />
      </Field>
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
        {...register("nickname")}
      />
      {serverError && <p className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">{serverError}</p>}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-fg-subtle">By sending you agree to the privacy policy. No spam, ever.</p>
        <Button type="submit" size="lg" loading={isSubmitting}>
          Send message <ArrowUpRight className="size-4" />
        </Button>
      </div>
    </form>
  );
}
