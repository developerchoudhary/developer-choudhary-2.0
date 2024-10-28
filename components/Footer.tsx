import { Link } from "@nextui-org/link";
import React from "react";
import { FcLike } from "react-icons/fc";

const Footer = () => {
  return (
    <footer className="w-full flex max-sm:flex-col max-sm:items-center gap-1 text-center justify-between px-4 py-1">
      <span className="text-sm">
        © 2024 Developer Choudhary. All Rights Reserved.
      </span>
      <Link
        isExternal
        className="text-black dark:text-white text-sm flex gap-1"
        href="https://developerchoudhary.vercel.app/"
        title="Aman Choudhary"
      >
        <p className="flex text-sm items-center justify-center">
          <span>Made with</span>{" "}
          <span>
            <FcLike className="mx-2" />
          </span>{" "}
          <span> by Developer Choudhary </span>
        </p>
      </Link>
    </footer>
  );
};

export default Footer;
