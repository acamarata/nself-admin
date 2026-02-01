import { type Locator, type Page, expect } from '@playwright/test'

export class LogsPage {
  readonly page: Page
  readonly pageTitle: Locator
  readonly serviceSelector: Locator
  readonly levelFilter: Locator
  readonly searchInput: Locator
  readonly logsContainer: Locator
  readonly downloadButton: Locator
  readonly streamToggle: Locator

  constructor(page: Page) {
    this.page = page
    this.pageTitle = page.locator('h1')
    this.serviceSelector = page.locator('[data-testid="service-selector"]')
    this.levelFilter = page.locator('[data-testid="level-filter"]')
    this.searchInput = page.locator('input[placeholder*="Search"]')
    this.logsContainer = page.locator('[data-testid="logs-container"]')
    this.downloadButton = page.locator('button:has-text("Download")')
    this.streamToggle = page.locator('[data-testid="stream-toggle"]')
  }

  async goto() {
    await this.page.goto('/logs')
  }

  async selectService(serviceName: string) {
    await this.serviceSelector.click()
    await this.page.click(`[role="option"]:has-text("${serviceName}")`)
  }

  async filterByLevel(level: string) {
    await this.levelFilter.click()
    await this.page.click(`[role="option"]:has-text("${level}")`)
  }

  async searchLogs(query: string) {
    await this.searchInput.fill(query)
    // Wait for search results to update
    await this.page.waitForTimeout(500)
  }

  async downloadLogs() {
    const downloadPromise = this.page.waitForEvent('download')
    await this.downloadButton.click()
    const download = await downloadPromise
    return download
  }

  async toggleRealTimeStream() {
    await this.streamToggle.click()
  }

  async expectLogsVisible() {
    await expect(this.logsContainer).toBeVisible()
  }

  async expectLogsContain(text: string) {
    await expect(this.logsContainer).toContainText(text)
  }
}
