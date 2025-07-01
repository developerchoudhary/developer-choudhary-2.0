"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@nextui-org/button";

/**
 * Hero Component
 * A visually appealing introduction section with animations, profile image,
 * heading, description, and a call-to-action button.
 */
export default function Hero() {
  /**
   * Scrolls smoothly to the Contact section when the button is clicked.
   */
  const scrollToContact = () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative flex items-center justify-center px-4 md:px-8 py-10">
      {/* Animated Gradient Background */}
      <div className="bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900" />
      {/* Animated Blobs for visual interest */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-4 md:left-20 w-56 md:w-72 h-56 md:h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
        <div className="absolute top-40 right-4 md:right-20 w-56 md:w-72 h-56 md:h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-56 md:w-72 h-56 md:h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-20 text-center w-full flex flex-col items-center">
        {/* Profile Image with status indicator */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12 flex items-center justify-center gap-10"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative mx-auto mb-8"
          >
            <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden ring-4 ring-blue-200 dark:ring-blue-800 shadow-2xl mx-auto">
              <Image
                src="/developerchoudhary.jpeg"
                alt="Aman Choudhary"
                fill
                className="object-cover"
                priority
              />
            </div>
          </motion.div>
          <div>
            {/* Name and Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-blue-800 to-cyan-600 dark:from-white dark:via-blue-200 dark:to-cyan-400 bg-clip-text text-transparent"
            >
              Aman Choudhary
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 font-medium"
            >
              Full-Stack Developer & UI/UX Designer
            </motion.p>
          </div>
        </motion.div>

        {/* Main Tagline */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-2xl md:text-4xl lg:text-5xl font-bold mb-8 leading-tight"
        >
          <span className="text-gray-900 dark:text-white">
            Crafting Digital
          </span>
          <br />
          <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Experiences
          </span>
        </motion.h2>

        {/* Description Paragraph */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
        >
          I transform ideas into exceptional digital solutions using
          cutting-edge technologies. Specializing in React, Next.js, and modern
          web development with a focus on performance, accessibility, and user
          experience.
        </motion.p>

        {/* Call-to-Action Buttons: Responsive flex layout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md mx-auto"
        >
          <Button
            onClick={scrollToContact}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 w-full sm:w-auto"
          >
            Let&apos;s Work Together
          </Button>
          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 border-2 border-blue-600 text-blue-600 dark:text-blue-400 font-semibold rounded-full hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-all duration-300 w-full sm:w-auto text-center"
          >
            Download Resume
          </a>
        </motion.div>

        {/* Scroll Indicator for next section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.5 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 hidden md:block"
        >
          <div className="w-6 h-10 border-2 border-gray-400 dark:border-gray-500 rounded-full flex justify-center">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-3 bg-gray-400 dark:bg-gray-500 rounded-full mt-2"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
