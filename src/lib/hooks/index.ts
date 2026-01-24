// Re-export all hooks for convenience
export * from './useCloud'
export * from './useDatabase'
export * from './useDeployment'
export * from './useK8s'
// Re-export usePerformance except useSlowQueries (which is also in useDatabase)
export {
  useAlertRules,
  useAlerts,
  useBenchmarkBaseline,
  useBenchmarkComparison,
  useBenchmarkResults,
  useOptimizationSuggestions,
  usePerformanceAnalysis,
  usePerformanceProfile,
  useScalingStatus,
} from './usePerformance'
// Alias for performance slow queries
export { useSlowQueries as usePerformanceSlowQueries } from './usePerformance'
export * from './usePlugins'
