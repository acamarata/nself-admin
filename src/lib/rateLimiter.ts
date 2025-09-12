import { NextRequest } from 'next/server'

interface RateLimitEntry {
  count: number
  resetTime: number
}

// In-memory store (use Redis in production)
const rateLimitStore = new Map<string, RateLimitEntry>()

// Configuration
const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes
const MAX_REQUESTS = {
  auth: 5, // 5 login attempts per 15 minutes
  api: 100, // 100 API calls per 15 minutes
  heavy: 10, // 10 heavy operations per 15 minutes
}

/**
 * Get client identifier from request
 */
function getClientId(request: NextRequest): string {
  // Try to get IP from various headers
  const forwarded = request.headers.get('x-forwarded-for')
  const real = request.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0] || real || 'unknown'

  // Combine with user agent for better fingerprinting
  const userAgent = request.headers.get('user-agent') || 'unknown'
  return `${ip}:${userAgent.substring(0, 50)}`
}

/**
 * Check if request is rate limited
 */
export function isRateLimited(
  request: NextRequest,
  type: 'auth' | 'api' | 'heavy' = 'api',
): boolean {
  const clientId = getClientId(request)
  const key = `${type}:${clientId}`
  const now = Date.now()
  const maxRequests = MAX_REQUESTS[type]

  // Clean up old entries
  for (const [k, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(k)
    }
  }

  const entry = rateLimitStore.get(key)

  if (!entry) {
    // First request
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    })
    return false
  }

  if (entry.resetTime < now) {
    // Window expired, reset
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    })
    return false
  }

  // Increment count
  entry.count++

  // Check if limit exceeded
  if (entry.count > maxRequests) {
    return true
  }

  return false
}

/**
 * Get remaining requests for client
 */
export function getRateLimitInfo(
  request: NextRequest,
  type: 'auth' | 'api' | 'heavy' = 'api',
): {
  remaining: number
  resetTime: number
  limit: number
} {
  const clientId = getClientId(request)
  const key = `${type}:${clientId}`
  const now = Date.now()
  const maxRequests = MAX_REQUESTS[type]

  const entry = rateLimitStore.get(key)

  if (!entry || entry.resetTime < now) {
    return {
      remaining: maxRequests,
      resetTime: now + RATE_LIMIT_WINDOW,
      limit: maxRequests,
    }
  }

  return {
    remaining: Math.max(0, maxRequests - entry.count),
    resetTime: entry.resetTime,
    limit: maxRequests,
  }
}

/**
 * Clear rate limit for a client (e.g., after successful login)
 */
export function clearRateLimit(
  request: NextRequest,
  type: 'auth' | 'api' | 'heavy' = 'auth',
): void {
  const clientId = getClientId(request)
  const key = `${type}:${clientId}`
  rateLimitStore.delete(key)
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key)
    }
  }
}, 60 * 1000) // Clean every minute
