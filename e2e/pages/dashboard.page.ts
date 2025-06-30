import { type Page, type Locator, expect } from "@playwright/test"

export class DashboardPage {
  readonly page: Page
  readonly pageTitle: Locator
  readonly statsCards: Locator
  readonly tabsList: Locator
  readonly overviewTab: Locator
  readonly analysisTab: Locator
  readonly mapsTab: Locator
  readonly datasetsTab: Locator
  readonly realtimeTab: Locator
  readonly userMenu: Locator
  readonly logoutButton: Locator

  constructor(page: Page) {
    this.page = page
    this.pageTitle = page.getByRole("heading", { name: /geological exploration dashboard/i })
    this.statsCards = page.locator('[data-testid="stats-card"]')
    this.tabsList = page.getByRole("tablist")
    this.overviewTab = page.getByRole("tab", { name: /overview/i })
    this.analysisTab = page.getByRole("tab", { name: /ai analysis/i })
    this.mapsTab = page.getByRole("tab", { name: /geological maps/i })
    this.datasetsTab = page.getByRole("tab", { name: /datasets/i })
    this.realtimeTab = page.getByRole("tab", { name: /real-time/i })
    this.userMenu = page.getByRole("button", { name: /user menu/i })
    this.logoutButton = page.getByRole("menuitem", { name: /log out/i })
  }

  async goto() {
    await this.page.goto("/dashboard")
    await this.page.waitForLoadState("networkidle")
  }

  async expectToBeVisible() {
    await expect(this.pageTitle).toBeVisible()
    await expect(this.tabsList).toBeVisible()
    await expect(this.statsCards.first()).toBeVisible()
  }

  async switchToTab(tabName: "overview" | "analysis" | "maps" | "datasets" | "realtime") {
    const tabMap = {
      overview: this.overviewTab,
      analysis: this.analysisTab,
      maps: this.mapsTab,
      datasets: this.datasetsTab,
      realtime: this.realtimeTab,
    }

    await tabMap[tabName].click()
    await expect(tabMap[tabName]).toHaveAttribute("data-state", "active")
  }

  async expectStatsToBeVisible() {
    await expect(this.page.getByText(/active projects/i)).toBeVisible()
    await expect(this.page.getByText(/total datasets/i)).toBeVisible()
    await expect(this.page.getByText(/ai analyses/i)).toBeVisible()
    await expect(this.page.getByText(/team members/i)).toBeVisible()
  }

  async logout() {
    await this.userMenu.click()
    await this.logoutButton.click()
    await this.page.waitForURL("/login")
  }
}
