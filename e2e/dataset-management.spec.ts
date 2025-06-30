import { test, expect } from "@playwright/test"
import { DashboardPage } from "./pages/dashboard.page"

test.describe("Dataset Management", () => {
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

    await dashboardPage.goto()
    await dashboardPage.switchToTab("datasets")
  })

  test("should display dataset management interface", async ({ page }) => {
    await expect(page.getByText(/upload dataset/i)).toBeVisible()
    await expect(page.getByText(/dataset library/i)).toBeVisible()
    await expect(page.getByText(/drop files here or click to browse/i)).toBeVisible()
  })

  test("should show existing datasets", async ({ page }) => {
    // Check for sample datasets
    await expect(page.getByText(/copper_geochemistry_2024\.csv/i)).toBeVisible()
    await expect(page.getByText(/geological_survey_data\.xlsx/i)).toBeVisible()
    await expect(page.getByText(/mining_boundaries\.shp/i)).toBeVisible()

    // Check dataset metadata
    await expect(page.getByText(/2\.4 MB/i)).toBeVisible()
    await expect(page.getByText(/15420 records/i)).toBeVisible()
  })

  test("should filter datasets by search", async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search datasets/i)
    await searchInput.fill("copper")

    // Should show only copper-related datasets
    await expect(page.getByText(/copper_geochemistry_2024\.csv/i)).toBeVisible()

    // Clear search
    await searchInput.clear()
    await searchInput.fill("")

    // Should show all datasets again
    await expect(page.getByText(/geological_survey_data\.xlsx/i)).toBeVisible()
  })

  test("should handle file upload simulation", async ({ page }) => {
    // Mock file upload API
    await page.route("**/api/v1/datasets/upload", async (route) => {
      const json = {
        id: "dataset-new-123",
        name: "test-upload.csv",
        status: "processing",
        created_at: "2024-01-01T00:00:00Z",
      }
      await route.fulfill({ json })
    })

    // Simulate file selection (note: actual file upload testing requires special setup)
    const fileInput = page.locator('input[type="file"]')
    await expect(fileInput).toBeAttached()

    // Check upload area is interactive
    const uploadArea = page.getByText(/drop files here or click to browse/i)
    await expect(uploadArea).toBeVisible()
  })

  test("should display dataset actions menu", async ({ page }) => {
    // Click on the first dataset's action menu
    const actionButton = page.locator('[data-testid="dataset-actions"]').first()
    await actionButton.click()

    // Check menu options
    await expect(page.getByText(/view details/i)).toBeVisible()
    await expect(page.getByText(/download/i)).toBeVisible()
    await expect(page.getByText(/delete/i)).toBeVisible()
  })
})
