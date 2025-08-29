import { NextRequest, NextResponse } from 'next/server'
import { validateCSRFToken, csrfErrorResponse, setCSRFCookie } from './lib/csrf'

// Define public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/login',
  '/api/auth/login',
  '/api/auth/setup',
  '/api/health',
  '/_next',
  '/favicon.ico',
  '/site.webmanifest',
  '/sw.js'
]

// Define API routes that should be protected
const PROTECTED_API_ROUTES = [
  '/api/docker',
  '/api/services',
  '/api/database',
  '/api/config',
  '/api/system',
  '/api/project',
  '/api/nself',
  '/api/storage',
  '/api/monitoring',
  '/api/graphql',
  '/api/redis',
  '/api/cli'
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Allow public routes
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }
  
  // Check for session cookie
  const sessionToken = request.cookies.get('nself-session')?.value
  
  // If no session token, redirect to login
  if (!sessionToken) {
    // For API routes, return 401
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // For page routes, redirect to login
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // For now, accept any session token that exists
  // Validation happens in the API routes themselves since Edge Runtime
  // doesn't support Node.js modules needed for database access
  
  // Check if it's a protected API route
  if (PROTECTED_API_ROUTES.some(route => pathname.startsWith(route))) {
    // Validate CSRF token for state-changing requests
    if (!validateCSRFToken(request)) {
      return csrfErrorResponse()
    }
    
    // Add security headers
    const response = NextResponse.next()
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    
    // Ensure CSRF token is set
    if (!request.cookies.get('nself-csrf')) {
      setCSRFCookie(response)
    }
    
    return response
  }
  
  // For non-API routes, ensure CSRF token exists
  const response = NextResponse.next()
  if (!request.cookies.get('nself-csrf')) {
    setCSRFCookie(response)
  }
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}