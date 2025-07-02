"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

/**
 * Hero Component
 * A visually appealing introduction section with animations, profile image,
 * heading, description, and a call-to-action button.
 */
export default function Hero() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="w-full min-h-screen flex flex-col gap-x-10 md:flex-row items-center justify-between px-4 md:px-16 py-8"
    >
      {/* Left Side */}
      <motion.div
        initial="hidden"
        animate="visible"
        className="flex-1 flex flex-col items-start justify-center max-w-xl"
      >
        <motion.span
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-sky-500 mb-4"
        >
          Welcome to my site
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight"
        >
          Hi, I&apos;m <span className="text-sky-700">Aman Choudhary</span>, a
          <br />
          <span className="text-amber-600">UI UX Designer.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="text-base md:text-lg text-gray-800 dark:text-gray-200 mb-2"
        >
          I am a focused and talented Full-Stack Developer passionate about
          creating exceptional digital experiences. Specializing in React,
          Next.js, and modern web development.{" "}
          <Link href="#about" className="text-sky-500 hover:underline">
            See More..
          </Link>
        </motion.p>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.15,
                delayChildren: 0.8,
              },
            },
          }}
          className="flex gap-4 mt-6"
        >
          <motion.a
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            href="#contact"
            className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            Hire me !
          </motion.a>
          <motion.a
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            href="#projects"
            className="px-8 py-3 rounded-lg border-2 border-sky-600 text-sky-600 font-semibold bg-white hover:bg-sky-50 transition-all duration-200"
          >
            See My Project
          </motion.a>
        </motion.div>
      </motion.div>
      {/* Right Side */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="flex-1 flex items-center justify-center mt-10 md:mt-0"
      >
        <div className="relative w-72 h-72 md:w-80 md:h-80">
          {/* Custom background shape */}
          <div
            className="absolute -top-4 -left-4 w-full h-full rounded-[60px_0_120px_0] bg-sky-100 z-0"
            style={{
              borderTopLeftRadius: "60px",
              borderBottomRightRadius: "120px",
            }}
          />
          <div
            className="relative w-full h-full overflow-hidden rounded-[60px_0_120px_0] z-10"
            style={{
              borderTopLeftRadius: "60px",
              borderBottomRightRadius: "120px",
            }}
          >
            <Image
              src="/developerchoudhary.jpg"
              alt="Aman Choudhary"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
}
