#!/usr/bin/env bash
# Local development helper for developerchoudhary.com.
#
#   scripts/dev.sh start      containers + migrations + seed + API (:8080) + web (:3000)
#   scripts/dev.sh stop       stop API and web, then the containers (data volumes are kept)
#   scripts/dev.sh restart    stop, then start
#   scripts/dev.sh status     what is running, with URLs
#   scripts/dev.sh logs       tail API and web logs (or: logs api | logs web | logs infra)
#   scripts/dev.sh infra      containers only (Postgres, MinIO, Gotenberg)
#   scripts/dev.sh reset-db   DANGER: delete the database and uploads, then start fresh
#
# State lives in .dev/ (pid files, logs, the built API binary); it is git-ignored.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND="$ROOT/apps/backend"
FRONTEND="$ROOT/apps/frontend"
COMPOSE_FILE="$BACKEND/deployments/docker/docker-compose.yml"
STATE="$ROOT/.dev"
LOGS="$STATE/logs"
API_PORT="${API_PORT:-8080}"
WEB_PORT="${WEB_PORT:-3000}"

mkdir -p "$LOGS" "$STATE/bin"

bold() { printf '\033[1m%s\033[0m\n' "$*"; }
info() { printf '  %s\n' "$*"; }
ok()   { printf '  \033[32m✓\033[0m %s\n' "$*"; }
die()  { printf '  \033[31m✗\033[0m %s\n' "$*" >&2; exit 1; }

compose() { docker compose -f "$COMPOSE_FILE" "$@"; }

need() { command -v "$1" >/dev/null 2>&1 || die "$1 is required ($2)"; }

check_tools() {
  need docker "https://docs.docker.com/get-docker/"
  docker info >/dev/null 2>&1 || die "Docker is installed but not running"
  need go "Go 1.24+, https://go.dev/dl/"
  need node "Node 22+, https://nodejs.org/"
  if ! command -v pnpm >/dev/null 2>&1; then
    corepack enable >/dev/null 2>&1 && corepack prepare pnpm@10 --activate >/dev/null 2>&1 || true
    command -v pnpm >/dev/null 2>&1 || die "pnpm is required; run: corepack enable && corepack prepare pnpm@10 --activate"
  fi
}

ensure_env() {
  if [ ! -f "$BACKEND/.env" ]; then
    cp "$BACKEND/.env.example" "$BACKEND/.env"
    info "created apps/backend/.env from .env.example — set ADMIN_PASSWORD and the SMTP_* values"
  fi
  if [ ! -f "$FRONTEND/.env" ]; then
    cp "$FRONTEND/.env.example" "$FRONTEND/.env"
    info "created apps/frontend/.env from .env.example"
  fi
}

port_in_use() {
  if command -v ss >/dev/null 2>&1; then ss -ltn 2>/dev/null | grep -q ":$1 "; else lsof -iTCP:"$1" -sTCP:LISTEN >/dev/null 2>&1; fi
}

pid_of() { [ -f "$STATE/$1.pid" ] && cat "$STATE/$1.pid" 2>/dev/null || true; }
pid_alive() { local pid; pid="$(pid_of "$1")"; [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; }

kill_tree() { # TERM a process and its descendants, then KILL whatever is left
  local pid=$1 child
  for child in $(pgrep -P "$pid" 2>/dev/null || true); do kill_tree "$child"; done
  kill -TERM "$pid" 2>/dev/null || true
  for _ in 1 2 3 4 5 6 7 8 9 10; do kill -0 "$pid" 2>/dev/null || return 0; sleep 0.5; done
  kill -KILL "$pid" 2>/dev/null || true
}

wait_for_port() { # port, name, seconds
  local n=$3
  until port_in_use "$1"; do
    n=$((n - 1)); [ "$n" -gt 0 ] || die "$2 did not start on :$1 — see $LOGS/$2.log"
    sleep 1
  done
}

wait_healthy() {
  local n=60 pg mn
  while :; do
    pg="$(compose ps --format '{{.Health}}' postgres 2>/dev/null || true)"
    mn="$(compose ps --format '{{.Health}}' minio 2>/dev/null || true)"
    [ "$pg" = "healthy" ] && [ "$mn" = "healthy" ] && return 0
    n=$((n - 1)); [ "$n" -gt 0 ] || die "containers did not become healthy — run: scripts/dev.sh logs infra"
    sleep 2
  done
}

infra_up() {
  bold "Infrastructure"
  compose up -d >/dev/null
  wait_healthy
  ok "Postgres :5432, MinIO :9000 (console :9001), Gotenberg :3001"
}

migrate_and_seed() {
  bold "Database"
  (cd "$BACKEND" && go run ./cmd/migrate -direction=up >"$LOGS/migrate.log" 2>&1) || die "migrations failed — see $LOGS/migrate.log"
  ok "migrations applied"
  (cd "$BACKEND" && go run ./cmd/seed >"$LOGS/seed.log" 2>&1) || die "seed failed — see $LOGS/seed.log"
  ok "seed applied (idempotent: creates the admin user and starter content only when missing)"
}

api_up() {
  bold "API"
  if pid_alive api; then ok "already running (pid $(pid_of api))"; return; fi
  port_in_use "$API_PORT" && die "port :$API_PORT is already in use by another process"
  (cd "$BACKEND" && go build -o "$STATE/bin/api" ./cmd/api) || die "API build failed"
  (
    cd "$BACKEND" || exit 1
    # only the server is backgrounded (not the cd), stdio is detached, and $! is the server's own pid
    PORT="$API_PORT" nohup "$STATE/bin/api" >"$LOGS/api.log" 2>&1 </dev/null &
    echo $! >"$STATE/api.pid"
  )
  wait_for_port "$API_PORT" api 60
  ok "http://localhost:$API_PORT (pid $(pid_of api)) — logs: .dev/logs/api.log"
}

web_up() {
  bold "Web"
  if pid_alive web; then ok "already running (pid $(pid_of web))"; return; fi
  port_in_use "$WEB_PORT" && die "port :$WEB_PORT is already in use by another process"
  if [ ! -d "$FRONTEND/node_modules" ]; then
    info "installing frontend dependencies"
    (cd "$FRONTEND" && pnpm install --frozen-lockfile >"$LOGS/pnpm-install.log" 2>&1) || die "pnpm install failed — see $LOGS/pnpm-install.log"
  fi
  (
    cd "$FRONTEND" || exit 1
    nohup "$FRONTEND/node_modules/.bin/next" dev -p "$WEB_PORT" >"$LOGS/web.log" 2>&1 </dev/null &
    echo $! >"$STATE/web.pid"
  )
  wait_for_port "$WEB_PORT" web 120
  ok "http://localhost:$WEB_PORT (pid $(pid_of web)) — logs: .dev/logs/web.log"
}

stop_proc() {
  local name=$1 pid
  pid="$(pid_of "$name")"
  if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then kill_tree "$pid"; ok "stopped $name (pid $pid)"; fi
  rm -f "$STATE/$name.pid"
}

cmd_start() {
  check_tools
  ensure_env
  infra_up
  migrate_and_seed
  api_up
  web_up
  echo
  bold "Ready"
  info "Site   http://localhost:$WEB_PORT"
  info "Admin  http://localhost:$WEB_PORT/admin  (ADMIN_EMAIL / ADMIN_PASSWORD from apps/backend/.env)"
  info "API    http://localhost:$API_PORT/health"
  info "MinIO  http://localhost:9001  (MINIO_ROOT_USER / MINIO_ROOT_PASSWORD, default minioadmin)"
  info "Stop with: scripts/dev.sh stop"
}

cmd_stop() {
  bold "Stopping"
  stop_proc web
  stop_proc api
  compose down >/dev/null 2>&1 && ok "containers stopped (data volumes kept)"
}

cmd_status() {
  bold "Containers"
  compose ps --format 'table {{.Name}}\t{{.Status}}\t{{.Ports}}' 2>/dev/null || info "none"
  bold "Processes"
  for name in api web; do
    if pid_alive "$name"; then ok "$name running (pid $(pid_of "$name"))"; else info "$name stopped"; fi
  done
  bold "URLs"
  info "http://localhost:$WEB_PORT   http://localhost:$WEB_PORT/admin   http://localhost:$API_PORT/health"
}

cmd_logs() {
  case "${1:-all}" in
    api)   tail -n 100 -f "$LOGS/api.log" ;;
    web)   tail -n 100 -f "$LOGS/web.log" ;;
    infra) compose logs -f --tail=100 ;;
    *)     tail -n 50 -f "$LOGS/api.log" "$LOGS/web.log" ;;
  esac
}

cmd_reset_db() {
  bold "Reset database and uploads"
  printf '  This deletes the Postgres and MinIO volumes. Type "reset" to continue: '
  read -r answer
  [ "$answer" = "reset" ] || { info "cancelled"; exit 0; }
  stop_proc web; stop_proc api
  compose down -v >/dev/null 2>&1 && ok "volumes removed"
  cmd_start
}

case "${1:-}" in
  start)    cmd_start ;;
  stop)     cmd_stop ;;
  restart)  cmd_stop; echo; cmd_start ;;
  status)   cmd_status ;;
  logs)     cmd_logs "${2:-all}" ;;
  infra)    check_tools; infra_up ;;
  reset-db) check_tools; ensure_env; cmd_reset_db ;;
  *)
    sed -n '2,13p' "$0" | sed 's/^# \{0,1\}//'
    exit 1
    ;;
esac
