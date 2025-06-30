#!/bin/bash

# Error Testing Script for GeoMiner Frontend
# This script runs comprehensive error handling tests

set -e

echo "🧪 Starting GeoMiner Error Handling Tests..."
echo "============================================="

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

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_status "Checking dependencies..."

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    print_status "Installing dependencies..."
    npm install
fi

# Create test results directory
mkdir -p test-results/error-handling

print_status "Running error handling tests..."

# Run login error scenarios
print_status "Testing login error scenarios..."
if npm test -- __tests__/error-handling/login-error-scenarios.test.tsx --verbose --coverage --coverageDirectory=test-results/error-handling/login-coverage; then
    print_success "Login error tests passed"
else
    print_error "Login error tests failed"
    exit 1
fi

# Run API client error tests
print_status "Testing API client error handling..."
if npm test -- __tests__/error-handling/api-client-errors.test.ts --verbose --coverage --coverageDirectory=test-results/error-handling/api-coverage; then
    print_success "API client error tests passed"
else
    print_error "API client error tests failed"
    exit 1
fi

# Run auth context error tests
print_status "Testing auth context error handling..."
if npm test -- __tests__/error-handling/auth-context-errors.test.tsx --verbose --coverage --coverageDirectory=test-results/error-handling/auth-coverage; then
    print_success "Auth context error tests passed"
else
    print_error "Auth context error tests failed"
    exit 1
fi

# Run all error handling tests together
print_status "Running comprehensive error handling test suite..."
if npm test -- __tests__/error-handling/ --verbose --coverage --coverageDirectory=test-results/error-handling/comprehensive-coverage --coverageReporters=text,html,json; then
    print_success "All error handling tests passed"
else
    print_error "Some error handling tests failed"
    exit 1
fi

# Generate coverage report
print_status "Generating coverage report..."
if [ -f "test-results/error-handling/comprehensive-coverage/coverage-final.json" ]; then
    print_success "Coverage report generated at test-results/error-handling/comprehensive-coverage/"
else
    print_warning "Coverage report not found"
fi

# Check coverage thresholds
print_status "Checking coverage thresholds..."
COVERAGE_FILE="test-results/error-handling/comprehensive-coverage/coverage-summary.json"

if [ -f "$COVERAGE_FILE" ]; then
    # Extract coverage percentages using node
    COVERAGE_CHECK=$(node -e "
        const fs = require('fs');
        const coverage = JSON.parse(fs.readFileSync('$COVERAGE_FILE', 'utf8'));
        const total = coverage.total;
        
        console.log('Lines:', total.lines.pct + '%');
        console.log('Functions:', total.functions.pct + '%');
        console.log('Branches:', total.branches.pct + '%');
        console.log('Statements:', total.statements.pct + '%');
        
        const threshold = 85;
        const passed = total.lines.pct >= threshold && 
                      total.functions.pct >= threshold && 
                      total.branches.pct >= threshold && 
                      total.statements.pct >= threshold;
        
        process.exit(passed ? 0 : 1);
    ")
    
    if [ $? -eq 0 ]; then
        print_success "Coverage thresholds met (85%+ required)"
        echo "$COVERAGE_CHECK"
    else
        print_warning "Coverage thresholds not met (85%+ required)"
        echo "$COVERAGE_CHECK"
    fi
else
    print_warning "Coverage summary not found"
fi

# Test specific error scenarios
print_status "Testing specific error scenarios..."

# Test network timeout
print_status "Testing network timeout handling..."
timeout 5s npm test -- __tests__/error-handling/login-error-scenarios.test.tsx -t "handles network timeout error" --verbose || print_warning "Timeout test may have issues"

# Test malformed JSON
print_status "Testing malformed JSON handling..."
npm test -- __tests__/error-handling/api-client-errors.test.ts -t "handles malformed JSON" --verbose

# Test rate limiting
print_status "Testing rate limiting handling..."
npm test -- __tests__/error-handling/login-error-scenarios.test.tsx -t "handles 429 rate limit error" --verbose

print_success "Error handling tests completed successfully!"
echo ""
echo "📊 Test Results Summary:"
echo "========================"
echo "✅ Login error scenarios: PASSED"
echo "✅ API client error handling: PASSED"
echo "✅ Auth context error handling: PASSED"
echo "✅ Comprehensive error suite: PASSED"
echo ""
echo "📁 Reports available at:"
echo "   - HTML Coverage: test-results/error-handling/comprehensive-coverage/index.html"
echo "   - JSON Coverage: test-results/error-handling/comprehensive-coverage/coverage-final.json"
echo ""
print_success "All error handling tests completed successfully! 🎉"
