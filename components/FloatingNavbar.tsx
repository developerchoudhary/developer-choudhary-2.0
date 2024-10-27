"use client";
import React from "react";
import {
  IconBrandGithub,
  IconHome,
  IconPhone,
  IconSitemap,
  IconTerminal2,
  IconUserFilled,
  IconVocabulary,
} from "@tabler/icons-react";

import { ThemeSwitch } from "./theme-switch";

import { FloatingDock } from "@/components/ui/floating-dock";

export default function FloatingNavbar() {
  const links = [
    {
      title: "GitHub",
      icon: (
        <IconBrandGithub className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "https://github.com/amanchoudhary9230",
    },
    {
      title: "Theme",
      icon: (
        <div className="h-5 w-5 transform -scale-[0.8] rotate-180 -translate-x-[2px] -translate-y-[2px] flex justify-center items-center rounded-full">
          <ThemeSwitch />
        </div>
      ),
      href: "#",
    },
    {
      title: "Contact",
      icon: (
        <IconPhone className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/contact",
    },
    {
      title: "About",
      icon: (
        <IconUserFilled className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/about",
    },
    {
      title: "Skills",
      icon: (
        <IconSitemap className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/skills",
    },
    {
      title: "Study",
      icon: (
        <IconVocabulary className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/study",
    },
    {
      title: "Showcase",
      icon: (
        <IconTerminal2 className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/showcase",
    },
    {
      title: "Home",
      icon: (
        <IconHome className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/",
    },
  ];

  return (
    <div className="w-fit h-fit">
      <FloatingDock items={links} />
    </div>
  );
}
