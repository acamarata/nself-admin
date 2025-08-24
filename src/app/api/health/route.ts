import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'

const execAsync = promisify(exec)

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  version: string
  uptime: number
  checks: {
    docker: boolean
    filesystem: boolean
    memory: boolean
    network: boolean
  }
  resources: {
    memory: {
      used: number
      total: number
      percentage: number
    }
    cpu: {
      usage: number
    }
  }
}

async function checkDocker(): Promise<boolean> {
  try {
    await execAsync('docker version')
    return true
  } catch {
    return false
  }
}

async function checkFilesystem(): Promise<boolean> {
  try {
    // Check if we can write to /tmp
    const testFile = '/tmp/.health-check'
    await fs.writeFile(testFile, 'test')
    await fs.unlink(testFile)
    
    // Check if project directory is accessible
    await fs.access('/project', fs.constants.R_OK | fs.constants.W_OK)
    return true
  } catch {
    return false
  }
}

async function checkMemory(): Promise<boolean> {
  try {
    const memInfo = await fs.readFile('/proc/meminfo', 'utf-8')
    const lines = memInfo.split('\n')
    const memTotal = parseInt(lines.find(l => l.startsWith('MemTotal'))?.split(/\s+/)[1] || '0')
    const memAvailable = parseInt(lines.find(l => l.startsWith('MemAvailable'))?.split(/\s+/)[1] || '0')
    
    // Check if we have at least 10% memory available
    return memAvailable / memTotal > 0.1
  } catch {
    // Fallback for non-Linux systems
    return true
  }
}

async function checkNetwork(): Promise<boolean> {
  try {
    // Try to resolve a common domain
    const { stdout } = await execAsync('ping -c 1 -W 1 google.com 2>/dev/null || echo "failed"')
    return !stdout.includes('failed')
  } catch {
    return false
  }
}

async function getMemoryUsage(): Promise<{ used: number; total: number; percentage: number }> {
  try {
    const memInfo = await fs.readFile('/proc/meminfo', 'utf-8')
    const lines = memInfo.split('\n')
    const memTotal = parseInt(lines.find(l => l.startsWith('MemTotal'))?.split(/\s+/)[1] || '0') / 1024 / 1024
    const memAvailable = parseInt(lines.find(l => l.startsWith('MemAvailable'))?.split(/\s+/)[1] || '0') / 1024 / 1024
    const memUsed = memTotal - memAvailable
    
    return {
      used: Math.round(memUsed * 100) / 100,
      total: Math.round(memTotal * 100) / 100,
      percentage: Math.round((memUsed / memTotal) * 100)
    }
  } catch {
    // Fallback values
    return { used: 0, total: 0, percentage: 0 }
  }
}

async function getCpuUsage(): Promise<number> {
  try {
    const stat1 = await fs.readFile('/proc/stat', 'utf-8')
    await new Promise(resolve => setTimeout(resolve, 100))
    const stat2 = await fs.readFile('/proc/stat', 'utf-8')
    
    const getCpuValues = (stat: string) => {
      const cpuLine = stat.split('\n')[0]
      const values = cpuLine.split(/\s+/).slice(1).map(Number)
      const idle = values[3]
      const total = values.reduce((a, b) => a + b, 0)
      return { idle, total }
    }
    
    const cpu1 = getCpuValues(stat1)
    const cpu2 = getCpuValues(stat2)
    
    const idleDiff = cpu2.idle - cpu1.idle
    const totalDiff = cpu2.total - cpu1.total
    
    const usage = 100 - (100 * idleDiff / totalDiff)
    return Math.round(usage * 10) / 10
  } catch {
    return 0
  }
}

export async function GET() {
  try {
    const startTime = process.hrtime()
    
    // Run all checks in parallel
    const [dockerOk, filesystemOk, memoryOk, networkOk, memoryUsage, cpuUsage] = await Promise.all([
      checkDocker(),
      checkFilesystem(),
      checkMemory(),
      checkNetwork(),
      getMemoryUsage(),
      getCpuUsage()
    ])
    
    const checks = {
      docker: dockerOk,
      filesystem: filesystemOk,
      memory: memoryOk,
      network: networkOk
    }
    
    const allChecksPass = Object.values(checks).every(check => check === true)
    const someChecksFail = Object.values(checks).some(check => check === false)
    
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
    if (!allChecksPass && !someChecksFail) {
      status = 'degraded'
    } else if (someChecksFail) {
      status = allChecksPass ? 'healthy' : 'degraded'
    }
    
    // Critical checks that make the service unhealthy
    if (!dockerOk || !filesystemOk) {
      status = 'unhealthy'
    }
    
    const health: HealthStatus = {
      status,
      timestamp: new Date().toISOString(),
      version: process.env.ADMIN_VERSION || require('../../../package.json').version,
      uptime: process.uptime(),
      checks,
      resources: {
        memory: memoryUsage,
        cpu: {
          usage: cpuUsage
        }
      }
    }
    
    const [, elapsed] = process.hrtime(startTime)
    const responseTime = Math.round(elapsed / 1000000) // Convert to milliseconds
    
    return NextResponse.json(health, {
      status: status === 'unhealthy' ? 503 : 200,
      headers: {
        'X-Response-Time': `${responseTime}ms`,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
        checks: {
          docker: false,
          filesystem: false,
          memory: false,
          network: false
        }
      },
      { status: 503 }
    )
  }
}

// Readiness check - lighter weight than health check
export async function HEAD() {
  try {
    // Just check if Docker is accessible
    const dockerOk = await checkDocker()
    
    if (dockerOk) {
      return new NextResponse(null, { status: 200 })
    } else {
      return new NextResponse(null, { status: 503 })
    }
  } catch {
    return new NextResponse(null, { status: 503 })
  }
}