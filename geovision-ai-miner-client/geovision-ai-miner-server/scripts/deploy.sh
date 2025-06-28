#!/bin/bash

# GeoVision AI Miner Backend - Deployment Script
# ==============================================

set -e

echo "🚀 Deploying GeoVision AI Miner Backend"
echo "======================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# Configuration
ENVIRONMENT=${1:-staging}
COMPOSE_FILE="docker-compose.yml"
BACKUP_DIR="backups"
DEPLOY_LOG="deploy_$(date +%Y%m%d_%H%M%S).log"

# Validate environment
validate_environment() {
    print_status "Validating deployment environment: $ENVIRONMENT"
    
    case $ENVIRONMENT in
        staging|production)
            print_success "Valid environment: $ENVIRONMENT"
            ;;
        *)
            print_error "Invalid environment: $ENVIRONMENT"
            print_status "Usage: $0 [staging|production]"
            exit 1
            ;;
    esac
    
    # Set compose file based on environment
    if [ "$ENVIRONMENT" = "staging" ]; then
        COMPOSE_FILE="docker-compose.staging.yml"
    elif [ "$ENVIRONMENT" = "production" ]; then
        COMPOSE_FILE="docker-compose.prod.yml"
    fi
    
    if [ ! -f "$COMPOSE_FILE" ]; then
        print_error "Compose file not found: $COMPOSE_FILE"
        exit 1
    fi
}

# Pre-deployment checks
pre_deployment_checks() {
    print_status "Running pre-deployment checks..."
    
    # Check if Docker is running
    if ! docker info &> /dev/null; then
        print_error "Docker is not running"
        exit 1
    fi
    
    # Check if required files exist
    local required_files=(".env" "app/main.py" "alembic.ini")
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            print_error "Required file not found: $file"
            exit 1
        fi
    done
    
    # Check environment variables
    if [ ! -f ".env" ]; then
        print_error "Environment file (.env) not found"
        exit 1
    fi
    
    # Load environment variables
    source .env
    
    # Check critical environment variables
    local required_vars=("SECRET_KEY" "POSTGRES_PASSWORD" "FIRST_SUPERUSER_PASSWORD")
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            print_error "Required environment variable not set: $var"
            exit 1
        fi
    done
    
    print_success "Pre-deployment checks passed"
}

# Backup database
backup_database() {
    print_status "Creating database backup..."
    
    mkdir -p "$BACKUP_DIR"
    
    # Create database backup
    if docker-compose -f "$COMPOSE_FILE" exec -T db pg_dump -U geovision geovision_ai_miner > "$BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql" 2>/dev/null; then
        print_success "Database backup created"
    else
        print_warning "Database backup failed - continuing with deployment"
    fi
}

# Build and deploy
deploy_application() {
    print_status "Building and deploying application..."
    
    # Pull latest images
    print_status "Pulling latest images..."
    docker-compose -f "$COMPOSE_FILE" pull
    
    # Build application
    print_status "Building application..."
    docker-compose -f "$COMPOSE_FILE" build --no-cache
    
    # Stop existing services
    print_status "Stopping existing services..."
    docker-compose -f "$COMPOSE_FILE" down
    
    # Start new services
    print_status "Starting new services..."
    docker-compose -f "$COMPOSE_FILE" up -d
    
    print_success "Application deployed"
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    # Wait for database to be ready
    sleep 10
    
    # Run migrations
    if docker-compose -f "$COMPOSE_FILE" exec -T api alembic upgrade head; then
        print_success "Database migrations completed"
    else
        print_error "Database migrations failed"
        exit 1
    fi
}

# Health check
health_check() {
    print_status "Performing health check..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f http://localhost:8000/health &> /dev/null; then
            print_success "Health check passed"
            return 0
        fi
        
        print_status "Attempt $attempt/$max_attempts - waiting for service..."
        sleep 10
        ((attempt++))
    done
    
    print_error "Health check failed after $max_attempts attempts"
    
    # Show logs for debugging
    print_status "Showing recent logs..."
    docker-compose -f "$COMPOSE_FILE" logs --tail=50 api
    
    exit 1
}

# Post-deployment tasks
post_deployment() {
    print_status "Running post-deployment tasks..."
    
    # Clean up old Docker images
    print_status "Cleaning up old Docker images..."
    docker image prune -f
    
    # Send deployment notification (if configured)
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        print_status "Sending deployment notification..."
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"✅ GeoVision AI Miner Backend deployed successfully to $ENVIRONMENT\"}" \
            "$SLACK_WEBHOOK_URL" || true
    fi
    
    print_success "Post-deployment tasks completed"
}

# Rollback function
rollback() {
    print_error "Deployment failed, initiating rollback..."
    
    # Stop current services
    docker-compose -f "$COMPOSE_FILE" down
    
    # Start previous version (if available)
    if [ -f "$BACKUP_DIR/docker-compose.backup.yml" ]; then
        print_status "Rolling back to previous version..."
        cp "$BACKUP_DIR/docker-compose.backup.yml" "$COMPOSE_FILE"
        docker-compose -f "$COMPOSE_FILE" up -d
        print_success "Rollback completed"
    else
        print_warning "No previous version available for rollback"
    fi
    
    # Send rollback notification
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"🚨 GeoVision AI Miner Backend rollback initiated for $ENVIRONMENT\"}" \
            "$SLACK_WEBHOOK_URL" || true
    fi
    
    exit 1
}

# Main deployment process
main() {
    # Redirect all output to log file
    exec > >(tee -a "$DEPLOY_LOG")
    exec 2>&1
    
    print_status "Starting deployment process..."
    print_status "Environment: $ENVIRONMENT"
    print_status "Compose file: $COMPOSE_FILE"
    print_status "Log file: $DEPLOY_LOG"
    
    # Set up error handling
    trap rollback ERR
    
    validate_environment
    pre_deployment_checks
    backup_database
    deploy_application
    run_migrations
    health_check
    post_deployment
    
    print_success "🎉 Deployment completed successfully!"
    print_status "Application is available at: http://localhost:8000"
    print_status "API documentation: http://localhost:8000/api/v1/docs"
    print_status "Log file: $DEPLOY_LOG"
}

# Run main function
main "$@" 