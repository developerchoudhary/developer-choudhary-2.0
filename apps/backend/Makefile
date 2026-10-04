# ////////////////////////////////////////////////////////////
# //////////////// Portfolio Backend Makefile ////////////////
# ////////////////////////////////////////////////////////////
#
# Usage:
#   make          - show help
#   make run      - run API server
#   make build    - build all binaries
#   make migrate-up   - run migrations up
#   make seed     - seed admin user and starter content
#

.PHONY: help build build-api run test lint vet fmt tidy clean \
		migrate-up migrate-down migrate-force run-migrate \
		run-api run-scheduler run-worker seed \
		docker-up docker-down docker-logs \
		install-deps swagger

help:
	@echo "Portfolio Backend - Makefile targets"
	@echo ""
	@echo "  build          Build all binaries (api, migrate, scheduler, worker, seed)"
	@echo "  run            Run API server (alias: run-api)"
	@echo "  test           Run tests"
	@echo "  lint           Run go vet"
	@echo "  fmt            Format code (go fmt)"
	@echo "  tidy           Run go mod tidy"
	@echo "  clean          Remove built binaries"
	@echo ""
	@echo "  migrate-up     Run database migrations (up)"
	@echo "  migrate-down   Rollback migrations (down)"
	@echo "  migrate-force  Force migration version (e.g. make migrate-force V=1)"
	@echo "  seed           Create the admin user and starter content (idempotent)"
	@echo ""
	@echo "  run-api        Run API server"
	@echo "  run-scheduler  Run scheduler (publishes scheduled posts, cleans sessions)"
	@echo "  run-worker     Run worker (email outbox dispatcher)"
	@echo ""
	@echo "  docker-up      Start Postgres, MinIO and Gotenberg via Docker Compose"
	@echo "  docker-down    Stop Docker Compose"
	@echo "  docker-logs    Tail Docker Compose logs"
	@echo ""
	@echo "  install-deps   Download Go modules"
	@echo "  swagger        Regenerate Swagger docs"

# ------------------------------------------------------------------------------
# Build
# ------------------------------------------------------------------------------
build:
	@echo "Building binaries..."
	@go build -o bin/api ./cmd/api
	@go build -o bin/migrate ./cmd/migrate
	@go build -o bin/scheduler ./cmd/scheduler
	@go build -o bin/worker ./cmd/worker
	@go build -o bin/seed ./cmd/seed
	@echo "Done. Binaries in ./bin/"

build-api:
	@go build -o bin/api ./cmd/api
	@echo "Built ./bin/api"

# ------------------------------------------------------------------------------
# Run
# ------------------------------------------------------------------------------
run: run-api

run-api:
	@echo "Starting API server..."
	@go run ./cmd/api

run-scheduler:
	@go run ./cmd/scheduler

run-worker:
	@go run ./cmd/worker

seed:
	@go run ./cmd/seed

# ------------------------------------------------------------------------------
# Migrations
# ------------------------------------------------------------------------------
migrate-up:
	@echo "Running migrations (up)..."
	@go run ./cmd/migrate -direction=up

migrate-down:
	@echo "Rolling back migrations (down)..."
	@go run ./cmd/migrate -direction=down

migrate-force:
	@if [ -z "$(V)" ]; then echo "Usage: make migrate-force V=1"; exit 1; fi
	@go run ./cmd/migrate -force=$(V)

run-migrate:
	@go run ./cmd/migrate -direction=$${DIR:-up}

# ------------------------------------------------------------------------------
# Quality
# ------------------------------------------------------------------------------
test:
	@go test ./...

lint: vet

vet:
	@go vet ./...

fmt:
	@go fmt ./...

tidy:
	@go mod tidy

clean:
	@rm -rf bin/
	@echo "Removed ./bin/"

install-deps:
	@go mod download
	@echo "Dependencies downloaded."

# ------------------------------------------------------------------------------
# Docker (local infrastructure only)
# ------------------------------------------------------------------------------
docker-up:
	@docker compose -f deployments/docker/docker-compose.yml up -d

docker-down:
	@docker compose -f deployments/docker/docker-compose.yml down

docker-logs:
	@docker compose -f deployments/docker/docker-compose.yml logs -f

swagger:
	@echo "Regenerating Swagger docs..."
	@go run github.com/swaggo/swag/cmd/swag@v1.16.3 init -g cmd/api/main.go -d . -o docs --parseInternal
	@echo "Done. Docs in ./docs/. Serve API and open /swagger/index.html"
