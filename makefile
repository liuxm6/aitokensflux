FRONTEND_DIR = ./web/default
FRONTEND_CLASSIC_DIR = ./web/classic
FRONTEND_CUSTOMER_DIR = ./web/customer
BACKEND_DIR = .
DEV_FRONTEND_DEFAULT_PORT ?= 5173
DEV_FRONTEND_CLASSIC_PORT ?= 5174
DEV_FRONTEND_CUSTOMER_PORT ?= 5175
DEV_COMPOSE_FILE = docker-compose.dev.yml
DEV_POSTGRES_SERVICE = postgres
DEV_REDIS_SERVICE = redis
DEV_BACKEND_SERVICE = new-api
DEV_POSTGRES_DB = new-api
DEV_POSTGRES_USER = root
DEV_POSTGRES_PASSWORD ?= 123456
DEV_POSTGRES_HOST ?= 127.0.0.1
DEV_POSTGRES_PORT ?= 15432
DEV_SQL_DSN ?= postgresql://$(DEV_POSTGRES_USER):$(DEV_POSTGRES_PASSWORD)@$(DEV_POSTGRES_HOST):$(DEV_POSTGRES_PORT)/$(DEV_POSTGRES_DB)?sslmode=disable
DEV_SQLITE_PATH ?= one-api.db

.PHONY: all build-frontend build-frontend-classic build-frontend-customer build-all-frontends start-backend dev dev-db dev-api dev-api-rebuild dev-web dev-web-classic dev-web-customer reset-setup

all: build-all-frontends start-backend

build-frontend:
	@echo "Building default frontend..."
	@cd ./web && bun install --frozen-lockfile
	@cd $(FRONTEND_DIR) && DISABLE_ESLINT_PLUGIN='true' VITE_REACT_APP_VERSION=$(cat ../../VERSION) bun run build

build-frontend-classic:
	@echo "Building classic frontend..."
	@cd ./web && bun install --frozen-lockfile
	@cd $(FRONTEND_CLASSIC_DIR) && VITE_REACT_APP_VERSION=$(cat ../../VERSION) bun run build

build-frontend-customer:
	@echo "Building customer frontend..."
	@cd ./web && bun install --frozen-lockfile
	@cd $(FRONTEND_CUSTOMER_DIR) && VITE_REACT_APP_VERSION=$(cat ../../VERSION) bun run build

build-all-frontends: build-frontend build-frontend-classic build-frontend-customer

start-backend:
	@echo "Starting backend dev server with Docker PostgreSQL..."
	@cd $(BACKEND_DIR) && SQL_DSN="$${SQL_DSN:-$(DEV_SQL_DSN)}" go run main.go &

dev-api:
	@echo "Starting backend services (docker)..."
	@docker compose -f $(DEV_COMPOSE_FILE) up -d

dev-db:
	@echo "Starting dev PostgreSQL and Redis (docker)..."
	@docker compose -f $(DEV_COMPOSE_FILE) up -d $(DEV_POSTGRES_SERVICE) $(DEV_REDIS_SERVICE)

dev-api-rebuild:
	@echo "Rebuilding and starting backend service (docker)..."
	@docker compose -f $(DEV_COMPOSE_FILE) up -d --build $(DEV_BACKEND_SERVICE)

dev-web:
	@echo "Starting frontend dev servers..."
	@echo "Default admin frontend: http://localhost:$(DEV_FRONTEND_DEFAULT_PORT)/admin/"
	@echo "Classic admin frontend: http://localhost:$(DEV_FRONTEND_CLASSIC_PORT)/admin/"
	@echo "Customer frontend: http://localhost:$(DEV_FRONTEND_CUSTOMER_PORT)"
	@cd ./web && bun install
	@(cd $(FRONTEND_DIR) && bun run dev -- --host 0.0.0.0 --port $(DEV_FRONTEND_DEFAULT_PORT)) & \
		default_pid=$$!; \
	(cd $(FRONTEND_CLASSIC_DIR) && bun run dev -- --host 0.0.0.0 --port $(DEV_FRONTEND_CLASSIC_PORT)) & \
		classic_pid=$$!; \
	(cd $(FRONTEND_CUSTOMER_DIR) && bun run dev -- --host 0.0.0.0 --port $(DEV_FRONTEND_CUSTOMER_PORT)) & \
		customer_pid=$$!; \
		trap 'kill $$default_pid $$classic_pid $$customer_pid 2>/dev/null; wait $$default_pid $$classic_pid $$customer_pid 2>/dev/null; exit 130' INT TERM; \
		while kill -0 $$default_pid 2>/dev/null && kill -0 $$classic_pid 2>/dev/null && kill -0 $$customer_pid 2>/dev/null; do \
			sleep 1; \
		done; \
		if ! kill -0 $$default_pid 2>/dev/null; then \
			wait $$default_pid; \
			status=$$?; \
			kill $$classic_pid $$customer_pid 2>/dev/null; \
			wait $$classic_pid $$customer_pid 2>/dev/null; \
			exit $$status; \
		fi; \
		if ! kill -0 $$classic_pid 2>/dev/null; then \
			wait $$classic_pid; \
			status=$$?; \
			kill $$default_pid $$customer_pid 2>/dev/null; \
			wait $$default_pid $$customer_pid 2>/dev/null; \
			exit $$status; \
		fi; \
		wait $$customer_pid; \
		status=$$?; \
		kill $$default_pid $$classic_pid 2>/dev/null; \
		wait $$default_pid $$classic_pid 2>/dev/null; \
		exit $$status

dev-web-classic:
	@echo "Starting classic frontend dev server..."
	@cd ./web && bun install
	@cd $(FRONTEND_CLASSIC_DIR) && bun run dev -- --host 0.0.0.0 --port $(DEV_FRONTEND_CLASSIC_PORT)

dev-web-customer:
	@echo "Starting customer frontend dev server..."
	@cd ./web && bun install
	@cd $(FRONTEND_CUSTOMER_DIR) && bun run dev -- --host 0.0.0.0 --port $(DEV_FRONTEND_CUSTOMER_PORT)

dev: dev-api dev-web

reset-setup:
	@echo "Resetting local setup wizard state..."
	@if docker compose -f $(DEV_COMPOSE_FILE) ps --services --status running | grep -qx "$(DEV_POSTGRES_SERVICE)"; then \
		echo "Detected running docker dev PostgreSQL. Removing setup record and root users..."; \
		docker compose -f $(DEV_COMPOSE_FILE) exec -T $(DEV_POSTGRES_SERVICE) \
			psql -U $(DEV_POSTGRES_USER) -d $(DEV_POSTGRES_DB) \
			-c 'DELETE FROM setups;' \
			-c 'DELETE FROM users WHERE role = 100;' \
			-c "DELETE FROM options WHERE key IN ('SelfUseModeEnabled', 'DemoSiteEnabled');"; \
		echo "Restarting docker dev backend so setup status is recalculated..."; \
		docker compose -f $(DEV_COMPOSE_FILE) restart $(DEV_BACKEND_SERVICE); \
	elif db_path="$${SQLITE_PATH:-$(DEV_SQLITE_PATH)}"; db_path="$${db_path%%\?*}"; [ -f "$$db_path" ]; then \
		db_path="$${SQLITE_PATH:-$(DEV_SQLITE_PATH)}"; \
		db_path="$${db_path%%\?*}"; \
		echo "Detected local SQLite database: $$db_path"; \
		sqlite3 "$$db_path" \
			"DELETE FROM setups; DELETE FROM users WHERE role = 100; DELETE FROM options WHERE key IN ('SelfUseModeEnabled', 'DemoSiteEnabled');"; \
		echo "SQLite setup state reset. Restart the local backend process before testing the setup wizard."; \
	else \
		echo "No running docker dev PostgreSQL or local SQLite database found."; \
		echo "Start the dev stack with 'make dev-api', or set SQLITE_PATH/DEV_SQLITE_PATH to your local SQLite database."; \
		exit 1; \
	fi
