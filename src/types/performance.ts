/**
 * Performance & Monitoring Types for nself-admin v0.0.8
 */

export interface PerformanceProfile {
  timestamp: string
  duration: number
  services: ServiceProfile[]
  system: SystemProfile
  database: DatabaseProfile
}

export interface ServiceProfile {
  name: string
  cpu: number
  memory: {
    used: number
    limit: number
    percentage: number
  }
  responseTime?: {
    avg: number
    p50: number
    p95: number
    p99: number
  }
  requestsPerSecond?: number
  errorRate?: number
}

export interface SystemProfile {
  cpu: {
    usage: number
    cores: number
    loadAvg: [number, number, number]
  }
  memory: {
    total: number
    used: number
    free: number
    percentage: number
  }
  disk: {
    total: number
    used: number
    free: number
    percentage: number
  }
  network: {
    bytesIn: number
    bytesOut: number
    packetsIn: number
    packetsOut: number
  }
}

export interface DatabaseProfile {
  connections: {
    active: number
    idle: number
    max: number
  }
  cacheHitRatio: number
  transactionsPerSecond: number
  avgQueryTime: number
  slowQueries: number
  deadlocks: number
  replicationLag?: number
}

export interface BenchmarkResult {
  id: string
  target: string
  type: 'api' | 'database' | 'full'
  timestamp: string
  duration: number
  requests: {
    total: number
    successful: number
    failed: number
    perSecond: number
  }
  latency: {
    min: number
    max: number
    avg: number
    p50: number
    p95: number
    p99: number
  }
  throughput: {
    bytesPerSecond: number
    requestsPerSecond: number
  }
  errors?: { code: string; count: number }[]
}

export interface BenchmarkBaseline {
  id: string
  name: string
  createdAt: string
  results: BenchmarkResult[]
}

export interface BenchmarkComparison {
  baseline: BenchmarkResult
  current: BenchmarkResult
  changes: {
    metric: string
    baseline: number
    current: number
    change: number
    changePercentage: number
    improved: boolean
  }[]
}

export interface OptimizationSuggestion {
  id: string
  category: 'database' | 'cache' | 'network' | 'memory' | 'cpu' | 'config'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  impact: string
  command?: string
  documentationUrl?: string
}

export interface ScalingConfig {
  service: string
  current: {
    replicas: number
    cpu: string
    memory: string
  }
  recommended?: {
    replicas: number
    cpu: string
    memory: string
    reason: string
  }
  autoScaling?: {
    enabled: boolean
    minReplicas: number
    maxReplicas: number
    targetCPU: number
    targetMemory?: number
  }
}

export interface Alert {
  id: string
  name: string
  severity: 'critical' | 'warning' | 'info'
  status: 'firing' | 'resolved' | 'pending'
  source: string
  message: string
  startedAt: string
  resolvedAt?: string
  labels?: Record<string, string>
  annotations?: Record<string, string>
}

export interface AlertRule {
  id: string
  name: string
  enabled: boolean
  condition: string
  severity: 'critical' | 'warning' | 'info'
  duration: string
  message: string
  labels?: Record<string, string>
}

export interface MetricQuery {
  query: string
  start: string
  end: string
  step?: string
}

export interface MetricResult {
  metric: Record<string, string>
  values: [number, string][]
}
