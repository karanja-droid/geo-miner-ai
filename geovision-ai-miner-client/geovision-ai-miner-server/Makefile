# GeoMiner AI Backend - Makefile
# ==============================

.PHONY: help install dev build test clean docker-build docker-run docker-stop docker-logs

# Default target
help:
	@echo "GeoMiner AI Backend - Available Commands:"
	@echo ""
	@echo "Development:"
	@echo "  install     - Install dependencies"
	@echo "  dev         - Start development environment"
	@echo "  dev-stop    - Stop development environment"
	@echo "  test        - Run tests"
	@echo "  lint        - Run linting"
	@echo "  format      - Format code"
	@echo ""
	@echo "Database:"
	@echo "  init-db     - Initialize database"
	@echo "  migrate     - Run database migrations"
	@echo "  reset-db    - Reset database"
	@echo ""
	@echo "Docker:"
	@echo "  docker-build - Build Docker image"
	@echo "  docker-run   - Run with Docker Compose"
	@echo "  docker-stop  - Stop Docker services"
	@echo "  docker-logs  - View Docker logs"
	@echo ""
	@echo "Production:"
	@echo "  build       - Build for production"
	@echo "  deploy      - Deploy to production"
	@echo "  clean       - Clean build artifacts"

# Development Commands
install:
	@echo "Installing dependencies..."
	pip install -e ".[dev]"
	pre-commit install

dev:
	@echo "Starting development environment..."
	docker-compose -f docker-compose.dev.yml up -d
	@echo "Development environment started!"
	@echo "API: http://localhost:8000"
	@echo "API Docs: http://localhost:8000/docs"
	@echo "MinIO Console: http://localhost:9001"

dev-stop:
	@echo "Stopping development environment..."
	docker-compose -f docker-compose.dev.yml down

test:
	@echo "Running tests..."
	pytest tests/ -v --cov=app --cov-report=term-missing

test-unit:
	@echo "Running unit tests..."
	pytest tests/unit/ -v

test-integration:
	@echo "Running integration tests..."
	pytest tests/integration/ -v

test-api:
	@echo "Running API tests..."
	pytest tests/api/ -v

lint:
	@echo "Running linting..."
	flake8 app/ tests/
	black --check app/ tests/
	isort --check-only app/ tests/
	mypy app/

format:
	@echo "Formatting code..."
	black app/ tests/
	isort app/ tests/

# Database Commands
init-db:
	@echo "Initializing database..."
	docker-compose exec api alembic upgrade head
	@echo "Database initialized!"

migrate:
	@echo "Running database migrations..."
	docker-compose exec api alembic revision --autogenerate -m "$(message)"
	docker-compose exec api alembic upgrade head

reset-db:
	@echo "Resetting database..."
	docker-compose down -v
	docker-compose up -d postgres
	sleep 5
	docker-compose exec postgres psql -U geominer -d geominer_ai_miner -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
	docker-compose exec api alembic upgrade head

# Docker Commands
docker-build:
	@echo "Building Docker image..."
	docker build -t geominer-backend:latest .

docker-run:
	@echo "Starting services with Docker Compose..."
	docker-compose up -d
	@echo "Services started!"
	@echo "API: http://localhost:8000"
	@echo "API Docs: http://localhost:8000/docs"
	@echo "Neo4j Browser: http://localhost:7474"
	@echo "MinIO Console: http://localhost:9001"
	@echo "Prometheus: http://localhost:9090"
	@echo "Grafana: http://localhost:3001"

docker-stop:
	@echo "Stopping Docker services..."
	docker-compose down

docker-logs:
	@echo "Viewing Docker logs..."
	docker-compose logs -f

docker-clean:
	@echo "Cleaning Docker resources..."
	docker-compose down -v --remove-orphans
	docker system prune -f

# Neo4j Commands
neo4j-setup:
	@echo "Setting up Neo4j..."
	./scripts/neo4j-setup.sh

neo4j-reset:
	@echo "Resetting Neo4j database..."
	docker-compose exec neo4j cypher-shell -u neo4j -p password "MATCH (n) DETACH DELETE n"

# Production Commands
build:
	@echo "Building for production..."
	docker build -t geominer-backend:production --target production .

deploy:
	@echo "Deploying to production..."
	docker-compose -f docker-compose.yml up -d
	@echo "Production deployment complete!"

clean:
	@echo "Cleaning build artifacts..."
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete
	find . -type d -name "*.egg-info" -exec rm -rf {} +
	rm -rf build/ dist/ .pytest_cache/ .coverage htmlcov/

# Monitoring Commands
monitor:
	@echo "Starting monitoring stack..."
	docker-compose up -d prometheus grafana
	@echo "Monitoring started!"
	@echo "Prometheus: http://localhost:9090"
	@echo "Grafana: http://localhost:3001 (admin/admin)"

logs:
	@echo "Viewing application logs..."
	docker-compose logs -f api

# Health Checks
health:
	@echo "Checking service health..."
	@curl -f http://localhost:8000/health || echo "API not responding"
	@curl -f http://localhost:8000/health/db || echo "Database not responding"
	@curl -f http://localhost:8000/health/ai || echo "AI services not responding"

# Backup Commands
backup:
	@echo "Creating database backup..."
	docker-compose exec postgres pg_dump -U geominer geominer_ai_miner > backup_$(shell date +%Y%m%d_%H%M%S).sql

restore:
	@echo "Restoring database from backup..."
	docker-compose exec -T postgres psql -U geominer -d geominer_ai_miner < $(backup_file)

# Development Helpers
shell:
	@echo "Opening shell in API container..."
	docker-compose exec api bash

db-shell:
	@echo "Opening PostgreSQL shell..."
	docker-compose exec postgres psql -U geominer -d geominer_ai_miner

redis-cli:
	@echo "Opening Redis CLI..."
	docker-compose exec redis redis-cli

# Quick Setup
setup: install docker-build docker-run init-db
	@echo "Setup complete! GeoMiner AI is ready to use."
	@echo "API: http://localhost:8000"
	@echo "API Docs: http://localhost:8000/docs"

# Development with hot reload
dev-reload:
	@echo "Starting development with hot reload..."
	docker-compose -f docker-compose.dev.yml up api

# Production-like testing
prod-test:
	@echo "Running production-like tests..."
	docker-compose -f docker-compose.yml up -d
	sleep 10
	pytest tests/ -v --cov=app
	docker-compose down 