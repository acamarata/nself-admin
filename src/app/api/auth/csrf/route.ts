import { NextResponse } from 'next/server'
import { generateCSRFToken } from '@/lib/csrf'

export async function GET() {
  const token = generateCSRFToken()
  
  const response = NextResponse.json({ token })
  
  // Set CSRF token in cookie
  response.cookies.set('nself-csrf', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 // 24 hours
  })
  
  return response
}