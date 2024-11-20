"use client";
import { title } from "@/components/primitives";
import { Image, Link } from "@nextui-org/react";
import { FaQuoteLeft } from "react-icons/fa";
import { FaQuoteRight } from "react-icons/fa";

export default function AboutPage() {
  return (
    <div className="flex flex-col gap-4 px-3 mt-24 mb-10">
      <h1 className="flex gap-2">
        <FaQuoteLeft />
        <span className={title()}>About Me</span>
        <FaQuoteRight />
      </h1>
      <div className="flex max-md:flex-col-reverse w-full gap-10">
        <section className="w-full flex flex-col gap-3">
          <p>
            Hi, I&apos;m Aman, also known as Developer Choudhary, a passionate
            Full Stack Web Developer based in Jaipur, Rajasthan. I specialize in
            creating innovative and user-friendly web applications. With a solid
            foundation in JavaScript, HTML, CSS, and frameworks like React.js,
            Next.js, and Tailwind CSS, I focus on building seamless,
            high-performance websites that deliver exceptional user experiences.
          </p>
          <p>
            My academic journey began in Anupgarh, where I completed my
            schooling and developed an interest in technology. Later, I pursued
            a Bachelor of Computer Applications (BCA) at Seth G.L Bihani S.D
            (P.G) College, Sri Ganganagar (2021-2024). This experience enhanced
            my understanding of programming and web technologies, setting the
            stage for my career in development.
          </p>
          <p>I&apos;ve worked on diverse projects, including:</p>
          <ul className="list-disc pl-6">
            <li>Developing interactive websites.</li>
            <li>Creating robust admin panels.</li>
            <li>Designing and implementing responsive UI/UX.</li>
            <li>Building scalable APIs.</li>
            <li>
              Integrating payment methods and advanced features like email and
              OTP functionality.
            </li>
            <li>Building scalable backends with Node.js and Express.js.</li>
          </ul>
          <p>
            I&apos;m always eager to explore emerging technologies. A quick
            learner at heart, I once mastered Next.js in just three days,
            showcasing my dedication to growth and innovation.
          </p>
          <p>
            Let&apos;s <Link href="/contact">connect</Link> and create something
            extraordinary together! 🚀
          </p>
        </section>
        <section className="flex justify-end">
          <Image
            src="/developerchoudhary.jpeg"
            alt="developer image"
            className="aspect-square md:h-[33rem]"
          />
        </section>
      </div>
    </div>
  );
}
