import { test, expect } from "@playwright/test"
import { DashboardPage } from "./pages/dashboard.page"

test.describe("Dashboard Functionality", () => {
  let dashboardPage: DashboardPage

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page)

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
  })

  test("should display dashboard with all components", async ({ page }) => {
    await dashboardPage.goto()
    await dashboardPage.expectToBeVisible()
    await dashboardPage.expectStatsToBeVisible()

    // Check navigation is present
    await expect(page.getByText(/geominer ai/i)).toBeVisible()

    // Check all tabs are present
    await expect(dashboardPage.overviewTab).toBeVisible()
    await expect(dashboardPage.analysisTab).toBeVisible()
    await expect(dashboardPage.mapsTab).toBeVisible()
    await expect(dashboardPage.datasetsTab).toBeVisible()
    await expect(dashboardPage.realtimeTab).toBeVisible()
  })

  test("should switch between dashboard tabs", async ({ page }) => {
    await dashboardPage.goto()

    // Test each tab
    await dashboardPage.switchToTab("analysis")
    await expect(page.getByText(/create ai analysis/i)).toBeVisible()

    await dashboardPage.switchToTab("maps")
    await expect(page.getByText(/interactive geological map/i)).toBeVisible()

    await dashboardPage.switchToTab("datasets")
    await expect(page.getByText(/upload dataset/i)).toBeVisible()

    await dashboardPage.switchToTab("realtime")
    await expect(page.getByText(/real-time system status/i)).toBeVisible()

    await dashboardPage.switchToTab("overview")
    await expect(page.getByText(/project overview/i)).toBeVisible()
  })

  test("should display correct statistics", async ({ page }) => {
    await dashboardPage.goto()

    // Check stats cards have expected content
    await expect(page.getByText("12")).toBeVisible() // Active projects
    await expect(page.getByText("847")).toBeVisible() // Total datasets
    await expect(page.getByText("156")).toBeVisible() // AI analyses
    await expect(page.getByText("8")).toBeVisible() // Team members
  })

  test("should be responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await dashboardPage.goto()

    // Dashboard should still be functional on mobile
    await dashboardPage.expectToBeVisible()

    // Tabs should be scrollable or stacked
    await expect(dashboardPage.tabsList).toBeVisible()
  })

  test("should handle navigation between sections", async ({ page }) => {
    await dashboardPage.goto()

    // Navigate to different sections and verify URLs
    await dashboardPage.switchToTab("analysis")
    await expect(dashboardPage.analysisTab).toHaveAttribute("data-state", "active")

    await dashboardPage.switchToTab("maps")
    await expect(dashboardPage.mapsTab).toHaveAttribute("data-state", "active")
  })
})
