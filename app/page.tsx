"use client";

import About from "@/components/About";
import Contact from "@/components/Contact";
import Experience from "@/components/Experience";
import Hero from "@/components/Hero";
import ProjectShowcase from "@/components/Showcase";
import SkillsShowcase from "@/components/Skills";

/**
 * Home page component that organizes different sections of the portfolio.
 */
export default function Home() {
  return (
    <div className="flex flex-col justify-center items-center overflow-hidden w-full">
      {/* Hero Section - Introduction and main heading */}
      <section id="top" className="max-w-7xl mx-auto w-full">
        <Hero />
      </section>

      {/* Projects Section - Showcases work and completed projects */}
      <section id="projects" className="max-w-7xl mx-auto w-full">
        <ProjectShowcase />
      </section>

      {/* Skills Section - Displays technical skills */}
      <section id="skills" className="max-w-7xl mx-auto w-full">
        <SkillsShowcase />
      </section>

      {/* About Section - Personal and professional background */}
      <section id="about" className="max-w-7xl mx-auto w-full">
        <About />
      </section>

      {/* Experience Section - Work history and experience details */}
      <section id="experience" className="max-w-7xl mx-auto w-full">
        <Experience />
      </section>

      {/* Contact Section - Contact details and form */}
      <section id="contact" className="max-w-7xl mx-auto w-full">
        <Contact />
      </section>
    </div>
  );
}
