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
import type { SocialLink } from "@/lib/types";
import { cn } from "@/lib/utils";

const icons: Record<string, LucideIcon> = {
  github: Github,
  instagram: Instagram,
  facebook: Facebook,
  linkedin: Linkedin,
  twitter: Twitter,
  x: Twitter,
  youtube: Youtube,
  whatsapp: MessageCircle,
};

export function SocialLinks({ links, className }: { links: SocialLink[]; className?: string }) {
  if (!links.length) return null;
  return (
    <ul className={cn("flex flex-wrap gap-1", className)}>
      {links.map((s) => {
        const Icon = icons[s.icon.toLowerCase()] ?? ArrowUpRight;
        return (
          <li key={s.url}>
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              title={s.label}
              className="inline-flex size-9 items-center justify-center rounded-full text-fg-muted transition-colors hover:bg-bg-muted hover:text-fg"
            >
              <Icon className="size-[1.1rem]" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
