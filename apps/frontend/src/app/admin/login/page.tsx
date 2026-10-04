"use client";

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
    <main className="flex min-h-screen items-center justify-center px-4">
      <form
        onSubmit={handleSubmit(async (v) => {
          setError("");
          try {
            await login(v.email, v.password);
          } catch (err) {
            setError(errorMessage(err));
          }
        })}
        className="card w-full max-w-sm space-y-5 p-8"
      >
        <div>
          <span className="display text-3xl italic">
            DC<span className="text-accent">.</span>
          </span>
          <h1 className="mt-3 text-xl font-semibold">Sign in to the admin</h1>
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
        {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
        <Button type="submit" className="w-full" loading={isSubmitting}>
          Sign in
        </Button>
      </form>
    </main>
  );
}
