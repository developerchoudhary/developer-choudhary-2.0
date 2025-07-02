"use client";

import { motion } from "framer-motion";
import {
  FaCode,
  FaLaptopCode,
  FaRocket,
  FaGraduationCap,
  FaMapMarkerAlt,
  FaEnvelope,
} from "react-icons/fa";
import Link from "next/link";

// Stats and skills for About section
const stats = [
  { number: "3+", label: "Years Experience", icon: FaCode },
  { number: "50+", label: "Projects Completed", icon: FaLaptopCode },
  { number: "100%", label: "Client Satisfaction", icon: FaRocket },
];

const skills = [
  "React.js",
  "Next.js",
  "Node.js",
  "TypeScript",
  "Tailwind CSS",
  "MongoDB",
];

// About Section: Bio, stats, skills, and call-to-action
export default function AboutPage() {
  return (
    <section className="py-20 px-4 md:px-6 relative">
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
            <span className="text-gray-900 dark:text-white">About</span>
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              {" "}
              Me
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Passionate Full-Stack Developer crafting exceptional digital
            experiences
          </p>
        </motion.div>

        {/* Stats Cards: Responsive grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              viewport={{ once: true }}
              className="glass p-6 text-center hover:transform hover:scale-105 transition-all duration-300"
            >
              <stat.icon className="w-8 h-8 text-blue-600 dark:text-cyan-400 mx-auto mb-4" />
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {stat.number}
              </div>
              <div className="text-gray-600 dark:text-gray-300">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content Grid: Responsive two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Column - Bio and Quick Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {/* Bio Card */}
            <div className="glass p-8">
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                My Story
              </h3>
              <div className="space-y-4 text-gray-600 dark:text-gray-300 leading-relaxed">
                <p>
                  Hi, I&apos;m
                  <span className="font-semibold text-blue-600 dark:text-cyan-400">
                    Aman Choudhary
                  </span>
                  , a passionate Full-Stack Developer from Sri Ganganagar,
                  Rajasthan. My journey in web development began with a
                  curiosity to build things that make a difference.
                </p>
                <p>
                  I earned my <span className="font-semibold">BCA degree</span>{" "}
                  from Seth G.L Bihani S.D (P.G) College, which provided me with
                  a solid foundation in computer science and programming
                  principles.
                </p>
                <p>
                  What drives me is the ability to transform ideas into reality
                  through code. I specialize in modern web technologies and love
                  creating seamless, user-friendly experiences that solve real
                  problems.
                </p>
              </div>
            </div>

            {/* Quick Info Card */}
            <div className="glass p-6">
              <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Quick Info
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <FaMapMarkerAlt className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                  <span className="text-gray-600 dark:text-gray-300">
                    Sri Ganganagar, Rajasthan
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <FaGraduationCap className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                  <span className="text-gray-600 dark:text-gray-300">
                    BCA Graduate (2021-2024)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <FaEnvelope className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                  <span className="text-gray-600 dark:text-gray-300">
                    Available for new opportunities
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Skills & Services */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {/* Core Skills Card */}
            <div className="glass p-8">
              <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                Core Skills
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {skills.map((skill, index) => (
                  <motion.div
                    key={skill}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-2 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg"
                  >
                    <div className="w-2 h-2 bg-blue-600 dark:bg-cyan-400 rounded-full"></div>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      {skill}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* What I Do Card */}
            <div className="glass p-8">
              <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                What I Do
              </h3>
              <div className="space-y-4">
                {[
                  "Build dynamic, responsive websites with modern frameworks",
                  "Develop powerful admin panels and dashboards",
                  "Design seamless UI/UX experiences",
                  "Integrate payment systems and authentication",
                  "Build scalable backend APIs and services",
                  "Optimize performance and ensure accessibility",
                ].map((service, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-2 h-2 bg-blue-600 dark:bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-600 dark:text-gray-300">
                      {service}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Call to Action: Centered and responsive */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="glass p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Ready to Build Something Amazing?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Let&apos;s collaborate and bring your ideas to life with
              cutting-edge technology and creative solutions.
            </p>
            <Link
              href="#contact"
              className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              Get In Touch
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
