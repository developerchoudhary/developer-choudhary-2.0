import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Suspense } from "react";
import { ContactForm } from "@/components/site/contact-form";
import { JsonLd } from "@/components/site/json-ld";
import { Reveal } from "@/components/site/reveal";
import { PageHero } from "@/components/site/section";
import { getServices, getSite, setting } from "@/lib/data";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Contact · Start a project",
  description:
    "Tell me about your website, ERP, CRM or web app. I reply personally within one working day with next steps and a rough estimate.",
  path: "/contact",
});

export default async function ContactPage() {
  const [site, services] = await Promise.all([getSite(), getServices()]);
  const { profile } = site;
  const responseTime = setting(site, "contact.responseTime", "within one working day");
  const calendar = setting(site, "contact.calendarUrl", "");
  const steps = [
    "You send a few lines about the project.",
    `I reply ${responseTime} with questions and a rough estimate.`,
    "We hop on a call, then you get a written scope and fixed quote.",
  ];

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ])}
      />
      <PageHero
        eyebrow="Contact"
        title={
          <>
            Let&apos;s build something <span className="text-accent">that lasts.</span>
          </>
        }
        lede="Tell me what you are trying to achieve. No forms disappearing into a void: a real person replies."
      />
      <section className="container-dc grid gap-10 pb-16 lg:grid-cols-[0.75fr_1.25fr]">
        <Reveal className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="card divide-y divide-line">
            {profile.email && (
              <ContactRow
                icon={<Mail className="size-4" />}
                label="Email"
                href={`mailto:${profile.email}`}
                value={profile.email}
              />
            )}
            {profile.whatsapp && (
              <ContactRow
                icon={<MessageCircle className="size-4" />}
                label="WhatsApp"
                href={`https://wa.me/${profile.whatsapp}`}
                value="Chat on WhatsApp"
                external
              />
            )}
            {profile.phone && (
              <ContactRow
                icon={<Phone className="size-4" />}
                label="Phone"
                href={`tel:${profile.phone.replace(/\s+/g, "")}`}
                value={profile.phone}
              />
            )}
            <ContactRow
              icon={<MapPin className="size-4" />}
              label="Based in"
              value={`${[profile.locationCity, profile.locationRegion, profile.locationCountry].filter(Boolean).join(", ")} · remote worldwide`}
            />
            <ContactRow icon={<Clock className="size-4" />} label="Response time" value={responseTime} />
          </div>
          {calendar && (
            <a
              href={calendar}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 items-center justify-center rounded-xl border border-line-strong text-sm font-medium transition hover:bg-bg-muted"
            >
              Book a 20-minute call
            </a>
          )}
          <ol className="card space-y-3 p-6 text-sm">
            <p className="eyebrow mb-1">What happens next</p>
            {steps.map((s, i) => (
              <li key={s} className="flex gap-3 text-fg-muted">
                <span className="font-mono text-xs text-accent">0{i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
        </Reveal>
        <Reveal delay={0.1}>
          <Suspense fallback={<div className="card h-[560px] animate-pulse" />}>
            <ContactForm services={services} whatsapp={profile.whatsapp} />
          </Suspense>
        </Reveal>
      </section>
    </>
  );
}

function ContactRow({
  icon,
  label,
  value,
  href,
  external,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
  external?: boolean;
}) {
  const inner = (
    <>
      <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="eyebrow block">{label}</span>
        <span className="mt-0.5 block truncate text-sm font-medium text-fg">{value}</span>
      </span>
    </>
  );
  return href ? (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="flex items-center gap-4 p-4 transition hover:bg-bg-muted/50"
    >
      {inner}
    </a>
  ) : (
    <div className="flex items-center gap-4 p-4">{inner}</div>
  );
}
