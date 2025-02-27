"use client";

import { motion } from "framer-motion";
import {
  FaReact,
  FaNodeJs,
  FaHtml5,
  FaCss3Alt,
  FaJs,
  FaGitAlt,
} from "react-icons/fa";
import {
  SiNextdotjs,
  SiTailwindcss,
  SiTypescript,
  SiMongodb,
  SiExpress,
} from "react-icons/si";

const skills = [
  { name: "React.js", icon: <FaReact className="text-blue-400" /> },
  {
    name: "Next.js",
    icon: <SiNextdotjs className="text-black dark:text-white" />,
  },
  { name: "Node.js", icon: <FaNodeJs className="text-green-500" /> },
  { name: "Express.js", icon: <SiExpress className="text-gray-500" /> },
  { name: "MongoDB", icon: <SiMongodb className="text-green-700" /> },
  { name: "JavaScript", icon: <FaJs className="text-yellow-500" /> },
  { name: "TypeScript", icon: <SiTypescript className="text-blue-500" /> },
  { name: "HTML5", icon: <FaHtml5 className="text-orange-500" /> },
  { name: "CSS3", icon: <FaCss3Alt className="text-blue-500" /> },
  { name: "Tailwind CSS", icon: <SiTailwindcss className="text-blue-400" /> },
  { name: "Git", icon: <FaGitAlt className="text-red-500" /> },
];

export default function SkillsShowcase() {
  return (
    <motion.div className="flex flex-col items-center justify-center w-full overflow-hidden">
      <motion.h2
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
        viewport={{ once: true, amount: 0.5 }}
        className="bg-clip-text text-transparent bg-gradient-to-b from-neutral-500 to-neutral-600 dark:from-neutral-50 dark:to-neutral-300 text-4xl md:text-6xl text-center font-bold tracking-wide leading-tight"
      >
        My Tech Stack & Expertise
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        viewport={{ once: true, amount: 0.5 }}
        className="max-w-4xl text-center mt-4 text-base md:text-xl text-neutral-700 dark:text-neutral-300"
      >
        A collection of tools and technologies that I specialize in, ensuring
        high-performance, scalable, and visually stunning web applications.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
        viewport={{ once: true, amount: 0.5 }}
        className="relative w-full mt-10 overflow-x-hidden py-4"
      >
        <motion.div
          className="flex whitespace-nowrap"
          animate={{ x: ["0%", "-500%"] }}
          transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
        >
          {[...skills, ...skills, ...skills, ...skills].map((skill, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg dark:shadow-gray-800 mx-4 min-w-[150px]"
            >
              <div className="text-5xl">{skill.icon}</div>
              <p className="mt-3 text-lg font-semibold text-gray-800 dark:text-gray-200">
                {skill.name}
              </p>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
