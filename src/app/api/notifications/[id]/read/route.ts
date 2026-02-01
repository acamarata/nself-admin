import { logger } from '@/lib/logger'
import * as notificationsApi from '@/lib/notifications'
import { NextRequest, NextResponse } from 'next/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * POST /api/notifications/[id]/read - Mark a notification as read
 */
export async function POST(_request: NextRequest, { params }: RouteParams) {
  const startTime = Date.now()

  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Notification ID is required' },
        { status: 400 },
      )
    }

    // TODO: Get actual user ID from session when multi-user is implemented
    const userId = 'current-user'

    const notification = await notificationsApi.markAsRead(id, userId)

    if (!notification) {
      return NextResponse.json(
        { success: false, error: 'Notification not found' },
        { status: 404 },
      )
    }

    logger.api(
      'POST',
      `/api/notifications/${id}/read`,
      200,
      Date.now() - startTime,
    )
    logger.info('Marked notification as read', { id })

    return NextResponse.json({
      success: true,
      notification,
    })
  } catch (error) {
    logger.error('Failed to mark notification as read', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to mark notification as read',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
