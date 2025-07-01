"use client";

import { motion } from "framer-motion";
import {
  FaBriefcase,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaTrophy,
  FaCode,
  FaUsers,
} from "react-icons/fa";

// Experience data structure
interface IExperience {
  title: string;
  company: string;
  period: string;
  location: string;
  description: string[];
  technologies: string[];
  achievements: string[];
  type: "full-time" | "freelance" | "contract";
}

// Experience entries
const experiences: IExperience[] = [
  {
    title: "Full-Stack Web Developer",
    company: "Seth G.L. Bihani Shiksha Trust",
    period: "2024 - Present",
    location: "Sri Ganganagar, Rajasthan",

    type: "full-time",
    description: [
      "Led the development and maintenance of the institution&apos;s comprehensive web presence",
      "Implemented responsive design principles for optimal viewing across all devices",
      "Collaborated with stakeholders to gather requirements and deliver solutions",
      "Managed multiple projects simultaneously while maintaining high code quality",
    ],
    technologies: [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "Node.js",
      "MongoDB",
    ],
    achievements: [
      "Reduced page load time by 40% through optimization techniques",
      "Implemented SEO best practices resulting in improved search rankings",
      "Developed a user-friendly content management system",
      "Successfully maintained 6 existing .NET websites while building 7 new dynamic sites",
    ],
  },
];

// Experience Section: Card-based layout, achievements, and responsibilities
const Experience = () => {
  return (
    <section id="experience" className="py-10 px-4 md:px-6 relative">
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
            <span className="text-gray-900 dark:text-white">Work</span>
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              {" "}
              Experience
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            My professional journey in web development, showcasing growth,
            achievements, and technical expertise
          </p>
        </motion.div>

        {/* Experience Cards: Responsive vertical stack */}
        <div className="space-y-8">
          {experiences.map((exp, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="glass p-8 hover:shadow-xl transition-all duration-300"
            >
              {/* Header: Title, company, location, type */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <FaBriefcase className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {exp.title}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-4 text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <FaMapMarkerAlt className="w-4 h-4" />
                      <span>{exp.company}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaCalendarAlt className="w-4 h-4" />
                      <span>{exp.period}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 lg:mt-0">
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-medium ${
                      exp.type === "full-time"
                        ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
                        : exp.type === "freelance"
                          ? "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200"
                          : "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200"
                    }`}
                  >
                    {exp.type.charAt(0).toUpperCase() + exp.type.slice(1)}
                  </span>
                </div>
              </div>

              {/* Responsibilities List */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <FaUsers className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                  Role & Responsibilities
                </h4>
                <ul className="space-y-2">
                  {exp.description.map((desc, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-start gap-3 text-gray-600 dark:text-gray-300"
                    >
                      <div className="w-2 h-2 bg-blue-600 dark:bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span>{desc}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* Achievements Grid */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <FaTrophy className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                  Key Achievements
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {exp.achievements.map((achievement, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-start gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg"
                    >
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {achievement}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Technologies Used */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <FaCode className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                  Technologies Used
                </h4>
                <div className="flex flex-wrap gap-2">
                  {exp.technologies.map((tech, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.5 + i * 0.05 }}
                      viewport={{ once: true }}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                    >
                      {tech}
                    </motion.span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Information: Responsibilities split into two columns */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <div className="glass p-8">
            <h3 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">
              Current Responsibilities
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                  Website Maintenance
                </h4>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-600 dark:bg-cyan-400 rounded-full"></div>
                    Maintaining 6 existing .NET-based websites
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-600 dark:bg-cyan-400 rounded-full"></div>
                    Regular updates and security patches
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-600 dark:bg-cyan-400 rounded-full"></div>
                    Performance optimization and monitoring
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                  New Development
                </h4>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Building 7 new dynamic websites
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Modern tech stack implementation
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Advanced features and integrations
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Call to Action: Centered and responsive */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="glass p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Ready to Bring My Experience to Your Project?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              With years of experience in modern web development, I&apos;m ready
              to help you create exceptional digital solutions.
            </p>
            <a
              href="#contact"
              className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              Let&apos;s Work Together
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Experience;
