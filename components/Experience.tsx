"use client";
import { motion } from "framer-motion";
import { Briefcase } from "lucide-react";

const Experience = () => {
  return (
    <motion.div className="relative flex flex-col items-center w-full justify-center text-center">
      <motion.h1
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
        viewport={{ once: true, amount: 0.5 }}
        className="flex flex-wrap justify-center items-center gap-2 text-4xl md:text-6xl font-bold "
      >
        <Briefcase className="w-10 h-10 text-gray-500 dark:text-gray-400" />
        <span className="bg-clip-text text-transparent bg-gradient-to-b from-neutral-500 to-neutral-600 dark:from-neutral-50 dark:to-neutral-300 text-4xl md:text-6xl font-bold tracking-wide leading-tight">
          Work Experience
        </span>
      </motion.h1>

      <div className="flex flex-col md:flex-row items-center justify-center gap-12 mt-10 w-full">
        {/* Experience Details */}
        <div className="flex flex-col gap-6 text-left text-neutral-700 dark:text-neutral-300 rounded-2xl w-full">
          <motion.h3
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            viewport={{ once: true, amount: 0.5 }}
            className="text-2xl font-bold text-gray-800 dark:text-white"
          >
            Website Developer
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
            viewport={{ once: true, amount: 0.5 }}
            className="text-gray-600 dark:text-gray-300"
          >
            <span className="font-semibold text-gray-900 dark:text-white">
              Seth G.L. Bihani Shiksha Trust, Sri Ganganagar
            </span>{" "}
            | First Job
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
            viewport={{ once: true, amount: 0.5 }}
            className="mt-2 sm:text-lg text-gray-700 dark:text-gray-300"
          >
            I am responsible for maintaining six existing .NET-based websites
            while developing seven new dynamic websites with advanced features
            for the trust, which manages multiple colleges and schools.
          </motion.p>
          <ul className="mt-3 space-y-2 sm:text-lg text-gray-700 dark:text-gray-300 list-disc pl-6">
            <motion.li
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
              viewport={{ once: true, amount: 0.5 }}
            >
              ⚡ Maintaining and updating six .NET-based websites.
            </motion.li>
            <motion.li
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.6 }}
              viewport={{ once: true, amount: 0.5 }}
            >
              ⚡ Creating seven new dynamic websites with enhanced functionality
              using{" "}
              <span className="font-semibold">
                Next.js, MongoDB, Cloudinary
              </span>
              , etc.
            </motion.li>
            <motion.li
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.7 }}
              viewport={{ once: true, amount: 0.5 }}
            >
              ⚡ Implementing modern UI/UX principles for better user
              experience.
            </motion.li>
            <motion.li
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.8 }}
              viewport={{ once: true, amount: 0.5 }}
            >
              ⚡ Optimizing website performance and security.
            </motion.li>
            <motion.li
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.9 }}
              viewport={{ once: true, amount: 0.5 }}
            >
              ⚡ Managing databases and backend integrations.
            </motion.li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
};

export default Experience;
