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

Tokens live in `src/styles/globals.css` (`--bg`, `--fg`, `--accent`, ...) and are exposed to Tailwind through
`@theme inline`, so `bg-bg`, `text-fg-muted`, `border-line` and friends follow light and dark mode automatically.
Type: Instrument Serif for display, Geist for text and mono.
