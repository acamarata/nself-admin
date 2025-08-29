// Centralized Docker Polling Service
// This service polls Docker API every second and stores data in the project store
// All components read from the store, ensuring single source of truth

import { useProjectStore } from '@/stores/projectStore'

class DockerPollingService {
  private intervalId: NodeJS.Timeout | null = null
  private isPolling = false
  
  // Start polling Docker stats every second
  start() {
    if (this.isPolling) {
      return
    }
    
    this.isPolling = true
    
    // Initial fetch
    this.fetchDockerStats()
    
    // Poll every second
    this.intervalId = setInterval(() => {
      this.fetchDockerStats()
    }, 1000)
  }
  
  // Stop polling
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
      this.isPolling = false
    }
  }
  
  // Fetch Docker stats and update store
  private async fetchDockerStats() {
    const store = useProjectStore.getState()
    
    // Only fetch if project is running
    if (store.projectStatus !== 'running') {
      return
    }
    
    try {
      // Fetch all metrics and containers in parallel
      const [metricsRes, containersRes] = await Promise.all([
        fetch('/api/system/metrics'),
        fetch('/api/docker/containers?detailed=true&stats=false')
      ])
      
      let metricsData: any = null
      let containersData: any = null
      
      if (metricsRes.ok) {
        metricsData = await metricsRes.json()
        
        if (metricsData.success && metricsData.data) {
          // Update store with fresh metrics
          store.updateCachedData({ 
            systemMetrics: metricsData.data,
            lastDockerUpdate: Date.now()
          })
        }
      }
      
      if (containersRes.ok) {
        containersData = await containersRes.json()
        
        if (containersData.success && containersData.data) {
          // Update store with container data
          store.updateCachedData({ 
            containerStats: containersData.data || []
          })
          
          // Log only occasionally to avoid spam
          if (Math.random() < 0.1 && metricsData) { // 10% chance
            // Metrics logging removed
          }
        }
      }
    } catch (error) {
    }
  }
  
  // Check if service is running
  isRunning() {
    return this.isPolling
  }
}

// Singleton instance
export const dockerPollingService = new DockerPollingService()

// Auto-start when project is running
if (typeof window !== 'undefined') {
  // Subscribe to project status changes
  let previousStatus: string | null = null
  const unsubscribe = useProjectStore.subscribe((state) => {
    const status = state.projectStatus
    if (status !== previousStatus) {
      previousStatus = status
      if (status === 'running' && !dockerPollingService.isRunning()) {
        dockerPollingService.start()
      } else if (status !== 'running' && dockerPollingService.isRunning()) {
        dockerPollingService.stop()
      }
    }
  })
  
  // Start if already running
  const currentStatus = useProjectStore.getState().projectStatus
  if (currentStatus === 'running') {
    dockerPollingService.start()
  }
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    dockerPollingService.stop()
    unsubscribe()
  })
}