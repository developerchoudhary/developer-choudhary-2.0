"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { buttonClass } from "./ui";

export function Header({ siteName, showBlog }: { siteName: string; showBlog: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu on navigation and on Escape; lock page scroll while it is open.
  useEffect(() => {
    if (pathname) setOpen(false);
  }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const items = NAV.filter((n) => n.href !== "/blog" || showBlog);
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-50">
      {/* The blur lives on this bar, not the header: backdrop-filter would trap the fixed menu panel. */}
      <div
        className={cn(
          "border-b transition-[background-color,border-color] duration-300",
          open
            ? "border-line bg-bg"
            : scrolled
              ? "border-line bg-bg/80 backdrop-blur-lg"
              : "border-transparent",
        )}
      >
        <div className="container-dc flex h-16 items-center justify-between gap-6">
          <Logo name={siteName} />

          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn(
                  "relative rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive(item.href) ? "text-fg" : "text-fg-muted hover:text-fg",
                )}
              >
                {item.label}
                <span
                  className={cn(
                    "absolute inset-x-3 -bottom-[13px] h-0.5 rounded-full bg-accent transition-opacity",
                    isActive(item.href) ? "opacity-100" : "opacity-0",
                  )}
                  aria-hidden="true"
                />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <Link href="/contact" className={buttonClass("primary", "md", "ml-1 h-9 max-md:hidden")}>
              Contact
            </Link>
            <button
              type="button"
              className="inline-flex size-9 items-center justify-center rounded-full text-fg transition hover:bg-bg-muted md:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div
          id="mobile-menu"
          className="fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto border-t border-line bg-bg md:hidden"
        >
          <nav className="container-dc flex flex-col py-4" aria-label="Mobile">
            {[...items, { href: "/contact", label: "Contact" }].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn(
                  "flex items-center justify-between border-b border-line py-4 text-2xl font-semibold tracking-tight",
                  isActive(item.href) ? "text-accent" : "text-fg",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
