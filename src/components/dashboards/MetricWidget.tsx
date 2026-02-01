'use client'

import { cn } from '@/lib/utils'
import type { Widget } from '@/types/dashboard'
import { Minus, TrendingDown, TrendingUp } from 'lucide-react'
import { useEffect, useState } from 'react'

interface MetricWidgetProps {
  widget: Widget
  className?: string
}

interface MetricData {
  value: number | string
  previousValue?: number
  trend?: 'up' | 'down' | 'neutral'
  trendPercentage?: number
  unit?: string
  prefix?: string
}

// Mock data fetcher - in real implementation this would call the data source
async function fetchMetricData(widget: Widget): Promise<MetricData> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Return mock data based on widget config
  const mockValues: Record<string, MetricData> = {
    default: {
      value: 1234,
      previousValue: 1100,
      trend: 'up',
      trendPercentage: 12.2,
    },
  }

  return mockValues.default
}

export function MetricWidget({ widget, className }: MetricWidgetProps) {
  const [data, setData] = useState<MetricData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const thresholds = widget.config.thresholds

  useEffect(() => {
    let mounted = true

    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await fetchMetricData(widget)
        if (mounted) {
          setData(result)
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load data')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadData()

    // Set up auto-refresh if configured
    const refreshInterval = widget.config.dataSource?.refreshInterval
    let intervalId: NodeJS.Timeout | undefined

    if (refreshInterval && refreshInterval > 0) {
      intervalId = setInterval(loadData, refreshInterval * 1000)
    }

    return () => {
      mounted = false
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [widget])

  // Determine color based on thresholds
  const getThresholdColor = (value: number | string): string => {
    if (typeof value !== 'number') return ''
    if (thresholds?.critical && value >= thresholds.critical) {
      return 'text-red-600 dark:text-red-400'
    }
    if (thresholds?.warning && value >= thresholds.warning) {
      return 'text-yellow-600 dark:text-yellow-400'
    }
    return ''
  }

  // Format the value for display
  const formatValue = (value: number | string): string => {
    if (typeof value === 'string') return value

    // Format large numbers with abbreviations
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M'
    }
    if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K'
    }
    return value.toLocaleString()
  }

  // Get trend icon and color
  const getTrendIndicator = (trend: 'up' | 'down' | 'neutral' | undefined) => {
    switch (trend) {
      case 'up':
        return {
          icon: TrendingUp,
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-100 dark:bg-green-900/30',
        }
      case 'down':
        return {
          icon: TrendingDown,
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-100 dark:bg-red-900/30',
        }
      default:
        return {
          icon: Minus,
          color: 'text-zinc-500 dark:text-zinc-400',
          bgColor: 'bg-zinc-100 dark:bg-zinc-800',
        }
    }
  }

  if (loading) {
    return (
      <div
        className={cn('flex h-full items-center justify-center p-6', className)}
      >
        <div className="text-center">
          <div className="mx-auto h-8 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="mx-auto mt-2 h-4 w-16 animate-pulse rounded bg-zinc-100 dark:bg-zinc-900" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className={cn('flex h-full items-center justify-center p-6', className)}
      >
        <div className="text-center">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div
        className={cn('flex h-full items-center justify-center p-6', className)}
      >
        <div className="text-center">
          <p className="text-sm text-zinc-500">No data available</p>
        </div>
      </div>
    )
  }

  const trendIndicator = getTrendIndicator(data.trend)
  const TrendIcon = trendIndicator.icon

  return (
    <div className={cn('flex h-full flex-col justify-center p-6', className)}>
      {/* Main value */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-1">
          {data.prefix && (
            <span className="text-2xl text-zinc-400">{data.prefix}</span>
          )}
          <span
            className={cn(
              'text-4xl font-bold text-zinc-900 dark:text-zinc-100',
              getThresholdColor(data.value),
            )}
          >
            {formatValue(data.value)}
          </span>
          {data.unit && (
            <span className="text-lg text-zinc-500 dark:text-zinc-400">
              {data.unit}
            </span>
          )}
        </div>

        {/* Trend indicator */}
        {data.trend && data.trendPercentage !== undefined && (
          <div className="mt-3 flex items-center justify-center gap-2">
            <div
              className={cn(
                'flex items-center gap-1 rounded-full px-2 py-1',
                trendIndicator.bgColor,
              )}
            >
              <TrendIcon className={cn('h-3.5 w-3.5', trendIndicator.color)} />
              <span className={cn('text-sm font-medium', trendIndicator.color)}>
                {data.trend === 'up' ? '+' : data.trend === 'down' ? '-' : ''}
                {Math.abs(data.trendPercentage).toFixed(1)}%
              </span>
            </div>
            <span className="text-xs text-zinc-400">vs previous period</span>
          </div>
        )}

        {/* Threshold indicators */}
        {thresholds && (
          <div className="mt-4 flex items-center justify-center gap-4 text-xs">
            {thresholds.warning && (
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                <span className="text-zinc-500">
                  Warning: {thresholds.warning}
                </span>
              </div>
            )}
            {thresholds.critical && (
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-red-500" />
                <span className="text-zinc-500">
                  Critical: {thresholds.critical}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
