import { useEffect, useRef } from 'react'

/**
 * Custom hook for fetching data with proper abort handling
 * Prevents AbortError console spam on component unmount
 */
export function useDataFetch() {
  const abortControllerRef = useRef<AbortController | null>(null)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    
    return () => {
      isMountedRef.current = false
      // Abort any pending requests when component unmounts
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
        abortControllerRef.current = null
      }
    }
  }, [])

  const fetchData = async (url: string, options?: RequestInit) => {
    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController()

    try {
      const response = await fetch(url, {
        ...options,
        signal: abortControllerRef.current.signal
      })

      // Only process response if component is still mounted
      if (!isMountedRef.current) {
        return null
      }

      return response
    } catch (error) {
      // Silently ignore abort errors
      if (error instanceof Error && error.name === 'AbortError') {
        return null
      }
      
      // Re-throw other errors
      throw error
    } finally {
      // Clear the abort controller reference
      if (abortControllerRef.current) {
        abortControllerRef.current = null
      }
    }
  }

  return {
    fetchData,
    isActive: () => isMountedRef.current,
    abort: () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
        abortControllerRef.current = null
      }
    }
  }
}