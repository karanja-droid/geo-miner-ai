#!/bin/bash

# Run comprehensive error handling tests
echo "🧪 Running comprehensive error handling tests..."

# Set test environment
export NODE_ENV=test

# Run login error scenarios
echo "📝 Testing login error scenarios..."
npm test -- __tests__/error-handling/login-error-scenarios.test.tsx --verbose

# Run API client error tests
echo "🔌 Testing API client error handling..."
npm test -- __tests__/error-handling/api-client-errors.test.ts --verbose

# Run auth context error tests
echo "🔐 Testing auth context error handling..."
npm test -- __tests__/error-handling/auth-context-errors.test.tsx --verbose

# Run all error handling tests together
echo "🎯 Running all error handling tests..."
npm test -- __tests__/error-handling/ --coverage --verbose

# Generate coverage report
echo "📊 Generating coverage report..."
npm test -- __tests__/error-handling/ --coverage --coverageReporters=html --coverageReporters=text

echo "✅ Error handling tests completed!"
echo "📋 Coverage report available in coverage/lcov-report/index.html"
