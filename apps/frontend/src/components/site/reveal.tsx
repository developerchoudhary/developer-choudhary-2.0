"use client";

import { type ElementType, type ReactNode, useEffect, useRef } from "react";

/**
 * Fades its children in when they scroll into view. The hidden start state only applies when
 * scripting is enabled (globals.css), so the content never depends on this component running.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: ElementType;
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      el.classList.add("is-in");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag
      ref={ref}
      data-reveal=""
      className={className}
      style={delay ? ({ "--delay": `${Math.round(delay * 1000)}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </Tag>
  );
}
