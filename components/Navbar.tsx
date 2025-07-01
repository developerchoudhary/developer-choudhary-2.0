"use client";
import Link from "next/link";
import ThemeToggle from "@/components/ui/ThemeToggle";

// Navigation links for the portfolio
const navLinks = [
  { name: "About", href: "#about" },
  { name: "Skills", href: "#skills" },
  { name: "Projects", href: "#projects" },
  { name: "Experience", href: "#experience" },
  { name: "Contact", href: "#contact" },
];

// Navbar: Static, responsive, and modern
export default function Navbar() {
  return (
    // Static navbar at the top of the page
    <nav className="w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-white/20 dark:border-gray-800/40 py-3 px-4 md:px-8 z-40">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand/Logo */}
        <Link href="/">
          <span className="font-bold text-xl tracking-tight text-blue-600 dark:text-cyan-400 select-none">
            Developer Choudhary
          </span>
        </Link>
        {/* Navigation links: Hidden on mobile, visible on md+ */}
        <div className="hidden md:flex gap-6 items-center">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-base font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-cyan-400 transition"
            >
              {link.name}
            </a>
          ))}
          {/* Theme toggle button */}
          <ThemeToggle />
        </div>
        {/* Mobile: Only theme toggle for now */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          {/* Optionally, add a mobile menu button here */}
        </div>
      </div>
    </nav>
  );
} 