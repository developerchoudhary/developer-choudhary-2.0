import { ArrowDown, ArrowUpRight, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Profile, ReviewSummary } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Stars } from "../ui/misc";
import { Reveal } from "./reveal";
import { TaglineRotator } from "./tagline-rotator";

interface HeroProps {
  profile: Profile;
  taglines: string[];
  eyebrow: string;
  reviews: ReviewSummary;
  cta: { label: string; href: string };
  ctaSecondary: { label: string; href: string };
}

export function Hero({ profile, taglines, eyebrow, reviews, cta, ctaSecondary }: HeroProps) {
  const available = profile.availabilityStatus === "available";
  return (
    <section className="relative overflow-hidden">
      <div className="grid-bg pointer-events-none absolute inset-x-0 top-0 h-[640px]" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -top-48 right-[-10%] h-[520px] w-[520px] rounded-full bg-accent/20 blur-[140px] dark:bg-accent/15"
        aria-hidden="true"
      />
      <div className="container-dc relative pt-10 pb-14 sm:pt-20 sm:pb-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-line bg-bg-elevated/70 px-3 py-1.5 text-xs text-fg-muted backdrop-blur">
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  available
                    ? "bg-success animate-pulse-soft"
                    : profile.availabilityStatus === "limited"
                      ? "bg-warning"
                      : "bg-danger",
                )}
              />
              {profile.availabilityNote ||
                (available ? "Available for new projects" : "Limited availability")}
            </div>
            <p className="eyebrow mt-6">{eyebrow}</p>
            <h1 className="display mt-4 text-[clamp(2.6rem,8vw,5.75rem)] text-balance">
              {taglines.length > 0 ? (
                <TaglineRotator items={taglines} />
              ) : (
                <span>Websites, ERPs and CRMs built to last.</span>
              )}
            </h1>
            <p className="mt-7 max-w-xl text-pretty text-lg leading-relaxed text-fg-muted sm:text-xl">
              {profile.bioShort}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href={cta.href}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-accent px-6 text-sm font-medium text-accent-fg shadow-glow transition hover:bg-accent-strong"
              >
                {cta.label} <ArrowUpRight className="size-4" />
              </Link>
              <Link
                href={ctaSecondary.href}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-line-strong px-6 text-sm font-medium text-fg transition hover:bg-bg-muted"
              >
                {ctaSecondary.label} <ArrowDown className="size-4" />
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-fg-muted">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-3.5" />
                {[profile.locationCity, profile.locationCountry].filter(Boolean).join(", ")} · working
                worldwide
              </span>
              {reviews.count > 0 && (
                <span className="inline-flex items-center gap-2">
                  <Stars rating={Math.round(reviews.average)} size="size-3.5" />
                  <span>
                    {reviews.average.toFixed(1)} from {reviews.count} client{reviews.count === 1 ? "" : "s"}
                  </span>
                </span>
              )}
            </div>
          </Reveal>

          <Reveal delay={0.15} className="relative mx-auto w-full max-w-[420px] lg:max-w-none">
            <div className="relative">
              <div
                className="pointer-events-none absolute -inset-4 rounded-[2.5rem] bg-gradient-to-b from-accent/30 via-transparent to-transparent blur-2xl"
                aria-hidden="true"
              />
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-line bg-bg-muted shadow-lift">
                <Image
                  src={profile.avatarUrl || "/aman-choudhary.jpg"}
                  alt={profile.fullName}
                  fill
                  priority
                  sizes="(min-width: 1024px) 40vw, 90vw"
                  className="object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-5 text-white sm:p-6">
                  <p className="font-display text-xl font-semibold">{profile.fullName}</p>
                  <p className="text-sm text-white/80">{profile.headline}</p>
                </div>
              </div>
              <div className="card absolute left-3 top-6 flex items-center gap-3 px-4 py-3 shadow-lift animate-float sm:-left-8 sm:top-8">
                <span className="display text-3xl text-accent">{profile.yearsExperience}+</span>
                <span className="text-xs leading-tight text-fg-muted">
                  years
                  <br />
                  shipping
                </span>
              </div>
              <div
                className="card absolute right-3 bottom-24 flex items-center gap-3 px-4 py-3 shadow-lift animate-float sm:-right-8 sm:bottom-16"
                style={{ animationDelay: "1.2s" }}
              >
                <span className="display text-3xl">{profile.projectsCompleted}+</span>
                <span className="text-xs leading-tight text-fg-muted">
                  projects
                  <br />
                  delivered
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
