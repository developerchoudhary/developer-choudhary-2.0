"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@nextui-org/button";

export default function Hero() {
  const scrollToContact = () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <div className="flex flex-col items-center gap-4 justify-center h-full min-h-[100dvh] w-full text-center relative overflow-hidden">
      {/* Profile Image */}
      <motion.div
        initial={{ opacity: 0, scale: 0.1 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
        viewport={{ once: true, amount: 0.5 }}
        className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-black dark:border-white shadow-lg"
      >
        <Image
          src="/developerchoudhary.jpeg" // Replace with your actual photo path
          alt="Amandeep Kumar"
          className="w-full h-full object-cover"
          width={200}
          height={200}
          loading="lazy"
        />
      </motion.div>

      {/* Name */}
      <motion.h2
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
        viewport={{ once: true, amount: 0.5 }}
        className="text-2xl md:text-3xl mb-10 font-semibold text-black dark:text-white mt-4"
      >
        Aman Choudhary
      </motion.h2>

      {/* Heading with Animation */}
      <motion.h1
        initial={{ opacity: 0, y: 70 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.6 }}
        viewport={{ once: true, amount: 0.5 }}
        className="bg-clip-text text-transparent bg-gradient-to-b from-neutral-500 to-neutral-600 dark:from-neutral-50 dark:to-neutral-300 text-4xl md:text-6xl font-bold tracking-wide leading-tight mt-2"
      >
        From Idea to Launch:
        <br /> Complete Web Solutions
      </motion.h1>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 90 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.9 }}
        className="max-w-4xl mt-4 text-base md:text-xl text-neutral-700 dark:text-neutral-300"
      >
        I specialize in transforming your ideas into fully functional,
        high-performance web solutions using modern technologies like React,
        Next.js, and Tailwind CSS. Let&apos;s build something exceptional
        together.
      </motion.p>

      {/* Call to Action Button */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 1.2 }}
        viewport={{ once: true, amount: 0.5 }}
        className="mt-6"
      >
        <Button
          onClick={scrollToContact}
          href="#contact"
          className="relative inline-flex items-center justify-center px-6 py-3 text-base md:text-lg font-medium text-white bg-neutral-800 rounded-md shadow-md transition-all duration-300 ease-in-out hover:bg-neutral-700 hover:shadow-lg"
        >
          Hire Me
        </Button>
      </motion.div>
    </div>
  );
}
