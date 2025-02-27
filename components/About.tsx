"use client";
import { motion } from "framer-motion";
import { FaQuoteLeft, FaQuoteRight } from "react-icons/fa";

export default function AboutPage() {
  return (
    <motion.div className="relative flex flex-col items-center w-full justify-center text-center">
      <motion.h1
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
        viewport={{ once: true, amount: 0.5 }}
        className="flex items-center gap-2 text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-500 dark:from-gray-200 dark:to-gray-400"
      >
        <FaQuoteLeft className="text-gray-400 dark:text-gray-500" />
        <span className="bg-clip-text text-transparent bg-gradient-to-b from-neutral-500 to-neutral-600 dark:from-neutral-50 dark:to-neutral-300 text-4xl md:text-6xl font-bold tracking-wide leading-tight">
          About Me
        </span>
        <FaQuoteRight className="text-gray-400 dark:text-gray-500" />
      </motion.h1>
      <div className="flex flex-col md:flex-row items-center justify-center gap-12 mt-10 w-full">
        {/* Text Section */}
        <div className="flex flex-col gap-6 text-left text-neutral-700 dark:text-neutral-300">
          <motion.p
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            viewport={{ once: true, amount: 0.5 }}
          >
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
          <motion.p
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
            viewport={{ once: true, amount: 0.5 }}
            className="sm:text-lg"
          >
            My journey began in Anupgarh, where I developed a passion for
            coding. Later, I earned my{" "}
            <span className="font-semibold">
              BCA from Seth G.L Bihani S.D (P.G) College, Sri Ganganagar
              (2021-2024)
            </span>
            , which laid a strong foundation for my career.
          </motion.p>
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
              viewport={{ once: true, amount: 0.5 }}
              className="text-lg sm:text-xl font-semibold"
            >
              What I Do:
            </motion.h2>
            <ul className="list-disc pl-6 text-lg">
              <motion.li
                initial={{ opacity: 0, y: 100 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
                viewport={{ once: true, amount: 0.5 }}
              >
                Build dynamic, responsive websites.
              </motion.li>
              <motion.li
                initial={{ opacity: 0, y: 100 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.6 }}
                viewport={{ once: true, amount: 0.5 }}
              >
                Develop powerful admin panels.
              </motion.li>
              <motion.li
                initial={{ opacity: 0, y: 100 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.7 }}
                viewport={{ once: true, amount: 0.5 }}
              >
                Design and implement seamless UI/UX.
              </motion.li>
              <motion.li
                initial={{ opacity: 0, y: 100 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.8 }}
                viewport={{ once: true, amount: 0.5 }}
              >
                Integrate payment systems and OTP features.
              </motion.li>
              <motion.li
                initial={{ opacity: 0, y: 100 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.9 }}
                viewport={{ once: true, amount: 0.5 }}
              >
                Build scalable backends with Node.js & Express.js.
              </motion.li>
            </ul>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            className="text-lg"
          >
            Passionate about learning, I mastered{" "}
            <span className="font-semibold">Next.js in just three days</span>,
            showcasing my dedication to growth and innovation.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 1.1 }}
            viewport={{ once: true, amount: 0.5 }}
            className="text-lg"
          >
            Let&apos;s connect and build something amazing!
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
}
