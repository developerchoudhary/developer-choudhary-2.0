import {
  ArrowUpRight,
  Facebook,
  Github,
  Instagram,
  Linkedin,
  type LucideIcon,
  MessageCircle,
  Twitter,
  Youtube,
} from "lucide-react";
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
  showBlog: boolean;
  showReviews: boolean;
}

const socialIcons: Record<string, LucideIcon> = {
  github: Github,
  instagram: Instagram,
  facebook: Facebook,
  linkedin: Linkedin,
  twitter: Twitter,
  x: Twitter,
  youtube: Youtube,
  whatsapp: MessageCircle,
};

export function Footer({ profile, services, resume, note, showBlog, showReviews }: FooterProps) {
  const explore = [
    ...NAV.filter((n) => (n.href === "/blog" ? showBlog : true)),
    { href: "/contact", label: "Contact" },
    ...(showReviews ? [{ href: "/reviews", label: "Reviews" }] : []),
    ...(resume ? [{ href: "/resume", label: "Resume" }] : []),
  ];
  return (
    <footer className="relative mt-28 border-t border-line">
      <div className="container-dc pt-16 pb-8">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-fg-muted">{profile.headline}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {profile.socials.map((s) => {
                const Icon = socialIcons[s.icon.toLowerCase()] ?? ArrowUpRight;
                return (
                  <a
                    key={s.url}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    title={s.label}
                    className="inline-flex size-9 items-center justify-center rounded-full border border-line text-fg-muted transition hover:border-line-strong hover:text-fg"
                  >
                    <Icon className="size-4" />
                  </a>
                );
              })}
            </div>
          </div>
          <FooterColumn title="Explore">
            {explore.map((n) => (
              <FooterLink key={n.href} href={n.href}>
                {n.label}
              </FooterLink>
            ))}
          </FooterColumn>
          <FooterColumn title="Services">
            {services.slice(0, 6).map((s) => (
              <FooterLink key={s.id} href={`/services/${s.slug}`}>
                {s.title}
              </FooterLink>
            ))}
          </FooterColumn>
          <FooterColumn title="Contact">
            {profile.email && <FooterLink href={`mailto:${profile.email}`}>{profile.email}</FooterLink>}
            {profile.phone && (
              <FooterLink href={`tel:${profile.phone.replace(/\s+/g, "")}`}>{profile.phone}</FooterLink>
            )}
            {profile.whatsapp && (
              <FooterLink href={`https://wa.me/${profile.whatsapp}`} external>
                WhatsApp
              </FooterLink>
            )}
            <li className="pt-2 text-sm text-fg-subtle">
              {[profile.locationCity, profile.locationCountry].filter(Boolean).join(", ")}
            </li>
          </FooterColumn>
        </div>
        <div className="mt-14 flex flex-col gap-4 border-t border-line pt-6 text-sm text-fg-muted sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {new Date().getFullYear()} {profile.fullName}. All rights reserved.
          </span>
          <div className="flex flex-wrap items-center gap-5">
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
  const isExternal = external || /^(https?:|mailto:|tel:)/.test(href);
  return (
    <li>
      {isExternal ? (
        <a
          href={href}
          className={cls}
          target={external || href.startsWith("http") ? "_blank" : undefined}
          rel="noopener noreferrer"
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
