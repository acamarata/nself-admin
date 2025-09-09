import { NextResponse } from 'next/server'
import { readEnvFile } from '@/lib/env-handler'

export async function GET() {
  try {
    const env = await readEnvFile()
    
    if (!env) {
      return NextResponse.json({ env: null }, { status: 200 })
    }
    
    return NextResponse.json({ env })
  } catch (error: any) {
    console.error('Error reading env file:', error)
    return NextResponse.json(
      { error: 'Failed to read env file', details: error.message },
      { status: 500 }
    )
  }
}