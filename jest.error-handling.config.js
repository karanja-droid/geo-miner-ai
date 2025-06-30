const nextJest = require("next/jest")
const baseConfig = require("./jest.config.js")

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: "./",
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  ...baseConfig,
  displayName: "Error Handling Tests",
  setupFilesAfterEnv: ["<rootDir>/__tests__/error-handling/setup.ts"],
  testEnvironment: "jest-environment-jsdom",
  testMatch: ["<rootDir>/__tests__/error-handling/**/*.test.{js,jsx,ts,tsx}"],
  collectCoverageFrom: [
    "lib/auth-context.tsx",
    "lib/api.ts",
    "app/login/page.tsx",
    "components/error-boundary.tsx",
    "!**/*.d.ts",
    "!**/*.stories.{ts,tsx}",
    "!**/node_modules/**",
  ],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
  coverageReporters: ["text", "html", "json-summary", "json"],
  verbose: true,
  testTimeout: 10000,
  maxWorkers: 1, // Run tests serially for error handling tests
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
