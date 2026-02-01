import { type Locator, type Page, expect } from '@playwright/test'

export class DatabasePage {
  readonly page: Page
  readonly pageTitle: Locator
  readonly queryEditor: Locator
  readonly executeButton: Locator
  readonly queryResults: Locator
  readonly exportButton: Locator
  readonly schemaViewer: Locator
  readonly migrateButton: Locator

  constructor(page: Page) {
    this.page = page
    this.pageTitle = page.locator('h1')
    this.queryEditor = page.locator('[data-testid="query-editor"]')
    this.executeButton = page.locator('button:has-text("Execute")')
    this.queryResults = page.locator('[data-testid="query-results"]')
    this.exportButton = page.locator('button:has-text("Export")')
    this.schemaViewer = page.locator('[data-testid="schema-viewer"]')
    this.migrateButton = page.locator('button:has-text("Migrate")')
  }

  async goto() {
    await this.page.goto('/database')
  }

  async gotoConsole() {
    await this.page.goto('/database/console')
  }

  async gotoSchema() {
    await this.page.goto('/database/schema')
  }

  async gotoMigrate() {
    await this.page.goto('/database/migrate')
  }

  async executeQuery(query: string) {
    await this.queryEditor.fill(query)
    await this.executeButton.click()
  }

  async expectQueryResults() {
    await expect(this.queryResults).toBeVisible({ timeout: 10000 })
  }

  async exportResults() {
    const downloadPromise = this.page.waitForEvent('download')
    await this.exportButton.click()
    const download = await downloadPromise
    return download
  }

  async viewSchema() {
    await expect(this.schemaViewer).toBeVisible()
  }

  async runMigration() {
    await this.migrateButton.click()
    // Wait for migration to complete
    await this.page.waitForSelector('[data-testid="migration-complete"]', {
      timeout: 30000,
    })
  }
}
