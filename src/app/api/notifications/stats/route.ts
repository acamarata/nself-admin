import { logger } from '@/lib/logger'
import * as notificationsApi from '@/lib/notifications'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/notifications/stats - Get notification statistics
 */
export async function GET(_request: NextRequest) {
  const startTime = Date.now()

  try {
    // TODO: Get actual user ID from session when multi-user is implemented
    const userId = 'current-user'

    const stats = await notificationsApi.getNotificationStats(userId)

    logger.api('GET', '/api/notifications/stats', 200, Date.now() - startTime)

    return NextResponse.json({
      success: true,
      stats,
    })
  } catch (error) {
    logger.error('Failed to get notification stats', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get notification stats',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
