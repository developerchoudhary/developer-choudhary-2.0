"use client";

import { usePathname, useRouter } from "next/navigation";
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { admin, adminRequest, ensureSession, setAccessToken } from "@/lib/api/admin";
import type { AdminUser } from "@/lib/types";

interface AuthState {
  user: AdminUser | null;
  permissions: string[];
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  can: (permission: string) => boolean;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const isLogin = pathname === "/admin/login";

  const loadMe = useCallback(async () => {
    const me = await admin.get<{ user: AdminUser; permissions: string[] }>("/auth/me");
    setUser(me.user);
    setPermissions(me.permissions ?? []);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const ok = await ensureSession();
      if (cancelled) return;
      if (!ok) {
        setUser(null);
        if (!isLogin) router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`);
      } else {
        try {
          await loadMe();
          if (isLogin) router.replace("/admin");
        } catch {
          setUser(null);
        }
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [isLogin, pathname, router, loadMe]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await adminRequest<{ accessToken: string; user: AdminUser; permissions: string[] }>(
        "/auth/login",
        {
          method: "POST",
          body: { email, password },
        },
      );
      setAccessToken(res.data.accessToken);
      setUser(res.data.user);
      setPermissions(res.data.permissions ?? []);
      const next = new URLSearchParams(window.location.search).get("next");
      router.replace(next?.startsWith("/admin") && next !== "/admin/login" ? next : "/admin");
    },
    [router],
  );

  const logout = useCallback(async () => {
    try {
      await admin.post("/auth/logout");
    } catch {}
    setAccessToken(null);
    setUser(null);
    router.replace("/admin/login");
  }, [router]);

  const value = useMemo<AuthState>(
    () => ({
      user,
      permissions,
      loading,
      login,
      logout,
      can: (p) => permissions.includes("*") || permissions.includes(p),
    }),
    [user, permissions, loading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
