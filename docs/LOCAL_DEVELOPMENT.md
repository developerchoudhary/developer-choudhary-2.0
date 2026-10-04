# Running the project locally

Everything runs on your machine: three containers (PostgreSQL, MinIO, Gotenberg), the Go API and the
Next.js app. One script starts and stops all of it.

## Prerequisites

| Tool | Version | Notes |
| --- | --- | --- |
| Docker with Compose | any recent | Docker Desktop or Docker Engine; must be running |
| Go | 1.24+ | `go version` |
| Node.js | 22+ | `node --version` |
| pnpm | 10 | `corepack enable && corepack prepare pnpm@10 --activate` (ships with Node, no global install) |

## Start

```sh
scripts/dev.sh start
```

What it does, in order:

1. Creates `apps/backend/.env` and `apps/frontend/.env` from the `.env.example` files if they do not exist.
   Open `apps/backend/.env` and set `ADMIN_PASSWORD` (and `SMTP_*` if you want emails) before the first start.
2. Starts the containers and waits until Postgres and MinIO report healthy.
3. Applies database migrations and the idempotent seed (admin user from `ADMIN_EMAIL` / `ADMIN_PASSWORD`,
   starter content only when the tables are empty).
4. Builds and starts the API on http://localhost:8080.
5. Installs frontend dependencies if needed and starts Next.js on http://localhost:3000.

Then open:

- Site: http://localhost:3000
- Admin: http://localhost:3000/admin, sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `apps/backend/.env`
- API health: http://localhost:8080/health
- MinIO console: http://localhost:9001 (`MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD`, default `minioadmin`)

Logs and pid files live in `.dev/` (git-ignored): `scripts/dev.sh logs`, `logs api`, `logs web`, `logs infra`.

## Stop

```sh
scripts/dev.sh stop
```

Stops the web and API processes, then the containers. **Data is kept**: the Postgres and MinIO volumes
(`portfolio_postgres_data`, `portfolio_minio_data`) survive a stop, so the next start has the same content.

Other commands:

```sh
scripts/dev.sh status      # what is running
scripts/dev.sh restart     # stop, then start
scripts/dev.sh infra       # containers only, when you want to run the API or web yourself
scripts/dev.sh reset-db    # DELETES the database and uploads, then starts fresh (asks for confirmation)
```

## Doing it by hand

The script only sequences the commands below; use them directly when you want more control.

```sh
# infrastructure (from apps/backend)
make docker-up                # docker compose up -d
make docker-down              # docker compose down (volumes kept)
make docker-logs

# backend (from apps/backend, reads .env)
make migrate-up
make seed
make run                      # API on :8080
make run-scheduler            # publishes scheduled posts, prunes sessions and old visits
make test && make vet

# frontend (from apps/frontend, reads .env)
pnpm install
pnpm dev                      # :3000
pnpm lint && pnpm typecheck && pnpm build
```

The frontend proxies `/api/v1` and `/uploads` to `API_URL`, so the browser only talks to `localhost:3000`.
Admin changes purge the Next.js cache through `/api/revalidate`; `REVALIDATE_SECRET` must match in both
`.env` files (the examples already agree).

## Troubleshooting

- **"port :3000 / :8080 is already in use"** — something else is listening. Find it with `ss -ltnp | grep 3000`
  (or `lsof -i :3000`) and stop it, or run with other ports: `WEB_PORT=3100 API_PORT=8081 scripts/dev.sh start`
  (then update `ALLOWED_ORIGINS`, `SITE_URL` and `API_URL` in the `.env` files to match).
- **Admin login fails** — the seed only sets the password when it creates the admin user. If you changed
  `ADMIN_PASSWORD` later, either sign in with the old one and change it under Account & users, or run
  `scripts/dev.sh reset-db`.
- **pnpm: command not found** — `corepack enable && corepack prepare pnpm@10 --activate`.
- **Emails fail with `535`** — `SMTP_USERNAME` / `SMTP_PASSWORD` are placeholders. Messages wait in the
  `email_outbox` table and are retried once real credentials are set; nothing else is affected.
- **Uploaded images do not render on the site** — in development the API serves uploads from
  `http://localhost:8080`, which Next.js only allows because `dangerouslyAllowLocalIP` is enabled for
  `NODE_ENV=development`. In production uploads come from the public domain.
- **Containers never become healthy** — `scripts/dev.sh logs infra`. On a fresh machine the first start pulls
  three images and can take a few minutes.
- **A stale `.dev/*.pid`** after a crash — `scripts/dev.sh stop` ignores pids that are no longer alive; just run
  `start` again.
