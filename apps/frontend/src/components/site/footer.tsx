import Link from "next/link";
import { NAV, type SiteSettings } from "@/lib/site";
import type { Profile } from "@/lib/types";
import { Logo } from "./logo";
import { SocialLinks } from "./social-icon";

export function Footer({
  profile,
  settings,
  hasResume,
}: {
  profile: Profile;
  settings: SiteSettings;
  hasResume: boolean;
}) {
  const links = [
    ...NAV.filter((n) => n.href !== "/blog" || settings.showBlog),
    ...(settings.showReviews ? [{ href: "/reviews", label: "Reviews" }] : []),
    ...(settings.showResume && hasResume ? [{ href: "/resume", label: "Resume" }] : []),
    { href: "/contact", label: "Contact" },
  ];
  const place = [profile.locationCity, profile.locationCountry].filter(Boolean).join(", ");

  return (
    <footer className="mt-10 border-t border-line">
      <div className="container-dc py-12">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Logo name={settings.name} />
            <p className="mt-4 text-sm leading-relaxed text-fg-muted">
              {[profile.headline, place].filter(Boolean).join(" · ")}
            </p>
            <SocialLinks links={profile.socials} className="-ml-2 mt-4" />
          </div>
          <nav aria-label="Footer">
            <ul className="grid grid-cols-2 gap-x-14 gap-y-3 text-sm sm:grid-cols-3">
              {links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-fg-muted transition-colors hover:text-fg">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-line pt-6 text-sm text-fg-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {profile.fullName}
            {settings.footerNote ? <span className="hidden lg:inline"> · {settings.footerNote}</span> : null}
          </p>
          <div className="flex gap-5">
            <Link href="/privacy" className="transition-colors hover:text-fg">
              Privacy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-fg">
              Terms
            </Link>
            {settings.showBlog && (
              <a href="/feed.xml" className="transition-colors hover:text-fg">
                RSS
              </a>
            )}
          </div>
        </div>
        {settings.footerNote && (
          <p className="mt-3 text-xs text-fg-subtle lg:hidden">{settings.footerNote}</p>
        )}
      </div>
    </footer>
  );
}
