import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Suspense } from "react";
import { ContactForm } from "@/components/site/contact-form";
import { JsonLd } from "@/components/site/json-ld";
import { Reveal } from "@/components/site/reveal";
import { getServices, getSite, setting } from "@/lib/data";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Contact · Start a website, ERP or CRM project",
  description:
    "Tell me about your project. I reply within one working day with questions, a scope and a fixed quote. WhatsApp and email also work.",
  path: "/contact",
});

export default async function ContactPage() {
  const [site, services] = await Promise.all([getSite(), getServices()]);
  const { profile } = site;
  const responseTime = setting(site, "contact.responseTime", "within one working day");
  const calendar = setting(site, "contact.calendarUrl", "");
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ])}
      />
      <section className="container-dc grid gap-12 pt-10 pb-20 sm:pt-16 lg:grid-cols-[0.8fr_1.2fr]">
        <Reveal>
          <p className="eyebrow mb-5">Contact</p>
          <h1 className="display text-5xl sm:text-6xl">
            Tell me what you want to <em className="text-accent">build.</em>
          </h1>
          <p className="mt-6 text-lg text-fg-muted">
            A few lines are enough. I reply {responseTime} with questions, then we book a call and I send a
            written scope and quote.
          </p>
          <ul className="mt-10 space-y-5 text-sm">
            {profile.email && (
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 size-4 text-accent" />
                <div>
                  <p className="eyebrow">Email</p>
                  <a href={`mailto:${profile.email}`} className="mt-1 block font-medium link-underline">
                    {profile.email}
                  </a>
                </div>
              </li>
            )}
            {profile.whatsapp && (
              <li className="flex items-start gap-3">
                <MessageCircle className="mt-0.5 size-4 text-accent" />
                <div>
                  <p className="eyebrow">WhatsApp</p>
                  <a
                    href={`https://wa.me/${profile.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 block font-medium link-underline"
                  >
                    Chat on WhatsApp
                  </a>
                </div>
              </li>
            )}
            {profile.phone && (
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 size-4 text-accent" />
                <div>
                  <p className="eyebrow">Phone</p>
                  <a
                    href={`tel:${profile.phone.replace(/\s+/g, "")}`}
                    className="mt-1 block font-medium link-underline"
                  >
                    {profile.phone}
                  </a>
                </div>
              </li>
            )}
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-4 text-accent" />
              <div>
                <p className="eyebrow">Based in</p>
                <p className="mt-1 font-medium">
                  {[profile.locationCity, profile.locationRegion, profile.locationCountry]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Clock className="mt-0.5 size-4 text-accent" />
              <div>
                <p className="eyebrow">Response time</p>
                <p className="mt-1 font-medium">Usually {responseTime}</p>
              </div>
            </li>
          </ul>
          {calendar && (
            <a
              href={calendar}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex h-11 items-center rounded-full border border-line-strong px-5 text-sm font-medium hover:bg-bg-muted"
            >
              Book a call instead
            </a>
          )}
        </Reveal>
        <Reveal delay={0.1}>
          <Suspense fallback={<div className="card h-[640px] animate-pulse" />}>
            <ContactForm services={services} whatsapp={profile.whatsapp} />
          </Suspense>
        </Reveal>
      </section>
    </>
  );
}
