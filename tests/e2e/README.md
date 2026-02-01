# E2E Tests

End-to-end tests for nself-admin using Playwright.

## Test Coverage

### 10 Critical User Flows

1. **Initial Setup** (`01-initial-setup.spec.ts`)
   - First-time password setup
   - Login with new password
   - Navigate to dashboard

2. **Authentication** (`02-authentication.spec.ts`)
   - Login with correct password
   - Login with wrong password (rate limiting)
   - Logout
   - Session persistence (remember me)

3. **Build Project** (`03-build-project.spec.ts`)
   - Navigate to build page
   - Run pre-build checks
   - Execute build
   - View build logs
   - Handle build errors

4. **Service Management** (`04-service-management.spec.ts`)
   - View services list
   - Start a service
   - Stop a service
   - Restart a service
   - View service logs
   - View service details

5. **Database Operations** (`05-database-operations.spec.ts`)
   - Open database console
   - Execute SQL query
   - View query results
   - Export results to CSV
   - View database schema
   - Run database migration

6. **Environment Config** (`06-environment-config.spec.ts`)
   - Navigate to config/env
   - Switch environment tabs
   - Add new environment variable
   - Edit existing variable
   - Delete variable
   - Save changes

7. **Logs Viewer** (`07-logs-viewer.spec.ts`)
   - Open logs viewer
   - Select service
   - Filter by log level
   - Search logs
   - Download logs
   - Real-time log streaming

8. **Backup & Restore** (`08-backup-restore.spec.ts`)
   - Navigate to database backup
   - Create new backup
   - Download backup
   - Navigate to restore page
   - Restore from backup
   - Verify restore success

9. **Deployment** (`09-deployment.spec.ts`)
   - Navigate to deployment page
   - Select environment (staging)
   - Configure deployment settings
   - Execute deployment
   - View deployment logs
   - Verify deployment success

10. **Help & Search** (`10-help-and-search.spec.ts`)
    - Open help center
    - Search for topic
    - View search results
    - Navigate to documentation page
    - Use command palette (Cmd+K)
    - Navigate using keyboard shortcuts

## Architecture

### Page Object Pattern

All tests use the Page Object pattern for maintainability:

- **Page Objects**: `tests/e2e/page-objects/`
  - `LoginPage.ts`
  - `DashboardPage.ts`
  - `BuildPage.ts`
  - `ServicesPage.ts`
  - `DatabasePage.ts`
  - `ConfigPage.ts`
  - `LogsPage.ts`
  - `BackupRestorePage.ts`
  - `DeploymentPage.ts`
  - `HelpPage.ts`

### Fixtures

Custom Playwright fixtures in `tests/e2e/fixtures.ts` provide:

- All page objects injected into tests
- Type-safe test context

### Helpers

Common utilities in `tests/e2e/helpers.ts`:

- `setupAuth()` - Login helper
- `clearAppState()` - Clear cookies/storage
- `waitForStable()` - Wait for animations
- `testKeyboardNavigation()` - Accessibility testing
- `checkAccessibility()` - ARIA label verification
- And more...

## Running Tests

### All Tests

```bash
# Run all tests
npx playwright test

# Run in headed mode (watch browser)
npx playwright test --headed

# Run specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Specific Tests

```bash
# Run single test file
npx playwright test 01-initial-setup.spec.ts

# Run tests matching pattern
npx playwright test authentication

# Run single test case
npx playwright test -g "should login with correct password"
```

### Debug Mode

```bash
# Run in debug mode
npx playwright test --debug

# Run specific test in debug mode
npx playwright test 02-authentication.spec.ts --debug
```

### Reports

```bash
# View HTML report
npx playwright show-report

# Generate report
npx playwright test --reporter=html
```

## Browser Coverage

Tests run on:

- ✅ Chromium (Desktop)
- ✅ Firefox (Desktop)
- ✅ WebKit (Safari)
- ✅ Mobile Chrome (Pixel 5)
- ✅ Mobile Safari (iPhone 12)

## Accessibility Testing

Each test suite includes:

- ✅ Keyboard navigation
- ✅ ARIA labels
- ✅ Focus management
- ✅ Screen reader support

## Responsive Design

Each test suite verifies:

- ✅ Desktop (1920x1080)
- ✅ Tablet (768x1024)
- ✅ Mobile (375x667)

## CI/CD Integration

Tests are configured to run in CI:

- Retry failed tests 2x
- Single worker (no parallel execution)
- HTML report artifact
- Screenshots on failure
- Video on failure

## Best Practices

1. **Use Page Objects** - Keep selectors in page objects
2. **Assertions** - Use `expect()` from Playwright
3. **Waits** - Use `waitFor()` instead of `waitForTimeout()`
4. **Isolation** - Each test should be independent
5. **Cleanup** - Use `beforeEach` to reset state
6. **Screenshots** - Automatic on failure
7. **Traces** - Enabled on retry for debugging

## Writing New Tests

1. Create new spec file in `tests/e2e/`
2. Import fixtures: `import { test, expect } from './fixtures'`
3. Use page objects for selectors
4. Add accessibility checks
5. Test responsive design
6. Add keyboard navigation tests

Example:

```typescript
import { test, expect } from './fixtures'
import { setupAuth } from './helpers'

test.describe('My Feature Flow', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page)
  })

  test('should do something', async ({ myPage }) => {
    await myPage.goto()
    await expect(myPage.element).toBeVisible()
  })
})
```

## Troubleshooting

### Tests Fail on CI

- Check video recordings in `test-results/`
- View trace with `npx playwright show-trace trace.zip`

### Tests Timeout

- Increase timeout in test: `{ timeout: 60000 }`
- Check if dev server is running
- Verify port 3021 is accessible

### Flaky Tests

- Add proper waits instead of `waitForTimeout`
- Use `toBeVisible()` before interactions
- Check for loading states

## Screenshots

Screenshots on failure are saved to `test-results/`

## Traces

Traces on retry are saved to `test-results/` and can be viewed with:

```bash
npx playwright show-trace test-results/trace.zip
```
