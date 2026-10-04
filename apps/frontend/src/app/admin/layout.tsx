"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { type ReactNode, useState } from "react";
import { AdminShell } from "@/components/admin/shell";
import { AuthProvider, useAuth } from "@/lib/admin/auth";

function Gate({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  if (pathname === "/admin/login") return <>{children}</>;
  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-fg-muted">
        <span className="size-5 animate-spin rounded-full border-2 border-fg-muted border-t-transparent" />
      </div>
    );
  }
  return <AdminShell>{children}</AdminShell>;
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false } },
      }),
  );
  return (
    <QueryClientProvider client={client}>
      <AuthProvider>
        <Gate>{children}</Gate>
      </AuthProvider>
    </QueryClientProvider>
  );
}
