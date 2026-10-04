"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

/** Cycles through hero taglines; renders the first one statically for SEO and no-JS. */
export function TaglineRotator({ items, interval = 3800 }: { items: string[]; interval?: number }) {
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (items.length < 2 || reduce) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % items.length), interval);
    return () => window.clearInterval(id);
  }, [items.length, interval, reduce]);

  const current = items[index] ?? items[0] ?? "";
  return (
    <span className="relative block">
      <span className="invisible block" aria-hidden="true">
        {items.reduce((a, b) => (a.length >= b.length ? a : b), "")}
      </span>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={current}
          initial={reduce ? false : { opacity: 0, y: 18, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={reduce ? undefined : { opacity: 0, y: -18, filter: "blur(6px)" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 block"
        >
          {current}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
