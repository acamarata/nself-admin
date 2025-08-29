'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Settings, Database, Server, Package, ChevronRight, ChevronLeft, Check } from 'lucide-react'
import { Button } from '@/components/Button'
import { HeroPattern } from '@/components/HeroPattern'
import { useProjectStore } from '@/stores/projectStore'

type WizardStep = 'project' | 'database' | 'services' | 'review'

interface ProjectConfig {
  projectName: string
  projectDescription: string
  database: 'PostgreSQL' | 'MySQL' | 'MongoDB'
  services: {
    required: string[]
    optional: string[]
    user: string[]
  }
  environment: 'development' | 'staging' | 'production'
}

const REQUIRED_SERVICES = ['PostgreSQL', 'Hasura', 'Authentication', 'Nginx']
const OPTIONAL_SERVICES = ['Redis', 'MinIO', 'Mailpit', 'Grafana', 'Prometheus', 'Loki', 'Jaeger', 'AlertManager']
const USER_SERVICE_TEMPLATES = ['NestJS API', 'BullMQ Worker', 'Python Service', 'Go Service']

export default function BuildPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<WizardStep>('project')
  const [building, setBuilding] = useState(false)
  const [buildProgress, setBuildProgress] = useState('')
  const checkProjectStatus = useProjectStore(state => state.checkProjectStatus)
  
  const [config, setConfig] = useState<ProjectConfig>({
    projectName: 'nself-project',
    projectDescription: '',
    database: 'PostgreSQL',
    services: {
      required: REQUIRED_SERVICES,
      optional: [],
      user: []
    },
    environment: 'development'
  })

  // Check if already built
  useEffect(() => {
    checkProjectStatus().then(() => {
      const currentStatus = useProjectStore.getState().projectStatus
      if (currentStatus !== 'not_initialized') {
        // Already built, redirect appropriately
        if (currentStatus === 'running') {
          router.push('/')
        } else {
          router.push('/start')
        }
      }
    })
  }, [checkProjectStatus, router])

  const handleNext = () => {
    const steps: WizardStep[] = ['project', 'database', 'services', 'review']
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1])
    }
  }

  const handleBack = () => {
    const steps: WizardStep[] = ['project', 'database', 'services', 'review']
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1])
    }
  }

  const handleBuild = async () => {
    try {
      setBuilding(true)
      setBuildProgress('Initializing project...')

      // Call nself init
      const initResponse = await fetch('/api/nself/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })

      if (!initResponse.ok) {
        throw new Error('Failed to initialize project')
      }

      setBuildProgress('Building Docker configurations...')

      // Call nself build
      const buildResponse = await fetch('/api/nself/build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!buildResponse.ok) {
        throw new Error('Failed to build project')
      }

      setBuildProgress('Project built successfully!')
      
      // Redirect to start page after build
      setTimeout(() => {
        router.push('/start')
      }, 2000)
    } catch (error) {
      console.error('Build failed:', error)
      setBuildProgress('Build failed. Please check the logs.')
      setBuilding(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 'project':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Project Information</h3>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Project Name
              </label>
              <input
                type="text"
                value={config.projectName}
                onChange={(e) => setConfig({ ...config, projectName: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                placeholder="my-awesome-project"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Description (optional)
              </label>
              <textarea
                value={config.projectDescription}
                onChange={(e) => setConfig({ ...config, projectDescription: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                rows={3}
                placeholder="A brief description of your project..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Environment
              </label>
              <select
                value={config.environment}
                onChange={(e) => setConfig({ ...config, environment: e.target.value as ProjectConfig['environment'] })}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
              >
                <option value="development">Development</option>
                <option value="staging">Staging</option>
                <option value="production">Production</option>
              </select>
            </div>
          </div>
        )

      case 'database':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Database Configuration</h3>
            <div className="space-y-3">
              {(['PostgreSQL', 'MySQL', 'MongoDB'] as const).map((db) => (
                <label key={db} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="database"
                    value={db}
                    checked={config.database === db}
                    onChange={(e) => setConfig({ ...config, database: e.target.value as ProjectConfig['database'] })}
                    className="text-blue-600"
                  />
                  <span className="text-zinc-700 dark:text-zinc-300">{db}</span>
                </label>
              ))}
            </div>
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {config.database === 'PostgreSQL' && 'PostgreSQL is recommended for most applications with Hasura GraphQL support.'}
                {config.database === 'MySQL' && 'MySQL is a popular choice for traditional web applications.'}
                {config.database === 'MongoDB' && 'MongoDB is ideal for document-based NoSQL applications.'}
              </p>
            </div>
          </div>
        )

      case 'services':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Select Services</h3>
            
            {/* Required Services */}
            <div>
              <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">Required Services</h4>
              <div className="space-y-2">
                {REQUIRED_SERVICES.map((service) => (
                  <label key={service} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={true}
                      disabled
                      className="text-blue-600"
                    />
                    <span className="text-zinc-600 dark:text-zinc-400">{service}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Optional Services */}
            <div>
              <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">Optional Services</h4>
              <div className="space-y-2">
                {OPTIONAL_SERVICES.map((service) => (
                  <label key={service} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.services.optional.includes(service)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setConfig({
                            ...config,
                            services: {
                              ...config.services,
                              optional: [...config.services.optional, service]
                            }
                          })
                        } else {
                          setConfig({
                            ...config,
                            services: {
                              ...config.services,
                              optional: config.services.optional.filter(s => s !== service)
                            }
                          })
                        }
                      }}
                      className="text-blue-600"
                    />
                    <span className="text-zinc-700 dark:text-zinc-300">{service}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* User Services */}
            <div>
              <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">User Service Templates</h4>
              <div className="space-y-2">
                {USER_SERVICE_TEMPLATES.map((service) => (
                  <label key={service} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.services.user.includes(service)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setConfig({
                            ...config,
                            services: {
                              ...config.services,
                              user: [...config.services.user, service]
                            }
                          })
                        } else {
                          setConfig({
                            ...config,
                            services: {
                              ...config.services,
                              user: config.services.user.filter(s => s !== service)
                            }
                          })
                        }
                      }}
                      className="text-blue-600"
                    />
                    <span className="text-zinc-700 dark:text-zinc-300">{service}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )

      case 'review':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Review Configuration</h3>
            
            <div className="space-y-4">
              <div className="border-b border-zinc-200 dark:border-zinc-700 pb-4">
                <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Project</h4>
                <p className="text-zinc-900 dark:text-white font-medium">{config.projectName}</p>
                {config.projectDescription && (
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">{config.projectDescription}</p>
                )}
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Environment: {config.environment}</p>
              </div>

              <div className="border-b border-zinc-200 dark:border-zinc-700 pb-4">
                <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Database</h4>
                <p className="text-zinc-900 dark:text-white">{config.database}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Services</h4>
                <div className="space-y-2">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    <span className="font-medium">Required:</span> {config.services.required.length} services
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    <span className="font-medium">Optional:</span> {config.services.optional.length} services
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    <span className="font-medium">User Services:</span> {config.services.user.length} templates
                  </p>
                  <p className="text-sm font-medium text-zinc-900 dark:text-white mt-2">
                    Total: {config.services.required.length + config.services.optional.length + config.services.user.length} services
                  </p>
                </div>
              </div>
            </div>

            {buildProgress && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">{buildProgress}</p>
              </div>
            )}
          </div>
        )
    }
  }

  const getStepIcon = (step: WizardStep) => {
    switch (step) {
      case 'project': return Settings
      case 'database': return Database
      case 'services': return Server
      case 'review': return Package
    }
  }

  const steps: WizardStep[] = ['project', 'database', 'services', 'review']
  const currentStepIndex = steps.indexOf(currentStep)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-800">
      <HeroPattern />
      
      <div className="relative z-10 max-w-3xl w-full mx-auto px-6">
        <div className="group relative rounded-2xl bg-zinc-50 p-8 dark:bg-white/2.5">
          <div className="absolute inset-0 rounded-2xl ring-1 ring-zinc-900/7.5 ring-inset group-hover:ring-zinc-900/10 dark:ring-white/10 dark:group-hover:ring-white/20" />
          <div className="relative">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Build Your Project</h2>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Configure your nself project before building
              </p>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-between mb-8">
              {steps.map((step, index) => {
                const Icon = getStepIcon(step)
                const isActive = index === currentStepIndex
                const isCompleted = index < currentStepIndex
                
                return (
                  <div key={step} className="flex items-center flex-1">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
                      isActive ? 'bg-blue-600 text-white' :
                      isCompleted ? 'bg-green-600 text-white' :
                      'bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400'
                    }`}>
                      {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-2 transition-colors ${
                        isCompleted ? 'bg-green-600' : 'bg-zinc-200 dark:bg-zinc-700'
                      }`} />
                    )}
                  </div>
                )
              })}
            </div>

            {/* Step Content */}
            <div className="min-h-[300px] mb-8">
              {renderStepContent()}
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                onClick={handleBack}
                variant="secondary"
                disabled={currentStepIndex === 0 || building}
                className="flex items-center"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>

              {currentStep === 'review' ? (
                <Button
                  onClick={handleBuild}
                  variant="primary"
                  disabled={building}
                  className="flex items-center"
                >
                  {building ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Building...
                    </>
                  ) : (
                    <>
                      Build Project
                      <Package className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  variant="primary"
                  className="flex items-center"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}