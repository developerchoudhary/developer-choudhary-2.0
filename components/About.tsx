"use client";

import { motion } from "framer-motion";
import { FaQuoteLeft, FaQuoteRight } from "react-icons/fa";

// Define animation variants for reuse
const fadeInUp = (delay: number = 0.2) => ({
  initial: { opacity: 0, y: 100 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: "easeOut", delay },
  viewport: { once: true, amount: 0.5 },
});

export default function AboutPage() {
  return (
    <motion.section className="relative flex flex-col items-center w-full justify-center text-center">
      {/* Heading */}
      <motion.h1
        {...fadeInUp(0.1)}
        className="flex items-center gap-2 text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-500 dark:from-gray-200 dark:to-gray-400"
      >
        <FaQuoteLeft
          className="text-gray-400 dark:text-gray-500"
          aria-hidden="true"
        />
        <span className="bg-clip-text text-transparent bg-gradient-to-b from-neutral-500 to-neutral-600 dark:from-neutral-50 dark:to-neutral-300 text-4xl md:text-6xl font-bold tracking-wide leading-tight">
          About Me
        </span>
        <FaQuoteRight
          className="text-gray-400 dark:text-gray-500"
          aria-hidden="true"
        />
      </motion.h1>

      {/* Content Section */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-12 mt-10 w-full">
        <article className="flex flex-col gap-6 text-left text-neutral-700 dark:text-neutral-300">
          {/* Introduction */}
          <motion.p {...fadeInUp(0.2)}>
            Hi, I&apos;m{" "}
            <span className="font-bold text-gray-900 dark:text-white">
              Aman
            </span>
            , also known as{" "}
            <span className="font-bold text-gray-900 dark:text-white">
              Developer Choudhary
            </span>
            . I am a Full Stack Web Developer based in Sri Ganganagar,
            Rajasthan. I specialize in crafting high-performance web
            applications with modern technologies like{" "}
            <span className="font-semibold">
              React.js, Next.js, Tailwind CSS, and Node.js
            </span>
            .
          </motion.p>

          {/* Education & Background */}
          <motion.p {...fadeInUp(0.3)} className="sm:text-lg">
            My journey began in Anupgarh, where I developed a passion for
            coding. Later, I earned my{" "}
            <span className="font-semibold">
              BCA from Seth G.L Bihani S.D (P.G) College, Sri Ganganagar
              (2021-2024)
            </span>
            , which laid a strong foundation for my career.
          </motion.p>

          {/* What I Do */}
          <motion.div {...fadeInUp(0.4)}>
            <h2 className="text-lg sm:text-xl font-semibold">What I Do:</h2>
            <ul className="list-disc pl-6 text-lg">
              {[
                "Build dynamic, responsive websites.",
                "Develop powerful admin panels.",
                "Design and implement seamless UI/UX.",
                "Integrate payment systems and OTP features.",
                "Build scalable backends with Node.js & Express.js.",
              ].map((task, index) => (
                <motion.li key={index} {...fadeInUp(0.5 + index * 0.1)}>
                  {task}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Additional Info */}
          <motion.p {...fadeInUp(1)} className="text-lg">
            Passionate about learning, I mastered{" "}
            <span className="font-semibold">Next.js in just three days</span>,
            showcasing my dedication to growth and innovation.
          </motion.p>

          <motion.p {...fadeInUp(1.1)} className="text-lg">
            Let&apos;s connect and build something amazing!
          </motion.p>
        </article>
      </div>
    </motion.section>
  );
}
