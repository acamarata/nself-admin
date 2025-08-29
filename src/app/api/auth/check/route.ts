import { NextRequest, NextResponse } from 'next/server'
import { isTokenExpired } from '@/lib/auth'
import { sessions } from '@/lib/sessions'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('nself-session')?.value
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No session' },
        { status: 401 }
      )
    }
    
    // Check if session exists and is valid
    const session = sessions.get(token)
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Invalid session' },
        { status: 401 }
      )
    }
    
    // Check if session is expired
    if (isTokenExpired(session.expiresAt)) {
      sessions.delete(token)
      return NextResponse.json(
        { success: false, error: 'Session expired' },
        { status: 401 }
      )
    }
    
    // Session is valid
    return NextResponse.json({
      success: true,
      userId: session.userId,
      expiresAt: session.expiresAt.toISOString()
    })
    
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Authentication check failed' },
      { status: 500 }
    )
  }
}