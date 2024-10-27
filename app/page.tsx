"use client";

import { BackgroundLines } from "@/components/ui/background-lines";

export default function Home() {
  return (
    <div className="flex justify-center items-center h-full w-full">
      <BackgroundLines className="flex items-center justify-center w-full flex-col px-4">
        <h2 className="bg-clip-text text-transparent text-center bg-gradient-to-b from-neutral-900 to-neutral-700 dark:from-neutral-600 dark:to-white text-2xl md:text-4xl lg:text-7xl font-sans py-2 md:py-10 relative z-20 font-bold tracking-tight">
          From Idea to Launch: <br /> Complete Web Solutions
        </h2>
        <p className="max-w-[70%] mx-auto text-sm md:text-lg text-neutral-700 dark:text-neutral-400 text-center">
          As a web developer, I specialize in taking your digital concepts from
          an initial idea to a fully functional, polished web solution. With a
          strong background in modern technologies like React, Next.js, and
          Tailwind CSS, I ensure that every project I deliver is not only
          visually appealing but also optimized for performance, responsiveness,
          and scalability.
        </p>
      </BackgroundLines>
    </div>
  );
}
