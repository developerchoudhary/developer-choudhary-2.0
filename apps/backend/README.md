# Portfolio Backend

Go API for developerchoudhary.com. Stores content and leads in PostgreSQL, files in MinIO, renders resume PDFs with
Gotenberg and sends email through SMTP.

## Layout

```
cmd/          api · migrate · scheduler · worker · seed
internal/
  app/        HTTP server wiring and lifecycle
  config/     environment access
  db/         Postgres connection, SQL migrations, seed data
  modules/    one package per domain: handler → service → repository
  middleware/ auth, permissions, audit context, request id, rate limit
  mail/       SMTP sender (STARTTLS or implicit TLS)
  objectstore/ MinIO client
  pdf/        Gotenberg client
  render/     resume templates and data model
  templates/  embedded HTML (resume, email) and fonts
  revalidate/ purges Next.js cache tags after content changes
  transport/  route registration
pkg/          authz, httputil, pagination, slug, utils (no app imports)
```

Every handler returns the envelope `{ "success", "message", "data", "meta"? }`.

## Running

```sh
cp .env.example .env
make docker-up        # Postgres, MinIO, Gotenberg
make migrate-up
make seed             # admin user from ADMIN_* plus starter content; safe to re-run
make run              # :8080
make test
```

`make run-scheduler` publishes scheduled posts every minute, removes expired sessions hourly and prunes visits older
than 13 months daily. Emails are queued in `email_outbox` and sent by the dispatcher inside the API
(`EMAIL_DISPATCH_IN_API=true`) or by `make run-worker`.

## Authentication

Admin login returns a 15-minute access token (HS256, `sub`=user, `aud`=session) and sets an httpOnly refresh cookie
scoped to `/api/v1/admin/auth`. Refresh tokens rotate on every use. Roles: `admin` (all permissions) and `editor`
(content, blog, media, reviews, read leads).

## Public write endpoints

`POST /api/v1/public/leads`, `/reviews`, `/visits` and `/posts/:slug/view` are rate limited per IP, trim input,
and use honeypot fields. Leads from the same IP are flagged as spam after five submissions an hour.

## Files

Uploads are stored under `uploads/{category}/{yyyy}/{mm}/{dd}/{ulid}{ext}` and streamed from
`/uploads/...` with immutable cache headers. The ingress routes that path to this service.
