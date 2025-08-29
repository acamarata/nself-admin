/**
 * Client-side API utilities for making authenticated requests
 */

/**
 * Get CSRF token from cookie
 */
function getCSRFToken(): string | null {
  if (typeof document === 'undefined') return null
  
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'nself-csrf') {
      return value
    }
  }
  return null
}

/**
 * Make an authenticated API request with CSRF token
 */
export async function apiRequest(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const csrfToken = getCSRFToken()
  
  const headers = new Headers(options.headers)
  
  // Add CSRF token if available and it's a state-changing request
  if (csrfToken && options.method && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method)) {
    headers.set('x-csrf-token', csrfToken)
  }
  
  // Add JSON content type if body is present and not FormData
  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }
  
  return fetch(url, {
    ...options,
    headers,
    credentials: 'same-origin' // Include cookies
  })
}

/**
 * Make a POST request with CSRF protection
 */
export async function apiPost(
  url: string,
  body?: any
): Promise<Response> {
  return apiRequest(url, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined
  })
}

/**
 * Make a GET request
 */
export async function apiGet(url: string): Promise<Response> {
  return apiRequest(url, { method: 'GET' })
}

/**
 * Make a DELETE request with CSRF protection
 */
export async function apiDelete(url: string): Promise<Response> {
  return apiRequest(url, { method: 'DELETE' })
}

/**
 * Make a PUT request with CSRF protection
 */
export async function apiPut(
  url: string,
  body?: any
): Promise<Response> {
  return apiRequest(url, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined
  })
}