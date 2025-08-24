import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()
    
    // Get the admin password from environment variable
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
    
    if (password === adminPassword) {
      // Generate a simple token (in production, use JWT or similar)
      const token = crypto.randomBytes(32).toString('hex')
      
      return NextResponse.json({ 
        success: true, 
        token 
      })
    }
    
    return NextResponse.json({ 
      success: false, 
      error: 'Invalid password' 
    }, { status: 401 })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Authentication failed' 
    }, { status: 500 })
  }
}