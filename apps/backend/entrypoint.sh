#!/bin/sh
set -eu

mode="${1:-api}"

case "${mode}" in
  api)
    exec /app/bin/api
    ;;
  scheduler)
    exec /app/bin/scheduler
    ;;
  worker)
    exec /app/bin/worker
    ;;
  seed)
    exec /app/bin/seed
    ;;
  migrate-up)
    exec /app/bin/migrate -direction=up
    ;;
  migrate-down)
    exec /app/bin/migrate -direction=down
    ;;
  migrate-force)
    if [ -z "${2:-}" ]; then
      echo "usage: migrate-force <version>"
      exit 1
    fi
    exec /app/bin/migrate -force="$2"
    ;;
  migrate-and-serve)
    /app/bin/migrate -direction=up
    /app/bin/seed
    exec /app/bin/api
    ;;
  *)
    exec "$@"
    ;;
esac
