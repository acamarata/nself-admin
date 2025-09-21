import { expect, test } from '@playwright/test'

test.describe('Project Setup Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Assume logged in state
    await page.goto('/login')
    await page.fill('input[type="password"]', 'TestPassword123!')
    await page.click('button[type="submit"]')
    await page.waitForURL((url) => !url.pathname.includes('/login'))
  })

  test('should complete project initialization wizard', async ({ page }) => {
    // Navigate to init page
    await page.goto('/init')

    // Step 1: Initial Setup
    await expect(page.locator('h2')).toContainText('Initial Setup')

    // Fill in project details
    await page.fill('input[name="projectName"]', 'Test Project')
    await page.fill('input[name="databaseName"]', 'testdb')
    await page.fill('input[name="databasePassword"]', 'SecureDBPass123!')
    await page.fill('input[name="adminEmail"]', 'admin@test.com')

    // Select environment
    await page.selectOption('select[name="environment"]', 'development')

    // Click next
    await page.click('button:has-text("Next")')

    // Step 2: Required Services
    await expect(page.locator('h2')).toContainText('Required Services')

    // Verify services are listed
    await expect(page.locator('text=PostgreSQL')).toBeVisible()
    await expect(page.locator('text=Hasura GraphQL')).toBeVisible()
    await expect(page.locator('text=Hasura Auth')).toBeVisible()
    await expect(page.locator('text=Nginx')).toBeVisible()

    // Click next
    await page.click('button:has-text("Next")')

    // Continue through remaining steps...
    // Step 3: Optional Services
    await expect(page.locator('h2')).toContainText('Optional Services')
    await page.click('button:has-text("Next")')

    // Step 4: Backend Services
    await expect(page.locator('h2')).toContainText('Backend Services')
    await page.click('button:has-text("Next")')

    // Step 5: Frontend Apps
    await expect(page.locator('h2')).toContainText('Frontend Apps')
    await page.click('button:has-text("Next")')

    // Step 6: Review
    await expect(page.locator('h2')).toContainText('Review & Build')

    // Click build
    await page.click('button:has-text("Build Project")')

    // Should navigate to build page
    await expect(page).toHaveURL(/.*\/build/)

    // Verify build process starts
    await expect(page.locator('text=Building Your Project')).toBeVisible()
  })

  test('should handle configuration validation', async ({ page }) => {
    await page.goto('/init')

    // Try to proceed without filling required fields
    await page.click('button:has-text("Next")')

    // Should show validation errors
    await expect(page.locator('text=Required')).toBeVisible()

    // Fill in required fields with invalid data
    await page.fill('input[name="projectName"]', 'Invalid Project!')
    await page.fill('input[name="databasePassword"]', 'weak')

    // Should show format errors
    await expect(page.locator('text=/[^a-zA-Z0-9_-]/')).toBeVisible()
    await expect(page.locator('text=at least')).toBeVisible()
  })

  test('should save progress between steps', async ({ page }) => {
    await page.goto('/init')

    // Fill in step 1
    await page.fill('input[name="projectName"]', 'Test Project')
    await page.fill('input[name="databaseName"]', 'testdb')
    await page.fill('input[name="databasePassword"]', 'SecureDBPass123!')
    await page.fill('input[name="adminEmail"]', 'admin@test.com')

    // Go to step 2
    await page.click('button:has-text("Next")')

    // Go back to step 1
    await page.click('button:has-text("Back")')

    // Values should be preserved
    await expect(page.locator('input[name="projectName"]')).toHaveValue(
      'Test Project',
    )
    await expect(page.locator('input[name="databaseName"]')).toHaveValue(
      'testdb',
    )
    await expect(page.locator('input[name="adminEmail"]')).toHaveValue(
      'admin@test.com',
    )
  })
})
