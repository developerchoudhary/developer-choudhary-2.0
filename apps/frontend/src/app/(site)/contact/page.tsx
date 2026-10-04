import { CalendarDays, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { ContactForm } from "@/components/site/contact-form";
import { JsonLd } from "@/components/site/json-ld";
import { LocalTime } from "@/components/site/local-time";
import { SocialLinks } from "@/components/site/social-icon";
import { ButtonLink } from "@/components/site/ui";
import { getServices, getSite } from "@/lib/data";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { siteSettings } from "@/lib/site";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: "Contact",
    description:
      "Tell me about your website, ERP, CRM or web app. I reply personally with next steps and a rough estimate.",
    path: "/contact",
  });
}

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as React.CSSProperties;

export default async function ContactPage() {
  const [site, services] = await Promise.all([getSite(), getServices()]);
  const { profile } = site;
  const settings = siteSettings(site);
  const place = [profile.locationCity, profile.locationRegion, profile.locationCountry]
    .filter(Boolean)
    .join(", ");

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ])}
      />
      <section className="container-dc grid gap-12 pt-12 pb-16 sm:pt-20 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
        <div>
          <h1 className="display rise text-balance text-[2.5rem] sm:text-[3.25rem]">
            Let&apos;s work together
          </h1>
          <p
            className="rise mt-5 max-w-md text-pretty text-lg leading-relaxed text-fg-muted"
            style={delay(80)}
          >
            Tell me about your project. A real person reads every message and replies {settings.responseTime}.
          </p>
          <ul className="rise mt-10 space-y-6" style={delay(140)}>
            {profile.email && (
              <ContactItem
                icon={<Mail className="size-[1.1rem]" />}
                label="Email"
                href={`mailto:${profile.email}`}
              >
                {profile.email}
              </ContactItem>
            )}
            {profile.whatsapp && (
              <ContactItem
                icon={<MessageCircle className="size-[1.1rem]" />}
                label="WhatsApp"
                href={`https://wa.me/${profile.whatsapp}`}
              >
                Chat on WhatsApp
              </ContactItem>
            )}
            {profile.phone && (
              <ContactItem
                icon={<Phone className="size-[1.1rem]" />}
                label="Phone"
                href={`tel:${profile.phone.replace(/\s+/g, "")}`}
              >
                {profile.phone}
              </ContactItem>
            )}
            {place && (
              <ContactItem icon={<MapPin className="size-[1.1rem]" />} label="Location">
                {place}
                <span className="mt-0.5 block text-sm font-normal text-fg-subtle">
                  Local time <LocalTime timezone={profile.timezone} /> · working with clients worldwide
                </span>
              </ContactItem>
            )}
          </ul>
          {settings.calendarUrl && (
            <ButtonLink href={settings.calendarUrl} variant="secondary" className="mt-10">
              <CalendarDays className="size-[1.1rem]" /> Book a call
            </ButtonLink>
          )}
          {profile.socials.length > 0 && <SocialLinks links={profile.socials} className="-ml-2 mt-8" />}
        </div>
        <div className="rise" style={delay(120)}>
          <Suspense fallback={<div className="card h-[620px]" />}>
            <ContactForm
              services={services}
              whatsapp={profile.whatsapp}
              responseTime={settings.responseTime}
            />
          </Suspense>
        </div>
      </section>
    </>
  );
}

function ContactItem({
  icon,
  label,
  href,
  children,
}: {
  icon: ReactNode;
  label: string;
  href?: string;
  children: ReactNode;
}) {
  const external = href?.startsWith("http");
  return (
    <li className="flex gap-4">
      <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-sm text-fg-subtle">{label}</p>
        {href ? (
          <a
            href={href}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
            className="font-medium break-words text-fg transition-colors hover:text-accent"
          >
            {children}
          </a>
        ) : (
          <div className="font-medium text-fg">{children}</div>
        )}
      </div>
    </li>
  );
}
