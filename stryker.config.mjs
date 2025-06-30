// @ts-check
/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
const config = {
  packageManager: "npm",
  reporters: ["html", "clear-text", "progress", "json", "dashboard"],
  testRunner: "jest",
  jest: {
    projectType: "custom",
    configFile: "jest.config.js",
    enableFindRelatedTests: true,
  },
  coverageAnalysis: "perTest",
  mutate: [
    "components/**/*.{ts,tsx}",
    "lib/**/*.{ts,tsx}",
    "app/**/*.{ts,tsx}",
    "!**/*.test.{ts,tsx}",
    "!**/*.spec.{ts,tsx}",
    "!**/*.stories.{ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!**/.next/**",
    "!**/coverage/**",
    "!**/storybook-static/**",
    "!**/e2e/**",
  ],
  timeoutMS: 60000,
  timeoutFactor: 1.5,
  maxConcurrentTestRunners: 2,
  thresholds: {
    high: 80,
    low: 60,
    break: 50,
  },
  dashboard: {
    project: "github.com/your-org/geominer-frontend",
    version: "main",
    module: "geominer-frontend",
  },
  htmlReporter: {
    fileName: "reports/mutation/mutation-report.html",
  },
  jsonReporter: {
    fileName: "reports/mutation/mutation-report.json",
  },
  plugins: [
    "@stryker-mutator/core",
    "@stryker-mutator/jest-runner",
    "@stryker-mutator/typescript-checker",
  ],
  checkers: ["typescript"],
  tsconfigFile: "tsconfig.json",
  tempDirName: "stryker-tmp",
  cleanTempDir: true,
  logLevel: "info",
  fileLogLevel: "trace",
  allowConsoleColors: true,
  concurrency: 2,
  dryRunTimeoutMinutes: 5,
  ignorePatterns: [
    "**/node_modules/**",
    "**/.next/**",
    "**/coverage/**",
    "**/storybook-static/**",
    "**/e2e/**",
    "**/docs/**",
    "**/*.config.{js,ts}",
    "**/*.setup.{js,ts}",
  ],
  mutator: {
    plugins: ["typescript"],
    excludedMutations: [
      "StringLiteral", // Often not meaningful for UI components
      "RegexMutator", // Can be too aggressive for validation patterns
    ],
  },
}

export default config
