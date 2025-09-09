'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, ArrowLeft, Database, Mail, Activity, Package, Search, HardDrive, Wrench } from 'lucide-react'
import { StepWrapper } from '../StepWrapper'
import ServiceConfigModal from '@/components/ServiceConfigModal'
import { useWizardStore } from '@/stores/wizardStore'

export default function InitStep3() {
  const router = useRouter()
  const [modalService, setModalService] = useState<string | null>(null)
  const [navigating, setNavigating] = useState(false)
  
  // Use wizard store
  const { 
    optionalServices,
    setOptionalServices,
    syncWithEnv,
    isInitialized,
    isLoading,
    environment
  } = useWizardStore()
  
  const [serviceConfigs, setServiceConfigs] = useState<Record<string, any>>({
    redis: {},
    minio: {},
    monitoring: {},
    mlflow: {},
    mailpit: {},
    elasticsearch: {}
  })

  // Always sync with env when component mounts to get latest values
  useEffect(() => {
    syncWithEnv()
    
    // Reload when the page gains focus (e.g., navigating back)
    const handleFocus = () => {
      syncWithEnv()
    }
    
    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        syncWithEnv()
      }
    })
    
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [syncWithEnv])



  const handleNext = () => {
    // Changes are already saved, just navigate
    setNavigating(true)
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
            environment: environment || 'dev'
          })
        })
      } catch (error) {
        console.error('Failed to save service configuration:', error)
      }
    }
  }

  const toggleService = async (serviceKey: string) => {
    // Map service keys to wizard store keys
    const keyMap: Record<string, string> = {
      'redisEnabled': 'redis',
      'minioEnabled': 'minio', 
      'mlflowEnabled': 'mlflow',
      'mailpitEnabled': 'mailpit',
      'searchEnabled': 'search',
      'monitoringEnabled': 'monitoring',
      'nadminEnabled': 'nadmin'
    }
    
    const storeKey = keyMap[serviceKey] as keyof typeof optionalServices
    if (!storeKey) return
    
    // Update wizard store
    const newOptionalServices = {
      ...optionalServices,
      [storeKey]: !optionalServices[storeKey]
    }
    
    setOptionalServices(newOptionalServices)
    
    // Save to env file
    try {
      // Get the environment from localStorage (set in step 1)
      const environment = localStorage.getItem('wizard_environment') || 'dev'
      
      await fetch('/api/wizard/update-env', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: { 
            environment,  // Include environment to write to correct file
            optionalServices: newOptionalServices 
          },
          step: 'optional-services'
        })
      })
    } catch (error) {
      console.error('Failed to save service state:', error)
    }
  }

  // Calculate toggle states based on wizard store
  const allEnabled = Object.values(optionalServices).filter((v, i) => 
    // Exclude nadmin from "all" calculation since it's always required
    Object.keys(optionalServices)[i] !== 'nadmin'
  ).every(v => v === true)
  
  const noneEnabled = Object.values(optionalServices).filter((v, i) => 
    // Exclude nadmin from "all" calculation since it's always required
    Object.keys(optionalServices)[i] !== 'nadmin'
  ).every(v => v === false)

  const toggleAll = async () => {
    const newState = !allEnabled
    // Don't include nadmin in the toggle since it's required
    const newOptionalServices = {
      ...optionalServices,
      redis: newState,
      minio: newState,
      mlflow: newState,
      mailpit: newState,
      search: newState,
      monitoring: newState
      // nadmin stays as is
    }
    
    setOptionalServices(newOptionalServices)
    
    // Save to env file
    try {
      // Get the environment from localStorage (set in step 1)
      const environment = localStorage.getItem('wizard_environment') || 'dev'
      
      await fetch('/api/wizard/update-env', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: { 
            environment,  // Include environment to write to correct file
            optionalServices: newOptionalServices 
          },
          step: 'optional-services'
        })
      })
    } catch (error) {
      console.error('Failed to save service state:', error)
    }
  }

  const serviceDefinitions: Array<{
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
      enabled: optionalServices.redis || false
    },
    {
      key: 'minioEnabled',
      configKey: 'minio',
      name: 'MinIO',
      icon: HardDrive,
      description: 'S3-compatible object storage for files and media',
      details: 'Self-hosted AWS S3 alternative. Perfect for storing user uploads, profile images, documents, backups, and any binary data with full S3 API compatibility and multi-cloud support.',
      enabled: optionalServices.minio || false
    },
    {
      key: 'mlflowEnabled',
      configKey: 'mlflow',
      name: 'MLflow',
      icon: Package,
      description: 'Machine Learning lifecycle management platform',
      details: 'Complete ML platform for experiment tracking, model registry, model deployment, and collaborative ML workflows. Integrates with popular ML frameworks and provides a unified interface for the entire ML lifecycle.',
      enabled: optionalServices.mlflow || false
    },
    {
      key: 'mailpitEnabled',
      configKey: 'mailpit',
      name: 'Mail Service',
      icon: Mail,
      description: 'Email testing and delivery service',
      details: 'Catch all emails in development with Mailpit\'s web UI. Configure production email with SendGrid, AWS SES, Resend, Postmark, or your own SMTP service. Auto mode uses Mailpit for dev and your selected service for production.',
      enabled: optionalServices.mailpit || false
    },
    {
      key: 'searchEnabled',
      configKey: 'search',
      name: 'Search Services',
      icon: Search,
      description: 'Full-text search with 6 engine options',
      details: 'Choose from Meilisearch (default), Typesense, Zinc, Elasticsearch, OpenSearch, or Sonic. Each offers different trade-offs between features, performance, and resource usage.',
      enabled: optionalServices.search || false
    },
    {
      key: 'monitoringEnabled',
      configKey: 'monitoring',
      name: 'Monitoring Bundle',
      icon: Activity,
      description: 'Complete observability stack with 5 integrated services',
      details: 'Includes Prometheus (metrics collection), Grafana (visualization dashboards), Loki (log aggregation), Tempo (distributed tracing), and Alertmanager (alert routing). Full observability for your entire stack.',
      enabled: optionalServices.monitoring || false
    }
  ]

  // Show loading skeleton while initial data loads
  if (isLoading && !isInitialized) {
    return (
      <StepWrapper>
        <div className="space-y-4">
          {/* Loading skeleton for service cards */}
          {[...Array(7)].map((_, i) => (
            <div key={i} className="p-5 border-2 border-zinc-200 dark:border-zinc-700 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse"></div>
                  <div>
                    <div className="h-5 w-28 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse mb-2"></div>
                    <div className="h-3 w-56 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-11 bg-zinc-200 dark:bg-zinc-700 rounded-full animate-pulse"></div>
                  <div className="h-8 w-8 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </StepWrapper>
    )
  }

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
        {serviceDefinitions.map((service) => {
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
                  onClick={() => !service.required && !service.enabled && toggleService(service.key)}
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
          disabled={navigating}
          className="inline-flex items-center gap-0.5 justify-center overflow-hidden text-sm font-medium transition rounded-full bg-blue-600 py-1 px-3 text-white hover:bg-blue-700 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-1 dark:ring-inset dark:ring-blue-400/20 dark:hover:bg-blue-400/10 dark:hover:text-blue-300 dark:hover:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:cursor-pointer disabled:cursor-not-allowed"
        >
          {navigating ? (
            <>
              <span>Loading</span>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white dark:border-blue-400"></div>
            </>
          ) : (
            <>
              <span>Next</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
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
        />
      )}
    </StepWrapper>
  )
}