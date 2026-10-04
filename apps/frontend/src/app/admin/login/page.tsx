"use client";

import { ArrowRight, Lock } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { useAuth } from "@/lib/admin/auth";
import { errorMessage } from "@/lib/admin/hooks";

export default function LoginPage() {
  const { login } = useAuth();
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<{ email: string; password: string }>();

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
      <section className="relative hidden overflow-hidden border-r border-line bg-bg-elevated lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="grid-bg pointer-events-none absolute inset-0" aria-hidden="true" />
        <div
          className="pointer-events-none absolute -bottom-40 -left-20 h-[480px] w-[480px] rounded-full bg-accent/20 blur-[140px]"
          aria-hidden="true"
        />
        <div className="relative flex items-center gap-2.5">
          <span className="inline-flex size-9 items-center justify-center rounded-lg bg-accent text-accent-fg">
            <span className="font-display text-base font-bold">DC</span>
          </span>
          <span className="font-display text-base font-semibold">Developer Choudhary</span>
        </div>
        <div className="relative">
          <p className="eyebrow mb-4">Admin console</p>
          <h1 className="display max-w-lg text-5xl">
            Everything on the site, <span className="text-accent">editable from here.</span>
          </h1>
          <p className="mt-5 max-w-md text-fg-muted">
            Projects, services, writing, leads, analytics and the resume generator. Changes go live within
            seconds.
          </p>
        </div>
        <p className="relative text-xs text-fg-subtle">developerchoudhary.com</p>
      </section>
      <section className="flex items-center justify-center px-6 py-16">
        <form
          onSubmit={handleSubmit(async (v) => {
            setError("");
            try {
              await login(v.email, v.password);
            } catch (err) {
              setError(errorMessage(err));
            }
          })}
          className="w-full max-w-sm space-y-5"
        >
          <div>
            <span className="inline-flex size-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
              <Lock className="size-4" />
            </span>
            <h2 className="mt-5 text-2xl font-semibold tracking-tight">Sign in</h2>
            <p className="mt-1 text-sm text-fg-muted">Use the admin credentials configured for this site.</p>
          </div>
          <Field label="Email">
            <Input type="email" autoComplete="email" autoFocus {...register("email", { required: true })} />
          </Field>
          <Field label="Password">
            <Input
              type="password"
              autoComplete="current-password"
              {...register("password", { required: true })}
            />
          </Field>
          {error && <p className="rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
          <Button type="submit" variant="accent" className="w-full" loading={isSubmitting}>
            Sign in <ArrowRight className="size-4" />
          </Button>
        </form>
      </section>
    </main>
  );
}
