'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, ArrowLeft, Plus, Trash2, Code, ChevronDown, ChevronUp, Info, Loader2, Edit2 } from 'lucide-react'
import { StepWrapper } from '../StepWrapper'
import { UrlInput } from '@/components/UrlInput'
import { useAutoSave } from '@/hooks/useAutoSave'

interface CustomService {
  name: string
  framework: string
  port: number
  route?: string
  routeError?: string
}

export default function InitStep4() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showFrameworkInfo, setShowFrameworkInfo] = useState(false)
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState<number | null>(null)
  
  const [localServices, setLocalServices] = useState<CustomService[]>([])
  const [dataLoaded, setDataLoaded] = useState(false)
  const [environment, setEnvironment] = useState('development')
  const [baseDomain, setBaseDomain] = useState('localhost')
  
  // Load configuration directly from env file on mount
  useEffect(() => {
    loadConfiguration()
    
    // Reload when the page gains focus (e.g., navigating back)
    const handleFocus = () => {
      loadConfiguration()
    }
    
    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        loadConfiguration()
      }
    })
    
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [])
  
  const loadConfiguration = async () => {
    try {
      const response = await fetch('/api/env/read')
      if (response.ok) {
        const data = await response.json()
        if (data.env) {
          // Load environment and domain
          const env = data.env.ENV || 'development'
          console.log('Loaded environment from env file:', env)
          setEnvironment(env === 'dev' ? 'development' : env)
          setBaseDomain(data.env.BASE_DOMAIN || 'localhost')
          
          // Load custom services from CS_* format
          const services: CustomService[] = []
          for (let i = 1; i <= 99; i++) {
            const serviceDef = data.env[`CS_${i}`]
            if (serviceDef) {
              const [name, framework, port, route] = serviceDef.split(':')
              if (name) {
                services.push({
                  name,
                  framework: framework || 'custom',
                  port: parseInt(port) || (4000 + i),
                  route: route || undefined
                })
              }
            } else {
              break // Stop looking for more services
            }
          }
          setLocalServices(services)
        }
      }
    } catch (error) {
      console.error('Failed to load configuration:', error)
    } finally {
      setDataLoaded(true)
    }
  }
  
  // Auto-save configuration
  const saveConfig = useCallback(async () => {
    try {
      console.log('Saving custom services:', localServices, 'to environment:', environment)
      // Save to env with explicit step for custom services
      await fetch('/api/wizard/update-env', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          customServices: localServices, 
          environment: environment,
          step: 'custom-services' // Add explicit step
        })
      })
    } catch (error) {
      console.error('Failed to auto-save custom services:', error)
    }
  }, [localServices, environment])
  
  // Use auto-save hook
  const { saveNow } = useAutoSave({ customServices: localServices, environment }, {
    onSave: saveConfig,
    enabled: dataLoaded,
    delay: 1000
  })
  // Framework tooltips with descriptions and performance scores
  const frameworkTooltips: Record<string, { description: string; performance: number }> = {
    // Custom
    'custom': { 
      description: 'A minimal Docker container with basic Linux tools. Perfect for bringing your own language, framework, or custom binaries. You have complete control over the environment.', 
      performance: 0 // N/A - depends on implementation
    },
    
    // JavaScript
    'node-js': { 
      description: 'Raw Node.js HTTP server without any framework overhead. Extremely lightweight and fast for simple APIs that don\'t need routing or middleware.',
      performance: 5
    },
    'express-js': { 
      description: 'The most popular Node.js framework with massive ecosystem. Great for rapid development with countless middleware options available.',
      performance: 4
    },
    'fastify-js': { 
      description: 'Built for speed with schema-based validation and serialization. Significantly faster than Express while maintaining good developer experience.',
      performance: 6
    },
    'nest-js': { 
      description: 'Enterprise-grade framework inspired by Angular with dependency injection. Best for large teams needing structure and TypeScript-first design.',
      performance: 3
    },
    'hono-js': { 
      description: 'Ultra-lightweight framework optimized for edge computing and Cloudflare Workers. Smallest bundle size with impressive performance.',
      performance: 7
    },
    'socketio-js': { 
      description: 'Real-time bidirectional communication using WebSockets with automatic fallbacks. Industry standard for chat, gaming, and live updates.',
      performance: 4
    },
    'bullmq-js': { 
      description: 'Redis-based queue system for background jobs and task scheduling. Handles millions of jobs with retry logic and rate limiting.',
      performance: 5
    },
    'temporal-js': { 
      description: 'Workflow orchestration for complex, long-running processes with automatic retries. Built for mission-critical distributed systems.',
      performance: 4
    },
    'bun': { 
      description: 'All-in-one JavaScript runtime that\'s faster than Node.js and Deno. Includes bundler, transpiler, and package manager in a single binary.',
      performance: 7
    },
    
    // TypeScript
    'node-ts': { 
      description: 'Raw Node.js with TypeScript for type safety without framework overhead. Best for simple APIs that need type checking.',
      performance: 5
    },
    'express-ts': { 
      description: 'Express with full TypeScript support and type definitions. Combines Express ecosystem with compile-time type safety.',
      performance: 4
    },
    'fastify-ts': { 
      description: 'Fastify with TypeScript for high-performance type-safe APIs. JSON schema validation works seamlessly with TypeScript types.',
      performance: 6
    },
    'nest-ts': { 
      description: 'NestJS is TypeScript-first with decorators and dependency injection. Most mature enterprise TypeScript framework available.',
      performance: 3
    },
    'hono-ts': { 
      description: 'Hono with end-to-end type safety including request/response types. Exceptional performance with full TypeScript support.',
      performance: 7
    },
    'socketio-ts': { 
      description: 'Socket.IO with TypeScript for type-safe real-time events. Ensures event payloads match expected types on both client and server.',
      performance: 4
    },
    'bullmq-ts': { 
      description: 'BullMQ with TypeScript for type-safe job processing. Job payloads and results are fully typed end-to-end.',
      performance: 5
    },
    'temporal-ts': { 
      description: 'Temporal with TypeScript for type-safe workflow definitions. Workflows and activities have full type checking.',
      performance: 4
    },
    'deno': { 
      description: 'Secure runtime with TypeScript built-in and no node_modules. Modern alternative to Node.js with better security defaults.',
      performance: 6
    },
    'trpc': { 
      description: 'TypeScript-only RPC with automatic type sharing, no code generation needed. Types flow directly from server to client, but only works in TypeScript.',
      performance: 5
    },
    
    // Python
    'flask': { 
      description: 'Minimalist Python framework that\'s easy to learn and extend. Perfect for small APIs and microservices with simple requirements.',
      performance: 2
    },
    'fastapi': { 
      description: 'Modern Python framework with automatic API docs and async support. Best performance in Python ecosystem with type hints.',
      performance: 4
    },
    'django-rest': { 
      description: 'Full-featured framework built on Django with authentication and ORM. Best for complex APIs needing admin panel and database migrations.',
      performance: 2
    },
    'celery': { 
      description: 'Distributed task queue for Python with multiple broker support. Industry standard for Python background job processing.',
      performance: 3
    },
    'ray': { 
      description: 'Distributed computing framework for ML workloads and model serving. Scales from laptop to cluster with minimal code changes.',
      performance: 4
    },
    'agent-analytics': { 
      description: 'Advanced analytics platform with Postgres/TimescaleDB/DuckDB integration. Includes Pandas, Polars, Plotly, and Streamlit for data analysis and visualization.',
      performance: 0
    },
    'agent-llm': { 
      description: 'Enhanced LLM agent with RAG, local model support (Ollama), and vector stores (Chroma/Meilisearch). Supports OpenAI and local LLMs.',
      performance: 0
    },
    'agent-timeseries': { 
      description: 'Time series analysis with TimescaleDB hypertables, Prophet/ARIMA forecasting, and real-time anomaly detection using PyOD and River.',
      performance: 0
    },
    'agent-vision': { 
      description: 'Computer vision agent with YOLOv8 object detection, CLIP classification, EasyOCR text extraction, and SAM segmentation. GPU-accelerated processing.',
      performance: 0
    },
    'agent-training': { 
      description: 'ML training infrastructure with PyTorch Lightning, MLFlow experiment tracking, Optuna hyperparameter optimization, and ONNX model export.',
      performance: 0
    },
    
    // Go
    'gin': { 
      description: 'Most popular Go web framework with martini-like API. Fast with good middleware ecosystem and JSON validation.',
      performance: 8
    },
    'fiber': { 
      description: 'Express-inspired Go framework built on fasthttp. Familiar API for Node.js developers with exceptional performance.',
      performance: 9
    },
    'echo': { 
      description: 'Minimalist Go framework with robust routing and middleware. Clean API design with excellent performance.',
      performance: 8
    },
    'grpc': { 
      description: 'Google\'s RPC framework with Protocol Buffers providing type-safe client/server code generation. Excellent for microservices with streaming support.',
      performance: 9
    },
    
    // Other Languages
    'rails': { 
      description: 'Convention-over-configuration Ruby framework in API-only mode. Rapid development with ActiveRecord ORM and extensive gems.',
      performance: 1
    },
    'sinatra': { 
      description: 'Lightweight Ruby DSL for creating APIs with minimal overhead. Perfect for simple microservices that don\'t need Rails features.',
      performance: 2
    },
    'actix-web': { 
      description: 'Rust framework with actor model and exceptional performance. One of the fastest web frameworks across all languages.',
      performance: 10
    },
    'spring-boot': { 
      description: 'Enterprise Java framework with dependency injection and auto-configuration. Industry standard for Java microservices with vast ecosystem.',
      performance: 4
    },
    'ktor': { 
      description: 'Kotlin framework by JetBrains with coroutine-based async. Modern alternative to Spring with better Kotlin integration.',
      performance: 5
    },
    'phoenix': { 
      description: 'Elixir framework built on Erlang VM with incredible concurrency. Handles millions of WebSocket connections on single server.',
      performance: 7
    },
    'aspnet': { 
      description: 'Microsoft\'s high-performance framework for .NET Core. Excellent for Windows environments with great tooling support.',
      performance: 7
    },
    'laravel': { 
      description: 'Full-featured PHP framework in API mode with Eloquent ORM. Best PHP developer experience with extensive package ecosystem.',
      performance: 2
    },
    'vapor': { 
      description: 'Server-side Swift framework with async/await support. Leverages Swift\'s performance and type safety for backend services.',
      performance: 6
    },
    'oatpp': { 
      description: 'Modern C++ framework with zero dependencies and async support. Extremely fast with minimal memory footprint.',
      performance: 10
    },
    'lapis': { 
      description: 'Lua web framework running on OpenResty (nginx + LuaJIT). Rails-like MVC structure with ORM and migrations. Exceptional performance.',
      performance: 8
    },
    'zap': { 
      description: 'Zig web framework built on facil.io. Ultra-fast performance with tiny memory footprint. Modern systems programming for web services.',
      performance: 9
    }
  }
  
  // Frameworks list remains the same...
  const frameworksForDropdown = {
    'Custom': [
      { value: 'custom', label: 'Custom Docker', description: 'Minimal Docker skeleton ready for any language or code' }
    ],
    'JavaScript': [
      { value: 'node-js', label: 'Node.js', description: 'Plain HTTP REST server' },
      { value: 'express-js', label: 'Express', description: 'Classic REST API framework' },
      { value: 'fastify-js', label: 'Fastify', description: 'High-performance REST API' },
      { value: 'nest-js', label: 'NestJS', description: 'Enterprise REST microservices' },
      { value: 'hono-js', label: 'Hono', description: 'Edge-optimized REST API' },
      { value: 'socketio-js', label: 'Socket.IO', description: 'Real-time WebSocket server' },
      { value: 'bullmq-js', label: 'BullMQ', description: 'Redis job queue service' },
      { value: 'temporal-js', label: 'Temporal', description: 'Workflow orchestration service' },
      { value: 'bun', label: 'Bun', description: 'Fast REST API runtime' }
    ],
    'TypeScript': [
      { value: 'node-ts', label: 'Node.js (TS)', description: 'TypeScript REST server' },
      { value: 'express-ts', label: 'Express (TS)', description: 'Express REST API with TypeScript' },
      { value: 'fastify-ts', label: 'Fastify (TS)', description: 'Fastify REST API with TypeScript' },
      { value: 'nest-ts', label: 'NestJS (TS)', description: 'NestJS REST microservices' },
      { value: 'hono-ts', label: 'Hono (TS)', description: 'Hono REST API with TypeScript' },
      { value: 'socketio-ts', label: 'Socket.IO (TS)', description: 'TypeScript WebSocket server' },
      { value: 'bullmq-ts', label: 'BullMQ (TS)', description: 'TypeScript job queue service' },
      { value: 'temporal-ts', label: 'Temporal (TS)', description: 'TypeScript workflow service' },
      { value: 'deno', label: 'Deno', description: 'Secure TypeScript REST runtime' },
      { value: 'trpc', label: 'tRPC', description: 'Type-safe RPC API service' }
    ],
    'Python': [
      { value: 'flask', label: 'Flask', description: 'Lightweight REST API' },
      { value: 'fastapi', label: 'FastAPI', description: 'Modern async REST API' },
      { value: 'django-rest', label: 'Django REST', description: 'Full-featured REST API' },
      { value: 'celery', label: 'Celery', description: 'Distributed task queue service' },
      { value: 'ray', label: 'Ray', description: 'ML serving/compute service' },
      { value: 'agent-analytics', label: 'Agent Analytics', description: 'Data analytics platform' },
      { value: 'agent-llm', label: 'Agent LLM', description: 'Enhanced LLM with RAG' },
      { value: 'agent-timeseries', label: 'Agent TimeSeries', description: 'Time series analysis' },
      { value: 'agent-vision', label: 'Agent Vision', description: 'Computer vision service' },
      { value: 'agent-training', label: 'Agent Training', description: 'ML training infrastructure' }
    ],
    'Go': [
      { value: 'gin', label: 'Gin', description: 'Fast Go REST API' },
      { value: 'fiber', label: 'Fiber', description: 'Express-style Go REST API' },
      { value: 'echo', label: 'Echo', description: 'Minimalist Go REST API' },
      { value: 'grpc', label: 'gRPC', description: 'High-performance RPC service' }
    ],
    'Other Languages': [
      { value: 'rails', label: 'Ruby (Rails API)', description: 'Rails REST API framework' },
      { value: 'sinatra', label: 'Ruby (Sinatra)', description: 'Lightweight Ruby REST DSL' },
      { value: 'actix-web', label: 'Rust (Actix Web)', description: 'High-performance Rust REST API' },
      { value: 'spring-boot', label: 'Java (Spring Boot)', description: 'Enterprise Java REST API' },
      { value: 'ktor', label: 'Kotlin (Ktor)', description: 'Async Kotlin REST framework' },
      { value: 'phoenix', label: 'Elixir (Phoenix)', description: 'Elixir REST API framework' },
      { value: 'aspnet', label: 'C# (ASP.NET Core)', description: '.NET Core REST API' },
      { value: 'laravel', label: 'PHP (Laravel REST)', description: 'Laravel REST API framework' },
      { value: 'vapor', label: 'Swift (Vapor)', description: 'Server-side Swift REST API' },
      { value: 'oatpp', label: 'C++ (Oat++)', description: 'C++ REST microservice framework' },
      { value: 'lapis', label: 'Lua (Lapis)', description: 'OpenResty/nginx Lua framework' },
      { value: 'zap', label: 'Zig (Zap)', description: 'Ultra-fast Zig web framework' }
    ]
  }
  
  const addService = () => {
    const nextPort = localServices.length > 0 
      ? Math.max(...localServices.map(s => s.port)) + 1 
      : 4001  // Start at 4001 since Auth uses 4000
    
    const newService: CustomService = {
      name: `service_${localServices.length + 1}`,
      framework: 'custom',
      port: nextPort,
      route: ''
    }
    
    const newIndex = localServices.length
    setLocalServices([...localServices, newService])
    
    // Set editing mode for the new service title
    setTimeout(() => {
      setEditingTitle(newIndex)
    }, 50)
  }
  
  const removeService = (index: number) => {
    setLocalServices(localServices.filter((_, i) => i !== index))
  }
  
  const updateService = (index: number, field: keyof CustomService, value: any) => {
    const updated = [...localServices]
    if (field === 'name' && typeof value === 'string') {
      value = value.toLowerCase().replace(/[^a-z0-9_-]/g, '')
    }
    updated[index] = {
      ...updated[index],
      [field]: value
    }
    setLocalServices(updated)
  }
  
  const handleNext = async () => {
    setLoading(true)
    await saveNow()
    // Small delay to ensure save completes
    await new Promise(resolve => setTimeout(resolve, 100))
    router.push('/init/5')
  }
  
  const handleBack = async () => {
    setLoading(true)
    await saveNow()
    // Small delay to ensure save completes
    await new Promise(resolve => setTimeout(resolve, 100))
    router.push('/init/3')
  }
  
  
  // Show loading skeleton while initial data loads
  if (!dataLoaded) {
    return (
      <StepWrapper>
        <div className="space-y-6">
          <div>
            <div className="h-6 w-40 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-96 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse"></div>
          </div>
          <div className="space-y-4">
            {/* Loading skeleton for service cards */}
            {[...Array(2)].map((_, i) => (
              <div key={i} className="p-6 border-2 border-zinc-200 dark:border-zinc-700 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex gap-4">
                      <div className="h-10 w-48 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse"></div>
                      <div className="h-10 w-32 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse"></div>
                      <div className="h-10 w-24 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse"></div>
                    </div>
                    <div className="h-10 w-full bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse"></div>
                  </div>
                  <div className="h-10 w-10 bg-red-200 dark:bg-red-900 rounded animate-pulse ml-4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </StepWrapper>
    )
  }

  return (
    <StepWrapper>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Custom Services
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Add custom backend services with your preferred languages and frameworks. Each service runs in its own container.
            Services without routes are internal-only (workers, queues, etc).
          </p>
        </div>
        
        {/* Framework info toggle */}
        <button
          onClick={() => setShowFrameworkInfo(!showFrameworkInfo)}
          className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
        >
          <Info className="h-4 w-4" />
          <span>Available frameworks and templates</span>
          {showFrameworkInfo ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        
        {showFrameworkInfo && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 text-sm">
            <p className="mb-3 text-blue-900 dark:text-blue-200">
              Each framework provides a production-ready backend API/microservice template with best practices:
            </p>
            {Object.entries(frameworksForDropdown).map(([category, frameworks]) => (
              <div key={category} className="mb-3">
                <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-1">{category}</h4>
                <div className="grid grid-cols-2 gap-1">
                  {frameworks.map((fw, idx) => {
                    const tooltip = frameworkTooltips[fw.value]
                    const tooltipId = `${category}-${fw.value}`
                    return (
                      <div 
                        key={fw.value} 
                        className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-1"
                      >
                        <span>• {fw.label}</span>
                        {/* Info icon with tooltip */}
                        <span 
                          className="relative inline-block cursor-help"
                          onMouseEnter={() => setActiveTooltip(tooltipId)}
                          onMouseLeave={() => setActiveTooltip(null)}
                        >
                          <span className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300">ⓘ</span>
                          {/* Tooltip on hover - only show if this is the active tooltip */}
                          {activeTooltip === tooltipId && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-[100] w-64 p-2 bg-zinc-900 text-white text-xs rounded-lg shadow-xl pointer-events-none animate-fadeIn">
                              <div className="mb-2">{tooltip?.description || fw.description}</div>
                              {tooltip?.performance > 0 && (
                                <div className="pt-2 border-t border-zinc-700">
                                  <span className="font-semibold">Performance Score: </span>
                                  <span className={`font-bold ${
                                    tooltip.performance >= 9 ? 'text-green-400' : 
                                    tooltip.performance >= 7 ? 'text-yellow-400' : 
                                    tooltip.performance >= 5 ? 'text-orange-400' : 'text-red-400'
                                  }`}>
                                    {Number.isInteger(tooltip.performance) ? tooltip.performance : tooltip.performance.toFixed(1)}/10
                                  </span>
                                </div>
                              )}
                              {tooltip?.performance === 0 && (
                                <div className="pt-2 border-t border-zinc-700 text-zinc-400">
                                  Performance varies by implementation
                                </div>
                              )}
                              {/* Arrow pointing down */}
                              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-900 transform rotate-45"></div>
                            </div>
                          )}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Service list */}
        {localServices.map((service, index) => (
          <div key={index} className="p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
            {/* Editable Title - styled like init/5 */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Code className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                {editingTitle === index ? (
                  <input
                    type="text"
                    value={service.name}
                    onChange={(e) => updateService(index, 'name', e.target.value)}
                    onBlur={() => setEditingTitle(null)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setEditingTitle(null)
                      }
                    }}
                    className="font-medium bg-transparent border-b border-zinc-400 dark:border-zinc-600 focus:outline-none focus:border-blue-500 text-zinc-900 dark:text-white"
                    placeholder="service_name"
                    autoFocus
                  />
                ) : (
                  <h3 
                    className="font-medium text-zinc-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                    onClick={() => setEditingTitle(index)}
                  >
                    {service.name || 'Unnamed Service'}
                  </h3>
                )}
              </div>
              <button
                onClick={() => removeService(index)}
                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Framework */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Framework
                </label>
                <select
                  value={service.framework}
                  onChange={(e) => updateService(index, 'framework', e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-600 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  title={service.framework ? `${frameworkTooltips[service.framework]?.description}\n\nPerformance: ${frameworkTooltips[service.framework]?.performance || 'N/A'}/10` : 'Select a framework'}
                >
                  <option value="">Select a framework</option>
                  {Object.entries(frameworksForDropdown).map(([category, frameworks]) => (
                    <optgroup key={category} label={category}>
                      {frameworks.map((fw) => {
                        const tooltip = frameworkTooltips[fw.value]
                        return (
                          <option 
                            key={fw.value} 
                            value={fw.value}
                            title={`${tooltip?.description || fw.description}${tooltip?.performance > 0 ? `\n\nPerformance Score: ${tooltip.performance}/10` : ''}`}
                          >
                            {fw.label}
                          </option>
                        )
                      })}
                    </optgroup>
                  ))}
                </select>
              </div>
              {/* Port */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Port
                </label>
                <input
                  type="number"
                  value={service.port}
                  onChange={(e) => updateService(index, 'port', parseInt(e.target.value) || 3000)}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-600 rounded-lg text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  min="1024"
                  max="65535"
                />
              </div>
              {/* Route */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Route <span className="text-xs text-zinc-500">(leave empty for internal-only service)</span>
                </label>
                <input
                  type="text"
                  value={service.route || ''}
                  onChange={(e) => updateService(index, 'route', e.target.value)}
                  placeholder="api, webhook.external.com, or leave empty"
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-600 rounded-lg text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                />
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  • No route = internal-only service (no external access)<br/>
                  • Single word (e.g., &quot;api&quot;) = api.{baseDomain}<br/>
                  • Full domain = used as-is (auto-detected, no :: needed)
                </p>
              </div>
            </div>
            
            {/* Route error */}
            {service.routeError && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{service.routeError}</p>
            )}
          </div>
        ))}
        
        {/* Empty state */}
        {localServices.length === 0 && (
          <div className="text-center py-8 px-4 border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-lg">
            <Code className="h-12 w-12 text-zinc-400 dark:text-zinc-500 mx-auto mb-3" />
            <p className="text-zinc-600 dark:text-zinc-400 mb-1">No custom services added yet</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-500 mb-4">
              Add services for your APIs, workers, or microservices
            </p>
            <button
              onClick={addService}
              className="inline-flex items-center gap-1.5 justify-center overflow-hidden text-sm font-medium transition rounded-full bg-blue-600 py-1.5 px-4 text-white hover:bg-blue-700 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-1 dark:ring-inset dark:ring-blue-400/20 dark:hover:bg-blue-400/10 dark:hover:text-blue-300 dark:hover:ring-blue-300"
            >
              <Plus className="h-4 w-4" />
              <span>Add Your First Service</span>
            </button>
          </div>
        )}
        
        {/* Add service button - only show when there are services */}
        {localServices.length > 0 && (
          <button
            onClick={addService}
            className="w-full py-3 px-4 border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-lg text-zinc-600 dark:text-zinc-400 hover:border-blue-500 hover:text-blue-600 dark:hover:border-blue-400 dark:hover:text-blue-400 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="h-5 w-5" />
            <span>Add Service</span>
          </button>
        )}
      </div>
      
      {/* Summary */}
      {localServices.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-900 dark:text-blue-200">
            <strong>{localServices.length}</strong> custom {localServices.length === 1 ? 'service' : 'services'} configured
          </p>
        </div>
      )}
      
      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-0.5 justify-center overflow-hidden text-sm font-medium transition rounded-full bg-zinc-100 py-1 px-3 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800/40 dark:text-zinc-400 dark:ring-1 dark:ring-inset dark:ring-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>
        <button
          onClick={handleNext}
          disabled={loading}
          className="inline-flex items-center gap-0.5 justify-center overflow-hidden text-sm font-medium transition rounded-full bg-blue-600 py-1 px-3 text-white hover:bg-blue-700 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-1 dark:ring-inset dark:ring-blue-400/20 dark:hover:bg-blue-400/10 dark:hover:text-blue-300 dark:hover:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:cursor-pointer disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <span>Saving</span>
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
    </StepWrapper>
  )
}