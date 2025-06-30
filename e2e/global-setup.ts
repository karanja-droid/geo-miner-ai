import { chromium, type FullConfig } from "@playwright/test"

async function globalSetup(config: FullConfig) {
  console.log("🚀 Starting global setup...")

  // Start browser for setup
  const browser = await chromium.launch()
  const page = await browser.newPage()

  try {
    // Wait for the application to be ready
    await page.goto(config.projects[0].use.baseURL || "http://localhost:3000")
    await page.waitForLoadState("networkidle")

    // Create test user and store authentication state
    await setupTestUser(page)

    console.log("✅ Global setup completed")
  } catch (error) {
    console.error("❌ Global setup failed:", error)
    throw error
  } finally {
    await browser.close()
  }
}

async function setupTestUser(page: any) {
  // Mock API responses for test user
  await page.route("**/api/v1/auth/login", async (route: any) => {
    const json = {
      access_token: "test-token-123",
      token_type: "bearer",
      user: {
        id: "test-user-123",
        email: "test@geominer.com",
        name: "Test User",
        role: "geologist",
        is_active: true,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        organization: "Test Mining Corp",
      },
    }
    await route.fulfill({ json })
  })

  // Navigate to login and authenticate
  await page.goto("/login")
  await page.fill('[data-testid="email-input"]', "test@geominer.com")
  await page.fill('[data-testid="password-input"]', "password123")
  await page.click('[data-testid="login-button"]')

  // Wait for redirect to dashboard
  await page.waitForURL("/dashboard")

  // Save authentication state
  await page.context().storageState({ path: "e2e/auth-state.json" })
}

export default globalSetup
