import { executeNselfCommand } from '@/lib/nselfCLI'
import { NextRequest, NextResponse } from 'next/server'

interface RouteParams {
  params: Promise<{ id: string; domain: string }>
}

export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id, domain } = await params
    const decodedDomain = decodeURIComponent(domain)

    const result = await executeNselfCommand('tenant', [
      'domain',
      'ssl',
      `--tenant=${id}`,
      `--domain=${decodedDomain}`,
      '--json',
    ])

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to generate SSL certificate',
          details: result.error || result.stderr || 'Unknown error',
        },
        { status: 500 },
      )
    }

    let sslData = { ssl: true, expiresAt: null }
    try {
      sslData = JSON.parse(result.stdout || '{}')
    } catch {
      // Use defaults
    }

    return NextResponse.json({
      success: true,
      data: sslData,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate SSL certificate',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
