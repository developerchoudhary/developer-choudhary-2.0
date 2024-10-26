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
      title: "Home",
      icon: (
        <IconHome className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/",
    },
    {
      title: "Showcase",
      icon: (
        <IconTerminal2 className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/showcase",
    },
    {
      title: "Study",
      icon: (
        <IconVocabulary className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/study",
    },
    {
      title: "Skills",
      icon: (
        <IconSitemap className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/skills",
    },
    {
      title: "About",
      icon: (
        <IconUserFilled className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/about",
    },
    {
      title: "Contact",
      icon: (
        <IconPhone className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/contact",
    },
    {
      title: "Theme",
      icon: (
        <div className="h-5 w-5 max-md:pr-1 max-md:pb-1 flex justify-center items-center rounded-full">
          <ThemeSwitch />
        </div>
      ),
      href: "#",
    },
    {
      title: "GitHub",
      icon: (
        <IconBrandGithub className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "https://github.com/amanchoudhary9230",
    },
  ];

  return (
    <div className="w-fit h-fit">
      <FloatingDock items={links} />
    </div>
  );
}
