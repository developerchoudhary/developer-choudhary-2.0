"use client";
import { useState, useEffect, useCallback } from "react";
import { Button, Image } from "@nextui-org/react";
import { motion } from "framer-motion";
import { products } from "@/config/site";
import { Link } from "@nextui-org/link";

export default function ProjectShowcase() {
  // State to track pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  // Function to update the number of items per page based on screen width
  const updateItemsPerPage = useCallback(() => {
    if (window.innerWidth >= 1024) {
      setItemsPerPage(6);
    } else if (window.innerWidth >= 768) {
      setItemsPerPage(4);
    } else {
      setItemsPerPage(2);
    }
    setCurrentPage(1); // Reset to page 1 when resizing to prevent empty state
  }, []);

  // Effect to listen for screen resizing
  useEffect(() => {
    updateItemsPerPage(); // Set initial value
    window.addEventListener("resize", updateItemsPerPage);
    return () => window.removeEventListener("resize", updateItemsPerPage);
  }, [updateItemsPerPage]);

  // Calculate pagination
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const paginatedProducts = products.slice(
    (currentPage - 1) * itemsPerPage,
    Math.min(currentPage * itemsPerPage, products.length),
  );

  return (
    <motion.div className="flex flex-col items-center w-full text-center relative overflow-hidden">
      {/* Heading Section */}
      <motion.h1
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
        viewport={{ once: true, amount: 0.5 }}
        className="bg-clip-text text-transparent bg-gradient-to-b from-neutral-500 to-neutral-600 dark:from-neutral-50 dark:to-neutral-300 text-4xl md:text-6xl font-bold tracking-wide leading-tight"
      >
        A Small Collection of My Best Work
      </motion.h1>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
        viewport={{ once: true, amount: 0.5 }}
        className="max-w-4xl mt-4 text-base md:text-xl text-neutral-700 dark:text-neutral-300"
      >
        Discover a selection of my top web development projects, showcasing
        modern, responsive, and user-friendly solutions.
      </motion.p>

      {/* Project Grid */}
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
        viewport={{ once: true, amount: 0.5 }}
        className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-10 mt-10 w-full"
      >
        {paginatedProducts.map((product, idx) => (
          <motion.div
            key={product.id || idx} // Ensures a unique key
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.8,
              ease: "easeOut",
              delay: 0.2 + idx * 0.1,
            }}
            viewport={{ once: true, amount: 0.5 }}
            className="relative group overflow-hidden rounded-xl shadow-lg bg-neutral-900 dark:bg-white/10 backdrop-blur-md border border-neutral-900 dark:border-white/10"
          >
            {/* Thumbnail Image */}
            <div className="relative w-full h-56">
              <Image
                alt={product.title}
                src={product.thumbnail}
                className="object-cover transition-opacity duration-300 group-hover:opacity-0"
              />
            </div>

            {/* Video Preview (Shows on Hover) */}
            <video
              autoPlay
              loop
              muted
              playsInline
              aria-label={`Video preview of ${product.title}`} // Accessibility Improvement
              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <source src={product.video} type="video/mp4" />
            </video>

            {/* Gradient Overlay */}
            <div className="absolute bottom-0 left-0 z-10 right-0 h-24 bg-gradient-to-t from-black/80 to-transparent"></div>

            {/* Project Title & Visit Button */}
            <div className="absolute bottom-2 z-20 left-4 right-4 flex items-center justify-between">
              <span className="text-white text-sm font-semibold">
                {product.title}
              </span>
              <Link
                className="h-8 px-4 rounded-md bg-neutral-800 text-white hover:bg-neutral-700"
                href={product.link}
                target="_blank"
              >
                Visit
              </Link>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Pagination Controls */}
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
        viewport={{ once: true, amount: 0.5 }}
        className="flex justify-center mt-6 space-x-4"
      >
        <Button
          variant="flat"
          isDisabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        >
          Previous
        </Button>

        <span className="dark:text-white text-black" aria-live="polite">
          Page {currentPage} of {totalPages}
        </span>

        <Button
          variant="flat"
          isDisabled={currentPage === totalPages}
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
        >
          Next
        </Button>
      </motion.div>
    </motion.div>
  );
}
