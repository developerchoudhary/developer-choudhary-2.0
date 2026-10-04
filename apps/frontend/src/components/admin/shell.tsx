"use client";

import {
  Award,
  BarChart3,
  Briefcase,
  ChevronRight,
  ExternalLink,
  FileText,
  FolderKanban,
  GraduationCap,
  Image as ImageIcon,
  Inbox,
  LayoutDashboard,
  LogOut,
  MessageSquareQuote,
  Newspaper,
  Quote,
  Settings,
  Sparkles,
  UserCircle,
  Users,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { LogoMark } from "@/components/site/logo";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { useAuth } from "@/lib/admin/auth";
import { cn } from "@/lib/utils";

export const ADMIN_NAV = [
  {
    title: "Overview",
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard, perm: "dashboard:read" }],
  },
  {
    title: "Inbox",
    items: [
      { href: "/admin/leads", label: "Leads", icon: Inbox, perm: "leads:read" },
      { href: "/admin/reviews", label: "Reviews", icon: MessageSquareQuote, perm: "reviews:write" },
      { href: "/admin/visitors", label: "Analytics", icon: BarChart3, perm: "visits:read" },
    ],
  },
  {
    title: "Content",
    items: [
      { href: "/admin/projects", label: "Projects", icon: FolderKanban, perm: "content:write" },
      { href: "/admin/services", label: "Services", icon: Sparkles, perm: "content:write" },
      { href: "/admin/blog", label: "Blog", icon: Newspaper, perm: "blog:write" },
      { href: "/admin/media", label: "Media", icon: ImageIcon, perm: "media:write" },
    ],
  },
  {
    title: "Profile",
    items: [
      { href: "/admin/profile", label: "Profile", icon: UserCircle, perm: "content:write" },
      { href: "/admin/taglines", label: "Taglines", icon: Quote, perm: "content:write" },
      { href: "/admin/skills", label: "Skills", icon: Wrench, perm: "content:write" },
      { href: "/admin/experience", label: "Experience", icon: Briefcase, perm: "content:write" },
      { href: "/admin/education", label: "Education", icon: GraduationCap, perm: "content:write" },
      { href: "/admin/certifications", label: "Certifications", icon: Award, perm: "content:write" },
      { href: "/admin/resume", label: "Resume", icon: FileText, perm: "resume:write" },
    ],
  },
  {
    title: "System",
    items: [
      { href: "/admin/settings", label: "Settings", icon: Settings, perm: "settings:write" },
      { href: "/admin/users", label: "Account & users", icon: Users, perm: "users:write" },
    ],
  },
];

const labels: Record<string, string> = {
  admin: "Dashboard",
  new: "New",
  taxonomy: "Categories & tags",
  preview: "Preview",
};

function crumbsFor(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  const out: Array<{ href: string; label: string }> = [];
  let href = "";
  for (const part of parts) {
    href += `/${part}`;
    const nav = ADMIN_NAV.flatMap((g) => g.items).find((i) => i.href === href);
    const label = nav?.label ?? labels[part] ?? (/^[0-9a-f-]{20,}$/i.test(part) ? "Edit" : part);
    out.push({ href, label });
  }
  return out;
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, logout, can } = useAuth();
  const crumbs = crumbsFor(pathname);

  return (
    <div className="admin-root flex min-h-screen bg-bg">
      <aside className="sticky top-0 flex h-screen w-[248px] shrink-0 flex-col border-r border-line bg-bg-elevated">
        <div className="flex h-16 items-center gap-2.5 border-b border-line px-5">
          <LogoMark className="size-8 shrink-0" />
          <div className="leading-tight">
            <p className="font-display text-sm font-semibold">Developer Choudhary</p>
            <p className="text-[0.65rem] uppercase tracking-wider text-fg-subtle">Admin console</p>
          </div>
        </div>
        <nav className="admin-scroll flex flex-1 flex-col gap-5 overflow-y-auto px-3 py-4">
          {ADMIN_NAV.map((g) => {
            const items = g.items.filter((i) => can(i.perm));
            if (!items.length) return null;
            return (
              <div key={g.title}>
                <p className="eyebrow mb-1.5 px-3">{g.title}</p>
                <ul className="space-y-0.5">
                  {items.map((item) => {
                    const active =
                      item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={cn(
                            "group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition",
                            active
                              ? "bg-accent-soft font-medium text-fg"
                              : "text-fg-muted hover:bg-bg-muted hover:text-fg",
                          )}
                        >
                          <item.icon
                            className={cn(
                              "size-4",
                              active ? "text-accent" : "text-fg-subtle group-hover:text-fg",
                            )}
                          />
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>
        <div className="border-t border-line p-3">
          <div className="flex items-center gap-3 rounded-xl px-2 py-1.5">
            <span className="inline-flex size-9 items-center justify-center rounded-full bg-bg-muted font-mono text-xs font-semibold text-fg">
              {(user?.name ?? "?")
                .split(/\s+/)
                .slice(0, 2)
                .map((p) => p[0]?.toUpperCase())
                .join("")}
            </span>
            <div className="min-w-0 flex-1 text-sm">
              <p className="truncate font-medium">{user?.name}</p>
              <p className="truncate text-xs text-fg-subtle capitalize">{user?.role}</p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg p-2 text-fg-muted transition hover:bg-bg-muted hover:text-fg"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b border-line bg-bg/85 px-8 backdrop-blur">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
            {crumbs.map((c, i) => (
              <span key={c.href} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="size-3.5 text-fg-subtle" />}
                {i === crumbs.length - 1 ? (
                  <span className="font-medium text-fg">{c.label}</span>
                ) : (
                  <Link href={c.href} className="text-fg-muted transition hover:text-fg">
                    {c.label}
                  </Link>
                )}
              </span>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line px-3.5 text-sm text-fg-muted transition hover:border-line-strong hover:text-fg"
            >
              View site <ExternalLink className="size-3.5" />
            </a>
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 px-8 py-8">
          <div className="mx-auto w-full max-w-[1400px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
