import * as apiKeysApi from '@/lib/api-keys'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/api-keys - List all API keys
 * Query params:
 *   - tenantId: Filter by tenant (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const tenantId = searchParams.get('tenantId') || undefined

    const apiKeys = await apiKeysApi.getApiKeys(tenantId)

    return NextResponse.json({
      success: true,
      apiKeys,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch API keys',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}

/**
 * POST /api/api-keys - Create a new API key
 * Body:
 *   - name: string (required)
 *   - scope: ApiKeyScope (required)
 *   - description?: string
 *   - permissions?: ApiKeyPermission[]
 *   - rateLimit?: { requests: number, window: number }
 *   - allowedIps?: string[]
 *   - allowedOrigins?: string[]
 *   - expiresAt?: string
 *
 * Returns the key AND the secret (one-time only)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.name || !body.scope) {
      return NextResponse.json(
        { success: false, error: 'name and scope are required' },
        { status: 400 },
      )
    }

    // Validate scope value
    const validScopes = ['read', 'write', 'admin', 'custom']
    if (!validScopes.includes(body.scope)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid scope. Must be one of: ${validScopes.join(', ')}`,
        },
        { status: 400 },
      )
    }

    // This returns the key AND the secret (one-time only)
    const result = await apiKeysApi.createApiKey(body)

    return NextResponse.json(
      {
        success: true,
        key: result.key,
        secretKey: result.secretKey, // Only shown once!
      },
      { status: 201 },
    )
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create API key',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
