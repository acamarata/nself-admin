import { useState, useEffect } from 'react'

interface SystemMetrics {
  system: {
    cpu: number
    memory: {
      used: number
      total: number
      percentage: number
    }
    disk: {
      used: number
      total: number
      percentage: number
    }
    network: {
      rx: number
      tx: number
    }
  }
  docker: {
    cpu: number
    memory: {
      used: number
      total: number
    }
    network: {
      rx: number
      tx: number
    }
  }
  timestamp: string
}

export function useSystemMetrics(refreshInterval: number = 5000) {
  const [data, setData] = useState<SystemMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMetrics = async () => {
    try {
      setError(null)
      const response = await fetch('/api/system/metrics')
      const result = await response.json()
      
      if (result.success) {
        setData(result.data)
      } else {
        setError(result.error || 'Failed to fetch metrics')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
    
    const interval = setInterval(fetchMetrics, refreshInterval)
    return () => clearInterval(interval)
  }, [refreshInterval])

  return {
    data,
    loading,
    error,
    refetch: fetchMetrics
  }
}