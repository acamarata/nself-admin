import { getRedisCollector } from '@/services/RedisCollector'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const collector = getRedisCollector()
    const stats = await collector.collect()

    return NextResponse.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch Redis stats',
        details:
          error instanceof Error
            ? error?.message || 'Unknown error'
            : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
