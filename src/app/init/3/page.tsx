'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, ArrowLeft, Database, Mail, Activity, Package, Search, HardDrive, Wrench } from 'lucide-react'
import { StepWrapper } from '../StepWrapper'
import ServiceConfigModal from '@/components/ServiceConfigModal'

export default function InitStep3() {
  const router = useRouter()
  const [modalService, setModalService] = useState<string | null>(null)
  const [initialConfig, setInitialConfig] = useState<any>({})
  const [config, setConfig] = useState({
    redisEnabled: false,
    minioEnabled: false,
    mlflowEnabled: false,
    mailpitEnabled: false,
    searchEnabled: false,
    monitoringEnabled: false
  })
  const [serviceConfigs, setServiceConfigs] = useState<Record<string, any>>({
    redis: {},
    minio: {},
    monitoring: {},
    mlflow: {},
    mailpit: {},
    elasticsearch: {}
  })

  // Load configuration from .env.local on mount
  useEffect(() => {
    checkAndLoadConfiguration()
    // nself-admin is always enabled since it's running
    saveNadminEnabled()
  }, [])
  
  const saveNadminEnabled = async () => {
    try {
      await fetch('/api/wizard/update-env-var', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          key: 'NSELF_ADMIN_ENABLED',
          value: 'true',
          environment: initialConfig.environment || 'dev'
        })
      })
    } catch (error) {
      console.error('Failed to save nadmin enabled state:', error)
    }
  }

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
          // Store initial config from step 1
          setInitialConfig({
            environment: data.config.environment,
            adminEmail: data.config.adminEmail
          })
          
          // Map env variables to state keys
          setConfig({
            redisEnabled: data.config.REDIS_ENABLED === 'true' || data.config.redisEnabled || false,
            minioEnabled: data.config.STORAGE_ENABLED === 'true' || data.config.MINIO_ENABLED === 'true' || data.config.minioEnabled || false,
            mlflowEnabled: data.config.MLFLOW_ENABLED === 'true' || data.config.mlflowEnabled || false,
            mailpitEnabled: data.config.MAILPIT_ENABLED === 'true' || data.config.mailpitEnabled || false,
            searchEnabled: data.config.SEARCH_ENABLED === 'true' || data.config.ELASTICSEARCH_ENABLED === 'true' || data.config.searchEnabled || data.config.elasticsearchEnabled || false,
            monitoringEnabled: data.config.MONITORING_ENABLED === 'true' || data.config.monitoringEnabled || false
          })
          
          // Load any existing service configs
          setServiceConfigs(prev => ({
            ...prev,
            redis: data.config.redisConfig || {},
            minio: data.config.minioConfig || {},
            monitoring: data.config.monitoringConfig || {},
            mlflow: data.config.mlflowConfig || {},
            mailpit: data.config.mailpitConfig || {},
            elasticsearch: data.config.elasticsearchConfig || {}
          }))
        }
      }
    } catch (error) {
      console.error('Failed to load configuration:', error)
    }
  }

  const handleNext = () => {
    // Changes are already saved, just navigate
    router.push('/init/4')
  }

  const handleBack = () => {
    router.push('/init/2')
  }

  const handleConfigure = (service: string) => {
    setModalService(service)
  }

  const handleSaveConfig = async (service: string, serviceConfig: any) => {
    setServiceConfigs(prev => ({
      ...prev,
      [service]: serviceConfig
    }))
    
    // Save configuration to .env.{environment} immediately (team settings)
    const variables = Object.entries(serviceConfig).map(([key, value]) => ({
      key,
      value: String(value)
    }))
    
    if (variables.length > 0) {
      try {
        await fetch('/api/wizard/update-env-var', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            variables,
            environment: initialConfig.environment || 'dev'
          })
        })
      } catch (error) {
        console.error('Failed to save service configuration:', error)
      }
    }
  }

  const toggleService = async (key: string) => {
    const newValue = !config[key as keyof typeof config]
    const newConfig = { ...config, [key]: newValue }
    setConfig(newConfig)
    
    // Save ALL optional services state immediately
    try {
      await fetch('/api/wizard/update-env', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: newConfig,
          step: 'optional-services',
          environment: initialConfig.environment || 'dev'
        })
      })
    } catch (error) {
      console.error('Failed to save service state:', error)
    }
    
    // Map the key to the actual env variable name (keeping for reference)
    const envKeyMap: Record<string, string> = {
      'minioEnabled': 'STORAGE_ENABLED',
      'redisEnabled': 'REDIS_ENABLED',
      'monitoringEnabled': 'MONITORING_ENABLED',
      'mlflowEnabled': 'MLFLOW_ENABLED',
      'mailpitEnabled': 'MAILPIT_ENABLED',
      'searchEnabled': 'SEARCH_ENABLED'
    }
  }

  const enableService = async (key: string) => {
    const newConfig = { ...config, [key]: true }
    setConfig(newConfig)
    
    // Save ALL optional services state immediately
    try {
      await fetch('/api/wizard/update-env', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: newConfig,
          step: 'optional-services',
          environment: initialConfig.environment || 'dev'
        })
      })
    } catch (error) {
      console.error('Failed to save service state:', error)
    }
  }

  const allEnabled = Object.values(config).every(v => v === true)
  const noneEnabled = Object.values(config).every(v => v === false)

  const toggleAll = async () => {
    const newState = !allEnabled
    // Don't include nadmin in the toggle since it's required
    const newConfig = {
      redisEnabled: newState,
      minioEnabled: newState,
      mlflowEnabled: newState,
      mailpitEnabled: newState,
      searchEnabled: newState,
      monitoringEnabled: newState
    }
    setConfig(newConfig)
    
    // Save ALL optional services state immediately
    try {
      await fetch('/api/wizard/update-env', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: newConfig,
          step: 'optional-services',
          environment: initialConfig.environment || 'dev'
        })
      })
    } catch (error) {
      console.error('Failed to save service state:', error)
    }
  }

  const optionalServices: Array<{
    key: string
    configKey: string
    name: string
    icon: any
    description: string
    details: string
    enabled: boolean
    required?: boolean
    hasConfiguration?: boolean
  }> = [
    {
      key: 'nadminEnabled',
      configKey: 'nadmin',
      name: 'nself-admin',
      icon: Wrench,
      description: 'Web-based administration dashboard (Required)',
      details: 'Currently running! This dashboard provides complete control over your nself project including service management, database tools, monitoring, and configuration. Essential for project administration.',
      enabled: true,
      required: true,
      hasConfiguration: false
    },
    {
      key: 'redisEnabled',
      configKey: 'redis',
      name: 'Redis',
      icon: Database,
      description: 'In-memory data store for caching and real-time features',
      details: 'Lightning-fast key-value database. Use for session storage, caching, pub/sub messaging, real-time leaderboards, rate limiting, and distributed locks.',
      enabled: config.redisEnabled
    },
    {
      key: 'minioEnabled',
      configKey: 'minio',
      name: 'MinIO',
      icon: HardDrive,
      description: 'S3-compatible object storage for files and media',
      details: 'Self-hosted AWS S3 alternative. Perfect for storing user uploads, profile images, documents, backups, and any binary data with full S3 API compatibility and multi-cloud support.',
      enabled: config.minioEnabled
    },
    {
      key: 'mlflowEnabled',
      configKey: 'mlflow',
      name: 'MLflow',
      icon: Package,
      description: 'Machine Learning lifecycle management platform',
      details: 'Complete ML platform for experiment tracking, model registry, model deployment, and collaborative ML workflows. Integrates with popular ML frameworks and provides a unified interface for the entire ML lifecycle.',
      enabled: config.mlflowEnabled
    },
    {
      key: 'mailpitEnabled',
      configKey: 'mailpit',
      name: 'Mail Service',
      icon: Mail,
      description: 'Email testing and delivery service',
      details: 'Catch all emails in development with Mailpit\'s web UI. Configure production email with SendGrid, AWS SES, Resend, Postmark, or your own SMTP service. Auto mode uses Mailpit for dev and your selected service for production.',
      enabled: config.mailpitEnabled
    },
    {
      key: 'searchEnabled',
      configKey: 'search',
      name: 'Search Services',
      icon: Search,
      description: 'Full-text search with 6 engine options',
      details: 'Choose from Meilisearch (default), Typesense, Zinc, Elasticsearch, OpenSearch, or Sonic. Each offers different trade-offs between features, performance, and resource usage.',
      enabled: config.searchEnabled
    },
    {
      key: 'monitoringEnabled',
      configKey: 'monitoring',
      name: 'Monitoring Bundle',
      icon: Activity,
      description: 'Complete observability stack with 5 integrated services',
      details: 'Includes Prometheus (metrics collection), Grafana (visualization dashboards), Loki (log aggregation), Tempo (distributed tracing), and Alertmanager (alert routing). Full observability for your entire stack.',
      enabled: config.monitoringEnabled
    }
  ]

  return (
    <StepWrapper>
      {/* Subtle toggle all button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={toggleAll}
          className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          {allEnabled ? 'Disable All' : noneEnabled ? 'Enable All' : 'Toggle All'}
        </button>
      </div>

      <div className="space-y-4">
        {optionalServices.map((service) => {
          const Icon = service.icon
          return (
            <div
              key={service.key}
              className={`relative p-5 border-2 rounded-lg transition-all ${
                service.enabled 
                  ? 'border-purple-500/40 bg-purple-50/40 dark:bg-purple-900/10' 
                  : 'border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/30'
              }`}
            >
              <div className="flex items-start justify-between">
                <div 
                  className={`flex items-start space-x-4 flex-1 ${service.required ? '' : 'cursor-pointer'}`}
                  onClick={() => !service.required && !service.enabled && enableService(service.key)}
                >
                  <div className={`p-2 rounded-lg border ${
                    service.enabled 
                      ? 'bg-white dark:bg-zinc-800 border-purple-300 dark:border-purple-800' 
                      : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:border-purple-200 dark:hover:border-purple-800'
                  }`}>
                    <Icon className={`h-6 w-6 ${
                      service.enabled 
                        ? 'text-purple-600 dark:text-purple-400' 
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-purple-500'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-medium mb-1 ${
                      service.enabled
                        ? 'text-purple-900 dark:text-purple-100'
                        : 'text-zinc-900 dark:text-white hover:text-purple-700 dark:hover:text-purple-300'
                    }`}>
                      {service.name}
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                      {service.description}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-500">
                      {service.details}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-2 ml-4">
                  {/* Checkbox */}
                  <label className={`relative inline-flex items-center ${service.required ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                    <input
                      type="checkbox"
                      checked={service.enabled}
                      onChange={() => !service.required && toggleService(service.key)}
                      disabled={service.required}
                      className={`w-5 h-5 rounded border-2 focus:ring-2 ${
                        service.enabled
                          ? 'text-purple-600 focus:ring-purple-400'
                          : 'border-zinc-300 dark:border-zinc-600 text-purple-600 hover:border-purple-400 dark:hover:border-purple-500'
                      } ${service.required ? 'opacity-50 cursor-not-allowed' : ''}`}
                      style={{
                        accentColor: service.enabled ? '#9333ea' : undefined
                      }}
                    />
                  </label>
                  
                  {/* Configure link (only shown when enabled and has configuration) */}
                  {service.enabled && (
                    <button
                      onClick={() => service.hasConfiguration !== false ? handleConfigure(service.configKey) : null}
                      disabled={service.hasConfiguration === false}
                      className={`inline-flex items-center gap-1 text-xs transition-colors ${
                        service.hasConfiguration === false
                          ? 'text-zinc-400 dark:text-zinc-600 cursor-not-allowed'
                          : 'text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 cursor-pointer'
                      }`}
                      title={service.hasConfiguration === false ? 'No configuration options available' : 'Configure service'}
                    >
                      <Wrench className="h-3 w-3" />
                      <span>Configure</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-0.5 justify-center overflow-hidden text-sm font-medium transition rounded-full bg-zinc-900 py-1 px-3 text-white hover:bg-zinc-700 dark:bg-zinc-500/10 dark:text-zinc-400 dark:ring-1 dark:ring-inset dark:ring-zinc-400/20 dark:hover:bg-zinc-400/10 dark:hover:text-zinc-300 dark:hover:ring-zinc-300"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>
        <button
          onClick={handleNext}
          className="inline-flex items-center gap-0.5 justify-center overflow-hidden text-sm font-medium transition rounded-full bg-blue-600 py-1 px-3 text-white hover:bg-blue-700 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-1 dark:ring-inset dark:ring-blue-400/20 dark:hover:bg-blue-400/10 dark:hover:text-blue-300 dark:hover:ring-blue-300"
        >
          <span>Next</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Configuration Modal */}
      {modalService && (
        <ServiceConfigModal
          isOpen={!!modalService}
          onClose={() => setModalService(null)}
          service={modalService}
          config={serviceConfigs[modalService]}
          onSave={(serviceConfig) => handleSaveConfig(modalService, serviceConfig)}
          initialConfig={initialConfig}
        />
      )}
    </StepWrapper>
  )
}