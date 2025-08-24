import { NextResponse } from 'next/server'
import { getDockerStatsCollector } from '@/services/DockerStatsCollector'

export async function GET() {
  try {
    const collector = getDockerStatsCollector()
    const stats = await collector.collect()
    
    return NextResponse.json({
      success: true,
      data: {
        cpu: stats.cpu,
        memory: stats.memory,
        storage: stats.storage,
        network: stats.network,
        containers: stats.containers.total,
        containerDetails: stats.containers,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('[API] Docker stats error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch Docker stats',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}