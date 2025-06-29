#!/bin/bash

# GeoVision AI Miner - Production Deployment Script
# Deploy to https://geo-miner.com

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="geovision-ai-miner"
DOMAIN="geo-miner.com"
VERSION=$(git describe --tags --always --dirty 2>/dev/null || echo "latest")

# Logging function
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

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed"
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed"
    fi
    
    # Check if git is installed
    if ! command -v git &> /dev/null; then
        error "Git is not installed"
    fi
    
    # Check if environment file exists
    if [ ! -f "production.env" ]; then
        error "production.env file not found"
    fi
    
    log "Prerequisites check passed"
}

# Load environment variables
load_environment() {
    log "Loading environment variables..."
    
    if [ -f "production.env" ]; then
        export $(cat production.env | grep -v '^#' | xargs)
    else
        error "production.env file not found"
    fi
    
    log "Environment variables loaded"
}

# Create necessary directories
create_directories() {
    log "Creating necessary directories..."
    
    mkdir -p logs
    mkdir -p uploads
    mkdir -p backups
    mkdir -p nginx/ssl
    mkdir -p monitoring/prometheus
    mkdir -p monitoring/grafana/dashboards
    mkdir -p monitoring/grafana/datasources
    
    log "Directories created"
}

# Generate SSL certificates for production
generate_ssl_certificates() {
    log "Setting up SSL certificates for ${DOMAIN}..."
    
    if [ ! -f "nginx/ssl/cert.pem" ] || [ ! -f "nginx/ssl/key.pem" ]; then
        info "SSL certificates not found. Please add SSL certificates for ${DOMAIN} to nginx/ssl/ directory"
        info "You can obtain SSL certificates from Let's Encrypt or your SSL provider"
        warn "For now, using self-signed certificates (not recommended for production)"
        
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout nginx/ssl/key.pem \
            -out nginx/ssl/cert.pem \
            -subj "/C=US/ST=State/L=City/O=GeoVision/CN=${DOMAIN}"
        
        log "Self-signed SSL certificates generated"
    else
        log "SSL certificates already exist"
    fi
}

# Build Docker images
build_images() {
    log "Building Docker images..."
    
    # Build backend image
    log "Building backend image..."
    docker build -t ${PROJECT_NAME}-backend:${VERSION} ./geovision-ai-miner-server
    
    # Build frontend image
    log "Building frontend image..."
    docker build -t ${PROJECT_NAME}-frontend:${VERSION} ./geovision-ai-miner-client
    
    log "Docker images built successfully"
}

# Run database migrations
run_migrations() {
    log "Running database migrations..."
    
    # Wait for database to be ready
    log "Waiting for database to be ready..."
    docker-compose -f docker-compose.prod.yml up -d postgres
    sleep 15
    
    # Run migrations
    docker-compose -f docker-compose.prod.yml run --rm backend alembic upgrade head
    
    log "Database migrations completed"
}

# Initialize database with seed data
initialize_database() {
    log "Initializing database with seed data..."
    
    # Run initialization scripts
    docker-compose -f docker-compose.prod.yml run --rm backend python scripts/init_pricing_plans.py
    
    log "Database initialization completed"
}

# Deploy application stack
deploy_stack() {
    log "Deploying application stack to ${DOMAIN}..."
    
    # Stop existing stack
    log "Stopping existing stack..."
    docker-compose -f docker-compose.prod.yml down --remove-orphans
    
    # Start the stack
    log "Starting application stack..."
    docker-compose -f docker-compose.prod.yml up -d
    
    log "Application stack deployed successfully"
}

# Wait for services to be healthy
wait_for_services() {
    log "Waiting for services to be healthy..."
    
    # Wait for backend
    log "Waiting for backend service..."
    timeout=300
    while [ $timeout -gt 0 ]; do
        if curl -f http://localhost:8000/health >/dev/null 2>&1; then
            log "Backend service is healthy"
            break
        fi
        sleep 5
        timeout=$((timeout - 5))
    done
    
    if [ $timeout -le 0 ]; then
        error "Backend service failed to become healthy"
    fi
    
    # Wait for frontend
    log "Waiting for frontend service..."
    timeout=300
    while [ $timeout -gt 0 ]; do
        if curl -f http://localhost:80 >/dev/null 2>&1; then
            log "Frontend service is healthy"
            break
        fi
        sleep 5
        timeout=$((timeout - 5))
    done
    
    if [ $timeout -le 0 ]; then
        error "Frontend service failed to become healthy"
    fi
}

# Setup monitoring
setup_monitoring() {
    log "Setting up monitoring..."
    
    # Create Prometheus configuration
    cat > monitoring/prometheus.yml << EOF
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'geovision-backend'
    static_configs:
      - targets: ['backend:8000']
    metrics_path: '/metrics'
    
  - job_name: 'geovision-frontend'
    static_configs:
      - targets: ['frontend:80']
    metrics_path: '/metrics'
    
  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres:5432']
    
  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']
EOF
    
    log "Monitoring setup completed"
}

# Create backup
create_backup() {
    log "Creating backup..."
    
    timestamp=$(date +%Y%m%d_%H%M%S)
    backup_dir="backups/backup_${timestamp}"
    
    mkdir -p "${backup_dir}"
    
    # Backup database
    docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump -U geovision_user geovision_prod > "${backup_dir}/database.sql"
    
    # Backup uploads
    if [ -d "uploads" ]; then
        cp -r uploads "${backup_dir}/"
    fi
    
    # Backup logs
    if [ -d "logs" ]; then
        cp -r logs "${backup_dir}/"
    fi
    
    log "Backup created: ${backup_dir}"
}

# Setup DNS and domain configuration
setup_domain() {
    log "Setting up domain configuration for ${DOMAIN}..."
    
    info "Please ensure your DNS is configured to point ${DOMAIN} to this server's IP address"
    info "You may need to configure your domain registrar or DNS provider"
    
    # Check if domain resolves
    if nslookup ${DOMAIN} >/dev/null 2>&1; then
        log "Domain ${DOMAIN} resolves correctly"
    else
        warn "Domain ${DOMAIN} does not resolve. Please check DNS configuration"
    fi
}

# Setup firewall
setup_firewall() {
    log "Setting up firewall rules..."
    
    # Allow HTTP and HTTPS
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    
    # Allow SSH (if not already allowed)
    sudo ufw allow ssh
    
    # Enable firewall
    sudo ufw --force enable
    
    log "Firewall configured"
}

# Performance optimization
optimize_performance() {
    log "Optimizing performance..."
    
    # Set system limits
    echo "fs.file-max = 65536" | sudo tee -a /etc/sysctl.conf
    echo "net.core.somaxconn = 65536" | sudo tee -a /etc/sysctl.conf
    echo "net.ipv4.tcp_max_syn_backlog = 65536" | sudo tee -a /etc/sysctl.conf
    
    # Apply changes
    sudo sysctl -p
    
    log "Performance optimization completed"
}

# Health check
health_check() {
    log "Performing health check..."
    
    # Check if all services are running
    if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
        log "All services are running"
    else
        error "Some services are not running"
    fi
    
    # Check if application is accessible
    if curl -f https://${DOMAIN}/health >/dev/null 2>&1; then
        log "Application is accessible via HTTPS"
    else
        warn "Application may not be accessible via HTTPS"
    fi
    
    log "Health check completed"
}

# Main deployment function
main() {
    log "Starting deployment of GeoVision AI Miner to ${DOMAIN}"
    
    check_prerequisites
    load_environment
    create_directories
    generate_ssl_certificates
    build_images
    setup_monitoring
    deploy_stack
    run_migrations
    initialize_database
    wait_for_services
    setup_domain
    setup_firewall
    optimize_performance
    health_check
    
    log "Deployment completed successfully!"
    log "Your application is now available at: https://${DOMAIN}"
    log "Monitoring dashboard: http://localhost:3000 (Grafana)"
    log "Metrics endpoint: http://localhost:9090 (Prometheus)"
    
    info "Next steps:"
    info "1. Configure your domain DNS to point to this server"
    info "2. Set up proper SSL certificates from Let's Encrypt"
    info "3. Configure your Stripe keys for payments"
    info "4. Set up monitoring alerts"
    info "5. Configure backup schedules"
}

# Run main function
main "$@" 