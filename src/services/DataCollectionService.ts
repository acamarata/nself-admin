import { useCentralDataStore } from '@/stores/centralDataStore'
import type { 
  DockerMetrics, 
  SystemMetrics, 
  ContainerInfo, 
  PostgresMetrics,
  HasuraMetrics,
  RedisMetrics 
} from '@/stores/centralDataStore'

// Cache configuration for different data types
const CACHE_TTL = {
  critical: 1000,    // 1 second - container health, alerts
  high: 5000,        // 5 seconds - CPU, memory, connections
  medium: 30000,     // 30 seconds - database size, metadata
  low: 300000,       // 5 minutes - certificates, backups
}

// Request deduplication to prevent multiple simultaneous requests
class RequestDeduplicator {
  private pending = new Map<string, Promise<any>>()
  
  async dedupe<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    if (this.pending.has(key)) {
      return this.pending.get(key) as Promise<T>
    }
    
    const promise = fetcher().finally(() => {
      this.pending.delete(key)
    })
    
    this.pending.set(key, promise)
    return promise
  }
}

// Cache with TTL support
class DataCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()
  
  set(key: string, data: any, ttl: number) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }
  
  get(key: string): any | null {
    const entry = this.cache.get(key)
    if (!entry) return null
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return entry.data
  }
  
  clear() {
    this.cache.clear()
  }
}

// Main Data Collection Service
export class DataCollectionService {
  private cache = new DataCache()
  private deduplicator = new RequestDeduplicator()
  private intervals = new Map<string, NodeJS.Timeout>()
  private abortController: AbortController | null = null
  private isRunning = false
  
  constructor() {
    // No need to subscribe - we'll get fresh state each time
  }
  
  // Always get fresh store state
  private get store() {
    return useCentralDataStore.getState()
  }
  
  // Start all collection schedules
  start() {
    if (this.isRunning) {
      return
    }
    
    this.isRunning = true
    
    // Clear any existing intervals
    this.stop()
    
    // Create new abort controller for fetch requests
    this.abortController = new AbortController()
    
    // Schedule different data collections at appropriate intervals
    this.scheduleCritical()
    this.scheduleHigh()
    this.scheduleMedium()
    
    // Initial fetch of all data
    this.fetchAllData()
    
    this.store.setConnected(true)
  }
  
  // Stop all collection
  stop() {
    
    // Cancel all pending requests
    if (this.abortController) {
      this.abortController.abort()
      this.abortController = null
    }
    
    // Clear all intervals
    this.intervals.forEach(interval => clearInterval(interval))
    this.intervals.clear()
    
    this.isRunning = false
    this.store.setConnected(false)
  }
  
  // Critical data - every 1 second
  private scheduleCritical() {
    const fetch = async () => {
      if (!this.isRunning) return
      try {
        await Promise.all([
          this.fetchDockerStats(),
          this.fetchContainerHealth()
        ])
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
        }
      }
    }
    
    this.intervals.set('critical', setInterval(fetch, CACHE_TTL.critical))
  }
  
  // High priority data - every 5 seconds
  private scheduleHigh() {
    const fetch = async () => {
      if (!this.isRunning) return
      try {
        await Promise.all([
          this.fetchSystemMetrics(),
          this.fetchContainerDetails()
        ])
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
        }
      }
    }
    
    this.intervals.set('high', setInterval(fetch, CACHE_TTL.high))
  }
  
  // Medium priority data - every 30 seconds
  private scheduleMedium() {
    const fetch = async () => {
      if (!this.isRunning) return
      try {
        await Promise.all([
          this.fetchPostgresMetrics(),
          this.fetchHasuraMetrics(),
          this.fetchRedisMetrics()
        ])
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
        }
      }
    }
    
    this.intervals.set('medium', setInterval(fetch, CACHE_TTL.medium))
  }
  
  // Fetch all data at once (for initial load)
  async fetchAllData() {
    
    try {
      await Promise.allSettled([
        this.fetchDockerStats(),
        this.fetchSystemMetrics(),
        this.fetchContainerDetails(),
        this.fetchPostgresMetrics(),
        this.fetchHasuraMetrics(),
        this.fetchRedisMetrics()
      ])
    } catch (error) {
    }
  }
  
  // Docker stats fetcher
  private async fetchDockerStats() {
    const cached = this.cache.get('docker-stats')
    if (cached) {
      this.store.trackCacheHit()
      return cached
    }
    
    this.store.trackCacheMiss()
    
    return this.deduplicator.dedupe('docker-stats', async () => {
      try {
        if (!this.abortController) return
        
        this.store.trackApiCall()
        
        const response = await fetch('/api/docker/stats', {
          signal: this.abortController.signal
        })
        
        if (!response.ok) throw new Error('Failed to fetch Docker stats')
        
        const data = await response.json()
        
        if (data.success && data.data) {
          const metrics: DockerMetrics = {
            cpu: data.data.cpu || 0,
            memory: data.data.memory || { used: 0, total: 0, percentage: 0 },
            storage: data.data.storage || { used: 0, total: 50, percentage: 0 },
            network: {
              rx: data.data.network?.rx || 0,
              tx: data.data.network?.tx || 0,
              maxSpeed: 1000
            },
            containers: data.data.containerDetails || 
              (data.data.containers 
                ? {
                    total: data.data.containers,
                    running: 0,
                    stopped: 0,
                    healthy: 0,
                    unhealthy: 0
                  }
                : { total: 0, running: 0, stopped: 0, healthy: 0, unhealthy: 0 })
          }
          
          this.store.updateDocker(metrics)
          this.cache.set('docker-stats', metrics, CACHE_TTL.critical)
          
          return metrics
        }
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
        }
      }
    })
  }
  
  // System metrics fetcher
  private async fetchSystemMetrics() {
    const cached = this.cache.get('system-metrics')
    if (cached) {
      this.store.trackCacheHit()
      return cached
    }
    
    this.store.trackCacheMiss()
    
    return this.deduplicator.dedupe('system-metrics', async () => {
      try {
        if (!this.abortController) return
        
        this.store.trackApiCall()
        
        const response = await fetch('/api/system/metrics', {
          signal: this.abortController.signal
        })
        
        if (!response.ok) throw new Error('Failed to fetch system metrics')
        
        const data = await response.json()
        
        if (data.success && data.data) {
          const metrics: SystemMetrics = {
            cpu: data.data.system?.cpu || 0,
            memory: data.data.system?.memory || { used: 0, total: 0, percentage: 0 },
            disk: data.data.system?.disk || { used: 0, total: 0, percentage: 0 },
            network: data.data.system?.network || { rx: 0, tx: 0, maxSpeed: 1000 },
            uptime: data.data.system?.uptime || 0
          }
          
          // Also update Docker metrics if present
          if (data.data.docker) {
            const dockerMetrics: DockerMetrics = {
              cpu: data.data.docker.cpu || 0,
              memory: data.data.docker.memory || { used: 0, total: 0, percentage: 0 },
              storage: data.data.docker.storage || { used: 0, total: 50, percentage: 0 },
              network: { 
                rx: data.data.system?.network?.rx || 0, 
                tx: data.data.system?.network?.tx || 0,
                maxSpeed: data.data.system?.network?.maxSpeed || 1000
              },
              containers: data.data.docker.containers || { 
                total: 0, running: 0, stopped: 0, healthy: 0, unhealthy: 0 
              }
            }
            this.store.updateDocker(dockerMetrics)
          }
          
          this.store.updateSystem(metrics)
          this.cache.set('system-metrics', metrics, CACHE_TTL.high)
          
          return metrics
        }
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
        }
      }
    })
  }
  
  // Container health checker (lightweight)
  private async fetchContainerHealth() {
    return this.deduplicator.dedupe('container-health', async () => {
      try {
        if (!this.abortController) return
        
        this.store.trackApiCall()
        
        const response = await fetch('/api/docker/containers?stats=false', {
          signal: this.abortController.signal
        })
        
        if (!response.ok) throw new Error('Failed to fetch container health')
        
        const data = await response.json()
        
        if (data.success && data.data) {
          // Update container counts in Docker metrics
          const counts = {
            total: data.data.length,
            running: 0,
            stopped: 0,
            healthy: 0,
            unhealthy: 0
          }
          
          data.data.forEach((container: any) => {
            if (container.state === 'running') counts.running++
            else if (container.state === 'stopped') counts.stopped++
            
            if (container.health === 'healthy') counts.healthy++
            else if (container.health === 'unhealthy') counts.unhealthy++
          })
          
          
          // Update Docker metrics with container counts
          const currentDocker = this.store.docker
          if (currentDocker) {
            this.store.updateDocker({
              ...currentDocker,
              containers: counts
            })
          } else {
            // If no docker metrics yet, create minimal one with counts
            this.store.updateDocker({
              cpu: 0,
              memory: { used: 0, total: 0, percentage: 0 },
              storage: { used: 0, total: 0, percentage: 0 },
              network: { rx: 0, tx: 0, maxSpeed: 1000 },
              containers: counts
            })
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
        }
      }
    })
  }
  
  // Container details fetcher
  private async fetchContainerDetails() {
    const cached = this.cache.get('container-details')
    if (cached) {
      this.store.trackCacheHit()
      return cached
    }
    
    this.store.trackCacheMiss()
    
    return this.deduplicator.dedupe('container-details', async () => {
      try {
        if (!this.abortController) return
        
        this.store.trackApiCall()
        
        const response = await fetch('/api/docker/containers?stats=true', {
          signal: this.abortController.signal
        })
        
        if (!response.ok) throw new Error('Failed to fetch container details')
        
        const data = await response.json()
        
        if (data.success && data.data) {
          const containers: ContainerInfo[] = data.data.map((c: any) => {
            // Determine category based on service name
            const name = c.name?.toLowerCase() || ''
            let category: 'required' | 'optional' | 'user' = 'user'
            
            if (['postgres', 'hasura', 'auth', 'nginx'].some(s => name.includes(s))) {
              category = 'required'
            } else if (['minio', 'redis', 'mailpit', 'grafana', 'prometheus'].some(s => name.includes(s))) {
              category = 'optional'
            }
            
            return {
              id: c.id,
              name: c.name,
              image: c.image,
              state: c.state,
              status: c.status,
              health: c.health || 'none',
              cpu: c.stats?.cpu || 0,
              memory: c.stats?.memory || { usage: '0', limit: '0', percentage: 0 },
              ports: c.ports || [],
              created: c.created,
              uptime: c.status?.match(/Up (.+?)(\s|$)/)?.[1] || 'Unknown',
              restartCount: 0,
              serviceType: c.serviceType,
              category
            }
          })
          
          // Also calculate container counts for Docker metrics
          const counts = {
            total: containers.length,
            running: containers.filter(c => c.state === 'running').length,
            stopped: containers.filter(c => c.state === 'stopped').length,
            healthy: containers.filter(c => c.health === 'healthy').length,
            unhealthy: containers.filter(c => c.health === 'unhealthy').length
          }
          
          // Update both containers and counts
          this.store.updateContainers(containers)
          
          // Update Docker metrics with accurate counts
          const currentDocker = this.store.docker
          if (currentDocker) {
            this.store.updateDocker({
              ...currentDocker,
              containers: counts
            })
          }
          
          this.cache.set('container-details', containers, CACHE_TTL.high)
          
          return containers
        }
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
        }
      }
    })
  }
  
  // PostgreSQL metrics fetcher
  private async fetchPostgresMetrics() {
    // Mock data for now - will be implemented with actual DB connection
    const metrics: PostgresMetrics = {
      status: 'healthy',
      connections: {
        active: 5,
        idle: 10,
        max: 100
      },
      databaseSize: '125 MB',
      tableCount: 42,
      queryStats: {
        totalQueries: 15234,
        slowQueries: 3,
        averageTime: 12.5
      }
    }
    
    this.store.updatePostgres(metrics)
    return metrics
  }
  
  // Hasura metrics fetcher
  private async fetchHasuraMetrics() {
    // Mock data for now
    const metrics: HasuraMetrics = {
      status: 'healthy',
      metadata: {
        tables: 28,
        relationships: 45,
        permissions: 120,
        actions: 8,
        eventTriggers: 5
      },
      performance: {
        requestRate: 250,
        errorRate: 0.2,
        p95ResponseTime: 45,
        activeSubscriptions: 12
      },
      inconsistentObjects: []
    }
    
    this.store.updateHasura(metrics)
    return metrics
  }
  
  // Redis metrics fetcher
  private async fetchRedisMetrics() {
    // Mock data for now
    const metrics: RedisMetrics = {
      status: 'healthy',
      memory: {
        used: 256,
        peak: 512,
        fragmentation: 1.2
      },
      clients: 8,
      opsPerSecond: 1250,
      hitRate: 92.5,
      evictedKeys: 0,
      keyspaceInfo: {
        db0: { keys: 1523, expires: 234 }
      }
    }
    
    this.store.updateRedis(metrics)
    return metrics
  }
}

// Singleton instance - stored on window to persist across HMR and navigation
let dataCollectionService: DataCollectionService | null = null

export const getDataCollectionService = () => {
  if (typeof window !== 'undefined') {
    // Store on window to persist across module reloads
    const win = window as any
    if (!win.__dataCollectionService) {
      win.__dataCollectionService = new DataCollectionService()
    }
    return win.__dataCollectionService as DataCollectionService
  }
  
  if (!dataCollectionService) {
    dataCollectionService = new DataCollectionService()
  }
  return dataCollectionService
}

// Auto-start when in browser
if (typeof window !== 'undefined') {
  const service = getDataCollectionService()
  
  // Check if already running before starting
  if (!service['isRunning']) {
    // Start service when page loads
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        if (!service['isRunning']) {
          setTimeout(() => service.start(), 100) // Small delay to let React mount
        }
      })
    } else {
      setTimeout(() => {
        if (!service['isRunning']) {
          service.start()
        }
      }, 100)
    }
  }
  
  // Only stop on actual page unload, not navigation
  window.addEventListener('unload', () => {
    // Don't stop on navigation, only on actual page close
    // Modern browsers will handle cleanup
  })
  
  // Handle visibility changes - keep running in background
  document.addEventListener('visibilitychange', () => {
    // Don't stop when hidden - keep collecting data
    if (!document.hidden && !service['isRunning']) {
      service.start()
    }
  })
}