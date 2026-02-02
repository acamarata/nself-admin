/**
 * Client-side authentication utilities
 * Provides functions to get current user info from session cookie
 */

export interface CurrentUser {
  userId: string
  userName: string
  sessionToken?: string
}

/**
 * Get current user information from session
 * For client-side use in hooks and components
 */
export function getCurrentUser(): CurrentUser {
  // In single-user mode, we always return 'admin'
  // When multi-user support is added, this will read from session cookie
  return {
    userId: 'admin',
    userName: 'Admin User',
  }
}

/**
 * Get user ID from session (convenience function)
 */
export function getCurrentUserId(): string {
  return getCurrentUser().userId
}

/**
 * Get user name from session (convenience function)
 */
export function getCurrentUserName(): string {
  return getCurrentUser().userName
}

/**
 * Check if user is authenticated
 * For client-side use
 */
export function isAuthenticated(): boolean {
  // Check if session cookie exists
  if (typeof document === 'undefined') return false
  return document.cookie.includes('session=')
}
