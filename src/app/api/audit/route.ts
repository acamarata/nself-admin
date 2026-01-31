import { executeNselfCommand } from '@/lib/nselfCLI'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const action = searchParams.get('action')
    const since = searchParams.get('since')
    const limit = searchParams.get('limit')

    const args: string[] = []

    if (action) {
      args.push(`--action=${action}`)
    }
    if (since) {
      args.push(`--since=${since}`)
    }
    if (limit) {
      args.push(`--limit=${limit}`)
    }

    const result = await executeNselfCommand('audit', args)

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to retrieve audit log',
          details: result.error || result.stderr || 'Unknown error',
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      data: { output: result.stdout?.trim() },
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve audit log',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
