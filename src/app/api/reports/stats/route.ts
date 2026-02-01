import * as reportsApi from '@/lib/reports'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/reports/stats - Get report statistics
export async function GET(_request: NextRequest) {
  try {
    const stats = await reportsApi.getReportStats()

    return NextResponse.json({
      success: true,
      stats,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to get report stats',
      },
      { status: 500 },
    )
  }
}
