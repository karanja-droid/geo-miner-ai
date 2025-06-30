import { test, expect } from "@playwright/test"
import { DashboardPage } from "./pages/dashboard.page"
import { AIAnalysisPage } from "./pages/ai-analysis.page"

test.describe("AI Analysis Workflow", () => {
  let dashboardPage: DashboardPage
  let aiAnalysisPage: AIAnalysisPage

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page)
    aiAnalysisPage = new AIAnalysisPage(page)

    // Mock authentication
    await page.addInitScript(() => {
      localStorage.setItem("geominer_token", "test-token-123")
      localStorage.setItem(
        "geominer_user",
        JSON.stringify({
          id: "test-user-123",
          email: "test@geominer.com",
          name: "Test User",
          role: "geologist",
          is_active: true,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
        }),
      )
    })

    await dashboardPage.goto()
    await dashboardPage.switchToTab("analysis")
  })

  test("should display AI analysis panel", async ({ page }) => {
    await expect(page.getByText(/create ai analysis/i)).toBeVisible()
    await expect(aiAnalysisPage.analysisTypeSelect).toBeVisible()
    await expect(aiAnalysisPage.providerSelect).toBeVisible()
    await expect(aiAnalysisPage.promptTextarea).toBeVisible()
    await expect(aiAnalysisPage.startAnalysisButton).toBeVisible()
  })

  test("should validate required fields", async ({ page }) => {
    await aiAnalysisPage.startAnalysisButton.click()
    await aiAnalysisPage.expectValidationError()
  })

  test("should create analysis with valid input", async ({ page }) => {
    // Mock analysis creation API
    await page.route("**/api/v1/ai/analysis", async (route) => {
      const json = {
        id: "analysis-123",
        analysis_type: "geological",
        provider: "openai",
        status: "pending",
        progress: 0,
        created_at: "2024-01-01T00:00:00Z",
      }
      await route.fulfill({ json })
    })

    await aiAnalysisPage.createAnalysis({
      prompt: "Analyze geological formations for copper mineralization potential",
    })

    await aiAnalysisPage.expectAnalysisStarted()
  })

  test("should select different analysis types", async ({ page }) => {
    await aiAnalysisPage.analysisTypeSelect.click()

    // Check all analysis types are available
    await expect(page.getByText(/geological formation analysis/i)).toBeVisible()
    await expect(page.getByText(/geochemical assessment/i)).toBeVisible()
    await expect(page.getByText(/structural analysis/i)).toBeVisible()
    await expect(page.getByText(/mineral potential evaluation/i)).toBeVisible()

    // Select geochemical analysis
    await page.getByText(/geochemical assessment/i).click()
    await expect(aiAnalysisPage.analysisTypeSelect).toContainText(/geochemical/i)
  })

  test("should select different AI providers", async ({ page }) => {
    await aiAnalysisPage.providerSelect.click()

    // Check all providers are available
    await expect(page.getByText(/openai gpt-4/i)).toBeVisible()
    await expect(page.getByText(/anthropic claude/i)).toBeVisible()
    await expect(page.getByText(/alibaba qwen/i)).toBeVisible()

    // Select Anthropic
    await page.getByText(/anthropic claude/i).click()
    await expect(aiAnalysisPage.providerSelect).toContainText(/anthropic/i)
  })

  test("should display existing analyses", async ({ page }) => {
    // Check for existing analyses in the results panel
    await expect(page.getByText(/analysis results/i)).toBeVisible()
    await expect(page.getByText(/geological analysis/i)).toBeVisible()
    await expect(page.getByText(/geochemical analysis/i)).toBeVisible()

    // Check status indicators
    await expect(page.getByText(/completed/i)).toBeVisible()
    await expect(page.getByText(/running/i)).toBeVisible()
  })

  test("should show analysis progress", async ({ page }) => {
    // Look for progress indicators in existing analyses
    await expect(page.getByText(/processing\.\.\. 65%/i)).toBeVisible()

    // Check for progress bars
    const progressBars = page.locator('[role="progressbar"]')
    await expect(progressBars.first()).toBeVisible()
  })
})
