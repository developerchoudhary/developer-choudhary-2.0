import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { NAV } from "@/lib/site";
import type { Profile, ResumePublic, Service } from "@/lib/types";
import { LocalTime } from "./local-time";
import { Logo } from "./logo";

interface FooterProps {
  profile: Profile;
  services: Service[];
  resume: ResumePublic | null;
  note: string;
  ctaTagline: string;
}

export function Footer({ profile, services, resume, note, ctaTagline }: FooterProps) {
  return (
    <footer className="mt-24 border-t border-line bg-bg-elevated/60">
      <div className="container-dc py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <h2 className="display text-4xl sm:text-5xl">
              Let&apos;s build something <em className="text-accent">that lasts.</em>
            </h2>
            <p className="mt-4 max-w-md text-fg-muted">{ctaTagline}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-fg px-5 text-sm font-medium text-bg hover:opacity-90"
              >
                Start a project <ArrowUpRight className="size-4" />
              </Link>
              {profile.whatsapp && (
                <a
                  href={`https://wa.me/${profile.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-line-strong px-5 text-sm font-medium text-fg hover:bg-bg-muted"
                >
                  WhatsApp
                </a>
              )}
            </div>
          </div>
          <FooterColumn title="Explore">
            {NAV.map((n) => (
              <FooterLink key={n.href} href={n.href}>
                {n.label}
              </FooterLink>
            ))}
            <FooterLink href="/experience">Experience</FooterLink>
            {resume && <FooterLink href="/resume">Resume</FooterLink>}
            <FooterLink href="/contact">Contact</FooterLink>
          </FooterColumn>
          <FooterColumn title="Services">
            {services.slice(0, 7).map((s) => (
              <FooterLink key={s.id} href={`/services/${s.slug}`}>
                {s.title}
              </FooterLink>
            ))}
          </FooterColumn>
          <FooterColumn title="Connect">
            {profile.email && <FooterLink href={`mailto:${profile.email}`}>{profile.email}</FooterLink>}
            {profile.phone && (
              <FooterLink href={`tel:${profile.phone.replace(/\s+/g, "")}`}>{profile.phone}</FooterLink>
            )}
            {profile.socials.map((s) => (
              <FooterLink key={s.url} href={s.url} external>
                {s.label}
              </FooterLink>
            ))}
          </FooterColumn>
        </div>
        <div className="mt-14 flex flex-col gap-4 border-t border-line pt-6 text-sm text-fg-muted sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Logo compact />
            <span>
              © {new Date().getFullYear()} {profile.fullName}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <LocalTime timezone={profile.timezone} city={profile.locationCity} />
            <Link href="/privacy" className="hover:text-fg">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-fg">
              Terms
            </Link>
          </div>
        </div>
        {note && <p className="mt-4 text-xs text-fg-subtle">{note}</p>}
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="eyebrow mb-4">{title}</p>
      <ul className="space-y-2.5 text-sm">{children}</ul>
    </div>
  );
}

function FooterLink({
  href,
  children,
  external,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  const cls = "text-fg-muted transition-colors hover:text-fg";
  return (
    <li>
      {external || href.startsWith("mailto:") || href.startsWith("tel:") ? (
        <a
          href={href}
          className={cls}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
        >
          {children}
        </a>
      ) : (
        <Link href={href} className={cls}>
          {children}
        </Link>
      )}
    </li>
  );
}
