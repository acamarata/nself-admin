import { NextResponse } from 'next/server'
import { orchestrator } from '@/services/globalOrchestrator'
import os from 'os'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function GET() {
  try {
    // Get data from our orchestrator
    // Use global orchestrator instance
    
    // Ensure orchestrator is running
    if (!orchestrator.isActive()) {
      await orchestrator.start()
      // Wait a moment for initial data collection
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    const state = orchestrator.getState()
    
    // Get system-level metrics (not Docker-specific)
    const getSystemMetrics = async () => {
      // CPU usage
      const getCpuUsage = async () => {
        try {
          const { stdout } = await execAsync("top -l 1 -n 0 | grep 'CPU usage' | awk '{print $3}' | sed 's/%//'")
          return parseFloat(stdout.trim()) || 0
        } catch {
          const load = os.loadavg()[0]
          const cpus = os.cpus().length
          return Math.min(Math.round((load / cpus) * 100), 100)
        }
      }

      // Memory usage
      const getMemoryUsage = async () => {
        const totalMem = os.totalmem()
        const freeMem = os.freemem()
        const usedMem = totalMem - freeMem
        
        return {
          used: Math.round(usedMem / (1024 * 1024 * 1024) * 10) / 10,
          total: Math.round(totalMem / (1024 * 1024 * 1024) * 10) / 10,
          percentage: Math.round((usedMem / totalMem) * 100)
        }
      }

      // Disk usage
      const getDiskUsage = async () => {
        try {
          const { stdout } = await execAsync("df -h / | tail -1 | awk '{print $2 \" \" $3 \" \" $5}' | sed 's/G//g' | sed 's/%//'")
          const parts = stdout.trim().split(' ')
          const total = parseFloat(parts[0]) || 100
          const used = parseFloat(parts[1]) || 50
          const percentage = parseInt(parts[2]) || 50
          
          return { used, total, percentage }
        } catch {
          return { used: 50, total: 100, percentage: 50 }
        }
      }

      // Network speed
      const getNetworkSpeed = async () => {
        try {
          const { stdout: wifiInfo } = await execAsync("system_profiler SPAirPortDataType 2>/dev/null | grep 'Transmit Rate:' | head -1 | awk '{print $3}'")
          const wifiRate = parseInt(wifiInfo.trim())
          if (wifiRate && wifiRate > 0) {
            return wifiRate
          }
        } catch {
          // Default to 1 Gbps
        }
        return 1000
      }

      return Promise.all([
        getCpuUsage(),
        getMemoryUsage(),
        getDiskUsage(),
        getNetworkSpeed()
      ])
    }

    const [systemCpu, systemMemory, systemDisk, maxSpeed] = await getSystemMetrics()

    // Calculate Docker metrics from orchestrator data
    const dockerMetrics = {
      cpu: state.metrics.totalCpu,
      memory: {
        used: state.metrics.totalMemory.used,
        total: state.metrics.totalMemory.total || systemMemory.total, // Use system memory as fallback
        percentage: state.metrics.totalMemory.percentage
      },
      network: {
        rx: state.metrics.totalNetwork.rx,
        tx: state.metrics.totalNetwork.tx
      },
      storage: {
        used: state.docker.containers.reduce((sum, c) => {
          // Estimate storage based on container count (rough estimate)
          return sum + 0.5 // Each container ~500MB
        }, 0),
        total: systemDisk.total
      },
      containers: state.docker.containers.length
    }

    // Get Docker storage if possible
    try {
      const { stdout } = await execAsync("docker system df --format 'table {{.Type}}\t{{.Size}}' | grep -E '(Images|Containers|Local Volumes)' | awk '{print $2}' | sed 's/[A-Za-z]*//g'")
      const sizes = stdout.trim().split('\n').map(s => parseFloat(s) || 0)
      dockerMetrics.storage.used = sizes.reduce((sum, size) => sum + size, 0)
    } catch {
      // Keep estimate
    }

    return NextResponse.json({
      success: true,
      data: {
        system: {
          cpu: systemCpu,
          memory: systemMemory,
          disk: systemDisk,
          network: {
            rx: 0, // System network not tracked currently
            tx: 0,
            maxSpeed
          }
        },
        docker: dockerMetrics,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('System metrics error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch system metrics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}