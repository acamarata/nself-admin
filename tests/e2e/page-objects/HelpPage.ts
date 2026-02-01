import { type Locator, type Page, expect } from '@playwright/test'

export class HelpPage {
  readonly page: Page
  readonly pageTitle: Locator
  readonly searchInput: Locator
  readonly searchResults: Locator
  readonly commandPalette: Locator
  readonly docPage: Locator

  constructor(page: Page) {
    this.page = page
    this.pageTitle = page.locator('h1')
    this.searchInput = page.locator('input[placeholder*="Search"]')
    this.searchResults = page.locator('[data-testid="search-results"]')
    this.commandPalette = page.locator('[data-testid="command-palette"]')
    this.docPage = page.locator('[data-testid="doc-content"]')
  }

  async goto() {
    await this.page.goto('/help')
  }

  async searchHelp(query: string) {
    await this.searchInput.fill(query)
    await this.page.waitForTimeout(500) // Debounce
  }

  async expectSearchResults() {
    await expect(this.searchResults).toBeVisible()
  }

  async openCommandPalette() {
    // Use Cmd+K on Mac, Ctrl+K on Windows/Linux
    const isMac = process.platform === 'darwin'
    await this.page.keyboard.press(isMac ? 'Meta+K' : 'Control+K')
  }

  async expectCommandPaletteVisible() {
    await expect(this.commandPalette).toBeVisible()
  }

  async navigateToDoc(docTitle: string) {
    await this.page.click(`text="${docTitle}"`)
    await expect(this.docPage).toBeVisible()
  }

  async testKeyboardShortcut(shortcut: string) {
    await this.page.keyboard.press(shortcut)
  }
}
