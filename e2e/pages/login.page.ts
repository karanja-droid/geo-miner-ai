import { type Page, type Locator, expect } from "@playwright/test"

export class LoginPage {
  readonly page: Page
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly loginButton: Locator
  readonly errorMessage: Locator
  readonly forgotPasswordLink: Locator
  readonly signUpLink: Locator
  readonly showPasswordButton: Locator
  readonly demoCredentials: Locator

  constructor(page: Page) {
    this.page = page
    this.emailInput = page.getByLabel(/email/i)
    this.passwordInput = page.getByLabel(/password/i)
    this.loginButton = page.getByRole("button", { name: /sign in/i })
    this.errorMessage = page.getByText(/login failed/i)
    this.forgotPasswordLink = page.getByRole("link", { name: /forgot password/i })
    this.signUpLink = page.getByRole("link", { name: /sign up/i })
    this.showPasswordButton = page.getByRole("button", { name: "" }).first()
    this.demoCredentials = page.getByText(/demo credentials/i)
  }

  async goto() {
    await this.page.goto("/login")
    await this.page.waitForLoadState("networkidle")
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.loginButton.click()
  }

  async loginWithValidCredentials() {
    await this.login("demo@geominer.com", "demo123")
    await this.page.waitForURL("/dashboard")
  }

  async expectToBeVisible() {
    await expect(this.page.getByRole("heading", { name: /sign in/i })).toBeVisible()
    await expect(this.emailInput).toBeVisible()
    await expect(this.passwordInput).toBeVisible()
    await expect(this.loginButton).toBeVisible()
  }

  async expectValidationErrors() {
    await expect(this.page.getByText(/email is required/i)).toBeVisible()
    await expect(this.page.getByText(/password is required/i)).toBeVisible()
  }

  async togglePasswordVisibility() {
    await this.showPasswordButton.click()
  }

  async expectPasswordVisible() {
    await expect(this.passwordInput).toHaveAttribute("type", "text")
  }

  async expectPasswordHidden() {
    await expect(this.passwordInput).toHaveAttribute("type", "password")
  }
}
