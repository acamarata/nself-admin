import { expect, test } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing auth state
    await page.context().clearCookies()
  })

  test('should set up password for first time user', async ({ page }) => {
    // Navigate to the app
    await page.goto('/')

    // Should redirect to login page
    await expect(page).toHaveURL(/.*\/login/)

    // Should show welcome message for first-time setup
    await expect(page.locator('h1')).toContainText('Welcome to nAdmin')

    // Enter a new password
    await page.fill('input[type="password"]', 'TestPassword123!')

    // Submit the form
    await page.click('button[type="submit"]')

    // Should redirect to dashboard or init page
    await page.waitForURL((url) => !url.pathname.includes('/login'))
  })

  test('should login with existing password', async ({ page }) => {
    // Assume password is already set
    await page.goto('/login')

    // Should show login prompt
    await expect(page.locator('h1')).toContainText('nAdmin')

    // Enter password
    await page.fill('input[type="password"]', 'TestPassword123!')

    // Submit the form
    await page.click('button[type="submit"]')

    // Should redirect away from login
    await page.waitForURL((url) => !url.pathname.includes('/login'))
  })

  test('should reject invalid password', async ({ page }) => {
    await page.goto('/login')

    // Enter wrong password
    await page.fill('input[type="password"]', 'WrongPassword')
    await page.click('button[type="submit"]')

    // Should show error message
    await expect(page.locator('text=Invalid password')).toBeVisible()

    // Should stay on login page
    await expect(page).toHaveURL(/.*\/login/)
  })

  test('should logout successfully', async ({ page }) => {
    // First login
    await page.goto('/login')
    await page.fill('input[type="password"]', 'TestPassword123!')
    await page.click('button[type="submit"]')
    await page.waitForURL((url) => !url.pathname.includes('/login'))

    // Find and click logout button
    await page.click('button:has-text("Logout")')

    // Should redirect to login
    await expect(page).toHaveURL(/.*\/login/)

    // Verify session is cleared by trying to access protected route
    await page.goto('/')
    await expect(page).toHaveURL(/.*\/login/)
  })

  test('should handle session expiry', async ({ page, context }) => {
    // Login first
    await page.goto('/login')
    await page.fill('input[type="password"]', 'TestPassword123!')
    await page.click('button[type="submit"]')
    await page.waitForURL((url) => !url.pathname.includes('/login'))

    // Manually clear session cookie to simulate expiry
    await context.clearCookies()

    // Try to navigate to protected page
    await page.goto('/')

    // Should redirect to login
    await expect(page).toHaveURL(/.*\/login/)
  })
})
