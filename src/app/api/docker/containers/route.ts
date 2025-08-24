import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

function getServiceType(name: string, labels: any): string {
  const n = name.toLowerCase()
  if (n.includes('postgres')) return 'database'
  if (n.includes('hasura')) return 'api'
  if (n.includes('auth')) return 'auth'
  if (n.includes('nginx')) return 'proxy'
  if (n.includes('minio')) return 'storage'
  if (n.includes('redis')) return 'cache'
  if (n.includes('mailpit')) return 'mail'
  if (n.includes('bull')) return 'worker'
  if (n.includes('nest')) return 'backend'
  return 'service'
}

function getServiceCategory(name: string, labels: any): string {
  const n = name.toLowerCase()
  if (['postgres', 'hasura', 'auth', 'nginx'].some(s => n.includes(s))) return 'core'
  if (['minio', 'redis', 'mailpit'].some(s => n.includes(s))) return 'infrastructure'
  if (['bull', 'nest', 'python', 'go'].some(s => n.includes(s))) return 'application'
  return 'other'
}

function getHealthStatus(status: string, state: string): string {
  if (status.includes('healthy')) return 'healthy'
  if (status.includes('unhealthy')) return 'unhealthy'
  if (state === 'running') return 'running'
  return state
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const detailed = searchParams.get('detailed') === 'true'
    const withStats = searchParams.get('stats') === 'true'
    
    // Get container list using docker ps
    const { stdout: containerJson } = await execAsync(
      `docker ps -a --format '{{json .}}'`
    )
    
    const containers = containerJson
      .trim()
      .split('\n')
      .filter(line => line)
      .map(line => {
        try {
          return JSON.parse(line)
        } catch {
          return null
        }
      })
      .filter(c => c !== null)
    
    // Filter for nself containers only (unless explicitly requesting all)
    const showAll = searchParams.get('all') === 'true'
    const nselfContainers = showAll ? containers : containers.filter(container => {
      const name = container.Names?.toLowerCase() || ''
      return name.startsWith('nself_') || name.startsWith('nself-')
    })
    
    // Get stats if requested
    let statsMap = new Map()
    if (withStats && nselfContainers.length > 0) {
      try {
        const containerIds = nselfContainers.map(c => c.ID).join(' ')
        const { stdout: statsOutput } = await execAsync(
          `docker stats --no-stream --format '{{json .}}' ${containerIds}`
        )
        
        statsOutput
          .trim()
          .split('\n')
          .filter(line => line)
          .forEach(line => {
            try {
              const stat = JSON.parse(line)
              statsMap.set(stat.Container || stat.ID, {
                cpu: parseFloat(stat.CPUPerc?.replace('%', '') || '0'),
                memory: {
                  usage: stat.MemUsage?.split('/')[0]?.trim() || '0',
                  limit: stat.MemUsage?.split('/')[1]?.trim() || '0',
                  percentage: parseFloat(stat.MemPerc?.replace('%', '') || '0')
                }
              })
            } catch {
              // Ignore parse errors
            }
          })
      } catch (error) {
        console.error('Failed to get container stats:', error)
      }
    }
    
    const formattedContainers = nselfContainers.map(container => {
      const stats = statsMap.get(container.ID)
      
      return {
        id: container.ID,
        name: container.Names,
        image: container.Image,
        state: container.State === 'running' ? 'running' : 'stopped',
        status: container.Status,
        ports: container.Ports?.split(',').map(p => {
          const match = p.match(/(\d+)->(\d+)/)
          return match ? {
            private: parseInt(match[2]),
            public: parseInt(match[1]),
            type: 'tcp'
          } : null
        }).filter(p => p),
        created: container.CreatedAt,
        serviceType: getServiceType(container.Names, {}),
        category: getServiceCategory(container.Names, {}),
        health: getHealthStatus(container.Status, container.State),
        stats: stats || null
      }
    })
    
    return NextResponse.json({
      success: true,
      data: formattedContainers,
      count: formattedContainers.length,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Docker containers API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch container status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}