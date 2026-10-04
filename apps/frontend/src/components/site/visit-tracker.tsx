"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { track } from "@/lib/visitor";

export function VisitTracker() {
  const pathname = usePathname();
  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    const id = window.setTimeout(() => track(pathname), 400);
    return () => window.clearTimeout(id);
  }, [pathname]);
  return null;
}
