import { executeNselfCommand } from '@/lib/nselfCLI'
import { getRateLimitInfo, isRateLimited } from '@/lib/rateLimiter'
import { databaseQuerySchema, validateRequest } from '@/lib/validation'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // Rate limiting for heavy operations
  if (isRateLimited(request, 'heavy')) {
    const info = getRateLimitInfo(request, 'heavy')
    return NextResponse.json(
      {
        success: false,
        error: 'Rate limit exceeded',
        retryAfter: Math.ceil((info.resetTime - Date.now()) / 1000),
      },
      { status: 429 },
    )
  }

  try {
    const body = await request.json()

    // Validate input
    const validation = await validateRequest(body, databaseQuerySchema)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validation.errors.format(),
        },
        { status: 400 },
      )
    }

    const { query, database, timeout = 30000 } = validation.data

    // Execute query using nself CLI
    const result = await executeNselfCommand('db', ['query', '--json', query], {
      timeout,
      env: database ? { PGDATABASE: database } : undefined,
    })

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Query execution failed',
          stderr: result.stderr,
        },
        { status: 500 },
      )
    }

    // Parse the result
    try {
      const queryResult = JSON.parse(result.stdout || '{}')

      return NextResponse.json({
        success: true,
        data: {
          columns: queryResult.columns || [],
          rows: queryResult.rows || [],
          rowCount: queryResult.rowCount || 0,
          executionTime: queryResult.executionTime || 0,
        },
      })
    } catch (parseError) {
      // If not JSON, return raw result
      return NextResponse.json({
        success: true,
        data: {
          raw: result.stdout,
          executionTime: 0,
        },
      })
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: 'Query execution failed',
        details: error?.message || 'Unknown error',
      },
      { status: 500 },
    )
  }
}

// Get database list
export async function GET(request: NextRequest) {
  try {
    // Get list of databases
    const result = await executeNselfCommand('db', ['list', '--json'])

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch databases',
        },
        { status: 500 },
      )
    }

    const databases = JSON.parse(result.stdout || '[]')

    return NextResponse.json({
      success: true,
      data: databases,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch databases',
      },
      { status: 500 },
    )
  }
}
