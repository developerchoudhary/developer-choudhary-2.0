"use client";
import { Button, Image } from "@nextui-org/react";
import Link from "next/link";

import { products } from "@/config/site";

export default function ShowcasePage() {
  return (
    <div className="lg:mx-20 sm:mx-10 mx-2 mb-20">
      <div className="mb-10 mx-auto py-20 md:py-40 px-4 w-full left-0 top-0">
        <h1 className="text-2xl md:text-7xl font-bold dark:text-white">
          A Small Collection of My Best Work
        </h1>
        <p className="max-w-2xl text-base md:text-xl mt-8 dark:text-neutral-200">
          Discover a selection of my top web development projects, showcasing
          expertise in creating modern, responsive, and user-friendly solutions
          using the latest technologies.
        </p>
      </div>
      <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 justify-center items-center gap-10">
        {products.map((product, idx) => (
          <div
            key={idx}
            className="w-full h-full relative p-3 rounded-xl text-white dark:bg-white/20 bg-black/20 overflow-hidden"
          >
            <div className="group">
              {/* Image Component */}
              <Image
                alt={product.title}
                className="h-full w-full rounded-none object-cover transition-opacity duration-300 group-hover:opacity-0"
                src={product.thumbnail}
              />

              {/* Video Component */}
              <video
                autoPlay
                loop
                muted
                aria-label={product.title}
                className="absolute inset-0 h-fit hidden p-3 group-hover:block w-full object-cover"
              >
                <source src={product.video} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
            {/* Title Overlay */}
            <span className="min-h-fit flex font-semibold px-4 text-sm pt-2 items-center w-full justify-between">
              {product.title}
              <Link href={product.link} target="_black" className="z-10">
                <Button className="h-8 rounded-md" color="danger">
                  Take a Look
                </Button>
              </Link>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
