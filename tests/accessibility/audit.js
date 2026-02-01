#!/usr/bin/env node

/**
 * Automated Accessibility Testing Script
 * Uses pa11y to test all pages for WCAG 2.1 AA compliance
 *
 * Usage:
 *   node tests/accessibility/audit.js
 *
 * Requirements:
 *   - Development server must be running on port 3021
 *   - pnpm dev
 */

const pa11y = require('pa11y')
const fs = require('fs').promises

const BASE_URL = 'http://localhost:3021'

// Pages to test (requires authentication, so we'll test what we can)
const PAGES = [
  {
    url: `${BASE_URL}/login`,
    name: 'Login Page',
  },
  // Add more pages after authentication is implemented in testing
  // {
  //   url: `${BASE_URL}/`,
  //   name: 'Dashboard',
  // },
  // {
  //   url: `${BASE_URL}/services`,
  //   name: 'Services Page',
  // },
]

const PA11Y_OPTIONS = {
  standard: 'WCAG2AA',
  runners: ['axe'],
  timeout: 30000,
  wait: 1000,
  ignore: [
    // Ignore third-party issues if any
  ],
}

async function runAudit() {
  console.log('Starting Accessibility Audit...\n')
  console.log(`Testing ${PAGES.length} pages for WCAG 2.1 AA compliance\n`)

  const results = []
  let totalIssues = 0
  let criticalIssues = 0

  for (const page of PAGES) {
    console.log(`Testing: ${page.name}`)
    console.log(`URL: ${page.url}`)

    try {
      const result = await pa11y(page.url, PA11Y_OPTIONS)

      const issues = result.issues || []
      const critical = issues.filter((i) => i.type === 'error').length
      const warnings = issues.filter((i) => i.type === 'warning').length
      const notices = issues.filter((i) => i.type === 'notice').length

      totalIssues += issues.length
      criticalIssues += critical

      results.push({
        page: page.name,
        url: page.url,
        issues,
        critical,
        warnings,
        notices,
      })

      console.log(`  ✓ Errors: ${critical}`)
      console.log(`  ⚠ Warnings: ${warnings}`)
      console.log(`  ℹ Notices: ${notices}`)
      console.log('')
    } catch (error) {
      console.error(`  ✗ Error testing ${page.name}:`, error.message)
      console.log('')
    }
  }

  // Generate report
  await generateReport(results, { totalIssues, criticalIssues })

  // Print summary
  console.log('\n' + '='.repeat(60))
  console.log('ACCESSIBILITY AUDIT SUMMARY')
  console.log('='.repeat(60))
  console.log(`Total Issues: ${totalIssues}`)
  console.log(`Critical Errors: ${criticalIssues}`)
  console.log(`\nDetailed report saved to: tests/accessibility/report.md`)

  // Exit with error if critical issues found
  if (criticalIssues > 0) {
    console.log('\n⚠️  FAILED: Critical accessibility issues found!')
    process.exit(1)
  } else {
    console.log('\n✅ PASSED: No critical accessibility issues found!')
    process.exit(0)
  }
}

async function generateReport(results, summary) {
  const timestamp = new Date().toISOString()

  let report = `# Accessibility Audit Report

**Date:** ${timestamp}
**Standard:** WCAG 2.1 AA
**Tool:** pa11y with axe-core

---

## Summary

- **Total Issues:** ${summary.totalIssues}
- **Critical Errors:** ${summary.criticalIssues}
- **Pages Tested:** ${results.length}

---

## Detailed Results

`

  for (const result of results) {
    report += `### ${result.page}

**URL:** \`${result.url}\`

- Errors: ${result.critical}
- Warnings: ${result.warnings}
- Notices: ${result.notices}

`

    if (result.issues.length > 0) {
      report += `#### Issues Found:\n\n`

      for (const issue of result.issues) {
        report += `- **[${issue.type.toUpperCase()}]** ${issue.message}
  - Code: \`${issue.code}\`
  - Selector: \`${issue.selector}\`
  - Context: \`${issue.context}\`

`
      }
    } else {
      report += `✅ No accessibility issues found!\n\n`
    }

    report += '\n---\n\n'
  }

  await fs.writeFile('tests/accessibility/report.md', report, 'utf8')
}

// Run the audit
runAudit().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
