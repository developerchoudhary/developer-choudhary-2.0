"use client";

import { motion } from "framer-motion";
import {
  FaReact,
  FaNodeJs,
  FaHtml5,
  FaCss3Alt,
  FaJs,
  FaGitAlt,
  FaDatabase,
  FaServer,
  FaPalette,
} from "react-icons/fa";
import {
  SiNextdotjs,
  SiTailwindcss,
  SiTypescript,
  SiMongodb,
  SiExpress,
  SiFigma,
  SiVercel,
} from "react-icons/si";
import Link from "next/link";

// Skill categories and additional skills for the Skills section
const skillCategories = [
  {
    name: "Frontend Development",
    icon: FaPalette,
    description: "Building beautiful, responsive user interfaces",
    skills: [
      {
        name: "React.js",
        icon: FaReact,
        color: "text-blue-500",
        proficiency: 90,
      },
      {
        name: "Next.js",
        icon: SiNextdotjs,
        color: "text-black dark:text-white",
        proficiency: 85,
      },
      {
        name: "JavaScript",
        icon: FaJs,
        color: "text-yellow-500",
        proficiency: 95,
      },
      {
        name: "TypeScript",
        icon: SiTypescript,
        color: "text-blue-600",
        proficiency: 80,
      },
      {
        name: "HTML5",
        icon: FaHtml5,
        color: "text-orange-500",
        proficiency: 95,
      },
      {
        name: "CSS3",
        icon: FaCss3Alt,
        color: "text-blue-500",
        proficiency: 90,
      },
      {
        name: "Tailwind CSS",
        icon: SiTailwindcss,
        color: "text-cyan-500",
        proficiency: 85,
      },
    ],
  },
  {
    name: "Backend Development",
    icon: FaServer,
    description: "Creating robust server-side applications",
    skills: [
      {
        name: "Node.js",
        icon: FaNodeJs,
        color: "text-green-500",
        proficiency: 85,
      },
      {
        name: "Express.js",
        icon: SiExpress,
        color: "text-gray-600",
        proficiency: 80,
      },
      {
        name: "MongoDB",
        icon: SiMongodb,
        color: "text-green-600",
        proficiency: 75,
      },
    ],
  },
  {
    name: "Development Tools",
    icon: FaDatabase,
    description: "Essential tools for modern development",
    skills: [
      { name: "Git", icon: FaGitAlt, color: "text-red-500", proficiency: 85 },
      {
        name: "Figma",
        icon: SiFigma,
        color: "text-purple-500",
        proficiency: 75,
      },
      {
        name: "Vercel",
        icon: SiVercel,
        color: "text-black dark:text-white",
        proficiency: 80,
      },
    ],
  },
];

const additionalSkills = [
  "REST APIs",
  "GraphQL",
  "JWT",
  "OAuth",
  "Responsive Design",
  "Progressive Web Apps",
  "SEO",
  "Performance Optimization",
  "Testing (Jest)",
  "CI/CD",
  "Docker",
  "AWS",
  "UI/UX Design",
  "Wireframing",
  "Prototyping",
  "User Research",
];

// Animated progress bar for skill proficiency
const SkillProgressBar = ({ proficiency }: { proficiency: number }) => (
  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
    <motion.div
      initial={{ width: 0 }}
      whileInView={{ width: `${proficiency}%` }}
      transition={{ duration: 1, ease: "easeOut" }}
      viewport={{ once: true }}
      className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
    />
  </div>
);

// Skills Section: Categories, additional skills, and call-to-action
export default function SkillsShowcase() {
  return (
    <section id="skills" className="py-10 px-4 md:px-6 relative">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gray-900 dark:text-white">Technical</span>
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              {" "}
              Skills
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            A comprehensive collection of technologies and tools I use to create
            exceptional digital experiences
          </p>
        </motion.div>

        {/* Skills Categories: Responsive grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {skillCategories.map((category, categoryIndex) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: categoryIndex * 0.2 }}
              viewport={{ once: true }}
              className="glass p-8 hover:transform hover:scale-105 transition-all duration-300"
            >
              {/* Category Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <category.icon className="w-6 h-6 text-blue-600 dark:text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {category.description}
                  </p>
                </div>
              </div>

              {/* Skills List */}
              <div className="space-y-4">
                {category.skills.map((skill, skillIndex) => (
                  <motion.div
                    key={skill.name}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: 0.3 + skillIndex * 0.1,
                    }}
                    viewport={{ once: true }}
                    className="group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <skill.icon className={`w-5 h-5 ${skill.color}`} />
                        <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                          {skill.name}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-blue-600 dark:text-cyan-400">
                        {skill.proficiency}%
                      </span>
                    </div>
                    <SkillProgressBar proficiency={skill.proficiency} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Skills: Responsive grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <div className="glass p-8">
            <h3 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">
              Additional Skills & Tools
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {additionalSkills.map((skill, index) => (
                <motion.div
                  key={skill}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 1.0 + index * 0.05 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-2 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  <div className="w-2 h-2 bg-blue-600 dark:bg-cyan-400 rounded-full"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {skill}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Call to Action: Centered and responsive */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="glass p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Always Learning & Growing
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              I&apos;m constantly exploring new technologies and best practices
              to deliver cutting-edge solutions for my clients.
            </p>
            <Link
              href="#projects"
              className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              View My Work
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
