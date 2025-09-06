'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, ArrowLeft, Plus, Trash2, Code, ChevronDown, ChevronUp, Info } from 'lucide-react'
import { StepWrapper } from '../StepWrapper'
import { UrlInput } from '@/components/UrlInput'
import { useAutoSave } from '@/hooks/useAutoSave'

interface CustomService {
  name: string
  framework: string
  port: number
  route?: string  // Optional routing: subdomain or full URL
  routeError?: string  // Validation error for route field
}

export default function InitStep4() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [customServices, setCustomServices] = useState<CustomService[]>([])
  const [showFrameworkInfo, setShowFrameworkInfo] = useState(false)
  const [baseDomain, setBaseDomain] = useState('localhost')
  const [environment, setEnvironment] = useState('development')
  const [hasLoaded, setHasLoaded] = useState(false)

  // Auto-save configuration
  const saveConfig = useCallback(async () => {
    try {
      await fetch('/api/wizard/update-env', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customServices, environment })
      })
    } catch (error) {
      console.error('Failed to auto-save custom services:', error)
    }
  }, [customServices, environment])

  // Use auto-save hook
  const { saveNow } = useAutoSave({ customServices, environment }, {
    onSave: saveConfig,
    enabled: hasLoaded,
    delay: 1000
  })

  // Frameworks for dropdown (separate JS and TS categories)
  const frameworksForDropdown = {
    'Custom': [
      { value: 'custom', label: 'Custom Docker', description: 'Blank template for any language/framework' }
    ],
    'JavaScript': [
      { value: 'node-js', label: 'Node.js', description: 'Plain HTTP server baseline' },
      { value: 'express-js', label: 'Express', description: 'Classic minimalist web server' },
      { value: 'fastify-js', label: 'Fastify', description: 'Modern high-performance API framework' },
      { value: 'nest-js', label: 'NestJS', description: 'Opinionated, modular, enterprise style' },
      { value: 'hono-js', label: 'Hono', description: 'Ultra-light, edge-optimized' },
      { value: 'socketio-js', label: 'Socket.IO', description: 'Real-time bidirectional comms' },
      { value: 'bullmq-js', label: 'BullMQ', description: 'Redis-backed jobs/queues' },
      { value: 'temporal-js', label: 'Temporal', description: 'Workflow orchestration SDK' },
      { value: 'bun', label: 'Bun', description: 'Fast all-in-one JavaScript runtime' }
    ],
    'TypeScript': [
      { value: 'node-ts', label: 'Node.js (TS)', description: 'Plain HTTP server with TypeScript' },
      { value: 'express-ts', label: 'Express (TS)', description: 'Express with TypeScript support' },
      { value: 'fastify-ts', label: 'Fastify (TS)', description: 'Fastify with TypeScript support' },
      { value: 'nest-ts', label: 'NestJS (TS)', description: 'NestJS with full TypeScript' },
      { value: 'hono-ts', label: 'Hono (TS)', description: 'Hono with TypeScript support' },
      { value: 'socketio-ts', label: 'Socket.IO (TS)', description: 'Socket.IO with TypeScript' },
      { value: 'bullmq-ts', label: 'BullMQ (TS)', description: 'BullMQ with TypeScript' },
      { value: 'temporal-ts', label: 'Temporal (TS)', description: 'Temporal with TypeScript' },
      { value: 'deno', label: 'Deno', description: 'Secure runtime for TypeScript' },
      { value: 'trpc', label: 'tRPC', description: 'End-to-end type-safe RPC' }
    ],
    'Python': [
      { value: 'flask', label: 'Flask', description: 'Lightweight microframework' },
      { value: 'fastapi', label: 'FastAPI', description: 'Async, type-hinted, modern API' },
      { value: 'django-rest', label: 'Django REST', description: 'Full-featured APIs on Django' },
      { value: 'celery', label: 'Celery', description: 'Distributed task queue' },
      { value: 'ray', label: 'Ray', description: 'Distributed compute/serving for ML' },
      { value: 'agent-llm', label: 'Agent (LLM)', description: 'LLM agent orchestration starter' },
      { value: 'agent-data', label: 'Agent (Data)', description: 'Data-centric agent with pandas/scikit-learn' }
    ],
    'Go': [
      { value: 'gin', label: 'Gin', description: 'Popular high-performance web framework' },
      { value: 'echo', label: 'Echo', description: 'Lightweight, minimal API framework' },
      { value: 'fiber', label: 'Fiber', description: 'Express-inspired, speed-focused' },
      { value: 'grpc', label: 'gRPC-Go', description: 'Official Go gRPC implementation' }
    ],
    'Other': [
      { value: 'rust', label: 'Rust (Actix-web)', description: 'Ergonomic and modular web framework' },
      { value: 'spring-boot', label: 'Java Spring Boot', description: 'Enterprise Java framework' },
      { value: 'aspnet', label: 'C# ASP.NET Core', description: 'Cross-platform web API framework' },
      { value: 'cpp', label: 'C++ (Oat++)', description: 'Modern web framework' },
      { value: 'rails', label: 'Ruby on Rails', description: 'Rails in API mode' },
      { value: 'phoenix', label: 'Elixir Phoenix', description: 'Productive web framework' },
      { value: 'laravel', label: 'PHP Laravel', description: 'Full-featured PHP framework' },
      { value: 'ktor', label: 'Kotlin Ktor', description: 'Asynchronous framework' },
      { value: 'vapor', label: 'Swift Vapor', description: 'Server-side Swift' }
    ]
  }

  // Frameworks for info box display (JavaScript only, with JS/TS notation)
  const frameworksByLanguage = {
    'JavaScript': [
      { value: 'nodejs', label: 'Node.js (JS/TS)', description: 'Plain HTTP server baseline' },
      { value: 'express', label: 'Express (JS/TS)', description: 'Classic minimalist web server' },
      { value: 'fastify', label: 'Fastify (JS/TS)', description: 'Modern high-performance API framework' },
      { value: 'nest', label: 'NestJS (JS/TS)', description: 'Opinionated, modular, enterprise style' },
      { value: 'hono', label: 'Hono (JS/TS)', description: 'Ultra-light, edge-optimized' },
      { value: 'socketio', label: 'Socket.IO (JS/TS)', description: 'Real-time bidirectional comms' },
      { value: 'bullmq', label: 'BullMQ (JS/TS)', description: 'Redis-backed jobs/queues' },
      { value: 'temporal', label: 'Temporal (JS/TS)', description: 'Workflow orchestration SDK' },
      { value: 'bun', label: 'Bun (JS-only)', description: 'Fast all-in-one JavaScript runtime' },
      { value: 'deno', label: 'Deno (TS-only)', description: 'Secure runtime for TypeScript' },
      { value: 'trpc', label: 'tRPC (TS-only)', description: 'End-to-end type-safe RPC' }
    ],
    'Python': [
      { value: 'flask', label: 'Flask', description: 'Lightweight microframework' },
      { value: 'fastapi', label: 'FastAPI', description: 'Async, type-hinted, modern API' },
      { value: 'django', label: 'Django REST', description: 'Full-featured APIs on Django' },
      { value: 'celery', label: 'Celery', description: 'Distributed task queue' },
      { value: 'ray', label: 'Ray', description: 'Distributed compute/serving for ML' },
      { value: 'agent-lang', label: 'Agent (Lang)', description: 'LLM agent orchestration starter' },
      { value: 'agent-data', label: 'Agent (Data)', description: 'Data-centric agent' }
    ],
    'Go': [
      { value: 'gin', label: 'Gin', description: 'Popular high-performance web framework' },
      { value: 'echo', label: 'Echo', description: 'Lightweight, minimal API framework' },
      { value: 'fiber', label: 'Fiber', description: 'Express-inspired, speed-focused' },
      { value: 'grpc', label: 'gRPC-Go', description: 'Official Go gRPC implementation' }
    ],
    'Other': [
      { value: 'rust/axum', label: 'Rust Axum', description: 'Ergonomic web framework' },
      { value: 'java/spring', label: 'Java Spring', description: 'Enterprise Java' },
      { value: 'csharp/aspnet', label: 'C# ASP.NET', description: 'Web API framework' },
      { value: 'cpp/oatpp', label: 'C++ Oat++', description: 'Modern web framework' },
      { value: 'ruby/rails', label: 'Ruby Rails', description: 'Rails API mode' },
      { value: 'elixir/phoenix', label: 'Elixir Phoenix', description: 'Productive framework' },
      { value: 'php/slim', label: 'PHP Slim', description: 'Micro framework' },
      { value: 'kotlin/ktor', label: 'Kotlin Ktor', description: 'Async framework' },
      { value: 'scala/http4s', label: 'Scala Http4s', description: 'Functional HTTP' },
      { value: 'lua/openresty', label: 'Lua OpenResty', description: 'High-performance' }
    ]
  }

  // Flatten for dropdown
  const allFrameworks = Object.entries(frameworksByLanguage).flatMap(([lang, frameworks]) => 
    frameworks.map(f => ({ ...f, language: lang }))
  )

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
          if (data.config.customServices) {
            setCustomServices(data.config.customServices)
          }
          if (data.config.domain || data.config.BASE_DOMAIN) {
            setBaseDomain(data.config.domain || data.config.BASE_DOMAIN)
          }
          if (data.config.environment || data.config.ENV) {
            setEnvironment(data.config.environment || data.config.ENV)
          }
          setHasLoaded(true)  // Enable auto-save after loading
        }
      }
    } catch (error) {
      console.error('Failed to load configuration:', error)
      setHasLoaded(true)
    }
  }

  const addService = () => {
    const nextPort = customServices.length > 0 
      ? Math.max(...customServices.map(s => s.port)) + 1 
      : 4000
    
    const newServices = [
      ...customServices,
      {
        name: `service_${customServices.length + 1}`,
        framework: 'custom',
        port: nextPort,
        route: '',  // Empty by default
        routeError: undefined  // Initialize error field
      }
    ]
    setCustomServices(newServices)
    
    // Focus on the new service's name input after a brief delay
    setTimeout(() => {
      const inputElement = document.getElementById(`service-name-${customServices.length}`)
      if (inputElement) {
        inputElement.focus()
        ;(inputElement as HTMLInputElement).select()
      }
    }, 100)
  }

  const removeService = (index: number) => {
    setCustomServices(customServices.filter((_, i) => i !== index))
  }

  // Validation is now handled by UrlInput component
  
  const updateService = (index: number, field: keyof CustomService, value: any) => {
    const updated = [...customServices]
    if (field === 'name' && typeof value === 'string') {
      // Sanitize service name
      value = value.toLowerCase().replace(/[^a-z0-9_-]/g, '')
    }
    // Don't modify route field value, let it be set directly
    updated[index] = { ...updated[index], [field]: value }
    setCustomServices(updated)
  }

  const handleNext = async () => {
    setLoading(true)
    try {
      // Save immediately before navigating
      await saveNow()
      router.push('/init/5')
    } catch (error) {
      console.error('Error saving configuration:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    router.push('/init/3')
  }

  return (
    <StepWrapper>
      {/* Framework Info Box */}
      <div className="mb-6 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-900/20">
        <button
          onClick={() => setShowFrameworkInfo(!showFrameworkInfo)}
          className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors rounded-lg"
        >
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-900 dark:text-blue-200">
              Available Frameworks & Templates
            </span>
          </div>
          {showFrameworkInfo ? (
            <ChevronUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          )}
        </button>
        
        {showFrameworkInfo && (
          <div className="px-4 pb-4">
            <div className="mt-2 space-y-3">
              {Object.entries(frameworksByLanguage).map(([language, frameworks]) => (
                <div key={language} className="flex items-start gap-3">
                  <span className="text-xs font-semibold text-blue-800 dark:text-blue-300 mt-1 w-20 flex-shrink-0">
                    {language}:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {frameworks.map(framework => (
                      <div
                        key={framework.value}
                        className="relative inline-block group/tooltip"
                      >
                        <span
                          className="inline-flex items-center text-xs px-2 py-1 bg-white dark:bg-zinc-800 border border-blue-200 dark:border-blue-700 rounded text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-default"
                        >
                          {framework.label}
                        </span>
                        {/* Tooltip */}
                        <div className="pointer-events-none absolute z-50 invisible group-hover/tooltip:visible opacity-0 group-hover/tooltip:opacity-100 transition-all duration-150 bottom-full left-1/2 -translate-x-1/2 mb-1.5">
                          <div className="relative">
                            <div className="px-2.5 py-1.5 text-xs text-white bg-zinc-900 dark:bg-zinc-700 rounded shadow-lg whitespace-nowrap">
                              {framework.description}
                            </div>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                              <div className="border-4 border-transparent border-t-zinc-900 dark:border-t-zinc-700"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
              <p className="text-xs text-blue-700 dark:text-blue-400">
                Hover over any framework to see details. Each template includes boilerplate code, Dockerfile, and dependencies.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {customServices.map((service, index) => (
          <div
            key={index}
            className="p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-800/50"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Code className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                <input
                  id={`service-name-${index}`}
                  type="text"
                  value={service.name}
                  onChange={(e) => updateService(index, 'name', e.target.value)}
                  className="font-medium text-zinc-900 dark:text-white bg-transparent border-b border-transparent hover:border-zinc-300 dark:hover:border-zinc-600 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none px-1"
                  placeholder="service_name"
                />
              </div>
              <button
                onClick={() => removeService(index)}
                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            
            {/* All fields on one line */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Framework
                </label>
                <select
                  value={service.framework}
                  onChange={(e) => updateService(index, 'framework', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
                >
                  {Object.entries(frameworksForDropdown).map(([language, frameworks]) => (
                    <optgroup key={language} label={language}>
                      {frameworks.map(fw => (
                        <option key={fw.value} value={fw.value}>
                          {fw.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Port
                </label>
                <input
                  type="number"
                  value={service.port}
                  onChange={(e) => updateService(index, 'port', parseInt(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
                  min="3000"
                  max="9999"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Routing
                </label>
                <UrlInput
                  value={service.route || ''}
                  onChange={(value) => updateService(index, 'route', value)}
                  onError={(error) => updateService(index, 'routeError', error)}
                  environment={environment}
                  baseDomain={baseDomain}
                  placeholder={(environment === 'development' || environment === 'dev') ? "api" : "api or api.domain.com"}
                  required={false}
                  requireSubdomain={environment !== 'development' && environment !== 'dev'}  // Require subdomain in prod
                />
              </div>
            </div>
          </div>
        ))}
        
        {customServices.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg">
            <Code className="h-12 w-12 text-zinc-400 mx-auto mb-3" />
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              No custom services configured yet
            </p>
            <button
              onClick={addService}
              className="inline-flex items-center gap-0.5 justify-center overflow-hidden text-sm font-medium transition rounded-full bg-blue-600 py-1 px-3 text-white hover:bg-blue-700 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-1 dark:ring-inset dark:ring-blue-400/20 dark:hover:bg-blue-400/10 dark:hover:text-blue-300 dark:hover:ring-blue-300"
            >
              <Plus className="h-4 w-4" />
              <span>Add Your First Service</span>
            </button>
          </div>
        )}
      </div>

      {customServices.length > 0 && (
        <button
          onClick={addService}
          className="inline-flex items-center gap-0.5 justify-center overflow-hidden text-sm font-medium transition rounded-full bg-zinc-900 py-1 px-3 text-white hover:bg-zinc-700 dark:bg-zinc-500/10 dark:text-zinc-400 dark:ring-1 dark:ring-inset dark:ring-zinc-400/20 dark:hover:bg-zinc-400/10 dark:hover:text-zinc-300 dark:hover:ring-zinc-300"
        >
          <Plus className="h-4 w-4" />
          <span>Add Service</span>
        </button>
      )}

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
    </StepWrapper>
  )
}