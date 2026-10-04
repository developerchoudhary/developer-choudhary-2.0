import Link from "next/link";
import { LogoMark } from "@/components/site/logo";
import { buttonClass } from "@/components/site/ui";

export default function NotFound() {
  return (
    <main className="site-canvas flex min-h-dvh items-center">
      <div className="container-dc py-24 text-center">
        <LogoMark className="mx-auto size-12" />
        <p className="mt-8 text-sm font-semibold text-accent">404</p>
        <h1 className="display mt-3 text-balance text-[2.25rem] sm:text-[3rem]">Page not found</h1>
        <p className="mx-auto mt-4 max-w-md text-fg-muted">
          The link may be old, or the page has moved. Everything else is right where you left it.
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/" className={buttonClass("primary")}>
            Back to home
          </Link>
          <Link href="/work" className={buttonClass("secondary")}>
            See my work
          </Link>
        </div>
      </div>
    </main>
  );
}
