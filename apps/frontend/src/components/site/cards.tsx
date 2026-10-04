import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { PROJECT_TYPE_LABELS } from "@/lib/site";
import type { Post, Project, Review, Service } from "@/lib/types";
import { cn, formatDate, initials } from "@/lib/utils";
import { ServiceIcon } from "./service-icon";
import { StatusBadge } from "./ui";

const year = (p: Project) => (p.completedAt ?? p.startedAt ?? "").slice(0, 4);

function CoverPlaceholder({ title, label }: { title: string; label: string }) {
  return (
    <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-br from-[var(--frame)] via-bg-muted to-bg-muted p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-accent">{label}</p>
      <p className="mt-1.5 max-w-[16ch] text-2xl font-semibold leading-tight tracking-tight text-fg">
        {title}
      </p>
    </div>
  );
}

export function ProjectCard({
  project,
  priority,
  sizes = "(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw",
}: {
  project: Project;
  priority?: boolean;
  sizes?: string;
}) {
  const type = PROJECT_TYPE_LABELS[project.projectType] ?? project.projectType;
  const meta = [type, project.status === "completed" ? year(project) : ""].filter(Boolean).join(" · ");
  return (
    <Link href={`/work/${project.slug}`} className="group block">
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-line bg-bg-muted shadow-card transition-shadow duration-300 group-hover:shadow-lift">
        {project.coverUrl ? (
          <Image
            src={project.coverUrl}
            alt={project.title}
            fill
            priority={priority}
            sizes={sizes}
            className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.025]"
          />
        ) : (
          <CoverPlaceholder title={project.title} label={type} />
        )}
        {project.status !== "completed" && (
          <StatusBadge
            status={project.status}
            className="absolute top-3 left-3 bg-bg-elevated/95 shadow-card"
          />
        )}
      </div>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold tracking-tight transition-colors group-hover:text-accent">
            {project.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-[0.95rem] text-fg-muted">
            {project.subtitle || project.summary}
          </p>
          <p className="mt-2 text-sm text-fg-subtle">{meta}</p>
        </div>
        <ArrowUpRight className="mt-1 size-5 shrink-0 text-fg-subtle transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
      </div>
    </Link>
  );
}

/** Compact row for projects that are still in progress or upcoming. */
export function ProjectRow({ project }: { project: Project }) {
  return (
    <Link
      href={`/work/${project.slug}`}
      className="group flex items-center gap-4 border-t border-line py-5 transition-colors first:border-t-0 sm:gap-6"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <h3 className="font-semibold tracking-tight transition-colors group-hover:text-accent">
            {project.title}
          </h3>
          <StatusBadge status={project.status} />
        </div>
        <p className="mt-1 line-clamp-1 text-[0.95rem] text-fg-muted">
          {project.subtitle || project.summary}
        </p>
      </div>
      <ArrowUpRight className="size-5 shrink-0 text-fg-subtle transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
    </Link>
  );
}

export function ServiceCard({ service, showPrice }: { service: Service; showPrice?: boolean }) {
  return (
    <Link
      href={`/services/${service.slug}`}
      className="group card flex h-full flex-col p-6 transition-[border-color,box-shadow] duration-300 hover:border-line-strong hover:shadow-lift sm:p-7"
    >
      <span className="inline-flex size-11 items-center justify-center rounded-xl bg-accent-soft text-accent">
        <ServiceIcon name={service.icon} className="size-5" />
      </span>
      <h3 className="mt-5 flex items-center gap-1.5 text-lg font-semibold tracking-tight">
        {service.title}
        <ArrowUpRight className="size-4 text-fg-subtle opacity-0 transition-all group-hover:translate-x-0.5 group-hover:text-accent group-hover:opacity-100" />
      </h3>
      <p className="mt-2 text-[0.95rem] leading-relaxed text-fg-muted">
        {service.tagline || service.summary}
      </p>
      {showPrice && (service.startingPriceLabel || service.timelineLabel) && (
        <p className="mt-auto pt-6 text-sm">
          <span className="font-semibold text-fg">{service.startingPriceLabel}</span>
          {service.startingPriceLabel && service.timelineLabel && <span className="text-fg-subtle"> · </span>}
          <span className="text-fg-muted">{service.timelineLabel}</span>
        </p>
      )}
    </Link>
  );
}

export function PostRow({ post }: { post: Post }) {
  return (
    <article className="group relative grid gap-3 border-t border-line py-8 sm:grid-cols-[150px_1fr] sm:gap-8 lg:grid-cols-[150px_1fr_176px]">
      <div className="flex items-center gap-3 text-sm sm:block">
        <time dateTime={post.publishedAt ?? undefined} className="text-fg-subtle tabular">
          {formatDate(post.publishedAt)}
        </time>
        {post.category && (
          <p className="inline-flex items-center gap-2 font-medium text-fg-muted sm:mt-1.5 sm:flex">
            <CategoryDot color={post.category.color} />
            {post.category.name}
          </p>
        )}
      </div>
      <div className="min-w-0">
        <h3 className="text-xl font-semibold leading-snug tracking-tight text-balance">
          <Link href={`/blog/${post.slug}`} className="transition-colors group-hover:text-accent">
            <span className="absolute inset-0" aria-hidden="true" />
            {post.title}
          </Link>
        </h3>
        {post.excerpt && <p className="mt-2 line-clamp-2 text-fg-muted">{post.excerpt}</p>}
        <p className="mt-3 text-sm text-fg-subtle">{post.readingTimeMinutes} min read</p>
      </div>
      {post.coverUrl && (
        <div className="relative hidden aspect-[4/3] overflow-hidden rounded-xl border border-line bg-bg-muted lg:block">
          <Image
            src={post.coverUrl}
            alt={post.coverAlt || post.title}
            fill
            sizes="176px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        </div>
      )}
    </article>
  );
}

/** The category's colour from the admin, as a small dot before its name. */
export function CategoryDot({ color }: { color: string }) {
  return (
    <span
      aria-hidden="true"
      className="size-2 shrink-0 rounded-full bg-accent"
      style={color ? { backgroundColor: color } : undefined}
    />
  );
}

export function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <span role="img" aria-label={`${rating} out of 5 stars`} className={cn("inline-flex gap-0.5", className)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          viewBox="0 0 20 20"
          className={cn("size-4", n <= rating ? "fill-highlight" : "fill-line-strong")}
          aria-hidden="true"
        >
          <path d="M10 1.5l2.6 5.4 5.9.8-4.3 4.1 1.1 5.9L10 14.9l-5.3 2.8 1.1-5.9L1.5 7.7l5.9-.8z" />
        </svg>
      ))}
    </span>
  );
}

function ReviewAuthor({ review, serviceTitle }: { review: Review; serviceTitle?: string }) {
  const role = [review.authorRole, review.authorCompany].filter(Boolean).join(", ");
  return (
    <figcaption className="flex items-center gap-3">
      {review.authorAvatarUrl ? (
        // biome-ignore lint/performance/noImgElement: small remote avatar with unknown dimensions
        <img
          src={review.authorAvatarUrl}
          alt=""
          className="size-10 shrink-0 rounded-full object-cover"
          loading="lazy"
        />
      ) : (
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent">
          {initials(review.authorName)}
        </span>
      )}
      <span className="min-w-0 text-left">
        <span className="block font-semibold text-fg">{review.authorName}</span>
        {(role || serviceTitle) && (
          <span className="block truncate text-sm text-fg-muted">
            {[role, serviceTitle].filter(Boolean).join(" · ")}
          </span>
        )}
      </span>
    </figcaption>
  );
}

export function ReviewCard({ review, serviceTitle }: { review: Review; serviceTitle?: string }) {
  return (
    <figure className="card flex h-full flex-col p-6">
      <Stars rating={review.rating} />
      {review.title && <p className="mt-4 font-semibold tracking-tight">{review.title}</p>}
      <blockquote className={cn("leading-relaxed text-fg-muted", review.title ? "mt-2" : "mt-4")}>
        {review.body}
      </blockquote>
      <div className="mt-auto pt-6">
        <ReviewAuthor review={review} serviceTitle={serviceTitle} />
      </div>
    </figure>
  );
}

/** One large quote, used on the home page. */
export function Testimonial({ review }: { review: Review }) {
  return (
    <figure className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <Stars rating={review.rating} />
      <blockquote className="mt-6 text-balance text-[1.35rem] font-medium leading-relaxed tracking-tight text-fg sm:text-[1.6rem]">
        “{review.body}”
      </blockquote>
      <div className="mt-8">
        <ReviewAuthor review={review} />
      </div>
    </figure>
  );
}
