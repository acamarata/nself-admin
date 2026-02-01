import { getServiceStatus } from '@/lib/nself-service'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const result = await getServiceStatus('postgres')

    // Parse docker stats output to extract metrics
    // This is a simplified version - actual implementation would parse docker stats
    const mockStats = {
      status: {
        running: true,
        health: 'healthy' as const,
        uptime: '7d 14h 23m',
        cpu: 12.5,
        memory: 512 * 1024 * 1024, // 512MB
        memoryLimit: 2 * 1024 * 1024 * 1024, // 2GB
        network: {
          rx: '1.2 MB/s',
          tx: '0.8 MB/s',
        },
      },
      database: {
        version: 'PostgreSQL 15.3',
        databases: 5,
        tables: 47,
        size: '1.2 GB',
        connections: {
          active: 8,
          idle: 4,
          max: 100,
        },
      },
    }

    return NextResponse.json({
      success: true,
      data: result.success
        ? mockStats
        : { status: { running: false, health: 'stopped' as const } },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch PostgreSQL stats',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
