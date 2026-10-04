"use client";

import { ArrowUpRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";

interface HeaderProps {
  availability: "available" | "limited" | "unavailable";
  showBlog: boolean;
  showReviews: boolean;
}

const availabilityLabel = {
  available: "Available for projects",
  limited: "Limited availability",
  unavailable: "Fully booked",
};

export function Header({ availability, showBlog, showReviews }: HeaderProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (pathname) setOpen(false);
  }, [pathname]);

  const items = NAV.filter((n) =>
    n.href === "/blog" ? showBlog : n.href === "/reviews" ? showReviews : true,
  );

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all",
        scrolled ? "bg-bg/85 backdrop-blur-md border-b border-line" : "bg-transparent",
      )}
    >
      <div className="container-dc flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative rounded-full px-3.5 py-2 text-sm transition-colors",
                  active ? "text-fg" : "text-fg-muted hover:text-fg",
                )}
              >
                {item.label}
                {active && <span className="absolute inset-x-3.5 -bottom-px h-px bg-accent" />}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-2 rounded-full border border-line px-3 py-1.5 text-xs text-fg-muted lg:inline-flex">
            <span
              className={cn(
                "size-2 rounded-full",
                availability === "available"
                  ? "bg-success animate-pulse-soft"
                  : availability === "limited"
                    ? "bg-highlight"
                    : "bg-danger",
              )}
            />
            {availabilityLabel[availability]}
          </span>
          <ThemeToggle />
          <Link
            href="/contact"
            className="hidden h-9 items-center gap-1.5 rounded-full bg-fg px-4 text-sm font-medium text-bg transition hover:opacity-90 sm:inline-flex"
          >
            Start a project <ArrowUpRight className="size-4" />
          </Link>
          <button
            type="button"
            className="inline-flex size-9 items-center justify-center rounded-full border border-line text-fg md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Toggle menu"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-line bg-bg md:hidden">
          <nav className="container-dc flex flex-col py-3" aria-label="Mobile">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl px-3 py-3 text-base text-fg hover:bg-bg-muted"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/contact"
              className="mt-2 inline-flex h-11 items-center justify-center rounded-full bg-fg text-sm font-medium text-bg"
            >
              Start a project
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
