"use client";

import About from "@/components/About";
import Contact from "@/components/Contact";
import Hero from "@/components/Hero";
import ProjectShowcase from "@/components/Showcase";
import SkillsShowcase from "@/components/Skills";

export default function Home() {
  return (
    <div className="flex flex-col justify-center items-center overflow-hidden px-6 w-full">
      <section>
        {/* Hero section */}
        <Hero />
      </section>

      {/* Projects Section */}
      <section
        id="project-showcase"
        className="max-w-7xl mx-auto w-full mb-10 lg:mb-20"
      >
        <ProjectShowcase />
      </section>

      {/* Skills Section */}
      <section id="skills" className="max-w-7xl mx-auto w-full my-10 lg:my-20">
        <SkillsShowcase />
      </section>

      {/* About Section */}
      <section id="about" className="max-w-7xl mx-auto w-full my-10 lg:my-20">
        <About />
      </section>

      {/* Contact Section */}
      <section id="contact" className="max-w-7xl mx-auto w-full my-10 lg:my-20">
        <Contact />
      </section>
    </div>
  );
}
