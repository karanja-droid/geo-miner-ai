#!/bin/bash

set -e

# Configuration
APP_NAME="geominer-frontend"
DOCKER_IMAGE="geominer-frontend:latest"
CONTAINER_NAME="geominer-app"
PORT=3000
HEALTH_CHECK_URL="http://localhost:$PORT/api/health"
MAX_WAIT_TIME=60

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Pre-flight checks
preflight_checks() {
    log "Running pre-flight checks..."
    
    # Check if Docker is running
    if ! docker info > /dev/null 2>&1; then
        error "Docker is not running"
    fi
    
    # Check if required environment variables are set
    if [ -z "$NEXTAUTH_SECRET" ]; then
        error "NEXTAUTH_SECRET environment variable is not set"
    fi
    
    # Check if ports are available
    if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null; then
        warn "Port $PORT is already in use"
    fi
    
    log "Pre-flight checks passed"
}

# Build the Docker image
build_image() {
    log "Building Docker image..."
    
    if ! docker build -t $DOCKER_IMAGE .; then
        error "Failed to build Docker image"
    fi
    
    log "Docker image built successfully"
}

# Stop and remove existing container
cleanup_existing() {
    log "Cleaning up existing containers..."
    
    if docker ps -q -f name=$CONTAINER_NAME | grep -q .; then
        log "Stopping existing container..."
        docker stop $CONTAINER_NAME
    fi
    
    if docker ps -aq -f name=$CONTAINER_NAME | grep -q .; then
        log "Removing existing container..."
        docker rm $CONTAINER_NAME
    fi
}

# Deploy the new container
deploy() {
    log "Deploying new container..."
    
    docker run -d \
        --name $CONTAINER_NAME \
        --restart unless-stopped \
        -p $PORT:3000 \
        -e NODE_ENV=production \
        -e NEXTAUTH_SECRET="$NEXTAUTH_SECRET" \
        -e NEXT_PUBLIC_API_URL="$NEXT_PUBLIC_API_URL" \
        -e NEXT_PUBLIC_WS_URL="$NEXT_PUBLIC_WS_URL" \
        -v $(pwd)/logs:/app/logs \
        $DOCKER_IMAGE
    
    if [ $? -ne 0 ]; then
        error "Failed to start container"
    fi
    
    log "Container started successfully"
}

# Health check
health_check() {
    log "Performing health check..."
    
    local wait_time=0
    while [ $wait_time -lt $MAX_WAIT_TIME ]; do
        if curl -f $HEALTH_CHECK_URL > /dev/null 2>&1; then
            log "Health check passed"
            return 0
        fi
        
        log "Waiting for application to be ready... ($wait_time/$MAX_WAIT_TIME seconds)"
        sleep 5
        wait_time=$((wait_time + 5))
    done
    
    error "Health check failed after $MAX_WAIT_TIME seconds"
}

# Rollback function
rollback() {
    warn "Rolling back deployment..."
    
    # Stop the failed container
    docker stop $CONTAINER_NAME 2>/dev/null || true
    docker rm $CONTAINER_NAME 2>/dev/null || true
    
    # Start the previous version if it exists
    if docker images -q ${DOCKER_IMAGE}-backup | grep -q .; then
        log "Starting backup container..."
        docker run -d \
            --name $CONTAINER_NAME \
            --restart unless-stopped \
            -p $PORT:3000 \
            -e NODE_ENV=production \
            ${DOCKER_IMAGE}-backup
    fi
    
    error "Deployment rolled back"
}

# Main deployment process
main() {
    log "Starting deployment of $APP_NAME..."
    
    # Set trap for cleanup on failure
    trap rollback ERR
    
    preflight_checks
    
    # Backup current image
    if docker images -q $DOCKER_IMAGE | grep -q .; then
        log "Backing up current image..."
        docker tag $DOCKER_IMAGE ${DOCKER_IMAGE}-backup
    fi
    
    build_image
    cleanup_existing
    deploy
    health_check
    
    # Cleanup backup image on success
    docker rmi ${DOCKER_IMAGE}-backup 2>/dev/null || true
    
    log "Deployment completed successfully!"
    log "Application is running at: http://localhost:$PORT"
}

# Run main function
main "$@"
