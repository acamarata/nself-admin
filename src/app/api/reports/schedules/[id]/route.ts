import * as reportsApi from '@/lib/reports'
import { NextRequest, NextResponse } from 'next/server'

interface RouteContext {
  params: Promise<{ id: string }>
}

// GET /api/reports/schedules/[id] - Get a single schedule
export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const schedule = await reportsApi.getSchedule(id)

    if (!schedule) {
      return NextResponse.json(
        { success: false, error: 'Schedule not found' },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      schedule,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to get schedule',
      },
      { status: 500 },
    )
  }
}

// PATCH /api/reports/schedules/[id] - Update a schedule
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const body = await request.json()

    // Check if schedule exists
    const existing = await reportsApi.getSchedule(id)
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Schedule not found' },
        { status: 404 },
      )
    }

    // Validate frequency if provided
    if (body.frequency) {
      const validFrequencies = ['once', 'hourly', 'daily', 'weekly', 'monthly']
      if (!validFrequencies.includes(body.frequency)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid frequency. Must be one of: ${validFrequencies.join(', ')}`,
          },
          { status: 400 },
        )
      }
    }

    // Validate format if provided
    if (body.format) {
      const validFormats = ['pdf', 'excel', 'csv', 'json', 'html']
      if (!validFormats.includes(body.format)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid format. Must be one of: ${validFormats.join(', ')}`,
          },
          { status: 400 },
        )
      }
    }

    const schedule = await reportsApi.updateSchedule(id, {
      frequency: body.frequency,
      dayOfWeek: body.dayOfWeek,
      dayOfMonth: body.dayOfMonth,
      time: body.time,
      timezone: body.timezone,
      format: body.format,
      recipients: body.recipients,
      enabled: body.enabled,
    })

    return NextResponse.json({
      success: true,
      schedule,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to update schedule',
      },
      { status: 500 },
    )
  }
}

// DELETE /api/reports/schedules/[id] - Delete a schedule
export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    // Check if schedule exists
    const existing = await reportsApi.getSchedule(id)
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Schedule not found' },
        { status: 404 },
      )
    }

    await reportsApi.deleteSchedule(id)

    return NextResponse.json({
      success: true,
      message: 'Schedule deleted successfully',
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to delete schedule',
      },
      { status: 500 },
    )
  }
}
