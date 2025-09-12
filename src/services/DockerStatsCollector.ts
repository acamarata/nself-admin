/**
 * Docker Stats Collector
 * Efficient collection of Docker container statistics
 */

import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export interface DockerStats {
  cpu: number
  memory: {
    used: number // GB
    total: number // GB
    percentage: number
  }
  storage: {
    used: number // GB
    total: number // GB
    percentage: number
  }
  network: {
    rx: number // Mbps
    tx: number // Mbps
  }
  containers: {
    total: number
    running: number
    stopped: number
    healthy: number
    unhealthy: number
  }
}

export class DockerStatsCollector {
  private cache: {
    data: DockerStats | null
    timestamp: number
  } = { data: null, timestamp: 0 }

  private readonly CACHE_TTL = 1000 // 1 second cache

  /**
   * Get all Docker stats in a single efficient call
   */
  async collect(): Promise<DockerStats> {
    const now = Date.now()

    // Return cached if fresh
    if (this.cache.data && now - this.cache.timestamp < this.CACHE_TTL) {
      return this.cache.data
    }

    try {
      // Get all stats in parallel with timeout
      const [containers, stats, storage, network] = await Promise.all([
        this.getContainers(),
        this.getResourceStats(),
        this.getStorageStats(),
        this.getNetworkStats(),
      ])

      const result: DockerStats = {
        cpu: stats.cpu,
        memory: stats.memory,
        storage,
        network,
        containers,
      }

      // Update cache
      this.cache = { data: result, timestamp: now }

      return result
    } catch (error) {
      // Return empty stats on error
      return {
        cpu: 0,
        memory: { used: 0, total: 8, percentage: 0 },
        storage: { used: 0, total: 50, percentage: 0 },
        network: { rx: 0, tx: 0 },
        containers: {
          total: 0,
          running: 0,
          stopped: 0,
          healthy: 0,
          unhealthy: 0,
        },
      }
    }
  }

  /**
   * Get container counts and health status
   */
  private async getContainers() {
    try {
      // Simple approach - get container list
      const { stdout: psOutput } = await this.execWithTimeout(
        'docker ps -a --format "{{.State}}|{{.Status}}"',
        2000,
      )

      const lines = psOutput
        .trim()
        .split('\n')
        .filter((l) => l)

      let running = 0,
        stopped = 0,
        healthy = 0,
        unhealthy = 0

      lines.forEach((line) => {
        const [state, status] = line.split('|')

        if (state === 'running') running++
        else stopped++

        if (status?.includes('healthy')) healthy++
        else if (status?.includes('unhealthy')) unhealthy++
      })

      return {
        total: lines.length,
        running,
        stopped,
        healthy,
        unhealthy,
      }
    } catch (error) {
      return { total: 0, running: 0, stopped: 0, healthy: 0, unhealthy: 0 }
    }
  }

  /**
   * Get CPU and Memory stats efficiently
   */
  private async getResourceStats() {
    try {
      // Get CPU stats - docker stats can be slow, increase timeout
      const { stdout: cpuOut } = await this.execWithTimeout(
        "docker stats --no-stream --format '{{.CPUPerc}}' | sed 's/%//' | awk '{s+=$1} END {print s}'",
        8000, // Increased timeout for slow Docker daemon
      )

      // Get Memory stats - just first container for total
      const { stdout: memOut } = await this.execWithTimeout(
        "docker stats --no-stream --format '{{.MemUsage}}' | head -1",
        8000, // Increased timeout
      )

      const cpu = parseFloat(cpuOut.trim()) || 0

      // Parse memory (e.g., "3.359MiB / 7.654GiB" or "1.5GiB / 8GiB")
      const memMatch = memOut.match(/([0-9.]+)(\w+)\s*\/\s*([0-9.]+)(\w+)/)
      let memUsed = 0,
        memTotal = 8

      if (memMatch) {
        const used = parseFloat(memMatch[1])
        const usedUnit = memMatch[2].toLowerCase()
        const total = parseFloat(memMatch[3])
        const totalUnit = memMatch[4].toLowerCase()

        // Convert to GB - handle both MiB and GiB
        if (usedUnit.includes('g')) {
          memUsed = used
        } else if (usedUnit.includes('m')) {
          memUsed = used / 1024
        } else if (usedUnit.includes('k')) {
          memUsed = used / (1024 * 1024)
        }

        if (totalUnit.includes('g')) {
          memTotal = total
        } else if (totalUnit.includes('m')) {
          memTotal = total / 1024
        } else if (totalUnit.includes('k')) {
          memTotal = total / (1024 * 1024)
        }

        // Actually sum up all container memory usage with proper unit handling
        try {
          const { stdout: allMemOut } = await this.execWithTimeout(
            `docker stats --no-stream --format '{{.MemUsage}}' | awk -F'/' '{print $1}' | awk '
            {
              value = $1
              if (index($0, "GiB") > 0) {
                gsub(/GiB/, "", value)
                sum += value * 1024
              } else if (index($0, "MiB") > 0) {
                gsub(/MiB/, "", value)
                sum += value
              } else if (index($0, "KiB") > 0) {
                gsub(/KiB/, "", value)
                sum += value / 1024
              }
            }
            END {print sum}'`,
            8000,
          )
          const totalUsedMiB = parseFloat(allMemOut.trim()) || 0
          if (totalUsedMiB > 0) {
            memUsed = totalUsedMiB / 1024 // Convert MiB to GiB
          }
        } catch (e) {
          // Fallback to single container memory if sum fails
        }
      }

      return {
        cpu: Math.round(cpu * 10) / 10,
        memory: {
          used: Math.round(memUsed * 10) / 10,
          total: Math.round(memTotal * 10) / 10,
          percentage: Math.round((memUsed / memTotal) * 100),
        },
      }
    } catch (error) {
      return {
        cpu: 0,
        memory: { used: 0, total: 8, percentage: 0 },
      }
    }
  }

  /**
   * Get storage stats from Docker system
   */
  private async getStorageStats() {
    try {
      const { stdout } = await this.execWithTimeout(
        "docker system df --format '{{json .}}'",
        5000,
      )

      const lines = stdout
        .trim()
        .split('\n')
        .filter((l) => l)
      let totalSize = 0
      let activeSize = 0

      for (const line of lines) {
        try {
          const data = JSON.parse(line)
          // Parse sizes (e.g., "4.687GB" -> 4.687)
          const parseSize = (str: string) => {
            if (!str) return 0
            const match = str.match(/([0-9.]+)([A-Z]+)/i)
            if (!match) return 0
            const value = parseFloat(match[1])
            const unit = match[2].toUpperCase()
            if (unit.startsWith('G')) return value
            if (unit.startsWith('M')) return value / 1024
            if (unit.startsWith('K')) return value / (1024 * 1024)
            return value
          }

          totalSize += parseSize(data.Size)
          if (data.Active && data.Active !== 'N/A') {
            activeSize += parseSize(data.Size)
          }
        } catch (e) {
          // Skip invalid JSON lines
        }
      }

      // Assume 50GB total available for Docker
      const totalAvailable = 50

      return {
        used: Math.round(totalSize * 10) / 10,
        total: totalAvailable,
        percentage: Math.round((totalSize / totalAvailable) * 100),
      }
    } catch (error) {
      return { used: 0, total: 50, percentage: 0 }
    }
  }

  /**
   * Get network stats from all containers
   */
  private async getNetworkStats() {
    try {
      const { stdout } = await this.execWithTimeout(
        "docker stats --no-stream --format '{{json .}}'",
        8000,
      )

      const lines = stdout
        .trim()
        .split('\n')
        .filter((l) => l)
      let totalRx = 0
      let totalTx = 0

      for (const line of lines) {
        try {
          const data = JSON.parse(line)
          // Parse network I/O (e.g., "858kB / 725kB")
          if (data.NetIO && data.NetIO !== '--') {
            const [rx, tx] = data.NetIO.split(' / ')

            const parseNetIO = (str: string) => {
              if (!str) return 0
              const match = str.match(/([0-9.]+)([A-Z]+)/i)
              if (!match) return 0
              const value = parseFloat(match[1])
              const unit = match[2].toUpperCase()
              // Convert to MB
              if (unit.startsWith('G')) return value * 1024
              if (unit.startsWith('M')) return value
              if (unit.startsWith('K')) return value / 1024
              if (unit === 'B') return value / (1024 * 1024)
              return value
            }

            totalRx += parseNetIO(rx)
            totalTx += parseNetIO(tx)
          }
        } catch (e) {
          // Skip invalid JSON lines
        }
      }

      // Convert to Mbps (rough estimate - this is cumulative, not rate)
      // For actual rate, we'd need to track over time
      return {
        rx: Math.round(totalRx * 10) / 10,
        tx: Math.round(totalTx * 10) / 10,
      }
    } catch (error) {
      return { rx: 0, tx: 0 }
    }
  }

  /**
   * Execute command with timeout
   */
  private execWithTimeout(
    command: string,
    timeout: number,
  ): Promise<{ stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
      const child = exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(error)
        } else {
          resolve({ stdout, stderr })
        }
      })

      const timer = setTimeout(() => {
        child.kill()
        reject(new Error(`Command timed out: ${command}`))
      }, timeout)

      child.on('exit', () => {
        clearTimeout(timer)
      })
    })
  }
}

// Singleton instance
let collector: DockerStatsCollector | null = null

export function getDockerStatsCollector(): DockerStatsCollector {
  if (!collector) {
    collector = new DockerStatsCollector()
  }
  return collector
}
