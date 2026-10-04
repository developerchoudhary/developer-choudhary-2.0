"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormCard, StatusBadge } from "@/components/admin/bits";
import { type Column, DataTable } from "@/components/admin/data-table";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Select, Switch } from "@/components/ui/field";
import { useAuth } from "@/lib/admin/auth";
import { useAction, useAll, useSave } from "@/lib/admin/hooks";
import { admin } from "@/lib/api/admin";
import type { AdminUser } from "@/lib/types";
import { formatDate } from "@/lib/utils";

type Draft = {
  id?: string;
  name: string;
  email: string;
  role: "admin" | "editor";
  password: string;
  isActive: boolean;
};

export default function UsersPage() {
  const { user: me, logout } = useAuth();
  const { data, isLoading } = useAll<AdminUser>("/users");
  const [draft, setDraft] = useState<Draft | null>(null);
  const save = useSave<Record<string, unknown>>({
    path: "/users",
    id: draft?.id,
    onSuccess: () => setDraft(null),
  });

  const pw = useForm<{ currentPassword: string; newPassword: string; confirm: string }>();
  const changePassword = useAction(
    (body: { currentPassword: string; newPassword: string }) => admin.put("/auth/password", body),
    {
      success: "Password changed. Please sign in again.",
      onSuccess: () => logout(),
    },
  );

  const columns: Column<AdminUser>[] = [
    {
      key: "name",
      header: "Name",
      render: (u) => (
        <span className="font-medium">
          {u.name}
          {u.id === me?.id && <span className="ml-2 text-xs text-fg-subtle">you</span>}
        </span>
      ),
    },
    { key: "email", header: "Email", render: (u) => <span className="text-fg-muted">{u.email}</span> },
    { key: "role", header: "Role", render: (u) => <StatusBadge value={u.role} /> },
    {
      key: "active",
      header: "Status",
      render: (u) => <StatusBadge value={u.isActive ? "approved" : "archived"} />,
    },
    {
      key: "login",
      header: "Last login",
      render: (u) => <span className="text-fg-muted">{formatDate(u.lastLoginAt) || "—"}</span>,
    },
  ];

  return (
    <>
      <PageHeader
        title="Users"
        description="People who can sign in to this admin. Editors manage content; admins manage everything."
        actions={
          <Button
            onClick={() => setDraft({ name: "", email: "", role: "editor", password: "", isActive: true })}
          >
            <Plus className="size-4" /> New user
          </Button>
        }
      />
      <DataTable
        columns={columns}
        rows={data}
        loading={isLoading}
        rowKey={(u) => u.id}
        onRowClick={(u) =>
          setDraft({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            password: "",
            isActive: u.isActive,
          })
        }
      />

      <div className="mt-8 max-w-lg">
        <FormCard title="Change my password" description="You will be signed out of every device afterwards.">
          <form
            onSubmit={pw.handleSubmit((v) => {
              if (v.newPassword !== v.confirm) return toast.error("Passwords do not match");
              changePassword.mutate({ currentPassword: v.currentPassword, newPassword: v.newPassword });
            })}
            className="space-y-4"
          >
            <Field label="Current password">
              <Input
                type="password"
                autoComplete="current-password"
                {...pw.register("currentPassword", { required: true })}
              />
            </Field>
            <Field label="New password" hint="10+ characters with letters and numbers">
              <Input
                type="password"
                autoComplete="new-password"
                {...pw.register("newPassword", { required: true, minLength: 10 })}
              />
            </Field>
            <Field label="Confirm new password">
              <Input
                type="password"
                autoComplete="new-password"
                {...pw.register("confirm", { required: true })}
              />
            </Field>
            <Button type="submit" variant="secondary" loading={changePassword.isPending}>
              Update password
            </Button>
          </form>
        </FormCard>
      </div>

      <Dialog
        open={Boolean(draft)}
        onClose={() => setDraft(null)}
        title={draft?.id ? "Edit user" : "New user"}
      >
        {draft && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const body: Record<string, unknown> = {
                name: draft.name,
                role: draft.role,
                isActive: draft.isActive,
              };
              if (!draft.id) body.email = draft.email;
              if (draft.password) body.password = draft.password;
              save.mutate(body);
            }}
            className="space-y-4"
          >
            <Field label="Name" required>
              <Input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                required
              />
            </Field>
            <Field label="Email" required>
              <Input
                type="email"
                value={draft.email}
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                required
                disabled={Boolean(draft.id)}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Role">
                <Select
                  value={draft.role}
                  onChange={(e) => setDraft({ ...draft, role: e.target.value as Draft["role"] })}
                >
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </Select>
              </Field>
              <Field label={draft.id ? "New password (optional)" : "Password"} hint="10+ chars">
                <Input
                  type="password"
                  value={draft.password}
                  onChange={(e) => setDraft({ ...draft, password: e.target.value })}
                  required={!draft.id}
                  minLength={10}
                  autoComplete="new-password"
                />
              </Field>
            </div>
            {draft.id && (
              <Switch
                checked={draft.isActive}
                onChange={(v) => setDraft({ ...draft, isActive: v })}
                label="Active"
                description="Inactive users cannot sign in"
              />
            )}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setDraft(null)}>
                Cancel
              </Button>
              <Button type="submit" loading={save.isPending}>
                Save
              </Button>
            </div>
          </form>
        )}
      </Dialog>
    </>
  );
}
