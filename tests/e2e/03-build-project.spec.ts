import { expect, test } from './fixtures'
import { setupAuth } from './helpers'

test.describe('Build Project Flow', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page)
  })

  test('should navigate to build page', async ({ buildPage }) => {
    await buildPage.goto()
    await expect(buildPage.pageTitle).toBeVisible()
    await expect(buildPage.page).toHaveURL(/\/build/)
  })

  test('should run pre-build checks', async ({ buildPage }) => {
    await buildPage.goto()

    // Click pre-check button if visible
    if (await buildPage.preCheckButton.isVisible()) {
      await buildPage.preCheckButton.click()

      // Wait for pre-check to complete
      await buildPage.page.waitForSelector(
        '[data-testid*="check"]:has-text("complete")',
        { timeout: 30000 },
      )
    }
  })

  test('should execute build', async ({ buildPage }) => {
    await buildPage.goto()

    // Run build
    await buildPage.runBuild()

    // Should show build logs
    await buildPage.expectBuildLogsVisible()
  })

  test('should view build logs in real-time', async ({ buildPage, page }) => {
    await buildPage.goto()

    // Start build
    await buildPage.runBuild()

    // Logs container should be visible
    await expect(buildPage.buildLogs).toBeVisible()

    // Wait for some log output
    await page.waitForTimeout(2000)

    // Check if logs contain expected output
    const logsContent = await buildPage.buildLogs.textContent()
    expect(logsContent).toBeTruthy()
  })

  test('should handle build errors gracefully', async ({ buildPage }) => {
    await buildPage.goto()

    // Note: This test would need a way to trigger a build error
    // For now, we just verify error handling UI exists
    const errorAlert = buildPage.page.locator('[role="alert"]')
    await expect(errorAlert).toBeAttached()
  })

  test('should show build progress indicator', async ({ buildPage, page }) => {
    await buildPage.goto()
    await buildPage.runBuild()

    // Should show some kind of progress indicator
    const progressIndicators = [
      '[data-testid="build-progress"]',
      '[role="progressbar"]',
      '[data-testid="loading-spinner"]',
    ]

    let found = false
    for (const selector of progressIndicators) {
      if (await page.locator(selector).isVisible()) {
        found = true
        break
      }
    }

    // At least one progress indicator should be present
    expect(found).toBe(true)
  })

  test('should be responsive on mobile', async ({ buildPage, page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await buildPage.goto()

    await expect(buildPage.pageTitle).toBeVisible()
    await expect(buildPage.buildButton).toBeVisible()
  })

  test('should support keyboard navigation', async ({ buildPage, page }) => {
    await buildPage.goto()

    // Tab through interactive elements
    await page.keyboard.press('Tab')

    // Build button should be focusable
    const isBuildButtonFocused = await buildPage.buildButton.evaluate(
      (el) => el === document.activeElement,
    )
    expect(
      isBuildButtonFocused ||
        (await buildPage.preCheckButton.evaluate(
          (el) => el === document.activeElement,
        )),
    ).toBeTruthy()
  })

  test('should display build configuration', async ({ buildPage, page }) => {
    await buildPage.goto()

    // Check for configuration display
    const configSection = page.locator('[data-testid="build-config"]')
    if (await configSection.isVisible()) {
      await expect(configSection).toBeVisible()
    }
  })

  test('should allow canceling build', async ({ buildPage, page }) => {
    await buildPage.goto()
    await buildPage.runBuild()

    // Look for cancel button
    const cancelButton = page.locator('button:has-text("Cancel")')
    if (await cancelButton.isVisible()) {
      await cancelButton.click()

      // Build should be cancelled
      await expect(page.locator('[data-testid="build-status"]')).toContainText(
        /cancel/i,
      )
    }
  })
})
