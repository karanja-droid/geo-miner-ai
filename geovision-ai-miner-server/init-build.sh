#!/bin/bash

# GeoVision AI Miner Backend - Automated Build Script
# ===================================================

set -e

echo "🚀 GeoVision AI Miner Backend - Automated Build & Deploy"
echo "========================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BOLD}${BLUE}=== $1 ===${NC}"
}

# Configuration
ENVIRONMENT=${1:-development}
SKIP_SETUP=${2:-false}

# Validate prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is required but not installed"
        print_status "Please install Docker from https://docs.docker.com/get-docker/"
        exit 1
    fi
    print_success "Docker found"
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is required but not installed"
        exit 1
    fi
    print_success "Docker Compose found"
    
    # Check Python
    if ! command -v python3 &> /dev/null; then
        print_warning "Python 3 not found - using Docker only"
    else
        print_success "Python 3 found"
    fi
    
    # Check if Docker daemon is running
    if ! docker info &> /dev/null; then
        print_error "Docker daemon is not running"
        print_status "Please start Docker and try again"
        exit 1
    fi
    print_success "Docker daemon is running"
}

# Setup environment
setup_environment() {
    print_header "Setting Up Environment"
    
    # Create .env file if it doesn't exist
    if [ ! -f ".env" ]; then
        print_status "Creating environment configuration..."
        cp .env.example .env
        
        # Generate a secure secret key
        if command -v python3 &> /dev/null; then
            SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")
            sed -i.bak "s/SECRET_KEY=.*/SECRET_KEY=$SECRET_KEY/" .env
            rm .env.bak 2>/dev/null || true
        fi
        
        print_success "Environment configuration created (.env)"
        print_warning "You may want to edit .env with your specific settings"
    else
        print_success "Environment configuration already exists"
    fi
    
    # Create necessary directories
    print_status "Creating necessary directories..."
    mkdir -p data logs models monitoring/grafana/{dashboards,datasources} backups
    print_success "Directories created"
}

# Build and start services
build_and_start() {
    print_header "Building and Starting Services"
    
    local compose_file="docker-compose.dev.yml"
    
    if [ "$ENVIRONMENT" = "production" ]; then
        compose_file="docker-compose.yml"
    fi
    
    print_status "Using compose file: $compose_file"
    
    # Stop any existing services
    print_status "Stopping any existing services..."
    docker-compose -f "$compose_file" down -v || true
    
    # Pull latest images
    print_status "Pulling latest base images..."
    docker-compose -f "$compose_file" pull
    
    # Build application
    print_status "Building application..."
    docker-compose -f "$compose_file" build --no-cache
    
    # Start services
    print_status "Starting services..."
    docker-compose -f "$compose_file" up -d
    
    print_success "Services started successfully"
}

# Wait for services to be ready
wait_for_services() {
    print_header "Waiting for Services to be Ready"
    
    # Wait for database
    print_status "Waiting for database to be ready..."
    local max_attempts=60
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if docker-compose -f docker-compose.dev.yml exec -T db pg_isready -U geovision -d geovision_ai_miner &> /dev/null; then
            print_success "Database is ready"
            break
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            print_error "Database failed to start after $max_attempts attempts"
            docker-compose -f docker-compose.dev.yml logs db
            exit 1
        fi
        
        echo -n "."
        sleep 2
        ((attempt++))
    done
    
    # Wait for Redis
    print_status "Waiting for Redis to be ready..."
    attempt=1
    while [ $attempt -le $max_attempts ]; do
        if docker-compose -f docker-compose.dev.yml exec -T redis redis-cli ping &> /dev/null; then
            print_success "Redis is ready"
            break
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            print_error "Redis failed to start after $max_attempts attempts"
            exit 1
        fi
        
        echo -n "."
        sleep 1
        ((attempt++))
    done
    
    # Wait for MinIO
    print_status "Waiting for MinIO to be ready..."
    attempt=1
    while [ $attempt -le $max_attempts ]; do
        if curl -f http://localhost:9000/minio/health/live &> /dev/null; then
            print_success "MinIO is ready"
            break
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            print_error "MinIO failed to start after $max_attempts attempts"
            exit 1
        fi
        
        echo -n "."
        sleep 2
        ((attempt++))
    done
}

# Setup database schema and initial data
setup_database() {
    print_header "Setting Up Database"
    
    # Create Alembic directory structure if it doesn't exist
    if [ ! -d "alembic" ]; then
        print_status "Creating Alembic migration structure..."
        mkdir -p alembic/versions
        
        # Create basic Alembic env.py
        cat > alembic/env.py << 'EOF'
from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context
import os
import sys

# Add the app directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.core.config import settings
from app.core.database import Base
from app.models import *  # Import all models

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

def get_url():
    return str(settings.DATABASE_URL)

def run_migrations_offline():
    """Run migrations in 'offline' mode."""
    url = get_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online():
    """Run migrations in 'online' mode."""
    configuration = config.get_section(config.config_ini_section)
    configuration["sqlalchemy.url"] = get_url()
    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
EOF
        
        # Create script.py.mako
        cat > alembic/script.py.mako << 'EOF'
"""${message}

Revision ID: ${up_revision}
Revises: ${down_revision | comma,n}
Create Date: ${create_date}

"""
from alembic import op
import sqlalchemy as sa
${imports if imports else ""}

# revision identifiers, used by Alembic.
revision = ${repr(up_revision)}
down_revision = ${repr(down_revision)}
branch_labels = ${repr(branch_labels)}
depends_on = ${repr(depends_on)}


def upgrade():
    ${upgrades if upgrades else "pass"}


def downgrade():
    ${downgrades if downgrades else "pass"}
EOF
        
        touch alembic/versions/__init__.py
        print_success "Alembic structure created"
    fi
    
    # Wait a bit more for the API to be ready
    sleep 10
    
    # Create initial migration if none exists
    if [ -z "$(ls -A alembic/versions/ 2>/dev/null)" ]; then
        print_status "Creating initial database migration..."
        if docker-compose -f docker-compose.dev.yml exec -T api alembic revision --autogenerate -m "Initial migration" 2>/dev/null; then
            print_success "Initial migration created"
        else
            print_warning "Could not create migration - may need manual setup"
        fi
    fi
    
    # Run migrations
    print_status "Running database migrations..."
    if docker-compose -f docker-compose.dev.yml exec -T api alembic upgrade head 2>/dev/null; then
        print_success "Database migrations completed"
    else
        print_warning "Migrations may need to be run manually"
    fi
}

# Create initial admin user
create_admin_user() {
    print_header "Creating Initial Admin User"
    
    print_status "Setting up initial admin user..."
    
    # Create a simple init script
    cat > temp_init.py << 'EOF'
import asyncio
import sys
import os
sys.path.insert(0, '/app')

from app.core.config import settings
from app.core.database import SessionLocal
from app.core.security import get_password_hash
from app.models.user import User, UserRole

def init_user():
    db = SessionLocal()
    try:
        # Check if admin user already exists
        admin_user = db.query(User).filter(User.email == settings.FIRST_SUPERUSER).first()
        if not admin_user:
            # Create admin user
            admin_user = User(
                email=settings.FIRST_SUPERUSER,
                full_name="System Administrator",
                hashed_password=get_password_hash(settings.FIRST_SUPERUSER_PASSWORD),
                is_superuser=True,
                is_active=True,
                is_verified=True,
                role=UserRole.ADMINISTRATOR
            )
            db.add(admin_user)
            db.commit()
            print(f"✓ Admin user created: {settings.FIRST_SUPERUSER}")
        else:
            print(f"✓ Admin user already exists: {settings.FIRST_SUPERUSER}")
    except Exception as e:
        print(f"✗ Error creating admin user: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    init_user()
EOF
    
    # Copy and run the init script
    docker cp temp_init.py $(docker-compose -f docker-compose.dev.yml ps -q api):/tmp/init.py
    if docker-compose -f docker-compose.dev.yml exec -T api python /tmp/init.py; then
        print_success "Admin user setup completed"
    else
        print_warning "Admin user setup may need manual intervention"
    fi
    
    # Clean up
    rm temp_init.py
}

# Health check
perform_health_check() {
    print_header "Performing Health Check"
    
    local max_attempts=30
    local attempt=1
    
    print_status "Checking API health..."
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s http://localhost:8000/health > /dev/null 2>&1; then
            print_success "API health check passed"
            break
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            print_warning "API health check failed - may need manual verification"
            docker-compose -f docker-compose.dev.yml logs --tail=20 api
            break
        fi
        
        echo -n "."
        sleep 2
        ((attempt++))
    done
}

# Display final status
show_final_status() {
    print_header "Deployment Status"
    
    echo ""
    echo "🎉 GeoVision AI Miner Backend Build Complete!"
    echo "============================================="
    echo ""
    echo "📊 Service Status:"
    docker-compose -f docker-compose.dev.yml ps
    echo ""
    echo "🔗 Access Points:"
    echo "  • API Documentation:  http://localhost:8000/api/v1/docs"
    echo "  • API Health Check:   http://localhost:8000/health"
    echo "  • MinIO Console:      http://localhost:9001"
    echo "  • Database:           localhost:5432"
    echo "  • Redis:              localhost:6379"
    echo ""
    echo "👤 Default Admin User:"
    echo "  • Email:    admin@geovision.ai"
    echo "  • Password: changeme"
    echo ""
    echo "🛠️  Useful Commands:"
    echo "  • View logs:          make logs"
    echo "  • Run tests:          make test"
    echo "  • Stop services:      make down"
    echo "  • Database shell:     make db-shell"
    echo "  • API shell:          make shell"
    echo ""
    echo "📖 For more information, see README.md"
    echo ""
}

# Main execution
main() {
    print_status "Starting automated build process..."
    print_status "Environment: $ENVIRONMENT"
    
    if [ "$SKIP_SETUP" != "true" ]; then
        check_prerequisites
        setup_environment
    fi
    
    build_and_start
    wait_for_services
    setup_database
    create_admin_user
    perform_health_check
    show_final_status
    
    print_success "🚀 Backend is ready for development!"
}

# Run main function
main "$@" 