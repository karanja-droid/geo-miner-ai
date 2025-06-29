#!/bin/bash

# GeoVision AI Miner - Production Deployment Script
# This script deploys the complete application stack to production

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="geovision-ai-miner"
DOCKER_REGISTRY="your-registry.com"
VERSION=$(git describe --tags --always --dirty)
ENVIRONMENT=${1:-production}

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
    
    # Set default values for required variables
    export POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-"change_me_in_production"}
    export REDIS_PASSWORD=${REDIS_PASSWORD:-"change_me_in_production"}
    export SECRET_KEY=${SECRET_KEY:-"change_me_in_production_minimum_32_characters"}
    export JWT_SECRET_KEY=${JWT_SECRET_KEY:-"change_me_in_production_minimum_32_characters"}
    
    log "Environment variables loaded"
}

# Security checks
security_checks() {
    log "Performing security checks..."
    
    # Check for default passwords
    if [ "$POSTGRES_PASSWORD" = "change_me_in_production" ]; then
        error "Please change the default PostgreSQL password in production.env"
    fi
    
    if [ "$REDIS_PASSWORD" = "change_me_in_production" ]; then
        error "Please change the default Redis password in production.env"
    fi
    
    if [ "$SECRET_KEY" = "change_me_in_production_minimum_32_characters" ]; then
        error "Please change the default SECRET_KEY in production.env"
    fi
    
    if [ "$JWT_SECRET_KEY" = "change_me_in_production_minimum_32_characters" ]; then
        error "Please change the default JWT_SECRET_KEY in production.env"
    fi
    
    # Check SSL certificates
    if [ ! -f "nginx/ssl/cert.pem" ] || [ ! -f "nginx/ssl/key.pem" ]; then
        warn "SSL certificates not found. HTTPS will not work properly."
        warn "Please add SSL certificates to nginx/ssl/ directory"
    fi
    
    log "Security checks completed"
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

# Generate SSL certificates (self-signed for development)
generate_ssl_certificates() {
    log "Generating SSL certificates..."
    
    if [ ! -f "nginx/ssl/cert.pem" ] || [ ! -f "nginx/ssl/key.pem" ]; then
        info "Generating self-signed SSL certificates..."
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout nginx/ssl/key.pem \
            -out nginx/ssl/cert.pem \
            -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
        
        log "SSL certificates generated"
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
    
    # Tag images for registry
    if [ ! -z "$DOCKER_REGISTRY" ]; then
        docker tag ${PROJECT_NAME}-backend:${VERSION} ${DOCKER_REGISTRY}/${PROJECT_NAME}-backend:${VERSION}
        docker tag ${PROJECT_NAME}-frontend:${VERSION} ${DOCKER_REGISTRY}/${PROJECT_NAME}-frontend:${VERSION}
    fi
    
    log "Docker images built successfully"
}

# Run database migrations
run_migrations() {
    log "Running database migrations..."
    
    # Wait for database to be ready
    log "Waiting for database to be ready..."
    docker-compose -f docker-compose.prod.yml up -d postgres
    sleep 10
    
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
    log "Deploying application stack..."
    
    # Stop existing stack
    log "Stopping existing stack..."
    docker-compose -f docker-compose.prod.yml down --remove-orphans
    
    # Start the complete stack
    log "Starting application stack..."
    docker-compose -f docker-compose.prod.yml up -d
    
    log "Application stack deployed successfully"
}

# Health checks
health_checks() {
    log "Performing health checks..."
    
    # Wait for services to start
    sleep 30
    
    # Check backend health
    log "Checking backend health..."
    if curl -f http://localhost:8000/health > /dev/null 2>&1; then
        log "Backend is healthy"
    else
        error "Backend health check failed"
    fi
    
    # Check frontend health
    log "Checking frontend health..."
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        log "Frontend is healthy"
    else
        warn "Frontend health check failed (may still be starting)"
    fi
    
    # Check database health
    log "Checking database health..."
    if docker-compose -f docker-compose.prod.yml exec postgres pg_isready -U geovision_user > /dev/null 2>&1; then
        log "Database is healthy"
    else
        error "Database health check failed"
    fi
    
    # Check Redis health
    log "Checking Redis health..."
    if docker-compose -f docker-compose.prod.yml exec redis redis-cli ping > /dev/null 2>&1; then
        log "Redis is healthy"
    else
        error "Redis health check failed"
    fi
    
    log "All health checks passed"
}

# Setup monitoring
setup_monitoring() {
    log "Setting up monitoring..."
    
    # Create Prometheus configuration
    cat > monitoring/prometheus.yml << EOF
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  # - "first_rules.yml"
  # - "second_rules.yml"

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'geovision-backend'
    static_configs:
      - targets: ['backend:8000']
    metrics_path: '/metrics'
    scrape_interval: 5s

  - job_name: 'geovision-frontend'
    static_configs:
      - targets: ['frontend:3000']
    metrics_path: '/metrics'
    scrape_interval: 5s

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres:5432']
    scrape_interval: 30s

  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']
    scrape_interval: 30s
EOF
    
    # Create Grafana datasource
    mkdir -p monitoring/grafana/datasources
    cat > monitoring/grafana/datasources/prometheus.yml << EOF
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
EOF
    
    # Create Grafana dashboard
    mkdir -p monitoring/grafana/dashboards
    cat > monitoring/grafana/dashboards/geovision-dashboard.json << EOF
{
  "dashboard": {
    "id": null,
    "title": "GeoVision AI Miner Dashboard",
    "tags": ["geovision", "mining"],
    "timezone": "browser",
    "panels": [
      {
        "id": 1,
        "title": "System CPU Usage",
        "type": "graph",
        "targets": [
          {
            "expr": "100 - (avg by (instance) (irate(node_cpu_seconds_total{mode=\"idle\"}[5m])) * 100)",
            "legendFormat": "CPU Usage %"
          }
        ]
      },
      {
        "id": 2,
        "title": "System Memory Usage",
        "type": "graph",
        "targets": [
          {
            "expr": "(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100",
            "legendFormat": "Memory Usage %"
          }
        ]
      }
    ]
  }
}
EOF
    
    log "Monitoring setup completed"
}

# Setup backup
setup_backup() {
    log "Setting up backup system..."
    
    # Create backup script
    cat > scripts/backup.sh << 'EOF'
#!/bin/bash

# Backup script for GeoVision AI Miner
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="geovision_backup_${DATE}.sql"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Backup database
docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump -U geovision_user geovision_prod > $BACKUP_DIR/$BACKUP_FILE

# Compress backup
gzip $BACKUP_DIR/$BACKUP_FILE

# Remove old backups (keep last 30 days)
find $BACKUP_DIR -name "geovision_backup_*.sql.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_DIR/${BACKUP_FILE}.gz"
EOF
    
    chmod +x scripts/backup.sh
    
    # Add to crontab
    (crontab -l 2>/dev/null; echo "0 2 * * * $(pwd)/scripts/backup.sh") | crontab -
    
    log "Backup system setup completed"
}

# Setup logging
setup_logging() {
    log "Setting up logging..."
    
    # Create logrotate configuration
    sudo tee /etc/logrotate.d/geovision << EOF
$(pwd)/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 root root
    postrotate
        docker-compose -f $(pwd)/docker-compose.prod.yml restart backend
    endscript
}
EOF
    
    log "Logging setup completed"
}

# Performance optimization
optimize_performance() {
    log "Optimizing system performance..."
    
    # Set kernel parameters for better performance
    echo 'net.core.somaxconn = 65535' | sudo tee -a /etc/sysctl.conf
    echo 'net.ipv4.tcp_max_syn_backlog = 65535' | sudo tee -a /etc/sysctl.conf
    echo 'vm.swappiness = 10' | sudo tee -a /etc/sysctl.conf
    
    # Apply changes
    sudo sysctl -p
    
    # Optimize Docker daemon
    sudo tee /etc/docker/daemon.json << EOF
{
    "max-concurrent-downloads": 10,
    "max-concurrent-uploads": 5,
    "storage-driver": "overlay2",
    "log-driver": "json-file",
    "log-opts": {
        "max-size": "100m",
        "max-file": "3"
    }
}
EOF
    
    # Restart Docker
    sudo systemctl restart docker
    
    log "Performance optimization completed"
}

# Security hardening
security_hardening() {
    log "Applying security hardening..."
    
    # Configure firewall
    sudo ufw allow 22/tcp
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    sudo ufw --force enable
    
    # Set up fail2ban
    sudo apt-get update
    sudo apt-get install -y fail2ban
    
    sudo tee /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log
maxretry = 3

[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 3
EOF
    
    sudo systemctl enable fail2ban
    sudo systemctl start fail2ban
    
    log "Security hardening completed"
}

# Main deployment function
main() {
    log "Starting GeoVision AI Miner deployment..."
    log "Environment: $ENVIRONMENT"
    log "Version: $VERSION"
    
    # Check if running as root
    if [ "$EUID" -eq 0 ]; then
        error "Please do not run this script as root"
    fi
    
    # Run deployment steps
    check_prerequisites
    load_environment
    security_checks
    create_directories
    generate_ssl_certificates
    build_images
    run_migrations
    initialize_database
    deploy_stack
    health_checks
    setup_monitoring
    setup_backup
    setup_logging
    optimize_performance
    security_hardening
    
    log "Deployment completed successfully!"
    log "Application is available at:"
    log "  - Frontend: http://localhost:3000"
    log "  - Backend API: http://localhost:8000"
    log "  - API Documentation: http://localhost:8000/docs"
    log "  - Grafana: http://localhost:3000 (admin/admin)"
    log "  - Prometheus: http://localhost:9090"
    
    # Show service status
    log "Service status:"
    docker-compose -f docker-compose.prod.yml ps
}

# Run main function
main "$@" 