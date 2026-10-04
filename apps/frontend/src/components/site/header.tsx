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
}

const availabilityLabel = {
  available: "Available for projects",
  limited: "Limited availability",
  unavailable: "Fully booked",
};

export function Header({ availability, showBlog }: HeaderProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (pathname) setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const items = NAV.filter((n) => (n.href === "/blog" ? showBlog : true));
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-50">
      <div
        className={cn(
          "transition-all duration-300",
          scrolled || open ? "border-b border-line bg-bg/80 backdrop-blur-xl" : "bg-transparent",
        )}
      >
        <div className="container-dc flex h-16 items-center justify-between gap-4 sm:h-[72px]">
          <Logo />

          <nav
            className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded-full border border-line bg-bg-elevated/70 p-1 backdrop-blur md:flex"
            aria-label="Main"
          >
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-sm transition-colors",
                  isActive(item.href) ? "bg-fg text-bg" : "text-fg-muted hover:bg-bg-muted hover:text-fg",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-2 rounded-full border border-line px-3 py-1.5 text-xs text-fg-muted lg:inline-flex">
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  availability === "available"
                    ? "bg-success animate-pulse-soft"
                    : availability === "limited"
                      ? "bg-warning"
                      : "bg-danger",
                )}
              />
              {availabilityLabel[availability]}
            </span>
            <ThemeToggle />
            <Link
              href="/contact"
              className="hidden h-9 items-center gap-1.5 rounded-full bg-fg px-4 text-sm font-medium text-bg transition hover:bg-fg/90 sm:inline-flex"
            >
              Let&apos;s talk <ArrowUpRight className="size-4" />
            </Link>
            <button
              type="button"
              className="inline-flex size-9 items-center justify-center rounded-full border border-line text-fg md:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
            >
              {open ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div
          id="mobile-menu"
          className="fixed inset-x-0 top-16 bottom-0 z-40 flex flex-col bg-bg/95 backdrop-blur-xl md:hidden"
        >
          <nav className="container-dc flex flex-1 flex-col justify-center gap-1 py-6" aria-label="Mobile">
            {items.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                style={{ animationDelay: `${i * 40}ms` }}
                className={cn(
                  "display flex items-center justify-between rounded-2xl px-4 py-3 text-4xl",
                  isActive(item.href) ? "text-fg" : "text-fg-muted",
                )}
              >
                {item.label}
                <ArrowUpRight className="size-6 text-fg-subtle" />
              </Link>
            ))}
          </nav>
          <div className="container-dc space-y-3 border-t border-line py-6">
            <span className="inline-flex items-center gap-2 text-sm text-fg-muted">
              <span
                className={cn(
                  "size-2 rounded-full",
                  availability === "available"
                    ? "bg-success animate-pulse-soft"
                    : availability === "limited"
                      ? "bg-warning"
                      : "bg-danger",
                )}
              />
              {availabilityLabel[availability]}
            </span>
            <Link
              href="/contact"
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-accent text-sm font-medium text-accent-fg"
            >
              Start a project <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
