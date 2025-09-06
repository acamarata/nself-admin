'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle, XCircle, AlertCircle, Hammer } from 'lucide-react'
import { StepWrapper } from '../StepWrapper'

interface ConfigSummary {
  projectName: string
  environment: string
  domain: string
  databaseName: string
  databasePassword: string
  hasuraEnabled: boolean
  authEnabled: boolean
  redisEnabled: boolean
  minioEnabled: boolean
  monitoringEnabled: boolean
  mlflowEnabled: boolean
  mailpitEnabled: boolean
  searchEnabled: boolean
  searchEngine?: string
  nadminEnabled: boolean
  customServices: Array<{ name: string; framework: string; port: number; route?: string }>
  frontendApps: Array<{ displayName: string; systemName?: string; tablePrefix?: string; localPort?: number; productionUrl?: string }>
  backupEnabled: boolean
  ENV?: string
  BASE_DOMAIN?: string
  POSTGRES_DB?: string
  POSTGRES_PASSWORD?: string
  REDIS_ENABLED?: string
  STORAGE_ENABLED?: string
  MINIO_ENABLED?: string  // Deprecated, for backwards compat
  MONITORING_ENABLED?: string
  MLFLOW_ENABLED?: string
  MAILPIT_ENABLED?: string
  SEARCH_ENABLED?: string
  SEARCH_ENGINE?: string
  NSELF_ADMIN_ENABLED?: string
  SERVICES_ENABLED?: string
}

export default function InitStep6() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [config, setConfig] = useState<ConfigSummary | null>(null)

  // Load configuration from .env.local on mount
  useEffect(() => {
    checkAndLoadConfiguration()
  }, [])

  const checkAndLoadConfiguration = async () => {
    // First check if env file exists
    try {
      const statusRes = await fetch('/api/project/status')
      if (statusRes.ok) {
        const statusData = await statusRes.json()
        if (!statusData.hasEnvFile) {
          // No env file - redirect to /init to create it
          router.push('/init')
          return
        }
      }
    } catch (error) {
      console.error('Error checking project status:', error)
    }
    
    // Load configuration if env file exists
    loadConfiguration()
  }

  const loadConfiguration = async () => {
    try {
      const response = await fetch('/api/wizard/init')
      if (response.ok) {
        const data = await response.json()
        if (data.config) {
          // Merge all config data including raw env vars
          const fullConfig: ConfigSummary = {
            projectName: data.config.projectName || data.config.PROJECT_NAME || 'my_project',
            environment: data.config.environment || data.config.ENV || 'development',
            domain: data.config.domain || data.config.BASE_DOMAIN || 'localhost',
            databaseName: data.config.databaseName || data.config.POSTGRES_DB || 'nself',
            databasePassword: data.config.databasePassword || data.config.POSTGRES_PASSWORD || '',
            hasuraEnabled: data.config.hasuraEnabled !== false,  // Always true for required service
            authEnabled: data.config.authEnabled !== false,  // Always true for required service
            nadminEnabled: data.config.nadminEnabled || data.config.NSELF_ADMIN_ENABLED === 'true' || data.config.adminEnabled || false,
            redisEnabled: data.config.redisEnabled || data.config.REDIS_ENABLED === 'true',
            minioEnabled: data.config.minioEnabled || data.config.STORAGE_ENABLED === 'true' || data.config.MINIO_ENABLED === 'true',
            mlflowEnabled: data.config.mlflowEnabled || data.config.MLFLOW_ENABLED === 'true',
            mailpitEnabled: data.config.mailpitEnabled || data.config.MAILPIT_ENABLED === 'true',
            searchEnabled: data.config.searchEnabled || data.config.SEARCH_ENABLED === 'true',
            searchEngine: data.config.searchEngine || data.config.SEARCH_ENGINE || 'meilisearch',
            monitoringEnabled: data.config.monitoringEnabled || data.config.MONITORING_ENABLED === 'true',
            customServices: data.config.customServices || data.config.userServices || [],
            frontendApps: data.config.frontendApps || [],
            backupEnabled: data.config.backupEnabled || data.config.BACKUP_ENABLED === 'true' || data.config.DB_BACKUP_ENABLED === 'true',
            ...data.config // Include all raw data
          }
          setConfig(fullConfig)
        }
      }
    } catch (error) {
      console.error('Failed to load configuration:', error)
    }
  }

  const handleBack = () => {
    router.push('/init/5')
  }

  const handleBuild = async () => {
    // Redirect to build page with wizard flag
    router.push('/build?from=wizard')
  }

  if (!config) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const enabledOptionalServices = [
    config.nadminEnabled && 'nself Admin UI',
    config.redisEnabled && 'Redis Cache',
    config.minioEnabled && 'Storage (MinIO)',
    config.mlflowEnabled && 'MLflow Platform',
    config.mailpitEnabled && 'Email Service (Mailpit)',
    config.searchEnabled && `Search Service (${(config.searchEngine || 'meilisearch').charAt(0).toUpperCase() + (config.searchEngine || 'meilisearch').slice(1)})`,
    config.monitoringEnabled && 'Monitoring Bundle (Prometheus, Grafana, Loki, Tempo, Alertmanager)'
  ].filter(Boolean)

  // Core services: PostgreSQL, Hasura, Auth, Nginx (4)
  // Optional services count individually (monitoring = 5 services)
  const coreServicesCount = 4  // Always enabled
  const optionalServicesCount = 
    (config.nadminEnabled ? 1 : 0) +
    (config.redisEnabled ? 1 : 0) +
    (config.minioEnabled ? 1 : 0) +
    (config.mlflowEnabled ? 1 : 0) +
    (config.mailpitEnabled ? 1 : 0) +
    (config.searchEnabled ? 1 : 0) +
    (config.monitoringEnabled ? 5 : 0) // Monitoring is 5 services
  
  const totalServices = coreServicesCount + 
    optionalServicesCount +
    config.customServices.length

  return (
    <StepWrapper>
      {/* Color Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-zinc-600 dark:text-zinc-400 mb-4 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
        <div className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3 text-blue-600" />
          <span>Core (Required)</span>
        </div>
        <div className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3 text-purple-600" />
          <span>Optional Services</span>
        </div>
        <div className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3 text-orange-600" />
          <span>Custom Services</span>
        </div>
        <div className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3 text-teal-600" />
          <span>Frontend Apps</span>
        </div>
      </div>
      
      {/* Configuration Summary */}
      <div className="space-y-4">
        {/* Project Details */}
        <div className="p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
          <h3 className="font-medium text-zinc-900 dark:text-white mb-3">Project Details</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-zinc-600 dark:text-zinc-400">Name:</span>
              <span className="ml-2 text-zinc-900 dark:text-white font-medium">{config.projectName}</span>
            </div>
            <div>
              <span className="text-zinc-600 dark:text-zinc-400">Environment:</span>
              <span className="ml-2 text-zinc-900 dark:text-white font-medium">{config.environment}</span>
            </div>
            <div>
              <span className="text-zinc-600 dark:text-zinc-400">Domain:</span>
              <span className="ml-2 text-zinc-900 dark:text-white font-medium">{config.domain}</span>
            </div>
            <div>
              <span className="text-zinc-600 dark:text-zinc-400">Database:</span>
              <span className="ml-2 text-zinc-900 dark:text-white font-medium">{config.databaseName}</span>
            </div>
          </div>
        </div>

        {/* Services Summary */}
        <div className="p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
          <h3 className="font-medium text-zinc-900 dark:text-white mb-3">Services Configuration</h3>
          
          <div className="space-y-3">
            {/* Core Services - Always Enabled */}
            <div>
              <h4 className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-2 uppercase tracking-wider">Core Services (Always Enabled)</h4>
              <div className="space-y-2 text-sm ml-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <span className="text-zinc-900 dark:text-white">PostgreSQL Database</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <span className="text-zinc-900 dark:text-white">Hasura GraphQL Engine</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <span className="text-zinc-900 dark:text-white">Authentication Service</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <span className="text-zinc-900 dark:text-white">Nginx Reverse Proxy</span>
                </div>
              </div>
            </div>
            
            {/* Optional Services - If Enabled */}
            {enabledOptionalServices.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-2 uppercase tracking-wider">Optional Services</h4>
                <div className="space-y-2 text-sm ml-2">
                  {enabledOptionalServices.map(service => (
                    <div key={String(service)} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-purple-600" />
                      <span className="text-zinc-900 dark:text-white">{service}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Custom Services */}
        {config.customServices.length > 0 && (
          <div className="p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
            <h3 className="font-medium text-zinc-900 dark:text-white mb-3">Custom Services ({config.customServices.length})</h3>
            <div className="space-y-2 text-sm">
              {config.customServices.map((service, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-orange-600" />
                  <div className="flex-1 flex items-center justify-between">
                    <span className="text-zinc-900 dark:text-white">{service.name}</span>
                    <span className="text-zinc-600 dark:text-zinc-400">
                      {service.framework} • Port {service.port}
                      {service.route && ` • ${service.route}.${config.domain}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Frontend Apps */}
        {config.frontendApps.length > 0 && (
          <div className="p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
            <h3 className="font-medium text-zinc-900 dark:text-white mb-3">Frontend Applications ({config.frontendApps.length})</h3>
            <div className="space-y-2 text-sm">
              {config.frontendApps.map((app, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-teal-600" />
                  <div className="flex-1 flex items-center justify-between">
                    <span className="text-zinc-900 dark:text-white">{app.displayName || `App ${index + 1}`}</span>
                    <span className="text-zinc-600 dark:text-zinc-400">
                      {app.productionUrl && `${app.productionUrl}.${config.domain} • `}
                      {app.localPort ? `Port ${app.localPort}` : 'No port configured'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Total Summary */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-900 dark:text-blue-200 font-medium">
              Total Services to Build
            </span>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {totalServices}
            </span>
          </div>
          <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
            <div className="flex justify-between">
              <span>Core Services:</span>
              <span className="font-medium">{coreServicesCount}</span>
            </div>
            {optionalServicesCount > 0 && (
              <div className="flex justify-between">
                <span>Optional Services:</span>
                <span className="font-medium">{optionalServicesCount}</span>
              </div>
            )}
            {config.customServices.length > 0 && (
              <div className="flex justify-between">
                <span>Custom Services:</span>
                <span className="font-medium">{config.customServices.length}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-0.5 justify-center overflow-hidden text-sm font-medium transition rounded-full bg-zinc-900 py-1 px-3 text-white hover:bg-zinc-700 dark:bg-zinc-500/10 dark:text-zinc-400 dark:ring-1 dark:ring-inset dark:ring-zinc-400/20 dark:hover:bg-zinc-400/10 dark:hover:text-zinc-300 dark:hover:ring-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>
        <button
          onClick={handleBuild}
          className="inline-flex items-center gap-0.5 justify-center overflow-hidden text-sm font-medium transition rounded-full bg-green-600 py-1 px-3 text-white hover:bg-green-700 dark:bg-green-500/10 dark:text-green-400 dark:ring-1 dark:ring-inset dark:ring-green-400/20 dark:hover:bg-green-400/10 dark:hover:text-green-300 dark:hover:ring-green-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Hammer className="h-4 w-4" />
          <span>Build Project</span>
        </button>
      </div>
    </StepWrapper>
  )
}