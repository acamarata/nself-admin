import { useEffect, useState } from 'react'

export interface DockerContainer {
  id: string
  name: string
  image: string
  state: string
  status: string
  ports: Array<{
    private: number
    public?: number
    type: string
  }>
  labels: Record<string, string>
  created: number
  serviceType: string
  health: 'healthy' | 'unhealthy' | 'starting' | 'stopped'
}

export interface DockerStatus {
  containers: DockerContainer[]
  grouped: Record<string, DockerContainer[]>
  summary: {
    total: number
    running: number
    stopped: number
  }
}

export function useDockerStatus(refreshInterval = 5000) {
  const [data, setData] = useState<DockerStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/docker/containers')
      const result = await response.json()

      if (result.success) {
        setData(result.data)
        setError(null)
      } else {
        setError(result.error || 'Failed to fetch Docker status')
      }
    } catch (err) {
      setError('Failed to connect to Docker API')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, refreshInterval)
    return () => clearInterval(interval)
  }, [refreshInterval])

  return { data, loading, error, refetch: fetchStatus }
}
