import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * The portrait in the leaf-shaped frame of the original site: rounded top-left and bottom-right
 * corners, with a soft shape offset behind it. The photo sits on a studio backdrop painted in the
 * theme's colours, which shows through a transparent cut-out.
 */
export function Portrait({
  src,
  alt,
  priority,
  size = "lg",
  className,
}: {
  src: string;
  alt: string;
  priority?: boolean;
  size?: "lg" | "md";
  className?: string;
}) {
  const leaf = size === "lg" ? "leaf" : "leaf-sm";
  const offset = size === "lg" ? "-top-4 -left-4 sm:-top-5 sm:-left-5" : "-top-3 -left-3";
  return (
    <div className={cn("relative", className)}>
      <div aria-hidden="true" className={cn("absolute h-full w-full bg-[var(--frame)]", leaf, offset)} />
      <div className={cn("photo-backdrop relative aspect-[4/5] overflow-hidden shadow-lift", leaf)}>
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes={size === "lg" ? "(min-width: 1024px) 420px, 80vw" : "(min-width: 1024px) 340px, 70vw"}
          className="object-cover"
        />
      </div>
    </div>
  );
}
