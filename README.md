# developerchoudhary.com

Portfolio and client-acquisition site for Aman Choudhary, built the same way as the production systems it showcases:
a Go API, a Next.js frontend, PostgreSQL, MinIO and Gotenberg, deployed to a self-hosted k3s cluster with GitOps.

```
apps/
  backend/     Go 1.24 · Gin · Bun · golang-migrate · MinIO · Gotenberg
  frontend/    Next.js 16 · React 19 · Tailwind CSS 4 · Biome
k8s/
  backend/     kustomize base + dev/prod overlays
  frontend/    kustomize base + dev/prod overlays (Traefik ingress, www redirect)
  infrastructure/  Postgres, MinIO, Gotenberg, backup CronJob
  argocd/      Applications and image updaters
.github/workflows/  GHCR image builds on dev/prod, checks on pull requests
```

## What the site does

- Public pages: home, work (case studies with completed / in-progress / upcoming status), services (one SEO page
  per service), about (story, experience, skills, education), blog with categories and tags, reviews, contact,
  resume, privacy and terms. Mobile-first, dark by default with a light theme.
- Everything is editable from `/admin`: taglines, profile, services, projects, skills, experience, education,
  certifications, blog posts (block editor with preview and scheduling), reviews moderation, leads pipeline with
  notes and CSV export, an analytics dashboard (traffic over 7/30/90/365 days with period comparison, pages,
  referrers, devices, countries, consented locations), media library and a resume generator.
- Leads from the contact form are stored, the admin is emailed and the visitor receives an auto-reply.
- Visitors may share their location; it is stored only with consent and shown per lead and in analytics.
- The resume PDF is generated from live data through Gotenberg and versioned; `/resume` always serves the current one.
- SEO: per-page metadata, JSON-LD (Person, ProfessionalService, Article, Service, FAQ, Breadcrumb), sitemap, RSS,
  dynamic Open Graph images, canonical URLs, and ISR cache tags purged by the API on every content change.

## Local development

Requirements: Go 1.24+, Node 22, pnpm 10, Docker.

```sh
# infrastructure
cd apps/backend && make docker-up

# backend
cp .env.example .env            # fill SMTP + admin credentials
make migrate-up && make seed    # creates the admin user and starter content
make run                        # http://localhost:8080

# frontend
cd ../frontend && cp .env.example .env
pnpm install && pnpm dev        # http://localhost:3000 · admin at /admin
```

The frontend proxies `/api/v1` and `/uploads` to `API_URL`, so the browser only ever talks to one origin.

## Deployment

1. Create the namespaces and secrets (`k8s/namespaces.yaml`, `k8s/secrets.example.yaml`), plus `ghcr-secret` in
   `portfolio`, `portfolio-dev` and `argocd`.
2. Apply `k8s/argocd/applications` and `k8s/argocd/image-updaters`.
3. Push to `dev` or `prod`. GitHub Actions builds `ghcr.io/developerchoudhary/portfolio-backend` and
   `portfolio-frontend` tagged `<env>-<sha>`; ArgoCD Image Updater writes the tag back to the overlay and syncs.
4. Point DNS at the cluster: `developerchoudhary.com`, `www`, `dev`, and `storage` (MinIO console).

The backend Deployment runs migrations and the idempotent seed as init containers, so a fresh cluster is usable
right after the first sync. Postgres is backed up every six hours to `/opt/portfolio-postgres-backups` on the node.

See `apps/backend/README.md`, `apps/backend/API.md` and `apps/frontend/README.md` for details.
