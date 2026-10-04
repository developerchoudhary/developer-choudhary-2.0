import { ArrowUpRight, Clock, Hammer, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { PROJECT_STATUS_LABELS, PROJECT_TYPE_LABELS } from "@/lib/site";
import type { Post, Project, Review, Service } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";
import { Avatar, Stars } from "../ui/misc";
import { TechList } from "./bits";
import { ServiceIcon } from "./service-icon";

export function ProjectCard({
  project,
  large,
  priority,
  compact,
}: {
  project: Project;
  large?: boolean;
  priority?: boolean;
  /** Shorter cover for cards stacked beside a large one. */
  compact?: boolean;
}) {
  const inProgress = project.status === "in-progress";
  const upcoming = project.status === "upcoming";
  return (
    <Link
      href={`/work/${project.slug}`}
      className="group card card-hover flex h-full flex-col overflow-hidden"
    >
      <div
        className={cn(
          "relative overflow-hidden border-b border-line bg-bg-muted",
          large
            ? "aspect-[16/9] lg:aspect-auto lg:min-h-[320px] lg:flex-1"
            : compact
              ? "aspect-[16/8]"
              : "aspect-[16/10]",
        )}
      >
        {project.coverUrl ? (
          <Image
            src={project.coverUrl}
            alt={project.title}
            fill
            priority={priority}
            sizes={
              large
                ? "(min-width: 1024px) 66vw, 100vw"
                : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            }
            className="object-cover object-top transition duration-700 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="dot-bg flex h-full items-center justify-center">
            <span className="display text-6xl text-fg-subtle/60">{project.title.slice(0, 1)}</span>
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-1.5">
          <span className="rounded-full bg-bg/90 px-2.5 py-1 font-mono text-[0.65rem] uppercase tracking-wider text-fg backdrop-blur">
            {PROJECT_TYPE_LABELS[project.projectType] ?? project.projectType}
          </span>
          {(inProgress || upcoming) && (
            <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 font-mono text-[0.65rem] uppercase tracking-wider text-accent-fg">
              {inProgress ? <Hammer className="size-3" /> : <Sparkles className="size-3" />}
              {PROJECT_STATUS_LABELS[project.status]}
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className={cn("font-semibold tracking-tight", large ? "text-2xl" : "text-lg")}>
              {project.title}
            </h3>
            {project.subtitle && <p className="mt-1 text-sm text-fg-muted">{project.subtitle}</p>}
          </div>
          <span className="mt-1 inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-line text-fg-subtle transition group-hover:border-accent group-hover:bg-accent group-hover:text-accent-fg">
            <ArrowUpRight className="size-4" />
          </span>
        </div>
        {large && project.summary && (
          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-fg-muted">{project.summary}</p>
        )}
        <TechList items={project.technologies} max={large ? 6 : 4} className="mt-auto pt-5" />
      </div>
    </Link>
  );
}

export function ProjectRow({ project }: { project: Project }) {
  return (
    <Link
      href={`/work/${project.slug}`}
      className="group flex items-center gap-4 rounded-2xl border border-line bg-bg-elevated p-3 pr-4 transition hover:border-line-strong"
    >
      <span className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-bg-muted">
        {project.coverUrl ? (
          <Image src={project.coverUrl} alt="" fill sizes="56px" className="object-cover object-top" />
        ) : (
          <span className="display flex size-full items-center justify-center text-xl text-fg-subtle">
            {project.title.slice(0, 1)}
          </span>
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{project.title}</span>
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-wider",
              project.status === "upcoming" ? "bg-bg-muted text-fg-muted" : "bg-accent-soft text-accent",
            )}
          >
            {PROJECT_STATUS_LABELS[project.status]}
          </span>
        </span>
        <span className="mt-0.5 block truncate text-sm text-fg-muted">
          {project.subtitle || project.summary}
        </span>
      </span>
      <ArrowUpRight className="size-4 shrink-0 text-fg-subtle transition group-hover:text-accent" />
    </Link>
  );
}

export function ServiceCard({ service, index }: { service: Service; index?: number }) {
  return (
    <Link
      href={`/services/${service.slug}`}
      className="group card card-hover flex h-full flex-col p-6 sm:p-7"
    >
      <div className="flex items-start justify-between">
        <span className="inline-flex size-11 items-center justify-center rounded-xl bg-accent-soft text-accent">
          <ServiceIcon name={service.icon} className="size-5" />
        </span>
        {index !== undefined && (
          <span className="font-mono text-xs text-fg-subtle">{String(index + 1).padStart(2, "0")}</span>
        )}
      </div>
      <h3 className="mt-6 text-xl font-semibold tracking-tight">{service.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-fg-muted">{service.tagline}</p>
      <div className="mt-auto flex items-center justify-between gap-3 pt-7 text-sm">
        <span className="text-fg-muted">
          {service.startingPriceLabel}
          {service.timelineLabel && <span className="text-fg-subtle"> · {service.timelineLabel}</span>}
        </span>
        <ArrowUpRight className="size-4 text-fg-subtle transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
      </div>
    </Link>
  );
}

export function PostCard({ post, featured }: { post: Post; featured?: boolean }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={cn(
        "group card card-hover flex h-full flex-col overflow-hidden",
        featured && "md:grid md:grid-cols-2",
      )}
    >
      {post.coverUrl && (
        <div
          className={cn(
            "relative overflow-hidden bg-bg-muted",
            featured ? "aspect-[4/3] md:aspect-auto md:min-h-[320px]" : "aspect-[16/9]",
          )}
        >
          <Image
            src={post.coverUrl}
            alt={post.coverAlt || post.title}
            fill
            sizes={
              featured
                ? "(min-width: 768px) 50vw, 100vw"
                : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            }
            className="object-cover transition duration-700 group-hover:scale-[1.03]"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-center gap-2 text-xs text-fg-muted">
          {post.category && (
            <span className="inline-flex items-center gap-1.5 font-medium text-fg">
              <span
                className="size-1.5 rounded-full"
                style={{ background: post.category.color || "var(--accent)" }}
              />
              {post.category.name}
            </span>
          )}
          {post.category && <span className="text-fg-subtle">·</span>}
          <span>{formatDate(post.publishedAt)}</span>
        </div>
        <h3
          className={cn(
            "mt-3 font-semibold tracking-tight text-balance",
            featured ? "text-2xl sm:text-3xl" : "text-lg",
          )}
        >
          {post.title}
        </h3>
        {post.excerpt && (
          <p
            className={cn(
              "mt-2 text-sm leading-relaxed text-fg-muted",
              featured ? "line-clamp-4" : "line-clamp-2",
            )}
          >
            {post.excerpt}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between pt-5 text-xs text-fg-subtle">
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3" /> {post.readingTimeMinutes} min read
          </span>
          <span className="inline-flex items-center gap-1 font-medium text-fg transition group-hover:text-accent">
            Read <ArrowUpRight className="size-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function ReviewCard({ review, className }: { review: Review; className?: string }) {
  return (
    <figure className={cn("card flex h-full flex-col p-6 sm:p-7", className)}>
      <Stars rating={review.rating} size="size-3.5" />
      <blockquote className="mt-4 flex-1 text-[0.95rem] leading-relaxed text-fg">
        {review.title && <p className="mb-2 font-semibold">{review.title}</p>}
        <p className="text-fg-muted">“{review.body}”</p>
      </blockquote>
      <figcaption className="mt-6 flex items-center gap-3">
        <Avatar src={review.authorAvatarUrl} name={review.authorName} className="size-9" />
        <div className="min-w-0 text-sm">
          <p className="truncate font-medium">{review.authorName}</p>
          <p className="truncate text-xs text-fg-muted">
            {[review.authorRole, review.authorCompany].filter(Boolean).join(", ")}
          </p>
        </div>
      </figcaption>
    </figure>
  );
}

export function StatTile({
  value,
  label,
  suffix,
  className,
}: {
  value: string | number;
  label: string;
  suffix?: string;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-line bg-bg-elevated/60 p-5", className)}>
      <p className="display text-4xl sm:text-5xl">
        {value}
        {suffix && <span className="text-accent">{suffix}</span>}
      </p>
      <p className="mt-2 text-sm text-fg-muted">{label}</p>
    </div>
  );
}
