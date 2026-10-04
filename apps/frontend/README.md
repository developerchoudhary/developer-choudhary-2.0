# Portfolio Frontend

Next.js 16 app for developerchoudhary.com: the public site and the `/admin` panel.

## Structure

```
src/app/(site)/      public pages (server components, rendered per request, data cached by tag)
src/app/admin/       admin panel (client components, TanStack Query, react-hook-form)
src/app/api/revalidate/  purge cache tags; called by the Go API with X-Revalidate-Secret
src/components/site  header, footer, cards, block renderer, forms, consent prompt, tracking
src/components/admin shell, data table, block editor, media library, form helpers
src/components/ui    buttons, fields, dialog, badges
src/lib              API clients, types, SEO helpers, visitor utilities, design tokens via globals.css
```

## Data flow

Server components call the Go API (`API_URL`) with `fetch` and cache tags (`site`, `services`, `projects`, `posts`,
`reviews`, `experience`, ...). The API purges tags after every admin change, so pages update within seconds without a
rebuild. Pages opt out of build-time prerendering with `connection()` so Docker builds never need the API.

The browser only talks to the same origin: `next.config.ts` rewrites `/api/v1` and `/uploads` to the API in
development, and the Traefik ingress routes them in production. Admin auth keeps the access token in memory and a
rotating httpOnly refresh cookie.

## Commands

```sh
pnpm dev        # http://localhost:3000
pnpm lint       # biome
pnpm typecheck
pnpm build
```

Environment: `API_URL`, `NEXT_PUBLIC_SITE_URL` (baked at build time), `REVALIDATE_SECRET`.

## Design

Tokens (`--bg`, `--fg`, `--accent`, `--highlight`, `--btn-*`, `--brand-*`, `--frame`, `--photo-*`, ...) are exposed to
Tailwind through `@theme inline`, so `bg-bg`, `text-fg-muted`, `border-line` and friends follow light and dark mode
automatically. Their values come from the theme chosen in Admin → Theme: the API derives every token from a short
definition, and the root layout injects the result as `html:root{…}html.dark{…}`, which outranks the defaults in
`src/styles/globals.css` (the built-in Powder theme, used when the API is unreachable). Light or dark follows the
system setting; the header toggle overrides it.

Everything drawn outside CSS follows the theme too: the favicon, app icons and logo SVG (`src/app/brand/[asset]`,
with `/favicon.ico` rewritten there), the web manifest, `theme-color`, and the share images (`src/lib/og.tsx`,
`/og-image.png`). Their URLs carry `?v=<theme version>`, so browsers and social networks pick up a change. The
admin's Theme page previews a theme on the live site in a frame (`components/admin/site-preview.tsx` posts the CSS
to `components/site/theme-preview.tsx`); framed pages never count as visits.

The photo is a transparent cut-out (`public/portraits/aman-portrait-4x5.webp`, and the profile avatar), painted on a
studio backdrop in the theme's colours (`.photo-backdrop`); an opaque photo simply covers it.
Type: Inter (variable with optical sizes, Latin subset, self-hosted in `src/fonts`) for everything, Geist Mono for
code. The share images (`opengraph-image.tsx`, `src/lib/og.tsx`) use static Inter subsets from the same folder.

Public pages keep copy short: each page has one heading and one sentence of introduction, then content. Shared pieces
are in `src/components/site/ui.tsx` (buttons, section and page headers, tabs, pagination) and `cards.tsx`; the hero
portrait uses the leaf-shaped frame from the original site (`portrait.tsx`). Every piece of copy that is not content
(home buttons, the closing call to action, reply time, footer note, feature switches, SEO defaults) comes from the
admin settings, read through `siteSettings()` in `src/lib/site.ts`.

The public site is mobile-first: every page is laid out for a 390px viewport first and widens up to the 1120px
container. The admin at `/admin` is a fixed-width desktop console (`.admin-root`, min 1360px) and scrolls
horizontally on smaller screens instead of reflowing. Its charts are small dependency-free SVG components in
`src/components/admin/charts.tsx`.
