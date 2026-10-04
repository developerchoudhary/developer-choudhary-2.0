import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { PROJECT_TYPE_LABELS } from "@/lib/site";
import type { Post, Project, Review, Service } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";
import { Avatar, Stars } from "../ui/misc";
import { ServiceIcon } from "./service-icon";

export function ProjectCard({ project, large }: { project: Project; large?: boolean }) {
  return (
    <Link
      href={`/work/${project.slug}`}
      className="group card flex h-full flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lift"
    >
      <div
        className={cn("relative overflow-hidden bg-bg-muted", large ? "aspect-[16/10]" : "aspect-[16/11]")}
      >
        {project.coverUrl ? (
          <Image
            src={project.coverUrl}
            alt={project.title}
            fill
            sizes={
              large
                ? "(min-width: 1024px) 50vw, 100vw"
                : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            }
            className="object-cover object-top transition duration-700 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center display text-5xl text-fg-subtle">
            {project.title.slice(0, 1)}
          </div>
        )}
        <span className="absolute top-3 left-3 rounded-full bg-bg/90 px-2.5 py-1 font-mono text-[0.65rem] uppercase tracking-wider text-fg backdrop-blur">
          {PROJECT_TYPE_LABELS[project.projectType] ?? project.projectType}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold tracking-tight">{project.title}</h3>
          <ArrowUpRight className="mt-1 size-4 shrink-0 text-fg-subtle transition group-hover:text-accent group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </div>
        <p className="mt-1 text-sm text-fg-muted">{project.subtitle || project.summary}</p>
        <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
          {project.technologies.slice(0, large ? 6 : 4).map((t) => (
            <span
              key={t}
              className="rounded-md border border-line px-2 py-0.5 font-mono text-[0.68rem] text-fg-muted"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}

export function ServiceCard({ service, index }: { service: Service; index?: number }) {
  return (
    <Link
      href={`/services/${service.slug}`}
      className="group card flex h-full flex-col p-6 transition hover:-translate-y-0.5 hover:shadow-lift"
    >
      <div className="flex items-center justify-between">
        <span className="inline-flex size-11 items-center justify-center rounded-xl bg-accent-soft text-accent">
          <ServiceIcon name={service.icon} className="size-5" />
        </span>
        {index !== undefined && (
          <span className="font-mono text-xs text-fg-subtle">{String(index + 1).padStart(2, "0")}</span>
        )}
      </div>
      <h3 className="mt-5 text-xl font-semibold tracking-tight">{service.title}</h3>
      <p className="mt-2 text-sm text-fg-muted">{service.tagline || service.summary}</p>
      {service.deliverables.length > 0 && (
        <ul className="mt-4 space-y-1.5 text-sm text-fg-muted">
          {service.deliverables.slice(0, 3).map((d) => (
            <li key={d} className="flex gap-2">
              <span className="mt-2 size-1 shrink-0 rounded-full bg-accent" />
              {d}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-auto flex items-center justify-between pt-6 text-sm">
        <span className="font-mono text-xs text-fg-subtle">{service.startingPriceLabel}</span>
        <span className="inline-flex items-center gap-1 font-medium text-fg group-hover:text-accent">
          Learn more <ArrowUpRight className="size-4" />
        </span>
      </div>
    </Link>
  );
}

export function PostCard({ post, featured }: { post: Post; featured?: boolean }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={cn(
        "group card flex h-full flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lift",
        featured && "md:flex-row",
      )}
    >
      {post.coverUrl && (
        <div
          className={cn(
            "relative aspect-[16/9] overflow-hidden bg-bg-muted",
            featured && "md:aspect-auto md:w-1/2",
          )}
        >
          <Image
            src={post.coverUrl}
            alt={post.coverAlt || post.title}
            fill
            sizes="(min-width: 1024px) 33vw, 100vw"
            className="object-cover transition duration-700 group-hover:scale-[1.03]"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-wider text-fg-subtle">
          {post.category && <span className="text-accent">{post.category.name}</span>}
          <span>{formatDate(post.publishedAt)}</span>
          <span>· {post.readingTimeMinutes} min</span>
        </div>
        <h3 className={cn("mt-3 font-semibold tracking-tight", featured ? "display text-3xl" : "text-lg")}>
          {post.title}
        </h3>
        <p className="mt-2 text-sm text-fg-muted line-clamp-3">{post.excerpt}</p>
        <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-medium group-hover:text-accent">
          Read article <ArrowUpRight className="size-4" />
        </span>
      </div>
    </Link>
  );
}

export function ReviewCard({ review, className }: { review: Review; className?: string }) {
  return (
    <figure className={cn("card flex h-full flex-col p-6", className)}>
      <Stars rating={review.rating} />
      {review.title && <p className="mt-4 font-semibold tracking-tight">{review.title}</p>}
      <blockquote className="mt-2 flex-1 text-[0.95rem] leading-relaxed text-fg-muted">
        “{review.body}”
      </blockquote>
      <figcaption className="mt-6 flex items-center gap-3">
        <Avatar src={review.authorAvatarUrl} name={review.authorName} />
        <div className="text-sm">
          <p className="font-medium text-fg">{review.authorName}</p>
          <p className="text-fg-subtle">
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
  suffix = "+",
}: {
  value: string | number;
  label: string;
  suffix?: string;
}) {
  return (
    <div className="card p-6">
      <p className="display text-5xl">
        {value}
        <span className="text-accent">{suffix}</span>
      </p>
      <p className="mt-2 text-sm text-fg-muted">{label}</p>
    </div>
  );
}
