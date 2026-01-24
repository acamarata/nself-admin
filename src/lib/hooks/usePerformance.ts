'use client'

import type {
  Alert,
  AlertRule,
  BenchmarkBaseline,
  BenchmarkComparison,
  BenchmarkResult,
  OptimizationSuggestion,
  PerformanceProfile,
  ScalingConfig,
} from '@/types/performance'
import useSWR from 'swr'

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
}

export function usePerformanceProfile() {
  const { data, error, isLoading, mutate } = useSWR<{
    success: boolean
    profile: PerformanceProfile
  }>('/api/performance/profile', fetcher, { refreshInterval: 5000 })

  return {
    profile: data?.profile,
    isLoading,
    isError: !!error,
    mutate,
  }
}

export function usePerformanceAnalysis() {
  const { data, error, isLoading } = useSWR<{
    success: boolean
    analysis: PerformanceProfile
  }>('/api/performance/analyze', fetcher, { refreshInterval: 30000 })

  return {
    analysis: data?.analysis,
    isLoading,
    isError: !!error,
  }
}

export function useSlowQueries(limit = 20) {
  const { data, error, isLoading } = useSWR<{
    success: boolean
    queries: { query: string; time: number; calls: number }[]
  }>(`/api/performance/queries?limit=${limit}`, fetcher, {
    refreshInterval: 30000,
  })

  return {
    queries: data?.queries || [],
    isLoading,
    isError: !!error,
  }
}

export function useOptimizationSuggestions() {
  const { data, error, isLoading } = useSWR<{
    success: boolean
    suggestions: OptimizationSuggestion[]
  }>('/api/performance/suggest', fetcher, { refreshInterval: 300000 })

  return {
    suggestions: data?.suggestions || [],
    isLoading,
    isError: !!error,
  }
}

// Benchmark hooks
export function useBenchmarkBaseline() {
  const { data, error, isLoading, mutate } = useSWR<{
    success: boolean
    baseline: BenchmarkBaseline
  }>('/api/benchmark/baseline', fetcher)

  return {
    baseline: data?.baseline,
    isLoading,
    isError: !!error,
    mutate,
  }
}

export function useBenchmarkResults() {
  const { data, error, isLoading } = useSWR<{
    success: boolean
    results: BenchmarkResult[]
  }>('/api/benchmark/results', fetcher)

  return {
    results: data?.results || [],
    isLoading,
    isError: !!error,
  }
}

export function useBenchmarkComparison() {
  const { data, error, isLoading } = useSWR<{
    success: boolean
    comparison: BenchmarkComparison
  }>('/api/benchmark/compare', fetcher)

  return {
    comparison: data?.comparison,
    isLoading,
    isError: !!error,
  }
}

// Scaling hooks
export function useScalingStatus() {
  const { data, error, isLoading, mutate } = useSWR<{
    success: boolean
    configs: ScalingConfig[]
  }>('/api/scale', fetcher, { refreshInterval: 10000 })

  return {
    configs: data?.configs || [],
    isLoading,
    isError: !!error,
    mutate,
  }
}

// Alert hooks
export function useAlerts() {
  const { data, error, isLoading, mutate } = useSWR<{
    success: boolean
    alerts: Alert[]
  }>('/api/monitor/alerts', fetcher, { refreshInterval: 10000 })

  return {
    alerts: data?.alerts || [],
    firing: data?.alerts?.filter((a) => a.status === 'firing') || [],
    isLoading,
    isError: !!error,
    mutate,
  }
}

export function useAlertRules() {
  const { data, error, isLoading, mutate } = useSWR<{
    success: boolean
    rules: AlertRule[]
  }>('/api/monitor/alerts/rules', fetcher)

  return {
    rules: data?.rules || [],
    isLoading,
    isError: !!error,
    mutate,
  }
}
