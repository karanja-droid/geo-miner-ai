# Makefile for GeoVision AI Miner Server

.PHONY: all setup test build deploy clean ci-test ci-build ci-deploy dev init-db help export_env

SHELL := /bin/bash
ENVIRONMENT ?= development

# Default environment file
ENV_FILE ?= .env

# Load environment variables from .env file if it exists
ifneq (,$(wildcard $(ENV_FILE)))
    include $(ENV_FILE)
    export
endif

all: build

setup:
	@echo "Setting up GeoVision AI Miner Server..."
	@echo "Please ensure Docker and Docker Compose (V2 CLI: docker compose) are installed."
	@echo "Run 'make dev' to start development environment or configure .env and run 'make deploy'."
	@if [ ! -f "$(ENV_FILE)" ]; then \
		echo "INFO: $(ENV_FILE) not found. Copying from env.example or .env.example..."; \
		if [ -f "env.example" ]; then \
			cp env.example $(ENV_FILE); \
		elif [ -f ".env.example" ]; then \
			cp .env.example $(ENV_FILE); \
		else \
			echo "WARNING: No env.example or .env.example found to create $(ENV_FILE). Please create it manually."; \
		fi; \
	else \
		echo "INFO: $(ENV_FILE) already exists."; \
	fi

dev:
	@echo "Starting development environment with docker compose..."
	docker compose -f docker-compose.yml up -d --build

init-db:
	@echo "Initializing database..."
	@echo "Waiting for PostgreSQL to be ready..."
	@until docker compose exec postgres pg_isready -U "${POSTGRES_USER:-geominer}" -d "${POSTGRES_DB:-geominer_ai_miner}" -q; do \
		sleep 2; \
	done
	@echo "PostgreSQL is ready."
	@echo "Running Alembic migrations..."
	docker compose exec backend alembic upgrade head
	@echo "Database initialization and migrations complete."

test:
	@echo "Running backend tests..."
	docker compose exec backend pytest app/tests

# Example for test coverage - adjust command as needed
test-coverage:
	@echo "Running backend tests with coverage..."
	docker compose exec backend pytest --cov=app app/tests

build:
	@echo "Building Docker images for server components using docker compose..."
	docker compose -f docker-compose.yml build backend celery_worker celery_beat

deploy:
	@echo "Deploying GeoVision AI Miner Server using script..."
	@bash ./scripts/deploy.sh $(ENVIRONMENT)

ci-test: test
	@echo "CI Tests completed."

ci-build: build
	@echo "CI Build completed."

ci-deploy: deploy
	@echo "CI Deploy triggered for environment: $(ENVIRONMENT)."

clean:
	@echo "Cleaning up Docker resources..."
	docker compose -f docker-compose.yml down -v --remove-orphans
	@echo "Docker cleanup complete."

help:
	@echo "Available targets:"
	@echo "  setup         - Perform initial setup (e.g., copy .env file)."
	@echo "  dev           - Start all services for development (docker compose up)."
	@echo "  init-db       - Initialize the database and run migrations (after 'make dev')."
	@echo "  test          - Run backend tests."
	@echo "  test-coverage - Run backend tests with coverage."
	@echo "  build         - Build Docker images for the backend services."
	@echo "  deploy        - Deploy the application using the deploy.sh script (pass ENVIRONMENT, e.g., make deploy ENVIRONMENT=production)."
	@echo "  ci-test       - Alias for 'test' for CI."
	@echo "  ci-build      - Alias for 'build' for CI."
	@echo "  ci-deploy     - Alias for 'deploy' for CI (pass ENVIRONMENT)."
	@echo "  clean         - Stop and remove Docker containers, volumes, and networks."
	@echo "  help          - Show this help message."

# Ensure .env variables are available to docker-compose if not passed by shell
# This is mostly illustrative as docker-compose itself handles .env files.
# However, explicit export can be useful for scripts called by make.
export_env:
ifeq (,$(wildcard .env))
	$(error ".env file not found. Please run 'make setup' or create it manually.")
endif
	set -a; source .env; set +a
