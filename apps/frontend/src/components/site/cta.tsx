import { MessageCircle } from "lucide-react";
import { ButtonLink } from "./ui";

/** The closing call to action at the bottom of most pages. Copy comes from the admin settings. */
export function Cta({
  title,
  text,
  whatsapp,
  primary = { label: "Start a project", href: "/contact" },
}: {
  title: string;
  text: string;
  whatsapp?: string;
  primary?: { label: string; href: string };
}) {
  return (
    <section className="container-dc py-14 sm:py-20">
      <div className="card relative overflow-hidden px-6 py-12 text-center sm:px-12 sm:py-16">
        <div aria-hidden="true" className="brand-gradient absolute inset-x-0 top-0 h-1" />
        <h2 className="display mx-auto max-w-2xl text-balance text-[1.85rem] sm:text-[2.5rem]">{title}</h2>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-fg-muted sm:text-lg">{text}</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href={primary.href}>{primary.label}</ButtonLink>
          {whatsapp && (
            <ButtonLink href={`https://wa.me/${whatsapp}`} variant="secondary">
              <MessageCircle className="size-[1.1rem]" /> WhatsApp
            </ButtonLink>
          )}
        </div>
      </div>
    </section>
  );
}
