'use client'

/**
 * Skip to Main Content Link
 * WCAG 2.1 AA: 2.4.1 Bypass Blocks (Level A)
 *
 * Provides keyboard users a way to skip repetitive navigation
 * and jump directly to main content.
 */
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:rounded-md focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-white focus:shadow-lg focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 focus:outline-none"
    >
      Skip to main content
    </a>
  )
}
