# Mutation Testing with Stryker

Mutation testing is a technique used to evaluate the quality of your test suite by introducing small changes (mutations) to your source code and checking if your tests catch these changes.

## Overview

This project uses [Stryker Mutator](https://stryker-mutator.io/) to perform mutation testing on our TypeScript/React codebase. Mutation testing helps identify:

- Weak spots in your test coverage
- Tests that don't actually validate the code behavior
- Areas where additional test cases are needed
- Overall test suite effectiveness

## Setup

### Installation

Stryker and its dependencies are included in the project's `package.json`. To install:

\`\`\`bash
npm install
\`\`\`

### Configuration Files

The project includes several Stryker configuration files:

- `stryker.conf.json` - Main configuration for full codebase testing
- `stryker.components.conf.json` - Focused testing for React components
- `stryker.lib.conf.json` - Testing for utility libraries
- `stryker.config.mjs` - ES module configuration alternative

## Running Mutation Tests

### Quick Start

\`\`\`bash
# Run mutation tests for all code
npm run test:mutation

# Run mutation tests for components only
npm run test:mutation:components

# Run mutation tests for library code only
npm run test:mutation:lib

# Run with detailed reporting
npm run test:mutation:verbose
\`\`\`

### Advanced Usage

\`\`\`bash
# Run specific configuration
npx stryker run --configFile stryker.components.conf.json

# Run with custom concurrency
npx stryker run --concurrency 4

# Run with specific mutators
npx stryker run --mutate "components/dashboard/**/*.tsx"

# Dry run (no actual mutations)
npx stryker run --dryRun
\`\`\`

### Using the Custom Runner Script

\`\`\`bash
# Run all mutation test suites
npm run mutation:all

# Run specific test suite
npm run mutation:components
npm run mutation:lib

# Run with TypeScript
npx ts-node scripts/mutation-test-runner.ts components
\`\`\`

## Understanding Results

### Mutation Score

The mutation score is the percentage of mutants that were killed (detected) by your tests:

\`\`\`
Mutation Score = (Killed Mutants / Total Mutants) × 100
\`\`\`

### Score Interpretation

- **90-100%**: Excellent - Your tests are very effective
- **80-89%**: Good - Minor improvements possible
- **60-79%**: Needs Improvement - Focus on business logic testing
- **Below 60%**: Poor - Significant test suite improvements needed

### Mutant States

- **Killed**: Test suite detected the mutation (✅ Good)
- **Survived**: Mutation went undetected (❌ Bad)
- **Timeout**: Test took too long to complete
- **No Coverage**: No tests executed the mutated code
- **Runtime Error**: Mutation caused a runtime error

## Configuration Details

### Mutation Thresholds

Different parts of the codebase have different quality expectations:

\`\`\`json
{
  "components": { "high": 85, "low": 70, "break": 60 },
  "lib": { "high": 90, "low": 80, "break": 70 },
  "utils": { "high": 95, "low": 85, "break": 75 }
}
\`\`\`

### Excluded Mutations

Some mutations are excluded as they're not meaningful for our codebase:

- **StringLiteral**: Often not meaningful for UI components
- **RegexMutator**: Can be too aggressive for validation patterns

### File Patterns

Mutation testing targets:

\`\`\`javascript
// Included
"components/**/*.{ts,tsx}"
"lib/**/*.{ts,tsx}"
"app/**/*.{ts,tsx}"

// Excluded
"**/*.test.{ts,tsx}"
"**/*.spec.{ts,tsx}"
"**/*.stories.{ts,tsx}"
"**/*.d.ts"
\`\`\`

## Best Practices

### 1. Start Small

Begin with critical business logic:

\`\`\`bash
# Test authentication logic first
npm run test:mutation:lib

# Then test key components
npm run test:mutation:components
\`\`\`

### 2. Focus on Survived Mutants

When mutants survive, it indicates:

- Missing test cases
- Weak assertions
- Dead code that should be removed

### 3. Improve Gradually

- Aim for incremental improvements
- Focus on high-impact areas first
- Don't try to achieve 100% immediately

### 4. Review Mutation Reports

\`\`\`bash
# Open HTML report
open reports/mutation/mutation-report.html

# Review JSON report programmatically
cat reports/mutation/mutation-report.json | jq '.mutationScore'
\`\`\`

## Common Mutation Types

### Arithmetic Operators

\`\`\`typescript
// Original
const total = price + tax

// Mutated
const total = price - tax  // Will your tests catch this?
\`\`\`

### Conditional Boundaries

\`\`\`typescript
// Original
if (score >= 80) return 'pass'

// Mutated
if (score > 80) return 'pass'  // Edge case testing
\`\`\`

### Boolean Literals

\`\`\`typescript
// Original
const isValid = true

// Mutated
const isValid = false  // Does your test verify the boolean value?
\`\`\`

### Array Methods

\`\`\`typescript
// Original
items.filter(item => item.active)

// Mutated
items.find(item => item.active)  // Different behavior
\`\`\`

## Improving Test Quality

### 1. Add Boundary Tests

\`\`\`typescript
// Test edge cases
expect(calculateDiscount(0)).toBe(0)
expect(calculateDiscount(100)).toBe(10)
expect(calculateDiscount(101)).toBe(10) // Boundary
\`\`\`

### 2. Test Error Conditions

\`\`\`typescript
// Test error paths
expect(() => divide(10, 0)).toThrow('Division by zero')
\`\`\`

### 3. Verify State Changes

\`\`\`typescript
// Don't just test that function runs
const result = processData(input)
expect(result.status).toBe('processed')
expect(result.items).toHaveLength(3)
\`\`\`

### 4. Test Component Behavior

\`\`\`typescript
// Test user interactions
fireEvent.click(button)
expect(onClickMock).toHaveBeenCalledWith(expectedData)
\`\`\`

## CI/CD Integration

### GitHub Actions

Mutation testing is integrated into the CI pipeline:

\`\`\`yaml
- name: Run mutation tests
  run: npm run test:mutation:ci
  
- name: Upload mutation reports
  uses: actions/upload-artifact@v3
  with:
    name: mutation-reports
    path: reports/mutation/
\`\`\`

### Quality Gates

The build will fail if mutation scores fall below thresholds:

- Components: 60% minimum
- Library code: 70% minimum
- Overall: 50% minimum

## Troubleshooting

### Performance Issues

\`\`\`bash
# Reduce concurrency
npx stryker run --concurrency 1

# Increase timeout
npx stryker run --timeoutMS 120000

# Run subset of files
npx stryker run --mutate "components/specific-component/**"
\`\`\`

### Memory Issues

\`\`\`bash
# Increase Node.js memory
NODE_OPTIONS="--max-old-space-size=4096" npm run test:mutation
\`\`\`

### Debugging Mutations

\`\`\`bash
# Enable debug logging
npx stryker run --logLevel debug

# Run single mutant
npx stryker run --mutate "src/component.ts:1:1"
\`\`\`

## Reports and Analysis

### HTML Reports

Interactive reports are generated at:
- `reports/mutation/mutation-report.html`
- `reports/mutation/components-mutation-report.html`
- `reports/mutation/lib-mutation-report.html`

### JSON Reports

Machine-readable reports for automation:
- `reports/mutation/mutation-report.json`

### Dashboard Integration

Results can be sent to the Stryker Dashboard for tracking over time:

\`\`\`json
{
  "dashboard": {
    "project": "github.com/your-org/geominer-frontend",
    "version": "main"
  }
}
\`\`\`

## Continuous Improvement

### Weekly Reviews

1. Review mutation score trends
2. Identify areas needing improvement
3. Plan test enhancement sprints
4. Update mutation thresholds as quality improves

### Team Practices

1. Include mutation testing in code reviews
2. Require mutation score improvements for new features
3. Celebrate test quality improvements
4. Share learnings from mutation testing insights

By following these practices, mutation testing becomes a valuable tool for maintaining and improving test quality over time.
\`\`\`
