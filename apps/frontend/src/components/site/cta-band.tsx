import { ArrowUpRight, Mail, MessageCircle } from "lucide-react";
import Link from "next/link";

export function CtaBand({
  text,
  whatsapp,
  email,
  title = "Have a project in mind?",
}: {
  text: string;
  whatsapp?: string;
  email?: string;
  title?: string;
}) {
  return (
    <section className="container-dc py-10 sm:py-16">
      <div className="relative overflow-hidden rounded-3xl border border-line bg-bg-elevated px-6 py-14 text-center sm:px-12 sm:py-20">
        <div className="dot-bg pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
        <div
          className="pointer-events-none absolute -bottom-32 left-1/2 h-72 w-[560px] -translate-x-1/2 rounded-full bg-accent/25 blur-[100px]"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-2xl">
          <p className="eyebrow mb-4">Let&apos;s work together</p>
          <h2 className="display text-balance text-4xl sm:text-6xl">{title}</h2>
          <p className="mt-5 text-pretty text-lg text-fg-muted">{text}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/contact"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent px-6 text-sm font-medium text-accent-fg shadow-glow transition hover:bg-accent-strong sm:w-auto"
            >
              Start a project <ArrowUpRight className="size-4" />
            </Link>
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-line-strong px-6 text-sm font-medium text-fg transition hover:bg-bg-muted sm:w-auto"
              >
                <MessageCircle className="size-4" /> WhatsApp
              </a>
            )}
          </div>
          {email && (
            <a
              href={`mailto:${email}`}
              className="mt-6 inline-flex items-center gap-1.5 text-sm text-fg-muted transition hover:text-fg"
            >
              <Mail className="size-3.5" /> {email}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
