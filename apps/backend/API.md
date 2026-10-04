# API reference

Base URL: `/api/v1`. Responses: `{ success, message, data }`; lists add `meta` with
`currentPage, pageSize, totalItems, totalPages`. List endpoints accept `page`, `pageSize`, `search`, `sortBy`,
`sortOrder` and the filters listed below.

## Public (no auth, cached 60s)

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/public/site` | profile, every setting (stored value or registry default), the active `theme` (see Themes), skill groups, review summary, current resume |
| GET | `/public/sitemap` | slugs and timestamps for services, projects, posts, categories, tags |
| GET | `/public/services`, `/public/services/:slug` | published services |
| GET | `/public/experience`, `/public/education`, `/public/certifications` | |
| GET | `/public/projects` | filters `projectType`, `status` (`upcoming`, `in-progress`, `completed`; comma-separated), `service` (a service slug), `search`; `/featured?limit=`; `/facets` (published counts per type); `/:slug` includes `related` |
| GET | `/public/posts` | filters `category`, `tag`, `search`; pinned (`isFeatured`) posts first; `/:slug` includes `related` (same category first) |
| GET | `/public/post-categories[/:slug]`, `/public/post-tags/:slug` | with published post counts |
| GET | `/public/reviews?featured=&limit=` | approved only |
| GET | `/public/resume/download` | redirects to the current PDF and counts the download |
| POST | `/public/leads` | contact form (`nickname` honeypot); `PUBLIC_WRITE_RATE_PER_MINUTE` per IP |
| POST | `/public/reviews` | pending until approved (`website` honeypot); `403` while `features.reviews` is off |
| POST | `/public/visits` | page view with optional consented location; `PUBLIC_TRACK_RATE_PER_MINUTE` per IP |
| POST | `/public/posts/:slug/view` | increments the view counter; tracking rate limit |

## Admin (Bearer token)

| Area | Endpoints |
| --- | --- |
| Auth | `POST /admin/auth/login`, `POST /admin/auth/refresh`, `POST /admin/auth/logout`, `GET /admin/auth/me`, `PUT /admin/auth/password` |
| Dashboard | `GET /admin/dashboard` |
| Users | `GET/POST /admin/users`, `PUT /admin/users/:id` |
| Profile | `GET/PUT /admin/profile` |
| Settings | `GET /admin/settings` (groups of fields: key, kind, label, description, default, value), `PUT /admin/settings` (`{ items: [{ key, value }] }`; unknown keys and invalid values are rejected) |
| Themes | `GET /admin/themes` (active slug, background styles, built-in and custom themes with tokens, CSS and version), `POST /admin/themes/preview` (resolve an unsaved theme: tokens, CSS, readability issues), `POST /admin/themes`, `PUT/DELETE /admin/themes/:id` (custom themes only; the active one cannot be deleted), `PUT /admin/themes/active` (`{ slug }`) |
| Catalog | `GET/POST /admin/{services,skills,projects,experience,education,certifications}`, `PUT/DELETE .../:id`, `GET .../:id` for services, projects and experience |
| Blog | `GET/POST /admin/posts`, `GET/PUT/DELETE /admin/posts/:id`, `GET /admin/posts/preview/:slug`, categories and tags under `/admin/post-categories`, `/admin/post-tags` |
| Media | `GET/POST /admin/media` (multipart `file`, `folder`, `altText`, `visibility`), `GET /admin/media/folders`, `PUT/DELETE /admin/media/:id` |
| Reviews | `GET/POST /admin/reviews`, `PUT/DELETE /admin/reviews/:id`, `PATCH /admin/reviews/:id/status` (`{ status, isFeatured }`) |
| Leads | `GET /admin/leads` (filters `status`, `priority`, `country`, `createdAtFrom/To`), `GET /admin/leads/stats` (totals, by status, 30-day daily counts), `GET /admin/leads/export` (CSV), `GET/PUT/DELETE /admin/leads/:id`, `POST /admin/leads/:id/notes` |
| Visits | `GET /admin/visits`, `GET /admin/visits/stats?days=7|30|90|365` (views, visitors, previous-period totals, daily and hourly series, top pages/countries/cities/referrers, devices, consented locations) |
| Resumes | `GET /admin/resumes`, `GET /admin/resumes/templates`, `POST /admin/resumes/preview` (HTML), `POST /admin/resumes` (generate), `DELETE /admin/resumes/:id`, `POST /admin/resumes/:id/current` |

Content fields (`description`, `content`) are arrays of blocks: `{ id, type, data }` with types `paragraph, heading,
image, gallery, code, quote, list, callout, divider, embed, table, cta, stats`.

Projects carry a `status` (`upcoming`, `in-progress`, `completed`; default `completed`) in addition to
`isPublished`/`isFeatured`, so upcoming and in-progress work can be shown on the site before it ships.

## Settings

Every setting the site reads is declared in `internal/modules/settings/registry.go` with its kind (`string`, `text`,
`url`, `bool`, `link`, `list`), label, help text, default and length limit. The admin settings page is generated from
that registry, the API validates values against it, and keys that are not saved yet are served with their default.
Groups: brand and SEO (`site.name`, `seo.*`), home page buttons (`hero.ctaPrimary`, `hero.ctaSecondary`), the closing
call to action (`cta.title`, `cta.text`), contact (`contact.responseTime`, also used in the auto-reply email, and
`contact.calendarUrl`), `footer.note`, and feature switches (`features.blog`, `features.reviews`, `features.resume`,
`features.locationConsent`).

## Themes

The colours of the public site, the admin accents, emails, résumé PDFs, the favicon and app icons, the manifest
and share images all come from the active theme. Built-in themes live in `internal/modules/themes/presets.go`
(default `powder`); custom themes are rows in `themes`, and the active slug is the hidden `theme.active` setting
(changed only through `PUT /admin/themes/active`).

A theme is a short definition: a background style (`surface`: `slate`, `navy`, `warm`, `graphite`), the logo gradient
(`logoFrom`, `logoTo`), the photo background (`backdrop`) and, for `light` and `dark`, `accent`, `buttonFrom`,
`buttonTo` and `highlight` (all `#rrggbb`). The API derives the full set of CSS custom properties from it and rejects
themes whose text would be hard to read (WCAG 4.5:1 for text and button labels, 3:1 for the role line and the logo
letter); `issues` explains each problem by field.

`theme` in `/public/site` is `{ slug, name, version, css, tokens: { light, dark } }`. The site injects `css`
(`html:root{…}html.dark{…}`) into every page and appends `?v=<version>` to icon and share-image URLs, so browsers and
social networks fetch new ones after a change. Activating or editing the active theme revalidates the `site` tag.
