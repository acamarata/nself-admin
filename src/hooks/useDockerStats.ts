/**
 * React Hook for Docker Stats Updates
 * Real-time Docker container statistics via WebSocket
 */

'use client'

import { DockerStatsEvent, EventType } from '@/lib/websocket/events'
import { useEffect, useState } from 'react'
import { useWebSocket } from './useWebSocket'

export interface DockerStatsMap {
  [containerId: string]: DockerStatsEvent
}

export function useDockerStats(containerId?: string) {
  const [stats, setStats] = useState<DockerStatsMap>({})
  const { on, connected } = useWebSocket()

  useEffect(() => {
    if (!connected) return

    // Subscribe to Docker stats updates
    const unsubscribe = on<DockerStatsEvent>(EventType.DOCKER_STATS, (data) => {
      // Only update if this is the container we're watching, or if no specific container is set
      if (!containerId || data.containerId === containerId) {
        setStats((prev) => ({
          ...prev,
          [data.containerId]: data,
        }))
      }
    })

    return () => {
      unsubscribe()
    }
  }, [connected, on, containerId])

  // Get stats for specific container
  const getStats = (id: string): DockerStatsEvent | undefined => {
    return stats[id]
  }

  // Get stats for the watched container
  const containerStats = containerId ? stats[containerId] : undefined

  return {
    stats,
    containerStats,
    getStats,
  }
}
