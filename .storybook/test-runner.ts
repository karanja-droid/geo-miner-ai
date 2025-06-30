import type { TestRunnerConfig } from "@storybook/test-runner"
import { checkA11y, injectAxe } from "axe-playwright"

const config: TestRunnerConfig = {
  setup() {
    // Add global setup here
  },
  async preVisit(page) {
    // Inject axe-core for accessibility testing
    await injectAxe(page)
  },
  async postVisit(page) {
    // Run accessibility tests
    await checkA11y(page, "#storybook-root", {
      detailedReport: true,
      detailedReportOptions: {
        html: true,
      },
    })
  },
  tags: {
    include: ["test"],
    exclude: ["skip-test"],
    skip: ["skip-test"],
  },
}

export default config
