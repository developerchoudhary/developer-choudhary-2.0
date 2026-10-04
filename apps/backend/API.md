# API reference

Base URL: `/api/v1`. Responses: `{ success, message, data }`; lists add `meta` with
`currentPage, pageSize, totalItems, totalPages`. List endpoints accept `page`, `pageSize`, `search`, `sortBy`,
`sortOrder` and the filters listed below.

## Public (no auth, cached 60s)

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/public/site` | profile, public settings, taglines, skill groups, review summary, current resume |
| GET | `/public/sitemap` | slugs and timestamps for services, projects, posts, categories, tags |
| GET | `/public/services`, `/public/services/:slug` | published services |
| GET | `/public/skills` | grouped by category |
| GET | `/public/experience`, `/public/education`, `/public/certifications` | |
| GET | `/public/projects` | filters `projectType`, `status` (`upcoming`, `in-progress`, `completed`), `search`; `/featured?limit=`; `/:slug` includes `related` |
| GET | `/public/posts` | filters `category`, `tag`, `search`; `/recent?limit=`; `/:slug` includes `related` |
| GET | `/public/post-categories[/:slug]`, `/public/post-tags[/:slug]` | with published post counts |
| GET | `/public/reviews?featured=&limit=`, `/public/reviews/summary` | approved only |
| GET | `/public/resume`, `/public/resume/download` | current version; download redirects and counts |
| POST | `/public/leads` | contact form (`nickname` honeypot) |
| POST | `/public/reviews` | pending until approved (`website` honeypot) |
| POST | `/public/visits` | page view with optional consented location |
| POST | `/public/posts/:slug/view` | increments the view counter |

## Admin (Bearer token)

| Area | Endpoints |
| --- | --- |
| Auth | `POST /admin/auth/login`, `POST /admin/auth/refresh`, `POST /admin/auth/logout`, `GET /admin/auth/me`, `PUT /admin/auth/password` |
| Dashboard | `GET /admin/dashboard` |
| Users | `GET/POST /admin/users`, `PUT /admin/users/:id` |
| Profile | `GET/PUT /admin/profile` |
| Settings | `GET /admin/settings`, `PUT /admin/settings` (`{ items: [{ key, value, isPublic, description }] }`) |
| Catalog | `GET/POST /admin/{taglines,services,skills,projects,experience,education,certifications}`, `GET/PUT/DELETE .../:id`, `POST .../reorder` (`{ ids }`) |
| Blog | `GET/POST /admin/posts`, `GET/PUT/DELETE /admin/posts/:id`, `GET /admin/posts/preview/:slug`, categories and tags under `/admin/post-categories`, `/admin/post-tags` |
| Media | `GET/POST /admin/media` (multipart `file`, `folder`, `altText`, `visibility`), `GET /admin/media/folders`, `GET/PUT/DELETE /admin/media/:id` |
| Reviews | `GET/POST /admin/reviews`, `GET/PUT/DELETE /admin/reviews/:id`, `PATCH /admin/reviews/:id/status` (`{ status, isFeatured }`) |
| Leads | `GET /admin/leads` (filters `status`, `priority`, `country`, `createdAtFrom/To`), `GET /admin/leads/stats` (totals, by status, by service interest, 30-day daily counts), `GET /admin/leads/export` (CSV), `GET/PUT/DELETE /admin/leads/:id`, `POST /admin/leads/:id/notes` |
| Visits | `GET /admin/visits`, `GET /admin/visits/stats?days=7|30|90|365` (views, visitors, previous-period totals, daily and hourly series, top pages/countries/cities/referrers, devices, consented locations) |
| Resumes | `GET /admin/resumes`, `GET /admin/resumes/templates`, `POST /admin/resumes/preview` (HTML), `POST /admin/resumes` (generate), `GET/DELETE /admin/resumes/:id`, `POST /admin/resumes/:id/current` |

Content fields (`description`, `content`) are arrays of blocks: `{ id, type, data }` with types `paragraph, heading,
image, gallery, code, quote, list, callout, divider, embed, table, cta, stats`.

Projects carry a `status` (`upcoming`, `in-progress`, `completed`; default `completed`) in addition to
`isPublished`/`isFeatured`, so upcoming and in-progress work can be shown on the site before it ships.
