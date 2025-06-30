import { test, expect, devices } from "@playwright/test"

const browsers = [
  { name: "chromium", device: devices["Desktop Chrome"] },
  { name: "firefox", device: devices["Desktop Firefox"] },
  { name: "webkit", device: devices["Desktop Safari"] },
]

browsers.forEach(({ name, device }) => {
  test.describe(`Cross-browser compatibility - ${name}`, () => {
    test.use(device)

    test(`should work correctly in ${name}`, async ({ page }) => {
      await page.goto("/login")

      // Basic functionality should work across all browsers
      await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible()
      await expect(page.getByLabel(/email/i)).toBeVisible()
      await expect(page.getByLabel(/password/i)).toBeVisible()

      // Test form interaction
      await page.getByLabel(/email/i).fill("test@example.com")
      await page.getByLabel(/password/i).fill("password123")

      // Check values are properly set
      await expect(page.getByLabel(/email/i)).toHaveValue("test@example.com")
      await expect(page.getByLabel(/password/i)).toHaveValue("password123")
    })

    test(`should handle responsive design in ${name}`, async ({ page }) => {
      // Test mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto("/login")

      await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible()

      // Test tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 })
      await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible()

      // Test desktop viewport
      await page.setViewportSize({ width: 1024, height: 768 })
      await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible()
    })
  })
})
