import { logger } from '@/lib/logger'
import * as notificationsApi from '@/lib/notifications'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/notifications/read-all - Mark all notifications as read
 */
export async function POST(_request: NextRequest) {
  const startTime = Date.now()

  try {
    // TODO: Get actual user ID from session when multi-user is implemented
    const userId = 'current-user'

    const count = await notificationsApi.markAllAsRead(userId)

    logger.api(
      'POST',
      '/api/notifications/read-all',
      200,
      Date.now() - startTime,
    )
    logger.info('Marked all notifications as read', { count })

    return NextResponse.json({
      success: true,
      data: {
        message: 'All notifications marked as read',
        count,
      },
    })
  } catch (error) {
    logger.error('Failed to mark all notifications as read', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to mark all notifications as read',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
