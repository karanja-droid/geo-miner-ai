#!/bin/bash

# GeoVision AI Miner - Cloudflare Deployment Script
# Deploy to Cloudflare Pages (Frontend) and Workers (Backend)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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
    
    # Check if Wrangler is installed
    if ! command -v wrangler &> /dev/null; then
        error "Wrangler CLI is not installed. Install it with: npm install -g wrangler"
    fi
    
    # Check if logged in to Cloudflare
    if ! wrangler whoami &> /dev/null; then
        error "Not logged in to Cloudflare. Run: wrangler login"
    fi
    
    log "Prerequisites check passed"
}

# Deploy backend to Cloudflare Workers
deploy_backend() {
    log "Deploying backend to Cloudflare Workers..."
    
    cd worker
    
    # Install dependencies
    npm install
    
    # Deploy to staging first
    log "Deploying to staging environment..."
    wrangler deploy --env staging
    
    # Deploy to production
    log "Deploying to production environment..."
    wrangler deploy --env production
    
    cd ..
    
    log "Backend deployed successfully"
}

# Deploy frontend to Cloudflare Pages
deploy_frontend() {
    log "Deploying frontend to Cloudflare Pages..."
    
    cd geovision-ai-miner-client
    
    # Build the application
    log "Building frontend application..."
    npm run build
    
    # Deploy to Cloudflare Pages
    log "Deploying to Cloudflare Pages..."
    wrangler pages deploy build --project-name=geovision-ai-miner
    
    cd ..
    
    log "Frontend deployed successfully"
}

# Setup DNS and domains
setup_domains() {
    log "Setting up domains..."
    
    info "Please configure your domains in Cloudflare Dashboard:"
    info "1. Add geo-miner.com to your Cloudflare account"
    info "2. Point the A record to 192.0.2.1 (Cloudflare Pages)"
    info "3. Add CNAME record: api.geo-miner.com -> your-worker-subdomain.workers.dev"
    info "4. Enable SSL/TLS → Full (strict)"
}

# Main deployment function
main() {
    log "Starting Cloudflare deployment for GeoVision AI Miner"
    
    check_prerequisites
    deploy_backend
    deploy_frontend
    setup_domains
    
    log "Deployment completed successfully!"
    log "Your application is now available at:"
    log "  - Frontend: https://geo-miner.com"
    log "  - Backend API: https://api.geo-miner.com"
    
    info "Next steps:"
    info "1. Configure your domain DNS in Cloudflare Dashboard"
    info "2. Set up environment variables in Cloudflare Pages"
    info "3. Configure custom domains for your Workers"
    info "4. Set up monitoring and analytics"
}

# Run main function
main "$@" 