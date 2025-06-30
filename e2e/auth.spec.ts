import { test, expect } from "@playwright/test"
import { LoginPage } from "./pages/login.page"
import { DashboardPage } from "./pages/dashboard.page"

test.describe("Authentication Flow", () => {
  let loginPage: LoginPage
  let dashboardPage: DashboardPage

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page)
    dashboardPage = new DashboardPage(page)
  })

  test("should display login page correctly", async ({ page }) => {
    await loginPage.goto()
    await loginPage.expectToBeVisible()

    // Check for GeoMiner AI branding
    await expect(page.getByText(/geominer ai/i)).toBeVisible()
    await expect(page.getByText(/advanced mining exploration platform/i)).toBeVisible()

    // Check for demo credentials
    await expect(loginPage.demoCredentials).toBeVisible()
  })

  test("should show validation errors for empty form", async ({ page }) => {
    await loginPage.goto()
    await loginPage.loginButton.click()
    await loginPage.expectValidationErrors()
  })

  test("should toggle password visibility", async ({ page }) => {
    await loginPage.goto()
    await loginPage.passwordInput.fill("secretpassword")

    // Initially hidden
    await loginPage.expectPasswordHidden()

    // Toggle to visible
    await loginPage.togglePasswordVisibility()
    await loginPage.expectPasswordVisible()

    // Toggle back to hidden
    await loginPage.togglePasswordVisibility()
    await loginPage.expectPasswordHidden()
  })

  test("should login successfully with valid credentials", async ({ page }) => {
    // Mock successful login response
    await page.route("**/api/v1/auth/login", async (route) => {
      const json = {
        access_token: "test-token-123",
        token_type: "bearer",
        user: {
          id: "test-user-123",
          email: "demo@geominer.com",
          name: "Demo User",
          role: "geologist",
          is_active: true,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
          organization: "Demo Mining Corp",
        },
      }
      await route.fulfill({ json })
    })

    await loginPage.goto()
    await loginPage.loginWithValidCredentials()

    // Should redirect to dashboard
    await expect(page).toHaveURL("/dashboard")
    await dashboardPage.expectToBeVisible()
  })

  test("should handle login failure gracefully", async ({ page }) => {
    // Mock failed login response
    await page.route("**/api/v1/auth/login", async (route) => {
      await route.fulfill({
        status: 401,
        json: {
          error: {
            message: "Invalid credentials",
            code: "AUTHENTICATION_ERROR",
          },
        },
      })
    })

    await loginPage.goto()
    await loginPage.login("wrong@email.com", "wrongpassword")

    // Should show error message
    await expect(loginPage.errorMessage).toBeVisible()

    // Should remain on login page
    await expect(page).toHaveURL("/login")
  })

  test("should logout successfully", async ({ page }) => {
    // First login
    await page.route("**/api/v1/auth/login", async (route) => {
      const json = {
        access_token: "test-token-123",
        token_type: "bearer",
        user: {
          id: "test-user-123",
          email: "demo@geominer.com",
          name: "Demo User",
          role: "geologist",
          is_active: true,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
        },
      }
      await route.fulfill({ json })
    })

    await loginPage.goto()
    await loginPage.loginWithValidCredentials()
    await dashboardPage.expectToBeVisible()

    // Then logout
    await dashboardPage.logout()

    // Should redirect to login page
    await expect(page).toHaveURL("/login")
    await loginPage.expectToBeVisible()
  })
})
