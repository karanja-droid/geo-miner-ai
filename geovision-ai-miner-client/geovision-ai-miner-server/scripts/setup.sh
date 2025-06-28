#!/bin/bash

# GeoVision AI Miner Backend - Setup Script
# =========================================

set -e

echo "🚀 Setting up GeoVision AI Miner Backend Development Environment"
echo "================================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check if running on supported OS
check_os() {
    print_status "Checking operating system..."
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        print_success "Linux detected"
        OS="linux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        print_success "macOS detected"
        OS="macos"
    elif [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "msys" ]]; then
        print_success "Windows detected"
        OS="windows"
    else
        print_error "Unsupported operating system: $OSTYPE"
        exit 1
    fi
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Python
    if command -v python3 &> /dev/null; then
        PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
        print_success "Python $PYTHON_VERSION found"
    else
        print_error "Python 3 is required but not installed"
        exit 1
    fi
    
    # Check Docker
    if command -v docker &> /dev/null; then
        DOCKER_VERSION=$(docker --version | cut -d' ' -f3 | cut -d',' -f1)
        print_success "Docker $DOCKER_VERSION found"
    else
        print_error "Docker is required but not installed"
        print_status "Please install Docker from https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    # Check Docker Compose
    if command -v docker-compose &> /dev/null; then
        COMPOSE_VERSION=$(docker-compose --version | cut -d' ' -f3 | cut -d',' -f1)
        print_success "Docker Compose $COMPOSE_VERSION found"
    else
        print_error "Docker Compose is required but not installed"
        exit 1
    fi
    
    # Check Git
    if command -v git &> /dev/null; then
        print_success "Git found"
    else
        print_error "Git is required but not installed"
        exit 1
    fi
}

# Setup Python virtual environment
setup_python_env() {
    print_status "Setting up Python virtual environment..."
    
    if [ ! -d "venv" ]; then
        python3 -m venv venv
        print_success "Virtual environment created"
    else
        print_success "Virtual environment already exists"
    fi
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Upgrade pip
    pip install --upgrade pip setuptools wheel
    
    # Install dependencies
    if [ -f "pyproject.toml" ]; then
        pip install -e .[dev]
        print_success "Dependencies installed"
    else
        print_error "pyproject.toml not found"
        exit 1
    fi
}

# Setup environment variables
setup_env_vars() {
    print_status "Setting up environment variables..."
    
    if [ ! -f ".env" ]; then
        cp .env.example .env
        print_success "Environment variables file created (.env)"
        print_warning "Please edit .env file with your specific settings"
    else
        print_success "Environment variables file already exists"
    fi
}

# Setup pre-commit hooks
setup_pre_commit() {
    print_status "Setting up pre-commit hooks..."
    
    if command -v pre-commit &> /dev/null; then
        pre-commit install
        print_success "Pre-commit hooks installed"
    else
        print_warning "Pre-commit not found, installing..."
        pip install pre-commit
        pre-commit install
        print_success "Pre-commit hooks installed"
    fi
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    mkdir -p data logs models monitoring/grafana/dashboards monitoring/grafana/datasources
    
    print_success "Directories created"
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    # Start database services
    docker-compose -f docker-compose.dev.yml up -d db redis minio
    
    # Wait for database to be ready
    print_status "Waiting for database to be ready..."
    sleep 10
    
    # Check if database is ready
    for i in {1..30}; do
        if docker-compose -f docker-compose.dev.yml exec -T db pg_isready -U geovision -d geovision_ai_miner &> /dev/null; then
            print_success "Database is ready"
            break
        fi
        
        if [ $i -eq 30 ]; then
            print_error "Database failed to start after 30 attempts"
            exit 1
        fi
        
        sleep 2
    done
    
    # Run migrations
    print_status "Running database migrations..."
    
    # Create initial migration if it doesn't exist
    if [ ! -d "alembic/versions" ] || [ -z "$(ls -A alembic/versions)" ]; then
        print_status "Creating initial migration..."
        alembic revision --autogenerate -m "Initial migration"
    fi
    
    alembic upgrade head
    print_success "Database migrations completed"
}

# Setup monitoring configuration
setup_monitoring() {
    print_status "Setting up monitoring configuration..."
    
    # Create Prometheus configuration
    mkdir -p monitoring
    cat > monitoring/prometheus.yml << EOF
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  # - "first_rules.yml"
  # - "second_rules.yml"

scrape_configs:
  - job_name: 'geovision-api'
    static_configs:
      - targets: ['api:8000']
    metrics_path: '/metrics'
    scrape_interval: 30s

  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
EOF
    
    print_success "Monitoring configuration created"
}

# Run tests
run_tests() {
    print_status "Running tests to verify setup..."
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Run basic tests
    if python -c "import app; print('✓ App imports successfully')" 2>/dev/null; then
        print_success "Basic import test passed"
    else
        print_warning "Basic import test failed - this is normal for initial setup"
    fi
}

# Display final instructions
show_final_instructions() {
    echo ""
    echo "🎉 Setup completed successfully!"
    echo "==============================="
    echo ""
    echo "Next steps:"
    echo "1. Edit .env file with your specific settings"
    echo "2. Start the development environment:"
    echo "   make dev"
    echo ""
    echo "3. Access the API documentation:"
    echo "   http://localhost:8000/api/v1/docs"
    echo ""
    echo "4. Access MinIO console:"
    echo "   http://localhost:9001 (admin/minioadmin123)"
    echo ""
    echo "5. Useful commands:"
    echo "   make help          - Show all available commands"
    echo "   make test          - Run tests"
    echo "   make lint          - Run linting"
    echo "   make format        - Format code"
    echo "   make logs          - Show application logs"
    echo ""
    echo "For more information, see the README.md file"
}

# Main execution
main() {
    check_os
    check_prerequisites
    setup_python_env
    setup_env_vars
    setup_pre_commit
    create_directories
    setup_monitoring
    setup_database
    run_tests
    show_final_instructions
}

# Run main function
main "$@" 