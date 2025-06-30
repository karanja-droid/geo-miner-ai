#!/bin/bash

# Supabase Setup Script for GeoMiner AI
# This script sets up Supabase integration step by step

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js and npm are installed
check_dependencies() {
    log_info "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    log_success "Dependencies check passed."
}

# Install Supabase dependencies
install_supabase_deps() {
    log_info "Installing Supabase dependencies..."
    
    npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
    
    # Install Supabase CLI globally if not present
    if ! command -v supabase &> /dev/null; then
        log_info "Installing Supabase CLI..."
        npm install -g supabase
    fi
    
    log_success "Supabase dependencies installed."
}

# Initialize Supabase project
init_supabase() {
    log_info "Initializing Supabase project..."
    
    if [ ! -f "supabase/config.toml" ]; then
        supabase init
        log_success "Supabase project initialized."
    else
        log_warning "Supabase project already initialized."
    fi
}

# Start local Supabase (optional for development)
start_local_supabase() {
    log_info "Starting local Supabase..."
    
    supabase start
    
    log_success "Local Supabase started."
    log_info "You can access the local dashboard at: http://localhost:54323"
}

# Create environment file template
create_env_template() {
    log_info "Creating environment file template..."
    
    cat > .env.local.template << 'EOF'
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# API Configuration
NEXT_PUBLIC_API_URL=https://your-project.supabase.co
NEXT_PUBLIC_WS_URL=wss://your-project.supabase.co/realtime/v1/websocket

# Other Configuration
MAPBOX_TOKEN=your_mapbox_token_here
JWT_SECRET=your_jwt_secret_here
API_SECRET_KEY=your_api_secret_key_here
EOF
    
    log_success "Environment template created: .env.local.template"
    log_warning "Please copy this to .env.local and fill in your actual values."
}

# Apply database schema
apply_schema() {
    log_info "Applying database schema..."
    
    if [ -f "lib/database/schema.sql" ]; then
        # Check if we're using local or remote Supabase
        if [ -f "supabase/config.toml" ] && supabase status &> /dev/null; then
            # Local Supabase
            supabase db reset
            log_success "Schema applied to local Supabase."
        else
            log_warning "To apply schema to remote Supabase:"
            log_info "1. Go to your Supabase dashboard"
            log_info "2. Navigate to SQL Editor"
            log_info "3. Copy and paste the contents of lib/database/schema.sql"
            log_info "4. Run the SQL commands"
        fi
    else
        log_error "Schema file not found: lib/database/schema.sql"
    fi
}

# Test Supabase connection
test_connection() {
    log_info "Testing Supabase connection..."
    
    if [ -f ".env.local" ]; then
        # Source environment variables
        export $(cat .env.local | grep -v '^#' | xargs)
        
        if [ -n "$NEXT_PUBLIC_SUPABASE_URL" ] && [ -n "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
            # Test connection using curl
            local response=$(curl -s -o /dev/null -w "%{http_code}" \
                -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
                -H "Authorization: Bearer $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
                "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/")
            
            if [ "$response" = "200" ]; then
                log_success "Supabase connection successful!"
            else
                log_error "Supabase connection failed (HTTP $response)"
                log_info "Please check your environment variables."
            fi
        else
            log_error "Environment variables not set properly."
        fi
    else
        log_warning ".env.local file not found. Please create it with your Supabase credentials."
    fi
}

# Run tests
run_tests() {
    log_info "Running Supabase integration tests..."
    
    if npm run test -- --testPathPattern="supabase" --passWithNoTests; then
        log_success "Tests passed!"
    else
        log_warning "Some tests failed. Please check the output above."
    fi
}

# Show setup instructions
show_instructions() {
    echo
    log_success "Supabase setup completed!"
    echo
    echo "Next steps:"
    echo "1. Create a Supabase project at https://supabase.com"
    echo "2. Copy your project URL and API keys"
    echo "3. Update .env.local with your credentials"
    echo "4. Apply the database schema in your Supabase dashboard"
    echo "5. Test the connection: ./scripts/supabase-setup.sh test"
    echo
    echo "Useful commands:"
    echo "  supabase status          - Check local Supabase status"
    echo "  supabase stop            - Stop local Supabase"
    echo "  supabase db reset        - Reset local database"
    echo "  supabase gen types       - Generate TypeScript types"
    echo
    echo "Documentation:"
    echo "  https://supabase.com/docs"
    echo "  https://supabase.com/docs/guides/getting-started/quickstarts/nextjs"
}

# Main execution
main() {
    echo "🚀 GeoMiner AI - Supabase Setup Script"
    echo "======================================"
    echo
    
    case "${1:-setup}" in
        "deps")
            check_dependencies
            install_supabase_deps
            ;;
        "init")
            check_dependencies
            init_supabase
            ;;
        "local")
            check_dependencies
            init_supabase
            start_local_supabase
            ;;
        "env")
            create_env_template
            ;;
        "schema")
            apply_schema
            ;;
        "test")
            test_connection
            run_tests
            ;;
        "setup")
            check_dependencies
            install_supabase_deps
            init_supabase
            create_env_template
            apply_schema
            show_instructions
            ;;
        *)
            echo "Usage: $0 [deps|init|local|env|schema|test|setup]"
            echo
            echo "Commands:"
            echo "  deps    - Install Supabase dependencies"
            echo "  init    - Initialize Supabase project"
            echo "  local   - Start local Supabase development"
            echo "  env     - Create environment template"
            echo "  schema  - Apply database schema"
            echo "  test    - Test connection and run tests"
            echo "  setup   - Run complete setup (default)"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
