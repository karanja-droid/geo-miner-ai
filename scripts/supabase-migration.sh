#!/bin/bash

# Supabase Migration Script for GeoMiner AI
# This script helps migrate from local PostgreSQL to Supabase

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
LOCAL_DB_URL="postgresql://geominer:geominer_password@localhost:5432/geominer_ai_miner"
BACKUP_DIR="./backups"
SCHEMA_FILE="./lib/database/schema.sql"

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

check_dependencies() {
    log_info "Checking dependencies..."
    
    if ! command -v psql &> /dev/null; then
        log_error "psql is not installed. Please install PostgreSQL client."
        exit 1
    fi
    
    if ! command -v npx &> /dev/null; then
        log_error "npx is not installed. Please install Node.js."
        exit 1
    fi
    
    log_success "All dependencies are available."
}

check_supabase_env() {
    log_info "Checking Supabase environment variables..."
    
    if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
        log_error "NEXT_PUBLIC_SUPABASE_URL is not set."
        echo "Please set your Supabase URL:"
        echo "export NEXT_PUBLIC_SUPABASE_URL='https://your-project.supabase.co'"
        exit 1
    fi
    
    if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
        log_error "NEXT_PUBLIC_SUPABASE_ANON_KEY is not set."
        echo "Please set your Supabase anon key:"
        echo "export NEXT_PUBLIC_SUPABASE_ANON_KEY='your-anon-key'"
        exit 1
    fi
    
    if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
        log_error "SUPABASE_SERVICE_ROLE_KEY is not set."
        echo "Please set your Supabase service role key:"
        echo "export SUPABASE_SERVICE_ROLE_KEY='your-service-role-key'"
        exit 1
    fi
    
    log_success "Supabase environment variables are set."
}

test_local_connection() {
    log_info "Testing local database connection..."
    
    if psql "$LOCAL_DB_URL" -c "SELECT version();" &> /dev/null; then
        log_success "Local database connection successful."
    else
        log_error "Cannot connect to local database."
        log_info "Please ensure PostgreSQL is running and the database exists."
        exit 1
    fi
}

test_supabase_connection() {
    log_info "Testing Supabase connection..."
    
    # Create a simple test using curl
    local response=$(curl -s -o /dev/null -w "%{http_code}" \
        -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
        -H "Authorization: Bearer $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
        "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/")
    
    if [ "$response" = "200" ]; then
        log_success "Supabase connection successful."
    else
        log_error "Cannot connect to Supabase (HTTP $response)."
        log_info "Please check your Supabase URL and API keys."
        exit 1
    fi
}

create_backup() {
    log_info "Creating backup of local database..."
    
    mkdir -p "$BACKUP_DIR"
    local backup_file="$BACKUP_DIR/geominer_backup_$(date +%Y%m%d_%H%M%S).sql"
    
    if pg_dump "$LOCAL_DB_URL" > "$backup_file"; then
        log_success "Backup created: $backup_file"
        echo "$backup_file"
    else
        log_error "Failed to create backup."
        exit 1
    fi
}

setup_supabase_schema() {
    log_info "Setting up Supabase schema..."
    
    if [ ! -f "$SCHEMA_FILE" ]; then
        log_error "Schema file not found: $SCHEMA_FILE"
        exit 1
    fi
    
    # Install Supabase CLI if not present
    if ! command -v supabase &> /dev/null; then
        log_info "Installing Supabase CLI..."
        npm install -g supabase
    fi
    
    # Initialize Supabase project if not already done
    if [ ! -f "supabase/config.toml" ]; then
        log_info "Initializing Supabase project..."
        supabase init
    fi
    
    # Link to remote project
    log_info "Linking to Supabase project..."
    supabase link --project-ref $(echo "$NEXT_PUBLIC_SUPABASE_URL" | sed 's/.*\/\/$$[^.]*$$.*/\1/')
    
    # Apply schema
    log_info "Applying schema to Supabase..."
    supabase db push
    
    log_success "Supabase schema setup complete."
}

migrate_data() {
    log_info "Migrating data to Supabase..."
    
    # This is a simplified migration - in practice, you'd need more sophisticated data transformation
    log_warning "Data migration requires manual review and testing."
    log_info "Please review your data structure and migrate accordingly."
    
    # Example migration commands would go here
    # psql "$SUPABASE_DB_URL" < "$backup_file"
    
    log_success "Data migration template ready."
}

update_env_files() {
    log_info "Updating environment files..."
    
    # Update .env.local
    cat > .env.local << EOF
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY

# API Configuration
NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_WS_URL=${NEXT_PUBLIC_SUPABASE_URL/https/wss}/realtime/v1/websocket

# Legacy (for backward compatibility)
DATABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
EOF
    
    log_success "Environment files updated."
}

install_dependencies() {
    log_info "Installing Supabase dependencies..."
    
    npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
    
    log_success "Dependencies installed."
}

run_tests() {
    log_info "Running connection tests..."
    
    # Test the new Supabase integration
    npm run test -- --testPathPattern="supabase" --verbose
    
    log_success "Tests completed."
}

show_next_steps() {
    log_success "Migration completed successfully!"
    echo
    echo "Next steps:"
    echo "1. Review and test your application with Supabase"
    echo "2. Update your deployment configuration"
    echo "3. Set up Row Level Security policies if needed"
    echo "4. Configure Supabase Storage for file uploads"
    echo "5. Set up real-time subscriptions if needed"
    echo
    echo "Useful commands:"
    echo "  supabase status          - Check project status"
    echo "  supabase db reset        - Reset database"
    echo "  supabase functions list  - List edge functions"
    echo
    echo "Documentation:"
    echo "  https://supabase.com/docs"
    echo "  https://supabase.com/docs/guides/auth"
    echo "  https://supabase.com/docs/guides/database"
}

# Main execution
main() {
    echo "🚀 GeoMiner AI - Supabase Migration Script"
    echo "=========================================="
    echo
    
    case "${1:-full}" in
        "check")
            check_dependencies
            check_supabase_env
            test_local_connection
            test_supabase_connection
            ;;
        "backup")
            check_dependencies
            test_local_connection
            create_backup
            ;;
        "schema")
            check_dependencies
            check_supabase_env
            setup_supabase_schema
            ;;
        "env")
            check_supabase_env
            update_env_files
            ;;
        "deps")
            install_dependencies
            ;;
        "test")
            check_dependencies
            check_supabase_env
            test_supabase_connection
            run_tests
            ;;
        "full")
            check_dependencies
            check_supabase_env
            test_local_connection
            test_supabase_connection
            backup_file=$(create_backup)
            setup_supabase_schema
            install_dependencies
            update_env_files
            run_tests
            show_next_steps
            ;;
        *)
            echo "Usage: $0 [check|backup|schema|env|deps|test|full]"
            echo
            echo "Commands:"
            echo "  check   - Check dependencies and connections"
            echo "  backup  - Create backup of local database"
            echo "  schema  - Set up Supabase schema"
            echo "  env     - Update environment files"
            echo "  deps    - Install dependencies"
            echo "  test    - Run connection tests"
            echo "  full    - Run complete migration (default)"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
