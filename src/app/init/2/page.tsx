'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, ArrowLeft, Database, Shield, Server, Globe, Wrench } from 'lucide-react'
import { StepWrapper } from '../StepWrapper'
import ServiceConfigModal from '@/components/ServiceConfigModal'

export default function InitStep2() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [modalService, setModalService] = useState<string | null>(null)
  const [initialConfig, setInitialConfig] = useState<any>({})
  const [serviceConfigs, setServiceConfigs] = useState<Record<string, any>>({
    postgresql: {},
    hasura: {},
    auth: {},
    nginx: {}
  })

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
          // Store initial config from step 1
          setInitialConfig({
            databaseName: data.config.databaseName,
            databasePassword: data.config.databasePassword,
            environment: data.config.environment,
            adminEmail: data.config.adminEmail
          })
          // Load any existing service configs
          setServiceConfigs(prev => ({
            ...prev,
            postgresql: data.config.postgresqlConfig || {},
            hasura: data.config.hasuraConfig || {},
            auth: data.config.authConfig || {},
            nginx: data.config.nginxConfig || {}
          }))
        }
      }
    } catch (error) {
      console.error('Failed to load configuration:', error)
    }
  }

  const handleNext = async () => {
    setLoading(true)
    try {
      // Save service configurations to .env.local
      const response = await fetch('/api/wizard/update-env', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          config: {
            postgresqlEnabled: true,
            hasuraEnabled: true,
            authEnabled: true,
            nginxEnabled: true,
            postgresqlConfig: serviceConfigs.postgresql,
            hasuraConfig: serviceConfigs.hasura,
            authConfig: serviceConfigs.auth,
            nginxConfig: serviceConfigs.nginx
          }, 
          step: 'required' 
        })
      })
      
      if (response.ok) {
        router.push('/init/3')
      } else {
        console.error('Failed to save configuration')
      }
    } catch (error) {
      console.error('Error saving configuration:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    router.push('/init/1')
  }

  const handleConfigure = (service: string) => {
    setModalService(service)
  }

  const handleSaveConfig = (service: string, config: any) => {
    setServiceConfigs(prev => ({
      ...prev,
      [service]: config
    }))
  }

  const requiredServices = [
    {
      key: 'postgresql',
      name: 'PostgreSQL',
      icon: Database,
      description: 'Primary database for all services',
      configurable: true
    },
    {
      key: 'hasura',
      name: 'Hasura GraphQL',
      icon: Server,
      description: 'Instant GraphQL API for your database',
      configurable: true
    },
    {
      key: 'auth',
      name: 'Hasura Auth',
      icon: Shield,
      description: 'User authentication and authorization',
      configurable: true
    },
    {
      key: 'nginx',
      name: 'Nginx',
      icon: Globe,
      description: 'Reverse proxy and load balancer',
      configurable: true
    }
  ]

  return (
    <StepWrapper>
      <div className="space-y-4">
        {requiredServices.map((service) => {
          const Icon = service.icon
          return (
            <div
              key={service.key}
              className="flex items-center justify-between p-4 border-2 border-blue-500/30 rounded-lg bg-blue-50/50 dark:bg-blue-900/10"
            >
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-white dark:bg-zinc-800 rounded-lg border border-blue-200 dark:border-blue-800">
                  <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-medium text-zinc-900 dark:text-white">
                    {service.name}
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {service.description}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-1">
                <span className="text-sm font-medium text-blue-800 dark:text-blue-600">
                  Required
                </span>
                {service.configurable && (
                  <button
                    onClick={() => handleConfigure(service.key)}
                    className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors cursor-pointer"
                  >
                    <Wrench className="h-3 w-3" />
                    <span className="cursor-pointer">Configure</span>
                  </button>
                )}
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
          disabled={loading}
          className="inline-flex items-center gap-0.5 justify-center overflow-hidden text-sm font-medium transition rounded-full bg-blue-600 py-1 px-3 text-white hover:bg-blue-700 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-1 dark:ring-inset dark:ring-blue-400/20 dark:hover:bg-blue-400/10 dark:hover:text-blue-300 dark:hover:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>{loading ? 'Saving...' : 'Next'}</span>
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
          onSave={(config) => handleSaveConfig(modalService, config)}
          initialConfig={initialConfig}
        />
      )}
    </StepWrapper>
  )
}