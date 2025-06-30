import { test, expect } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"

test.describe("Accessibility Tests", () => {
  test("should not have accessibility violations on login page", async ({ page }) => {
    await page.goto("/login")

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test("should not have accessibility violations on dashboard", async ({ page }) => {
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

    await page.goto("/dashboard")

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test("should have proper keyboard navigation", async ({ page }) => {
    await page.goto("/login")

    // Test tab navigation
    await page.keyboard.press("Tab")
    await expect(page.getByLabel(/email/i)).toBeFocused()

    await page.keyboard.press("Tab")
    await expect(page.getByLabel(/password/i)).toBeFocused()

    await page.keyboard.press("Tab")
    await expect(page.getByRole("button", { name: /sign in/i })).toBeFocused()
  })

  test("should have proper ARIA labels and roles", async ({ page }) => {
    await page.goto("/login")

    // Check for proper ARIA attributes
    const emailInput = page.getByLabel(/email/i)
    await expect(emailInput).toHaveAttribute("type", "email")

    const passwordInput = page.getByLabel(/password/i)
    await expect(passwordInput).toHaveAttribute("type", "password")

    // Check for screen reader text
    const srOnlyElements = page.locator(".sr-only")
    await expect(srOnlyElements.first()).toBeAttached()
  })
})
