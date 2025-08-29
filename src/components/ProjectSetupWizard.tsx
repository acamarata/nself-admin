'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/Button'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  FileText, 
  Package, 
  PlayCircle,
  RefreshCw,
  Terminal,
  Loader2,
  ChevronRight,
  Settings,
  Database,
  Shield,
  Cloud,
  Lock,
  Globe
} from 'lucide-react'
import { useProjectStore } from '@/stores/projectStore'

interface SetupStep {
  id: string
  title: string
  description: string
  command: string
  status: 'pending' | 'running' | 'complete' | 'error' | 'skipped'
  output?: string
}

export function ProjectSetupWizard() {
  const { 
    projectStatus, 
    hasEnvFile, 
    hasDockerCompose, 
    containersRunning,
    checkProjectStatus,
    setProjectSetup
  } = useProjectStore()
  
  const [currentStep, setCurrentStep] = useState(0)
  const [isExecuting, setIsExecuting] = useState(false)
  const [commandOutput, setCommandOutput] = useState('')
  const [envConfig, setEnvConfig] = useState({
    PROJECT_NAME: 'nself',
    POSTGRES_DB: 'nhost',
    POSTGRES_USER: 'postgres',
    POSTGRES_PASSWORD: 'postgres-dev-password',
    HASURA_ADMIN_SECRET: 'hasura-admin-secret-dev',
    JWT_SECRET: 'development-secret-key-minimum-32-characters-long',
    DOMAIN: 'nae.local',
    ADMIN_EMAIL: '',
    SMTP_HOST: 'mailpit',
    SMTP_PORT: '1025'
  })

  const steps: SetupStep[] = [
    {
      id: 'check',
      title: 'Checking Project',
      description: 'Analyzing your project structure and configuration',
      command: 'check',
      status: projectStatus === 'not_initialized' ? 'pending' : 'complete'
    },
    {
      id: 'init',
      title: 'Initialize Project',
      description: 'Create initial environment configuration',
      command: 'nself init',
      status: hasEnvFile ? 'complete' : 'pending'
    },
    {
      id: 'build',
      title: 'Build Project',
      description: 'Generate Docker Compose and infrastructure files',
      command: 'nself build',
      status: hasDockerCompose ? 'complete' : 'pending'
    },
    {
      id: 'start',
      title: 'Start Services',
      description: 'Launch all containers and services',
      command: 'nself start',
      status: containersRunning > 0 ? 'complete' : 'pending'
    }
  ]

  useEffect(() => {
    // Check project status on mount
    checkProjectStatus()
  }, [checkProjectStatus])

  useEffect(() => {
    // Auto-advance steps based on project status
    if (projectStatus === 'running') {
      setCurrentStep(4) // All complete
      setTimeout(() => {
        setProjectSetup(true)
      }, 2000)
    } else if (projectStatus === 'stopped' || projectStatus === 'built') {
      setCurrentStep(3) // Ready to start
    } else if (projectStatus === 'initialized') {
      setCurrentStep(2) // Ready to build
    } else {
      setCurrentStep(1) // Ready to init
    }
  }, [projectStatus, setProjectSetup])

  const executeCommand = async (command: string) => {
    setIsExecuting(true)
    setCommandOutput('')
    
    try {
      const response = await fetch('/api/cli/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setCommandOutput(data.output)
        // Refresh project status after command
        await checkProjectStatus()
        setCurrentStep(prev => prev + 1)
      } else {
        setCommandOutput(`Error: ${data.error}`)
      }
    } catch (error) {
      setCommandOutput(`Failed to execute command: ${error}`)
    } finally {
      setIsExecuting(false)
    }
  }

  const saveEnvConfig = async () => {
    setIsExecuting(true)
    
    try {
      const envContent = Object.entries(envConfig)
        .map(([key, value]) => `${key}=${value}`)
        .join('\n')
      
      const response = await fetch('/api/config/env', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file: 'local',
          content: envContent
        })
      })
      
      if (response.ok) {
        await checkProjectStatus()
        setCurrentStep(2)
      }
    } catch (error) {
    } finally {
      setIsExecuting(false)
    }
  }

  const getStepIcon = (step: SetupStep) => {
    switch (step.id) {
      case 'check': return Settings
      case 'init': return FileText
      case 'build': return Package
      case 'start': return PlayCircle
      default: return CheckCircle
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete': return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'running': return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />
      case 'skipped': return <AlertCircle className="w-5 h-5 text-yellow-500" />
      default: return <div className="w-5 h-5 rounded-full border-2 border-zinc-300 dark:border-zinc-600" />
    }
  }

  if (projectStatus === 'running' && currentStep >= 4) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[400px] text-center"
      >
        <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Project Ready!</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          All services are running. Redirecting to dashboard...
        </p>
      </motion.div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Project Setup Wizard</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Let&apos;s get your nself project up and running
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = getStepIcon(step)
            const isActive = index === currentStep - 1
            const isComplete = index < currentStep - 1 || step.status === 'complete'
            
            return (
              <div key={step.id} className="flex-1 relative">
                <div className="flex items-center">
                  <div className={`
                    relative z-10 w-12 h-12 rounded-full flex items-center justify-center
                    ${isComplete ? 'bg-green-500' : isActive ? 'bg-blue-500' : 'bg-zinc-200 dark:bg-zinc-700'}
                    transition-colors duration-300
                  `}>
                    {isComplete ? (
                      <CheckCircle className="w-6 h-6 text-white" />
                    ) : (
                      <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-zinc-500'}`} />
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`
                      absolute left-12 w-full h-0.5 -z-10
                      ${isComplete ? 'bg-green-500' : 'bg-zinc-200 dark:bg-zinc-700'}
                      transition-colors duration-300
                    `} />
                  )}
                </div>
                <div className="mt-2">
                  <p className={`text-sm font-medium ${isActive ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {step.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Current Step Content */}
      <AnimatePresence mode="wait">
        {currentStep === 1 && !hasEnvFile && (
          <motion.div
            key="env-setup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-6"
          >
            <h3 className="text-lg font-semibold mb-4">Environment Configuration</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
              Configure your project settings. These can be changed later.
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">Project Name</label>
                <input
                  type="text"
                  value={envConfig.PROJECT_NAME}
                  onChange={(e) => setEnvConfig({ ...envConfig, PROJECT_NAME: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Domain</label>
                <input
                  type="text"
                  value={envConfig.DOMAIN}
                  onChange={(e) => setEnvConfig({ ...envConfig, DOMAIN: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Admin Email</label>
                <input
                  type="email"
                  value={envConfig.ADMIN_EMAIL}
                  onChange={(e) => setEnvConfig({ ...envConfig, ADMIN_EMAIL: e.target.value })}
                  placeholder="admin@example.com"
                  className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Database Name</label>
                <input
                  type="text"
                  value={envConfig.POSTGRES_DB}
                  onChange={(e) => setEnvConfig({ ...envConfig, POSTGRES_DB: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900"
                />
              </div>
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => executeCommand('nself init')}
                disabled={isExecuting}
              >
                <Terminal className="w-4 h-4 mr-2" />
                Use CLI Instead
              </Button>
              <Button
                variant="primary"
                onClick={saveEnvConfig}
                disabled={isExecuting}
              >
                {isExecuting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Save Configuration
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}

        {currentStep === 2 && hasEnvFile && !hasDockerCompose && (
          <motion.div
            key="build"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-6"
          >
            <h3 className="text-lg font-semibold mb-4">Build Project Infrastructure</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
              Generate Docker Compose configuration and set up project structure.
            </p>
            
            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-4 mb-6">
              <p className="text-sm font-mono mb-2">This will create:</p>
              <ul className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                <li className="flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  PostgreSQL database configuration
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Authentication service setup
                </li>
                <li className="flex items-center gap-2">
                  <Cloud className="w-4 h-4" />
                  Storage service (MinIO) configuration
                </li>
                <li className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  GraphQL engine (Hasura) setup
                </li>
              </ul>
            </div>

            <Button
              variant="primary"
              onClick={() => executeCommand('nself build')}
              disabled={isExecuting}
              className="w-full"
            >
              {isExecuting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Building Project...
                </>
              ) : (
                <>
                  <Package className="w-4 h-4 mr-2" />
                  Build Project
                </>
              )}
            </Button>
          </motion.div>
        )}

        {currentStep === 3 && hasDockerCompose && containersRunning === 0 && (
          <motion.div
            key="start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-6"
          >
            <h3 className="text-lg font-semibold mb-4">Start Services</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
              Launch all Docker containers and initialize services.
            </p>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    This may take a few minutes
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    The first startup downloads Docker images and initializes databases.
                  </p>
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              onClick={() => executeCommand('nself start')}
              disabled={isExecuting}
              className="w-full"
            >
              {isExecuting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Starting Services...
                </>
              ) : (
                <>
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Start All Services
                </>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Command Output */}
      {commandOutput && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-6 bg-zinc-900 rounded-lg p-4 font-mono text-sm text-green-400 overflow-x-auto"
        >
          <pre>{commandOutput}</pre>
        </motion.div>
      )}

      {/* Help Section */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Need Help?</h4>
        <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
          Common commands you can run manually:
        </p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <code className="bg-white dark:bg-zinc-800 px-2 py-1 rounded">nself status</code>
          <span className="text-blue-700 dark:text-blue-300">Check service status</span>
          <code className="bg-white dark:bg-zinc-800 px-2 py-1 rounded">nself logs</code>
          <span className="text-blue-700 dark:text-blue-300">View service logs</span>
          <code className="bg-white dark:bg-zinc-800 px-2 py-1 rounded">nself stop</code>
          <span className="text-blue-700 dark:text-blue-300">Stop all services</span>
          <code className="bg-white dark:bg-zinc-800 px-2 py-1 rounded">nself reset</code>
          <span className="text-blue-700 dark:text-blue-300">Reset everything</span>
        </div>
      </div>
    </div>
  )
}