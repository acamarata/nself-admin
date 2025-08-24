import { NextResponse } from 'next/server'
import { getHasuraCollector } from '@/services/HasuraCollector'

export async function GET() {
  try {
    const collector = getHasuraCollector()
    const stats = await collector.collect()
    
    return NextResponse.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('[API] Hasura stats error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch Hasura stats',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}