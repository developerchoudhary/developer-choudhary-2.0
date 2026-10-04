import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Reveal } from "./reveal";

export function CtaBand({ text, whatsapp }: { text: string; whatsapp?: string }) {
  return (
    <section className="container-dc py-10">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl bg-fg px-8 py-14 text-bg sm:px-14 sm:py-20">
          <div className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-accent/30 blur-3xl" />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <h2 className="display max-w-2xl text-4xl sm:text-5xl lg:text-6xl">{text}</h2>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-bg px-6 text-sm font-medium text-fg hover:opacity-90"
              >
                Start a project <ArrowUpRight className="size-4" />
              </Link>
              {whatsapp && (
                <a
                  href={`https://wa.me/${whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 items-center rounded-full border border-bg/30 px-6 text-sm font-medium text-bg hover:bg-bg/10"
                >
                  Chat on WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
