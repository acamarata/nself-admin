import { NextRequest, NextResponse } from 'next/server'
import { verifyPassword, generateSessionToken, getAdminPasswordHash } from '@/lib/auth'
import { sessions } from '@/lib/sessions'
import { isRateLimited, getRateLimitInfo, clearRateLimit } from '@/lib/rateLimiter'

export async function POST(request: NextRequest) {
  // Check rate limiting
  if (isRateLimited(request, 'auth')) {
    const info = getRateLimitInfo(request, 'auth')
    return NextResponse.json(
      { 
        success: false, 
        error: 'Too many login attempts. Please try again later.',
        retryAfter: Math.ceil((info.resetTime - Date.now()) / 1000)
      },
      { 
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((info.resetTime - Date.now()) / 1000)),
          'X-RateLimit-Limit': String(info.limit),
          'X-RateLimit-Remaining': String(info.remaining),
          'X-RateLimit-Reset': new Date(info.resetTime).toISOString()
        }
      }
    )
  }
  
  try {
    // Input validation
    const body = await request.json()
    const { password } = body
    
    if (!password || typeof password !== 'string') {
      return NextResponse.json({ 
        success: false, 
        error: 'Password is required' 
      }, { status: 400 })
    }
    
    // Get the hashed admin password
    const adminPasswordHash = await getAdminPasswordHash()
    
    // Verify password using bcrypt
    const isValid = await verifyPassword(password, adminPasswordHash)
    
    if (isValid) {
      // Clear rate limit on successful login
      clearRateLimit(request, 'auth')
      
      // Generate secure session token
      const session = generateSessionToken()
      
      // Store session (in production, use Redis/database)
      sessions.set(session.token, {
        expiresAt: session.expiresAt,
        userId: 'admin'
      })
      
      // Create response with secure cookie
      const response = NextResponse.json({ 
        success: true,
        expiresAt: session.expiresAt.toISOString()
      })
      
      // Set httpOnly cookie for security
      response.cookies.set('nself-session', session.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60, // 24 hours
        path: '/'
      })
      
      return response
    }
    
    // Invalid password - add delay to prevent brute force
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return NextResponse.json({ 
      success: false, 
      error: 'Invalid credentials' 
    }, { status: 401 })
  } catch (error) {
    console.error('Authentication error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Authentication failed' 
    }, { status: 500 })
  }
}

// Logout endpoint
export async function DELETE(request: NextRequest) {
  const token = request.cookies.get('nself-session')?.value
  
  if (token) {
    sessions.delete(token)
  }
  
  const response = NextResponse.json({ success: true })
  response.cookies.delete('nself-session')
  
  return response
}