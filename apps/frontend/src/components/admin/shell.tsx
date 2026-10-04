"use client";

import {
  Award,
  BarChart3,
  Briefcase,
  ExternalLink,
  FileText,
  FolderKanban,
  GraduationCap,
  Image as ImageIcon,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareQuote,
  Newspaper,
  Quote,
  Settings,
  Sparkles,
  UserCircle,
  Users,
  Wrench,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { useAuth } from "@/lib/admin/auth";
import { cn } from "@/lib/utils";

const groups = [
  {
    title: "Overview",
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard, perm: "dashboard:read" }],
  },
  {
    title: "Inbox",
    items: [
      { href: "/admin/leads", label: "Leads", icon: Inbox, perm: "leads:read" },
      { href: "/admin/reviews", label: "Reviews", icon: MessageSquareQuote, perm: "reviews:write" },
      { href: "/admin/visitors", label: "Visitors", icon: BarChart3, perm: "visits:read" },
    ],
  },
  {
    title: "Content",
    items: [
      { href: "/admin/blog", label: "Blog", icon: Newspaper, perm: "blog:write" },
      { href: "/admin/projects", label: "Projects", icon: FolderKanban, perm: "content:write" },
      { href: "/admin/services", label: "Services", icon: Sparkles, perm: "content:write" },
      { href: "/admin/skills", label: "Skills", icon: Wrench, perm: "content:write" },
      { href: "/admin/experience", label: "Experience", icon: Briefcase, perm: "content:write" },
      { href: "/admin/education", label: "Education", icon: GraduationCap, perm: "content:write" },
      { href: "/admin/certifications", label: "Certifications", icon: Award, perm: "content:write" },
      { href: "/admin/media", label: "Media", icon: ImageIcon, perm: "media:write" },
    ],
  },
  {
    title: "Profile",
    items: [
      { href: "/admin/profile", label: "Profile", icon: UserCircle, perm: "content:write" },
      { href: "/admin/taglines", label: "Taglines", icon: Quote, perm: "content:write" },
      { href: "/admin/resume", label: "Resume", icon: FileText, perm: "resume:write" },
    ],
  },
  {
    title: "System",
    items: [
      { href: "/admin/settings", label: "Settings", icon: Settings, perm: "settings:write" },
      { href: "/admin/users", label: "Users", icon: Users, perm: "users:write" },
    ],
  },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, logout, can } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (pathname) setOpen(false);
  }, [pathname]);

  const nav = (
    <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-4">
      {groups.map((g) => {
        const items = g.items.filter((i) => can(i.perm));
        if (!items.length) return null;
        return (
          <div key={g.title}>
            <p className="eyebrow mb-2 px-3">{g.title}</p>
            <ul className="space-y-0.5">
              {items.map((item) => {
                const active =
                  item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition",
                        active ? "bg-fg text-bg" : "text-fg-muted hover:bg-bg-muted hover:text-fg",
                      )}
                    >
                      <item.icon className="size-4" />
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
  );

  return (
    <div className="flex min-h-screen bg-bg">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-line bg-bg-elevated lg:flex">
        <div className="flex h-14 items-center gap-2 border-b border-line px-5">
          <span className="display text-xl italic">
            DC<span className="text-accent">.</span>
          </span>
          <span className="text-sm font-medium">Admin</span>
        </div>
        {nav}
        <div className="border-t border-line p-3">
          <div className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5">
            <div className="min-w-0 text-sm">
              <p className="truncate font-medium">{user?.name}</p>
              <p className="truncate text-xs text-fg-subtle">{user?.role}</p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg p-2 text-fg-muted hover:bg-bg-muted hover:text-fg"
              aria-label="Sign out"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-fg/40"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          />
          <aside className="relative flex w-64 flex-col bg-bg-elevated shadow-lift">
            <div className="flex h-14 items-center justify-between border-b border-line px-4">
              <span className="text-sm font-medium">Menu</span>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close">
                <X className="size-4" />
              </button>
            </div>
            {nav}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-3 border-b border-line bg-bg/85 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="rounded-lg border border-line p-2 lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="size-4" />
            </button>
            <span className="text-sm text-fg-muted">developerchoudhary.com</span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line px-3 text-sm text-fg-muted hover:text-fg"
            >
              View site <ExternalLink className="size-3.5" />
            </a>
            <ThemeToggle />
            <button
              type="button"
              onClick={logout}
              className="inline-flex size-9 items-center justify-center rounded-full border border-line text-fg-muted hover:text-fg lg:hidden"
              aria-label="Sign out"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
