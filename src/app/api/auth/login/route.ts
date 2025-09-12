import {
  checkPasswordExists,
  createLoginSession,
  logout as deleteSessionToken,
  verifyAdminLogin,
} from '@/lib/auth-db'
import {
  clearRateLimit,
  getRateLimitInfo,
  isRateLimited,
} from '@/lib/rateLimiter'
import { validateRequest } from '@/lib/validation'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Schema for login request
const loginSchema = z.object({
  password: z
    .string()
    .min(1, 'Password is required')
    .max(256, 'Password too long'),
})

export async function POST(request: NextRequest) {
  // Check rate limiting
  if (isRateLimited(request, 'auth')) {
    const info = getRateLimitInfo(request, 'auth')
    return NextResponse.json(
      {
        success: false,
        error: 'Too many login attempts. Please try again later.',
        retryAfter: Math.ceil((info.resetTime - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(
            Math.ceil((info.resetTime - Date.now()) / 1000),
          ),
          'X-RateLimit-Limit': String(info.limit),
          'X-RateLimit-Remaining': String(info.remaining),
          'X-RateLimit-Reset': new Date(info.resetTime).toISOString(),
        },
      },
    )
  }

  try {
    // Parse and validate request body
    const body = await request.json().catch(() => null)

    if (!body) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request body',
        },
        { status: 400 },
      )
    }

    // Validate input with schema
    const validation = await validateRequest(body, loginSchema)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validation.errors.format(),
        },
        { status: 400 },
      )
    }

    const { password } = validation.data

    // Check if password is set
    const passwordExists = await checkPasswordExists()
    if (!passwordExists) {
      return NextResponse.json(
        {
          success: false,
          error: 'No password configured. Please set up your password first.',
          needsSetup: true,
        },
        { status: 401 },
      )
    }

    // Verify password
    const isValid = await verifyAdminLogin(password)

    if (isValid) {
      // Clear rate limit on successful login
      clearRateLimit(request, 'auth')

      // Get client info
      const ip =
        request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip') ||
        'unknown'
      const userAgent = request.headers.get('user-agent') || undefined

      // Create session in database
      const sessionToken = await createLoginSession(ip, userAgent)

      // Create response with secure cookie
      const response = NextResponse.json({
        success: true,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })

      // Set httpOnly cookie for security
      response.cookies.set('nself-session', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60, // 7 days to match session duration
        path: '/',
      })

      return response
    }

    // Invalid password - add progressive delay to prevent brute force
    const info = getRateLimitInfo(request, 'auth')
    const delay = Math.min(1000 * (5 - info.remaining), 5000) // Progressive delay up to 5 seconds
    await new Promise((resolve) => setTimeout(resolve, delay))

    return NextResponse.json(
      {
        success: false,
        error: 'Invalid credentials',
      },
      { status: 401 },
    )
  } catch (error: any) {
    console.error('Login error:', error?.message || error)

    // Don't leak internal errors
    return NextResponse.json(
      {
        success: false,
        error: 'Authentication failed',
      },
      { status: 500 },
    )
  }
}

// Logout endpoint
export async function DELETE(request: NextRequest) {
  const token = request.cookies.get('nself-session')?.value

  if (token) {
    await deleteSessionToken(token)
  }

  const response = NextResponse.json({ success: true })
  response.cookies.delete('nself-session')

  return response
}
