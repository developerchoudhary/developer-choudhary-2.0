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

Tokens live in `src/styles/globals.css` (`--bg`, `--fg`, `--accent`, `--chart-1`, ...) and are exposed to Tailwind
through `@theme inline`, so `bg-bg`, `text-fg-muted`, `border-line` and friends follow light and dark mode
automatically. Dark is the default theme; the toggle in the header switches to the tuned light palette.
Type: Bricolage Grotesque (variable, self-hosted) for headlines, Geist for text and Geist Mono for labels.

The public site is mobile-first: every page is laid out for a 390px viewport first and widens up to the 1200px
container. The admin at `/admin` is a fixed-width desktop console (`.admin-root`, min 1360px) and scrolls
horizontally on smaller screens instead of reflowing. Its charts are small dependency-free SVG components in
`src/components/admin/charts.tsx`.
