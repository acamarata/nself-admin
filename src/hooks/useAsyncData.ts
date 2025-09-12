import { useEffect, useRef, useState } from 'react'

interface UseAsyncDataOptions {
  /**
   * Whether to fetch data immediately on mount
   * @default true
   */
  fetchOnMount?: boolean

  /**
   * Polling interval in milliseconds
   * @default undefined (no polling)
   */
  pollingInterval?: number

  /**
   * Dependencies that trigger a refetch when changed
   * @default []
   */
  dependencies?: any[]
}

interface UseAsyncDataResult<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Hook for async data fetching that doesn't block page rendering
 *
 * PRINCIPLES:
 * 1. Never blocks initial render
 * 2. Handles loading/error states
 * 3. Supports polling and refetching
 * 4. Cleans up on unmount
 */
export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  options: UseAsyncDataOptions = {},
): UseAsyncDataResult<T> {
  const { fetchOnMount = true, pollingInterval, dependencies = [] } = options

  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const abortControllerRef = useRef<AbortController | null>(null)
  const isMountedRef = useRef(true)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchData = async () => {
    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController()

    setLoading(true)
    setError(null)

    try {
      const result = await fetcher()

      // Only update if component is still mounted
      if (isMountedRef.current) {
        setData(result)
        setLoading(false)
      }
    } catch (err) {
      // Ignore abort errors
      if (err instanceof Error && err.name === 'AbortError') {
        return
      }

      // Handle other errors
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        setLoading(false)
      }
    }
  }

  // Fetch on mount if enabled
  useEffect(() => {
    if (fetchOnMount) {
      fetchData()
    }

    return () => {
      isMountedRef.current = false
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, []) // eslint-disable-line

  // Refetch when dependencies change
  useEffect(() => {
    if (dependencies.length > 0 && !loading) {
      fetchData()
    }
  }, dependencies) // eslint-disable-line

  // Set up polling if enabled
  useEffect(() => {
    if (pollingInterval && pollingInterval > 0) {
      pollingIntervalRef.current = setInterval(() => {
        if (!loading) {
          fetchData()
        }
      }, pollingInterval)

      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current)
        }
      }
    }
  }, [pollingInterval]) // eslint-disable-line

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  }
}

/**
 * Hook for subscribing to the central data store
 * Returns data immediately if available, never blocks
 */
export function useStoreData<T>(selector: () => T, defaultValue: T): T {
  const [data, setData] = useState<T>(() => {
    try {
      return selector() || defaultValue
    } catch {
      return defaultValue
    }
  })

  useEffect(() => {
    // Subscribe to store changes
    const interval = setInterval(() => {
      try {
        const newData = selector()
        if (newData !== data) {
          setData(newData)
        }
      } catch {
        // Ignore errors
      }
    }, 100) // Check every 100ms for changes

    return () => clearInterval(interval)
  }, []) // eslint-disable-line

  return data
}
