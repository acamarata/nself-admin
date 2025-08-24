/**
 * Global error handling utilities
 */

// Store the original console.error
const originalConsoleError = console.error

/**
 * Suppress AbortError messages in console
 * These are expected when navigating away from pages
 */
export function suppressAbortErrors() {
  console.error = (...args: any[]) => {
    // Check if this is an AbortError
    const errorString = args.join(' ')
    
    // Skip logging if it's an AbortError
    if (
      errorString.includes('AbortError') ||
      errorString.includes('The user aborted a request') ||
      errorString.includes('signal is aborted without reason') ||
      errorString.includes('The operation was aborted')
    ) {
      return
    }
    
    // Otherwise, use original console.error
    originalConsoleError.apply(console, args)
  }
}

/**
 * Restore original console.error behavior
 */
export function restoreConsoleError() {
  console.error = originalConsoleError
}

/**
 * Safe fetch wrapper that handles aborts gracefully
 */
export async function safeFetch(
  url: string,
  options?: RequestInit
): Promise<Response | null> {
  try {
    const response = await fetch(url, options)
    return response
  } catch (error) {
    // Silently handle abort errors
    if (error instanceof Error && error.name === 'AbortError') {
      return null
    }
    // Re-throw other errors
    throw error
  }
}

/**
 * Create an abort controller with timeout
 */
export function createTimeoutController(timeoutMs: number = 5000) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  
  return {
    controller,
    clear: () => clearTimeout(timeoutId)
  }
}