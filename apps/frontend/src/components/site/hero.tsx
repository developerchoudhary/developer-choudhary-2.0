import { AVAILABILITY_LABELS, type LinkSetting } from "@/lib/site";
import type { Profile } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Portrait } from "./portrait";
import { ButtonLink } from "./ui";

const dot = {
  available: "bg-emerald-500",
  limited: "bg-amber-500",
  unavailable: "bg-rose-500",
} as const;

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as React.CSSProperties;

export function Hero({
  profile,
  primary,
  secondary,
}: {
  profile: Profile;
  primary: LinkSetting;
  secondary: LinkSetting;
}) {
  const status = profile.availabilityStatus;
  const place = [profile.locationCity, profile.locationCountry].filter(Boolean).join(", ");
  const role = profile.headline.replace(/[.!\s]+$/, "");

  return (
    <section className="container-dc grid items-center gap-14 pt-10 pb-14 sm:pt-16 lg:min-h-[calc(100svh-4rem)] lg:grid-cols-[1.12fr_0.88fr] lg:gap-16 lg:py-16">
      <div className="max-w-xl">
        <p className="rise flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium text-fg-muted">
          <span className={cn("size-2 rounded-full", dot[status])} aria-hidden="true" />
          {profile.availabilityNote || AVAILABILITY_LABELS[status]}
          {place && <span className="text-fg-subtle">· {place}</span>}
        </p>
        <h1
          className="display rise mt-6 text-balance text-[2.55rem] leading-[1.07] sm:text-[3.4rem] lg:text-[3.9rem]"
          style={delay(60)}
        >
          Hi, I&apos;m <span className="text-accent">{profile.fullName}</span>,
          {role && <span className="mt-1 block text-highlight">{role}.</span>}
        </h1>
        {profile.bioShort && (
          <p
            className="rise mt-6 text-pretty text-lg leading-relaxed text-fg-muted sm:text-xl"
            style={delay(120)}
          >
            {profile.bioShort}
          </p>
        )}
        <div className="rise mt-9 flex flex-col gap-3 sm:flex-row" style={delay(180)}>
          <ButtonLink href={primary.href}>{primary.label}</ButtonLink>
          <ButtonLink href={secondary.href} variant="secondary">
            {secondary.label}
          </ButtonLink>
        </div>
      </div>
      <div
        className="rise mx-auto w-full max-w-[320px] pl-4 sm:max-w-[380px] lg:mr-0 lg:ml-auto lg:max-w-[420px]"
        style={delay(140)}
      >
        <Portrait
          src={profile.avatarUrl || "/portraits/aman-portrait-4x5.webp"}
          alt={profile.fullName}
          priority
        />
      </div>
    </section>
  );
}
