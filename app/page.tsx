"use client";

import Link from "next/link";

import { ShootingStars } from "@/components/ui/shooting-stars";
import { StarsBackground } from "@/components/ui/stars-background";

export default function Home() {
  return (
    <div className="flex flex-col items-center h-full px-10 w-full">
      <div className="flex items-center md:h-full h-[90%] justify-center w-full gap-2 flex-col px-4">
        <h2 className="bg-clip-text text-transparent text-center bg-gradient-to-b from-neutral-900 to-neutral-700 dark:from-neutral-600 dark:to-white text-2xl md:text-4xl lg:text-7xl font-sans py-2 md:py-10 relative font-bold tracking-tight">
          From Idea to Launch: <br /> Complete Web Solutions
        </h2>

        <div className="md:max-w-[70%] text-center flex flex-col md:gap-8 gap-4 mx-auto text-sm md:text-lg text-neutral-700 dark:text-neutral-400">
          <p>
            As a web developer, I specialize in taking your digital concepts
            from an initial idea to a fully functional, polished web solution.
            With a strong background in modern technologies like React, Next.js,
            and Tailwind CSS, I ensure that every project I deliver is not only
            visually appealing but also optimized for performance,
            responsiveness, and scalability.
          </p>
          <p>
            From small business websites to large-scale web applications,
            I&apos;m passionate about crafting digital solutions that help you
            achieve your goals. Let&apos;s work together to bring your vision to
            life, ensuring your web presence is both impactful and memorable
            right from the idea phase to a successful launch.
          </p>
        </div>

        <Link
          className="h-12 z-10 flex items-center justify-center rounded-md border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:0%] px-10 font-medium text-slate-400 transition-colors mt-8"
          href={"/contact"}
        >
          Hire Me
        </Link>
      </div>
      <ShootingStars />
      <StarsBackground />
    </div>
  );
}
