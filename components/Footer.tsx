"use client";
import { Link } from "@nextui-org/link";
import React from "react";
import { FcLike } from "react-icons/fc";
import {
  FaInstagram,
  FaGithub,
  FaWhatsapp,
  FaArrowUp,
  FaFacebook,
} from "react-icons/fa";
import { motion } from "framer-motion";
import ThemeToggle from "./ui/ThemeToggle";

/**
 * Footer Component
 * Displays copyright information and a credit section with an animated heart icon.
 */
const Footer = () => {
  // Scroll to top handler
  const scrollToTop = () => {
    document.getElementById("top")?.scrollIntoView({ behavior: "smooth" });
  };

  // Social media links
  const socialLinks = [
    {
      icon: FaGithub,
      url: "https://github.com/developerchoudhary",
      label: "GitHub",
    },
    {
      icon: FaInstagram,
      url: "https://www.instagram.com/developer_choudhary/",
      label: "Instagram",
    },
    {
      icon: FaFacebook,
      url: "https://www.facebook.com/DeveloperChoudhary",
      label: "Facebook",
    },
    {
      icon: FaWhatsapp,
      url: "https://wa.me/919530363236",
      label: "WhatsApp",
    },
  ];

  // Quick navigation links
  const quickLinks = [
    { name: "About", href: "#about" },
    { name: "Skills", href: "#skills" },
    { name: "Projects", href: "#projects" },
    { name: "Experience", href: "#experience" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <footer className="relative mt-10">
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      {/* Scroll to top button: Fixed floating button */}
      <motion.button
        onClick={scrollToTop}
        initial={{ opacity: 0, scale: 0 }}
        whileInView={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 0.3 }}
        viewport={{ once: true }}
        className="fixed bottom-6 right-6 z-50 p-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
        aria-label="Scroll to top"
      >
        <FaArrowUp className="w-5 h-5" />
      </motion.button>

      {/* Main footer content: Responsive grid */}
      <div className="glass border-t border-white/20">
        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* Top section: Brand, quick links, contact info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Brand section: Name, description, social links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center md:text-left"
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Aman Choudhary
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Full-Stack Developer passionate about creating exceptional
                digital experiences.
              </p>
              <div className="flex justify-center md:justify-start gap-4">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-cyan-400"
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5" />
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Quick links: Navigation to all sections */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-center md:text-left"
            >
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Links
              </h4>
              <ul className="space-y-2">
                {quickLinks.map((link, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Link
                      href={link.href}
                      className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Contact info: Email, phone, location */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-center md:text-left"
            >
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Get In Touch
              </h4>
              <div className="space-y-2 text-gray-600 dark:text-gray-300">
                <p>contact@developerchoudhary.com</p>
                <p>+91 95303 63236</p>
                <p>Sri Ganganagar, Rajasthan</p>
              </div>
            </motion.div>
          </div>

          {/* Bottom section: Copyright and credit */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
            className="border-t border-white/20 pt-8"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Copyright */}
              <div className="text-center md:text-left">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  © 2024 Aman Choudhary. All Rights Reserved.
                </p>
              </div>

              {/* Made with love credit */}
              <Link
                isExternal
                className="text-gray-600 dark:text-gray-300 text-sm flex items-center gap-2 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors"
                href="https://developerchoudhary.vercel.app/"
                title="Aman Choudhary's Portfolio"
              >
                <span>Made with</span>
                <FcLike className="mx-1" />
                <span>by Developer Choudhary</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
