import { renderHook, waitFor } from '@testing-library/react'
import { useDockerStatus } from '../useDockerStatus'

global.fetch = jest.fn()

describe('useDockerStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('fetches docker status on mount', async () => {
    const mockData = {
      success: true,
      data: {
        containers: [],
        grouped: {},
        summary: { total: 0, running: 0, stopped: 0 },
      },
    }

    ;(global.fetch as jest.Mock).mockResolvedValue({
      json: () => Promise.resolve(mockData),
    })

    const { result } = renderHook(() => useDockerStatus())

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toEqual(mockData.data)
    expect(result.current.error).toBeNull()
  })

  it('sets error on fetch failure', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useDockerStatus())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Failed to connect to Docker API')
    expect(result.current.data).toBeNull()
  })

  it('sets error when API returns error', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      json: () =>
        Promise.resolve({
          success: false,
          error: 'Docker daemon not running',
        }),
    })

    const { result } = renderHook(() => useDockerStatus())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Docker daemon not running')
  })

  it('refetches data at specified interval', async () => {
    const mockData = {
      success: true,
      data: {
        containers: [],
        grouped: {},
        summary: { total: 0, running: 0, stopped: 0 },
      },
    }

    ;(global.fetch as jest.Mock).mockResolvedValue({
      json: () => Promise.resolve(mockData),
    })

    renderHook(() => useDockerStatus(1000))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })

    jest.advanceTimersByTime(1000)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })
  })

  it('allows manual refetch', async () => {
    const mockData = {
      success: true,
      data: {
        containers: [],
        grouped: {},
        summary: { total: 0, running: 0, stopped: 0 },
      },
    }

    ;(global.fetch as jest.Mock).mockResolvedValue({
      json: () => Promise.resolve(mockData),
    })

    const { result } = renderHook(() => useDockerStatus())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(global.fetch).toHaveBeenCalledTimes(1)

    await result.current.refetch()

    expect(global.fetch).toHaveBeenCalledTimes(2)
  })

  it('cleans up interval on unmount', async () => {
    const mockData = {
      success: true,
      data: {
        containers: [],
        grouped: {},
        summary: { total: 0, running: 0, stopped: 0 },
      },
    }

    ;(global.fetch as jest.Mock).mockResolvedValue({
      json: () => Promise.resolve(mockData),
    })

    const { unmount } = renderHook(() => useDockerStatus(1000))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })

    unmount()

    jest.advanceTimersByTime(1000)

    // Should not fetch again after unmount
    expect(global.fetch).toHaveBeenCalledTimes(1)
  })
})
