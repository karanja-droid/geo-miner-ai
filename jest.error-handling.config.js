const baseConfig = require("./jest.config.js")

module.exports = {
  ...baseConfig,
  testMatch: ["<rootDir>/__tests__/error-handling/**/*.test.{ts,tsx}"],
  collectCoverageFrom: [
    "lib/auth-context.tsx",
    "lib/api.ts",
    "app/login/page.tsx",
    "components/error-boundary.tsx",
    "!**/*.d.ts",
    "!**/*.stories.{ts,tsx}",
  ],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js", "<rootDir>/__tests__/error-handling/setup.ts"],
}
