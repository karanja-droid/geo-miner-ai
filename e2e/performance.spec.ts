import { test, expect } from "@playwright/test"

test.describe("Performance Tests", () => {
  test("should load login page within performance budget", async ({ page }) => {
    const startTime = Date.now()

    await page.goto("/login")
    await page.waitForLoadState("networkidle")

    const loadTime = Date.now() - startTime

    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000)
  })

  test("should load dashboard within performance budget", async ({ page }) => {
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

    const startTime = Date.now()

    await page.goto("/dashboard")
    await page.waitForLoadState("networkidle")

    const loadTime = Date.now() - startTime

    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000)
  })

  test("should have good Core Web Vitals", async ({ page }) => {
    await page.goto("/dashboard")

    // Measure Largest Contentful Paint (LCP)
    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          resolve(lastEntry.startTime)
        }).observe({ entryTypes: ["largest-contentful-paint"] })
      })
    })

    // LCP should be under 2.5 seconds
    expect(lcp).toBeLessThan(2500)
  })

  test("should handle large datasets efficiently", async ({ page }) => {
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

    // Mock large dataset response
    await page.route("**/api/v1/datasets", async (route) => {
      const largeDataset = Array.from({ length: 100 }, (_, i) => ({
        id: `dataset-${i}`,
        name: `Dataset ${i}.csv`,
        type: "geochemical",
        size: "2.4 MB",
        status: "ready",
        created_at: "2024-01-01T00:00:00Z",
        records_count: 15420,
      }))

      await route.fulfill({ json: { data: largeDataset } })
    })

    await page.goto("/dashboard")

    const startTime = Date.now()

    // Navigate to datasets tab
    await page.getByRole("tab", { name: /datasets/i }).click()
    await page.waitForLoadState("networkidle")

    const renderTime = Date.now() - startTime

    // Should render large dataset list within 2 seconds
    expect(renderTime).toBeLessThan(2000)
  })
})
