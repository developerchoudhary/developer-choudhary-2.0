"use client";
/**
 * Note: Use position fixed according to your needs
 * Desktop navbar is better positioned at the bottom
 * Mobile navbar is better positioned at bottom right.
 **/

import { IconLayoutNavbarCollapse } from "@tabler/icons-react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

import { cn } from "@/lib/utils";

export const FloatingDock = ({
  items,
  mobileClassName,
}: {
  items: { title: string; icon: React.ReactNode; href: string }[];
  desktopClassName?: string;
  mobileClassName?: string;
}) => {
  return (
    <>
      <FloatingDockMobile className={mobileClassName} items={items} />
    </>
  );
};

const FloatingDockMobile = ({
  items,
  className,
}: {
  items: { title: string; icon: React.ReactNode; href: string }[];
  className?: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn(`relative transform sm:rotate-90 rotate-180`, className)}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute bottom-full mb-2 inset-x-0 flex flex-col gap-2"
            layoutId="nav"
          >
            {items.map((item, idx) => (
              <motion.div
                key={item.title}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: 10,
                  transition: {
                    delay: idx * 0.05,
                  },
                }}
                initial={{ opacity: 0, y: 10 }}
                transition={{ delay: (items.length - 1 - idx) * 0.05 }}
              >
                <Link
                  key={item.title}
                  className="h-10 w-10 transform sm:-rotate-90 -rotate-180 rounded-full bg-gray-50 dark:bg-neutral-900 flex items-center justify-center"
                  href={item.href}
                >
                  <div className="h-4 w-4">{item.icon}</div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <button
        className="h-10 w-10 rounded-full bg-gray-50 dark:bg-neutral-800 flex items-center justify-center"
        onClick={() => setOpen(!open)}
      >
        <IconLayoutNavbarCollapse
          className={`h-5 w-5 transform transition-transform duration-500 ${open ? "rotate-180" : " rotate-0"} text-neutral-500 dark:text-neutral-400`}
        />
      </button>
    </div>
  );
};
