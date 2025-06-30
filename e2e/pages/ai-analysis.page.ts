import { type Page, type Locator, expect } from "@playwright/test"

export class AIAnalysisPage {
  readonly page: Page
  readonly analysisTypeSelect: Locator
  readonly providerSelect: Locator
  readonly promptTextarea: Locator
  readonly startAnalysisButton: Locator
  readonly analysisResults: Locator
  readonly progressIndicator: Locator
  readonly errorMessage: Locator

  constructor(page: Page) {
    this.page = page
    this.analysisTypeSelect = page.getByLabel(/analysis type/i)
    this.providerSelect = page.getByLabel(/ai provider/i)
    this.promptTextarea = page.getByLabel(/analysis prompt/i)
    this.startAnalysisButton = page.getByRole("button", { name: /start analysis/i })
    this.analysisResults = page.locator('[data-testid="analysis-results"]')
    this.progressIndicator = page.locator('[data-testid="progress-indicator"]')
    this.errorMessage = page.getByText(/please enter an analysis prompt/i)
  }

  async createAnalysis(options: {
    type?: string
    provider?: string
    prompt: string
  }) {
    if (options.type) {
      await this.analysisTypeSelect.click()
      await this.page.getByText(options.type).click()
    }

    if (options.provider) {
      await this.providerSelect.click()
      await this.page.getByText(options.provider).click()
    }

    await this.promptTextarea.fill(options.prompt)
    await this.startAnalysisButton.click()
  }

  async expectValidationError() {
    await expect(this.errorMessage).toBeVisible()
  }

  async expectAnalysisStarted() {
    await expect(this.page.getByText(/analysis started/i)).toBeVisible()
  }

  async expectAnalysisInProgress() {
    await expect(this.progressIndicator).toBeVisible()
  }

  async expectAnalysisCompleted() {
    await expect(this.page.getByText(/completed/i)).toBeVisible()
  }
}
