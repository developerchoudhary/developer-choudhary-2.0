"use client";
import { useState, useEffect, useCallback } from "react";
import { Button, Card, CardHeader, CardBody } from "@nextui-org/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaAngleLeft,
  FaAngleRight,
  FaExternalLinkAlt,
  FaGithub,
  FaTimes,
} from "react-icons/fa";
import { Project, products } from "@/config/site";
import Image from "next/image";

// Projects/Showcase Section: Interactive project cards, filtering, and detail modal
export default function ProjectShowcase() {
  // State for pagination, filtering, search, hover, and modal
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [filter, setFilter] = useState<"all" | Project["category"]>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Project categories for filtering
  const categories = [
    "all",
    "frontend",
    "fullstack",
    "backend",
    "other",
  ] as const;

  // Responsive items per page
  const updateItemsPerPage = useCallback(() => {
    if (window.innerWidth >= 1024) {
      setItemsPerPage(6);
    } else if (window.innerWidth >= 768) {
      setItemsPerPage(4);
    } else {
      setItemsPerPage(2);
    }
    setCurrentPage(1);
  }, []);

  useEffect(() => {
    updateItemsPerPage();
    window.addEventListener("resize", updateItemsPerPage);
    return () => window.removeEventListener("resize", updateItemsPerPage);
  }, [updateItemsPerPage]);

  // Filter and search logic
  const filteredProjects = products.filter((project) => {
    const matchesFilter = filter === "all" || project.category === filter;
    const matchesSearch =
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchTerm]);
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * itemsPerPage,
    Math.min(currentPage * itemsPerPage, filteredProjects.length)
  );

  return (
    <section id="projects" className="py-10 px-4 md:px-6 relative">
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
            <span className="text-gray-900 dark:text-white">Featured</span>
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              {" "}
              Projects
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            A showcase of my best work, demonstrating creativity, technical
            skills, and problem-solving abilities
          </p>
        </motion.div>

        {/* Search and Filter Controls: Responsive flex layout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white transition-colors glass"
              />
            </div>
            {/* Category Filters */}
            <div className="flex flex-wrap gap-3 justify-center md:justify-end">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setFilter(category)}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                    filter === category
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg"
                      : "bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Project Grid: Responsive grid layout */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
        >
          {paginatedProjects.map((project, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
              onHoverStart={() => setHoveredProject(index)}
              onHoverEnd={() => setHoveredProject(null)}
            >
              {/* Project Card */}
              <Card
                isPressable
                onPress={() => setSelectedProject(project)}
                className="glass h-full overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
                  <div className="flex justify-between items-start w-full">
                    <div className="flex flex-col items-start">
                      <h4 className="font-bold text-lg text-gray-900 dark:text-white">
                        {project.title}
                      </h4>
                      <small className="text-gray-600 dark:text-gray-400">
                        {project.subtitle}
                      </small>
                    </div>
                    <span className="px-3 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 font-medium">
                      {project.category}
                    </span>
                  </div>
                </CardHeader>
                <CardBody className="overflow-visible py-4">
                  <div className="relative group">
                    <Image
                      alt={project.title}
                      className="object-cover rounded-xl transition-all duration-300"
                      src={project.img}
                      width={270}
                      height={180}
                      style={{ width: "100%", height: "auto" }}
                    />
                    {/* Hover overlay with action buttons */}
                    <AnimatePresence>
                      {hoveredProject === index && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-black/70 rounded-xl flex items-center justify-center gap-4"
                        >
                          <Button
                            isIconOnly
                            variant="flat"
                            className="bg-white/20 backdrop-blur-lg"
                            onPress={() => {
                              window.open(project.link, "_blank");
                            }}
                          >
                            <FaExternalLinkAlt className="w-5 h-5" />
                          </Button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mt-4 line-clamp-2">
                    {project.description}
                  </p>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Pagination: Responsive flex layout */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            viewport={{ once: true }}
            className="flex justify-center items-center gap-4"
          >
            <Button
              isIconOnly
              variant="flat"
              disabled={currentPage === 1}
              onPress={() => setCurrentPage(currentPage - 1)}
              className="bg-white/50 dark:bg-gray-800/50"
            >
              <FaAngleLeft />
            </Button>
            <span className="text-gray-600 dark:text-gray-300">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              isIconOnly
              variant="flat"
              disabled={currentPage === totalPages}
              onPress={() => setCurrentPage(currentPage + 1)}
              className="bg-white/50 dark:bg-gray-800/50"
            >
              <FaAngleRight />
            </Button>
          </motion.div>
        )}

        {/* Project Detail Modal: Responsive modal for project details */}
        <AnimatePresence>
          {selectedProject && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedProject(null)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="glass max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-2xl p-8"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {selectedProject.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedProject.subtitle}
                    </p>
                  </div>
                  <Button
                    isIconOnly
                    variant="flat"
                    onPress={() => setSelectedProject(null)}
                    className="bg-white/50 dark:bg-gray-800/50"
                  >
                    <FaTimes />
                  </Button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <Image
                      alt={selectedProject.title}
                      src={selectedProject.img}
                      width={400}
                      height={300}
                      className="rounded-xl w-full"
                    />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Description
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        {selectedProject.description}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Technologies
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedProject.technologies?.map((tech, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-4 pt-4">
                      {selectedProject.github && (
                        <Button
                          variant="flat"
                          className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                          onPress={() =>
                            window.open(selectedProject.github, "_blank")
                          }
                        >
                          <FaGithub className="mr-2" />
                          View Code
                        </Button>
                      )}
                      <Button
                        variant="flat"
                        className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                        onPress={() =>
                          window.open(selectedProject.link, "_blank")
                        }
                      >
                        <FaExternalLinkAlt className="mr-2" />
                        Live Demo
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
