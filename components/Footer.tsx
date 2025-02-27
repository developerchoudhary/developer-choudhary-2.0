"use client";
import { Link } from "@nextui-org/link";
import React from "react";
import { FcLike } from "react-icons/fc";
import { motion } from "framer-motion";

const Footer = () => {
  return (
    <footer className="w-full flex max-sm:flex-col max-sm:items-center gap-1 text-center justify-between px-8 py-1">
      <motion.span
        initial={{ opacity: 0, x: -100 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        viewport={{ once: true, amount: 0.5 }}
        className="text-sm"
      >
        © 2024 Developer Choudhary. All Rights Reserved.
      </motion.span>
      <Link
        isExternal
        className="text-black dark:text-white text-sm flex gap-1"
        href="https://developerchoudhary.vercel.app/"
        title="Aman Choudhary"
      >
        <motion.p
          initial={{ opacity: 0, x: 100 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          viewport={{ once: true, amount: 0.5 }}
          className="flex text-sm items-center justify-center"
        >
          <span>Made with</span>{" "}
          <span>
            <FcLike className="mx-2" />
          </span>{" "}
          <span> by Developer Choudhary </span>
        </motion.p>
      </Link>
    </footer>
  );
};

export default Footer;
