'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/Button'
import { HeroPattern } from '@/components/HeroPattern'
import { Guides } from '@/components/Guides'
import { Resources } from '@/components/Resources'
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  type MotionValue,
} from 'framer-motion'
import { 
  Server, 
  Database, 
  Cpu, 
  MemoryStick, 
  HardDrive, 
  Network,
  Activity,
  CheckCircle,
  Clock,
  AlertCircle,
  Play,
  Container,
  Settings,
  Shield,
  Zap,
  GitBranch,
  Lock,
  Globe,
  Layers,
  Code,
  Truck,
  BarChart3,
  Workflow,
  Table2,
  List,
  Grid3x3,
  Mail,
  Eye,
  Briefcase,
  Package,
  Users,
  Terminal
} from 'lucide-react'
import { GridPattern } from '@/components/GridPattern'


interface SystemMetrics {
  cpu: number
  memory: number
  disk: number
  containers: number
  memoryTotal: number
  diskTotal: number
}

interface ServiceStatus {
  name: string
  status: string
  health?: string
  cpu?: number
  memory?: number
  ports?: number[]
  image?: string
  restartCount?: number
}

interface ProjectInfo {
  projectName: string
  database: string
  services: string[]
  status: string
}

function MetricCard({ 
  title, 
  value, 
  unit, 
  icon: Icon, 
  limit,
  color = "blue"
}: { 
  title: string
  value: number | string
  unit?: string
  icon: React.ComponentType<{ className?: string }>
  limit?: number
  color?: string
}) {
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  const percentage = limit ? (numValue / limit) * 100 : numValue
  
  const getColorClasses = (color: string) => {
    const colors: Record<string, {
      bg: string
      text: string
      progress: string
      icon: string
    }> = {
      blue: {
        bg: 'bg-blue-50 dark:bg-blue-950/20',
        text: 'text-blue-600 dark:text-blue-400',
        progress: 'bg-blue-500',
        icon: 'text-blue-500'
      },
      green: {
        bg: 'bg-green-50 dark:bg-green-950/20', 
        text: 'text-green-600 dark:text-green-400',
        progress: 'bg-green-500',
        icon: 'text-green-500'
      },
      purple: {
        bg: 'bg-purple-50 dark:bg-purple-950/20',
        text: 'text-purple-600 dark:text-purple-400', 
        progress: 'bg-purple-500',
        icon: 'text-purple-500'
      },
      orange: {
        bg: 'bg-orange-50 dark:bg-orange-950/20',
        text: 'text-orange-600 dark:text-orange-400',
        progress: 'bg-orange-500', 
        icon: 'text-orange-500'
      }
    }
    return colors[color] || colors.blue
  }
  
  const colorClasses = getColorClasses(color)
  
  return (
    <div className={`rounded-xl ${colorClasses.bg} p-6 transition-all duration-300 hover:shadow-lg`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{title}</h3>
        <Icon className={`h-5 w-5 ${colorClasses.icon}`} />
      </div>
      <div className="mb-3">
        <span className={`text-3xl font-bold ${colorClasses.text}`}>
          {typeof value === 'number' ? value.toFixed(1) : value}
        </span>
        {unit && <span className="text-sm ml-1 text-zinc-500 dark:text-zinc-400">{unit}</span>}
        {limit && (
          <span className="text-xs ml-2 text-zinc-500 dark:text-zinc-400">
            / {limit}{unit}
          </span>
        )}
      </div>
      {limit && (
        <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
          <div 
            className={`${colorClasses.progress} h-2 rounded-full transition-all duration-500`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      )}
    </div>
  )
}

function ProjectInfoCard({ projectInfo }: { projectInfo: ProjectInfo }) {
  let mouseX = useMotionValue(0)
  let mouseY = useMotionValue(0)

  function onMouseMove({
    currentTarget,
    clientX,
    clientY,
  }: React.MouseEvent<HTMLDivElement>) {
    let { left, top } = currentTarget.getBoundingClientRect()
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
  }

  return (
    <div
      onMouseMove={onMouseMove}
      className="group relative flex rounded-2xl bg-zinc-50 transition-shadow hover:shadow-md hover:shadow-zinc-900/5 dark:bg-white/2.5 dark:hover:shadow-black/5"
    >
      <ResourcePattern mouseX={mouseX} mouseY={mouseY} />
      <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-zinc-900/7.5 group-hover:ring-zinc-900/10 dark:ring-white/10 dark:group-hover:ring-white/20" />
      <div className="relative rounded-2xl px-4 pb-4 pt-16">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900/5 ring-1 ring-zinc-900/25 backdrop-blur-[2px] transition duration-300 group-hover:bg-white/50 group-hover:ring-zinc-900/25 dark:bg-white/7.5 dark:ring-white/15 dark:group-hover:bg-blue-400/10 dark:group-hover:ring-blue-400">
          <Settings className="h-5 w-5 fill-zinc-700/10 stroke-zinc-700 transition-colors duration-300 group-hover:stroke-zinc-900 dark:fill-white/10 dark:stroke-zinc-400 dark:group-hover:fill-blue-300/10 dark:group-hover:stroke-blue-400" />
        </div>
        <h3 className="mt-4 text-sm font-semibold leading-7 text-zinc-900 dark:text-white">
          {projectInfo.projectName}
        </h3>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Project is built and ready to start
        </p>
        <button 
          onClick={async () => {
            const response = await fetch('/api/nself/start', { method: 'POST' })
            if (response.ok) {
              window.location.reload()
            }
          }}
          className="mt-4 inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <Play className="mr-2 h-4 w-4" />
          Start Services
        </button>
      </div>
    </div>
  )
}

function ResourcePattern({
  mouseX,
  mouseY,
  ...gridProps
}: {
  mouseX: MotionValue<number>
  mouseY: MotionValue<number>
}) {
  let maskImage = useMotionTemplate`radial-gradient(180px at ${mouseX}px ${mouseY}px, white, transparent)`
  let style = { maskImage, WebkitMaskImage: maskImage }

  return (
    <div className="pointer-events-none">
      <div className="absolute inset-0 rounded-2xl transition duration-300 [mask-image:linear-gradient(white,transparent)] group-hover:opacity-50">
        <GridPattern
          width={72}
          height={56}
          x="50%"
          className="absolute inset-x-0 inset-y-[-30%] h-[160%] w-full skew-y-[-18deg] fill-black/[0.02] stroke-black/5 dark:fill-white/1 dark:stroke-white/2.5"
          {...gridProps}
        />
      </div>
      <motion.div
        className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#D7EDEA] to-[#F4FBDF] opacity-0 transition duration-300 group-hover:opacity-100 dark:from-[#202D2E] dark:to-[#303428]"
        style={style}
      />
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 mix-blend-overlay transition duration-300 group-hover:opacity-100"
        style={style}
      >
        <GridPattern
          width={72}
          height={56}
          x="50%"
          className="absolute inset-x-0 inset-y-[-30%] h-[160%] w-full skew-y-[-18deg] fill-black/50 stroke-black/70 dark:fill-white/2.5 dark:stroke-white/10"
          {...gridProps}
        />
      </motion.div>
    </div>
  )
}

function BackendServiceCard({ 
  title, 
  services, 
  icon: Icon,
  description
}: { 
  title: string
  services: ServiceStatus[]
  icon: React.ComponentType<{ className?: string }>
  description: string
}) {
  const [expanded, setExpanded] = useState(false)
  const displayServices = expanded ? services : services.slice(0, 3)
  const hasMore = services.length > 3
  
  return (
    <div className="group relative rounded-2xl bg-zinc-50 p-6 transition-shadow hover:shadow-md hover:shadow-zinc-900/5 dark:bg-white/2.5 dark:hover:shadow-black/5">
      <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-zinc-900/7.5 group-hover:ring-zinc-900/10 dark:ring-white/10 dark:group-hover:ring-white/20" />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900/5 ring-1 ring-zinc-900/25 backdrop-blur-[2px] transition duration-300 group-hover:bg-white/50 group-hover:ring-zinc-900/25 dark:bg-white/7.5 dark:ring-white/15 dark:group-hover:bg-blue-400/10 dark:group-hover:ring-blue-400">
              <Icon className="h-5 w-5 fill-zinc-700/10 stroke-zinc-700 transition-colors duration-300 group-hover:stroke-zinc-900 dark:fill-white/10 dark:stroke-zinc-400 dark:group-hover:fill-blue-300/10 dark:group-hover:stroke-blue-400" />
            </div>
            <h3 className="ml-3 text-sm font-semibold text-zinc-900 dark:text-white">{title}</h3>
          </div>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {services.filter(s => s.status === 'running' || s.status === 'healthy').length}/{services.length}
          </span>
        </div>
        
        <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-3">{description}</p>
        
        <div className="space-y-2">
          {displayServices.map((service, index) => {
            const isHealthy = service.status === 'running' || service.status === 'healthy'
            return (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-zinc-700 dark:text-zinc-300 truncate">{service.name}</span>
                <div className={`h-2 w-2 rounded-full ${isHealthy ? 'bg-green-500' : 'bg-red-500'}`} />
              </div>
            )
          })}
        </div>
        
        {hasMore && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-3 text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            {expanded ? 'Show less' : `+${services.length - 3} more`}
          </button>
        )}
      </div>
    </div>
  )
}

// Helper functions for categorization
function getServiceCategory(name: string): 'required' | 'optional' | 'user' {
  const lowerName = name.toLowerCase()
  
  // Check for BullMQ workers first - they are user services
  if (lowerName.includes('bullmq') || lowerName.includes('bull')) return 'user'
  
  // Required services
  if (lowerName.includes('postgres')) return 'required'
  if (lowerName.includes('hasura')) return 'required'
  if (lowerName.includes('auth') && !lowerName.includes('alertmanager')) return 'required'
  if (lowerName.includes('nginx')) return 'required'
  
  // Optional services
  if (lowerName.includes('minio')) return 'optional'
  if (lowerName.includes('storage')) return 'optional'
  if (lowerName.includes('mailpit')) return 'optional'
  if (lowerName.includes('redis')) return 'optional'
  if (lowerName.includes('grafana')) return 'optional'
  if (lowerName.includes('prometheus')) return 'optional'
  if (lowerName.includes('loki')) return 'optional'
  if (lowerName.includes('jaeger')) return 'optional'
  if (lowerName.includes('alertmanager')) return 'optional'
  
  // User services
  return 'user'
}

function getServiceDefaultOrder(name: string, category: 'required' | 'optional' | 'user'): number {
  const lowerName = name.toLowerCase()
  
  if (category === 'required') {
    if (lowerName.includes('postgres')) return 1
    if (lowerName.includes('hasura')) return 2
    if (lowerName.includes('auth')) return 3
    if (lowerName.includes('nginx')) return 4
    return 99
  }
  
  if (category === 'optional') {
    if (lowerName.includes('minio')) return 1
    if (lowerName.includes('storage')) return 2
    if (lowerName.includes('mailpit')) return 3
    if (lowerName.includes('redis')) return 4
    if (lowerName.includes('grafana')) return 5
    if (lowerName.includes('prometheus')) return 6
    if (lowerName.includes('loki')) return 7
    if (lowerName.includes('jaeger')) return 8
    if (lowerName.includes('alertmanager')) return 9
    return 99
  }
  
  // For user services, sort alphabetically by default
  return 0
}

// Function to categorize services for Backend Stack cards
function categorizeBackendServices(services: ServiceStatus[]) {
  const categories = {
    database: [] as ServiceStatus[],
    api: [] as ServiceStatus[],
    authentication: [] as ServiceStatus[],
    storage: [] as ServiceStatus[],
    mail: [] as ServiceStatus[],
    monitoring: [] as ServiceStatus[],
    workers: [] as ServiceStatus[],
    services: [] as ServiceStatus[],
    applications: [] as ServiceStatus[]
  }
  
  services.forEach(service => {
    const name = service.name.toLowerCase()
    const category = getServiceCategory(service.name)
    
    // Skip user services for backend stack cards
    if (category === 'user') {
      if (name.includes('bull') || name.includes('worker')) {
        categories.workers.push(service)
      } else if (name.includes('frontend') || name.includes('app') || name.includes('web')) {
        categories.applications.push(service)
      } else {
        categories.services.push(service)
      }
      return
    }
    
    // Categorize required and optional services
    if (name.includes('postgres')) categories.database.push(service)
    else if (name.includes('hasura')) categories.api.push(service)
    else if (name.includes('auth') && !name.includes('alertmanager')) categories.authentication.push(service)
    else if (name.includes('minio') || name.includes('storage')) categories.storage.push(service)
    else if (name.includes('mailpit')) categories.mail.push(service)
    else if (name.includes('grafana') || name.includes('prometheus') || name.includes('loki') || 
             name.includes('jaeger') || name.includes('alertmanager')) categories.monitoring.push(service)
    else if (name.includes('redis')) categories.storage.push(service)
    else if (name.includes('nginx')) categories.api.push(service)
  })
  
  return categories
}

function getServiceDisplayName(name: string): string {
  return name
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

interface ContainersTableProps {
  services: ServiceStatus[]
}

type ViewMode = 'table' | 'list' | 'cards'

interface ServiceTooltipProps {
  service: ServiceStatus
  children: React.ReactNode
}

function ServiceTooltip({ service, children }: ServiceTooltipProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  
  const getServiceDescription = (name: string) => {
    const lowerName = name.toLowerCase()
    if (lowerName.includes('postgres')) return 'PostgreSQL database for persistent data storage'
    if (lowerName.includes('hasura')) return 'GraphQL API engine for instant APIs over Postgres'
    if (lowerName.includes('auth')) return 'Authentication service for user management and JWT tokens'
    if (lowerName.includes('nginx')) return 'Web server and reverse proxy for routing requests'
    if (lowerName.includes('minio')) return 'S3-compatible object storage for files and media'
    if (lowerName.includes('storage')) return 'Storage API service for file management'
    if (lowerName.includes('mailpit')) return 'Email testing tool for development'
    if (lowerName.includes('redis')) return 'In-memory data store for caching and queues'
    if (lowerName.includes('grafana')) return 'Metrics visualization and monitoring dashboards'
    if (lowerName.includes('prometheus')) return 'Time-series database for metrics collection'
    if (lowerName.includes('loki')) return 'Log aggregation system for centralized logging'
    if (lowerName.includes('jaeger')) return 'Distributed tracing for performance monitoring'
    if (lowerName.includes('alertmanager')) return 'Alert routing and management for Prometheus'
    if (lowerName.includes('nest')) return 'NestJS backend service'
    if (lowerName.includes('bull')) return 'BullMQ worker for background job processing'
    if (lowerName.includes('python')) return 'Python service for data processing'
    if (lowerName.includes('go')) return 'Go service for high-performance operations'
    return 'Custom service'
  }
  
  return (
    <div className="relative inline-block">
      <div 
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {children}
      </div>
      {showTooltip && (
        <div className="absolute z-50 left-0 bottom-full mb-2 w-64 p-3 bg-zinc-900 dark:bg-zinc-800 text-white rounded-lg shadow-xl pointer-events-none">
          <div className="text-xs font-mono text-zinc-400 mb-1">
            {service.image || 'custom:latest'}
          </div>
          <div className="text-sm text-zinc-200">
            {getServiceDescription(service.name)}
          </div>
        </div>
      )}
    </div>
  )
}

interface StatusTooltipProps {
  service: ServiceStatus
  children: React.ReactNode
}

function StatusTooltip({ service, children }: StatusTooltipProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  
  const getHealthReason = (service: ServiceStatus) => {
    const healthStatus = getHealthStatus(service)
    if (healthStatus === 'healthy') return 'Service is running normally'
    if (healthStatus === 'unhealthy') {
      if (service.restartCount && service.restartCount > 0) {
        return `Service has restarted ${service.restartCount} times`
      }
      return 'Service health check is failing'
    }
    if (healthStatus === 'stopped') return 'Service is not running'
    return 'Service status is unknown'
  }
  
  const getHealthStatus = (service: ServiceStatus) => {
    if (service.health?.includes('unhealthy')) return 'unhealthy'
    if (service.health?.includes('healthy')) return 'healthy'
    if (service.status === 'running') return 'healthy'
    return service.status
  }
  
  return (
    <div className="relative inline-block">
      <div 
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {children}
      </div>
      {showTooltip && (
        <div className="absolute z-50 left-0 bottom-full mb-2 w-48 p-2 bg-zinc-900 dark:bg-zinc-800 text-white text-sm rounded-lg shadow-xl pointer-events-none">
          {getHealthReason(service)}
        </div>
      )}
    </div>
  )
}

function ContainersTable({ services }: ContainersTableProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [sortBy, setSortBy] = useState<'default' | 'name' | 'status' | 'cpu' | 'memory'>('default')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  
  // Organize services by category
  const requiredServices = services.filter(s => getServiceCategory(s.name) === 'required')
  const optionalServices = services.filter(s => getServiceCategory(s.name) === 'optional')
  const userServices = services.filter(s => getServiceCategory(s.name) === 'user')
  
  // Sort services within each category
  const sortServices = (serviceList: ServiceStatus[], category: 'required' | 'optional' | 'user') => {
    return [...serviceList].sort((a, b) => {
      switch (sortBy) {
        case 'default':
          const orderA = getServiceDefaultOrder(a.name, category)
          const orderB = getServiceDefaultOrder(b.name, category)
          return orderA - orderB
        case 'name':
          return a.name.localeCompare(b.name)
        case 'status':
          return a.status.localeCompare(b.status)
        case 'cpu':
          return (b.cpu || 0) - (a.cpu || 0)
        case 'memory':
          return (b.memory || 0) - (a.memory || 0)
        default:
          return 0
      }
    })
  }
  
  // Filter services
  const filterServices = (serviceList: ServiceStatus[]) => {
    return serviceList.filter(s => {
      if (filterStatus !== 'all' && s.status !== filterStatus) return false
      if (searchTerm && !s.name.toLowerCase().includes(searchTerm.toLowerCase())) return false
      return true
    })
  }
  
  const filteredRequired = filterServices(sortServices(requiredServices, 'required'))
  const filteredOptional = filterServices(sortServices(optionalServices, 'optional'))
  const filteredUser = filterServices(sortServices(userServices, 'user'))
  
  const getHealthStatus = (service: ServiceStatus) => {
    // Parse health status properly
    if (service.health?.includes('unhealthy')) return 'unhealthy'
    if (service.health?.includes('healthy')) return 'healthy'
    if (service.status === 'running') return 'healthy'
    return service.status
  }
  
  const getUptime = (health: string | undefined) => {
    if (!health) return null
    const match = health.match(/Up\s+(.+?)(?:\s+\(|$)/)
    return match ? match[1] : null
  }
  
  const renderServiceRow = (service: ServiceStatus, index: number) => {
    const healthStatus = getHealthStatus(service)
    const uptime = getUptime(service.health)
    
    // Card View
    if (viewMode === 'cards') {
      return (
        <div key={`${service.name}-${index}`} className="bg-white dark:bg-zinc-900/50 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700 hover:shadow-md transition-shadow">
          <ServiceTooltip service={service}>
            <div className="font-medium text-zinc-900 dark:text-white cursor-help mb-1">
              {getServiceDisplayName(service.name)}
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
              {service.name}
            </div>
          </ServiceTooltip>
          
          <StatusTooltip service={service}>
            <div className="flex items-center justify-between mb-3 cursor-help">
              <div className="flex items-center">
                <div className={`h-2 w-2 rounded-full mr-2 ${
                  healthStatus === 'healthy' ? 'bg-green-500' :
                  healthStatus === 'unhealthy' ? 'bg-red-500' :
                  healthStatus === 'stopped' ? 'bg-gray-500' :
                  'bg-yellow-500'
                }`} />
                <span className={`text-sm capitalize ${
                  healthStatus === 'healthy' ? 'text-green-600 dark:text-green-400' :
                  healthStatus === 'unhealthy' ? 'text-red-600 dark:text-red-400' :
                  healthStatus === 'stopped' ? 'text-gray-600 dark:text-gray-400' :
                  'text-yellow-600 dark:text-yellow-400'
                }`}>
                  {healthStatus}
                </span>
              </div>
              {uptime && (
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {uptime}
                </span>
              )}
            </div>
          </StatusTooltip>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center">
              <Cpu className="h-3 w-3 mr-1 text-zinc-400" />
              <span className="text-zinc-600 dark:text-zinc-400">
                {service.cpu?.toFixed(1) || '0.0'}%
              </span>
            </div>
            <div className="flex items-center">
              <MemoryStick className="h-3 w-3 mr-1 text-zinc-400" />
              <span className="text-zinc-600 dark:text-zinc-400">
                {service.memory?.toFixed(1) || '0.0'}%
              </span>
            </div>
            {service.ports && service.ports.length > 0 && (
              <div className="col-span-2 text-zinc-500 dark:text-zinc-400">
                Port: {service.ports[0]}
              </div>
            )}
          </div>
        </div>
      )
    }
    
    // List View
    if (viewMode === 'list') {
      return (
        <div key={`${service.name}-${index}`} className="flex items-center justify-between p-3 hover:bg-blue-50/30 dark:hover:bg-blue-950/10 transition-colors border-b border-zinc-200/50 dark:border-zinc-700/50">
          <div className="flex items-center space-x-4 flex-1">
            <ServiceTooltip service={service}>
              <div className="cursor-help">
                <div className="text-sm font-medium text-zinc-900 dark:text-white">
                  {getServiceDisplayName(service.name)}
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  {service.name}
                </div>
              </div>
            </ServiceTooltip>
            <StatusTooltip service={service}>
              <div className="flex items-center cursor-help">
                <div className={`h-2 w-2 rounded-full mr-2 ${
                  healthStatus === 'healthy' ? 'bg-green-500' :
                  healthStatus === 'unhealthy' ? 'bg-red-500' :
                  healthStatus === 'stopped' ? 'bg-gray-500' :
                  'bg-yellow-500'
                }`} />
                <span className={`text-sm ${
                  healthStatus === 'healthy' ? 'text-green-600 dark:text-green-400' :
                  healthStatus === 'unhealthy' ? 'text-red-600 dark:text-red-400' :
                  healthStatus === 'stopped' ? 'text-gray-600 dark:text-gray-400' :
                  'text-yellow-600 dark:text-yellow-400'
                }`}>
                  {healthStatus}
                </span>
              </div>
            </StatusTooltip>
          </div>
          <div className="flex items-center space-x-6">
            {service.ports && service.ports.length > 0 && (
              <div className="text-xs text-zinc-500">
                Port {service.ports[0]}
              </div>
            )}
            <div className="text-xs text-zinc-500">
              {service.cpu?.toFixed(1)}% CPU
            </div>
            <div className="text-xs text-zinc-500">
              {service.memory?.toFixed(1)}% RAM
            </div>
          </div>
        </div>
      )
    }
    
    // Table View (default)
    return (
      <tr key={`${service.name}-${index}`} className="group hover:bg-blue-50/30 dark:hover:bg-blue-950/10 transition-colors">
        <td className="px-6 py-3 border-b border-zinc-200/50 dark:border-zinc-700/50">
          <ServiceTooltip service={service}>
            <div className="cursor-help">
              <div className="text-sm font-medium text-zinc-900 dark:text-white">
                {getServiceDisplayName(service.name)}
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                {service.name}
              </div>
            </div>
          </ServiceTooltip>
        </td>
        <td className="px-6 py-3 border-b border-zinc-200/50 dark:border-zinc-700/50">
          <StatusTooltip service={service}>
            <div className="flex items-center cursor-help">
              <div className={`h-2 w-2 rounded-full mr-2 ${
                healthStatus === 'healthy' ? 'bg-green-500' :
                healthStatus === 'unhealthy' ? 'bg-red-500' :
                healthStatus === 'stopped' ? 'bg-gray-500' :
                'bg-yellow-500'
              }`} />
              <span className={`text-sm capitalize ${
                healthStatus === 'healthy' ? 'text-green-600 dark:text-green-400' :
                healthStatus === 'unhealthy' ? 'text-red-600 dark:text-red-400' :
                healthStatus === 'stopped' ? 'text-gray-600 dark:text-gray-400' :
                'text-yellow-600 dark:text-yellow-400'
              }`}>
                {healthStatus}
                {uptime && (
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 ml-2">
                    ({uptime})
                  </span>
                )}
              </span>
            </div>
          </StatusTooltip>
        </td>
        <td className="px-6 py-3 border-b border-zinc-200/50 dark:border-zinc-700/50">
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            {service.ports && service.ports.length > 0 ? (
              <span className="font-mono">{service.ports.join(', ')}</span>
            ) : (
              <span className="text-zinc-400 dark:text-zinc-500">-</span>
            )}
          </div>
        </td>
        <td className="px-6 py-3 border-b border-zinc-200/50 dark:border-zinc-700/50">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Cpu className="h-3 w-3 mr-1 text-zinc-400" />
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                {service.cpu?.toFixed(1) || '0.0'}%
              </span>
            </div>
            <div className="flex items-center">
              <MemoryStick className="h-3 w-3 mr-1 text-zinc-400" />
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                {service.memory?.toFixed(1) || '0.0'}%
              </span>
            </div>
          </div>
        </td>
        <td className="px-6 py-3 border-b border-zinc-200/50 dark:border-zinc-700/50">
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            {service.restartCount || 0} restarts
          </div>
        </td>
      </tr>
    )
  }
  
  return (
    <div className="mb-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Container Services
        </h2>
        
        {/* View Mode Toggle */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded ${viewMode === 'table' ? 'bg-white dark:bg-zinc-700 shadow-sm' : ''} transition-all`}
              title="Table View"
            >
              <Table2 className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white dark:bg-zinc-700 shadow-sm' : ''} transition-all`}
              title="List View"
            >
              <List className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded ${viewMode === 'cards' ? 'bg-white dark:bg-zinc-700 shadow-sm' : ''} transition-all`}
              title="Card View"
            >
              <Grid3x3 className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
            </button>
          </div>
          
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-1.5 text-sm border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 text-sm border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          >
            <option value="all">All Status</option>
            <option value="healthy">Healthy</option>
            <option value="running">Running</option>
            <option value="stopped">Stopped</option>
            <option value="unhealthy">Unhealthy</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 text-sm border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          >
            <option value="default">Sort by Default</option>
            <option value="name">Sort by Name</option>
            <option value="status">Sort by Status</option>
            <option value="cpu">Sort by CPU</option>
            <option value="memory">Sort by Memory</option>
          </select>
        </div>
      </div>
      
      {/* Render based on view mode */}
      {viewMode === 'cards' ? (
        <div>
          {filteredRequired.length > 0 && (
            <>
              <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">
                Required Services
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
                {filteredRequired.map((service, index) => renderServiceRow(service, index))}
              </div>
            </>
          )}
          
          {filteredOptional.length > 0 && (
            <>
              <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">
                Optional Services
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
                {filteredOptional.map((service, index) => renderServiceRow(service, index))}
              </div>
            </>
          )}
          
          {filteredUser.length > 0 && (
            <>
              <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">
                User Services
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredUser.map((service, index) => renderServiceRow(service, index))}
              </div>
            </>
          )}
        </div>
      ) : viewMode === 'list' ? (
        <div className="bg-white dark:bg-zinc-900/30 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700">
          {filteredRequired.length > 0 && (
            <>
              <div className="px-6 py-2 border-b border-zinc-200/50 dark:border-zinc-700/30">
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Required Services
                </span>
              </div>
              {filteredRequired.map((service, index) => renderServiceRow(service, index))}
            </>
          )}
          
          {filteredOptional.length > 0 && (
            <>
              <div className="px-6 py-2 border-b border-zinc-200/50 dark:border-zinc-700/30">
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Optional Services
                </span>
              </div>
              {filteredOptional.map((service, index) => renderServiceRow(service, index))}
            </>
          )}
          
          {filteredUser.length > 0 && (
            <>
              <div className="px-6 py-2 border-b border-zinc-200/50 dark:border-zinc-700/30">
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  User Services
                </span>
              </div>
              {filteredUser.map((service, index) => renderServiceRow(service, index))}
            </>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-700">
                <th className="px-6 py-3 text-left text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Ports
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Resources
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Health
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-zinc-900/30">
              {/* Required Services */}
              {filteredRequired.length > 0 && (
                <>
                  <tr>
                    <td colSpan={5} className="px-6 py-2 border-b border-zinc-200/50 dark:border-zinc-700/30">
                      <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                        Required Services
                      </span>
                    </td>
                  </tr>
                  {filteredRequired.map((service, index) => renderServiceRow(service, index))}
                </>
              )}
              
              {/* Optional Services */}
              {filteredOptional.length > 0 && (
                <>
                  <tr>
                    <td colSpan={5} className="px-6 py-2 border-b border-zinc-200/50 dark:border-zinc-700/30">
                      <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                        Optional Services
                      </span>
                    </td>
                  </tr>
                  {filteredOptional.map((service, index) => renderServiceRow(service, index))}
                </>
              )}
              
              {/* User Services */}
              {filteredUser.length > 0 && (
                <>
                  <tr>
                    <td colSpan={5} className="px-6 py-2 border-b border-zinc-200/50 dark:border-zinc-700/30">
                      <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                        User Services
                      </span>
                    </td>
                  </tr>
                  {filteredUser.map((service, index) => renderServiceRow(service, index))}
                </>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function HomePage() {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu: 0,
    memory: 0,
    disk: 0,
    containers: 0,
    memoryTotal: 16,
    diskTotal: 500
  })
  
  const [services, setServices] = useState<ServiceStatus[]>([])
  const [projectInfo, setProjectInfo] = useState<ProjectInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch metrics
        const metricsRes = await fetch('/api/docker/metrics')
        if (metricsRes.ok) {
          const metricsData = await metricsRes.json()
          setMetrics(metricsData)
        }
        
        // Fetch services
        const servicesRes = await fetch('/api/docker/services')
        if (servicesRes.ok) {
          const servicesData = await metricsRes.json()
          setServices(servicesData.services || [])
        } else {
          // If no services are running, get project info
          const projectRes = await fetch('/api/project/info')
          if (projectRes.ok) {
            const projectData = await projectRes.json()
            setProjectInfo(projectData.data)
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [])

  const backendCategories = categorizeBackendServices(services)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Show project info if no services are running
  if (services.length === 0 && projectInfo) {
    return (
      <>
        <HeroPattern />
        <div className="mx-auto max-w-7xl px-6 pt-20 pb-24 sm:pb-32 lg:px-8 lg:pt-24">
          <div className="mb-16">
            <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
              nself Dashboard
            </h1>
            <p className="mt-6 text-base text-zinc-600 dark:text-zinc-400">
              Your backend services are not currently running. Start your services to see system metrics and container status.
            </p>
          </div>
          
          <div className="max-w-sm">
            <ProjectInfoCard projectInfo={projectInfo} />
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <HeroPattern />
      <div className="mx-auto max-w-7xl px-6 pt-20 pb-24 sm:pb-32 lg:px-8 lg:pt-24">
        <div className="mb-16">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
            nself Dashboard
          </h1>
          <p className="mt-6 text-base text-zinc-600 dark:text-zinc-400">
            Monitor and manage your nself backend services and infrastructure.
          </p>
        </div>

        {/* System Metrics Overview */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-8">
            System Metrics
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="CPU Usage"
              value={metrics.cpu}
              unit="%"
              icon={Cpu}
              limit={100}
              color="blue"
            />
            <MetricCard
              title="Memory"
              value={metrics.memory}
              unit="GB"
              icon={MemoryStick}
              limit={metrics.memoryTotal}
              color="green"
            />
            <MetricCard
              title="Storage"
              value={metrics.disk}
              unit="GB"
              icon={HardDrive}
              limit={metrics.diskTotal}
              color="purple"
            />
            <MetricCard
              title="Containers"
              value={metrics.containers}
              icon={Container}
              color="orange"
            />
          </div>
        </div>
        
        {/* Container Status Overview */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-8">
            Container Status
          </h2>
          <div className="not-prose grid grid-cols-2 gap-8 sm:grid-cols-4">
            {/* Running Containers */}
            <div className="group relative rounded-2xl bg-zinc-50 p-6 dark:bg-white/2.5 hover:bg-green-50/50 dark:hover:bg-green-950/20 transition-colors duration-300">
              <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-zinc-900/7.5 group-hover:ring-green-500/20 dark:ring-white/10 dark:group-hover:ring-green-400/30 transition-colors duration-300" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Running</h3>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10 dark:bg-green-400/10 group-hover:bg-green-500/20 dark:group-hover:bg-green-400/20 transition-colors duration-300">
                    <Play className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-bold text-zinc-900 dark:text-white">
                    {services.filter(s => s.status === 'healthy' || s.status === 'running').length}
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Active containers</p>
                </div>
              </div>
            </div>
            
            {/* Healthy */}
            <div className="group relative rounded-2xl bg-zinc-50 p-6 dark:bg-white/2.5 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-colors duration-300">
              <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-zinc-900/7.5 group-hover:ring-blue-500/20 dark:ring-white/10 dark:group-hover:ring-blue-400/30 transition-colors duration-300" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Healthy</h3>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10 dark:bg-blue-400/10 group-hover:bg-blue-500/20 dark:group-hover:bg-blue-400/20 transition-colors duration-300">
                    <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-bold text-zinc-900 dark:text-white">
                    {services.filter(s => s.status === 'healthy').length}
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Passing checks</p>
                </div>
              </div>
            </div>
            
            {/* Stopped */}
            <div className="group relative rounded-2xl bg-zinc-50 p-6 dark:bg-white/2.5 hover:bg-gray-50/50 dark:hover:bg-gray-950/20 transition-colors duration-300">
              <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-zinc-900/7.5 group-hover:ring-gray-500/20 dark:ring-white/10 dark:group-hover:ring-gray-400/30 transition-colors duration-300" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Stopped</h3>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-500/10 dark:bg-gray-400/10 group-hover:bg-gray-500/20 dark:group-hover:bg-gray-400/20 transition-colors duration-300">
                    <Clock className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-bold text-zinc-900 dark:text-white">
                    {services.filter(s => s.status === 'stopped' || s.status === 'exited').length}
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Not running</p>
                </div>
              </div>
            </div>
            
            {/* Unhealthy/Error */}
            <div className="group relative rounded-2xl bg-zinc-50 p-6 dark:bg-white/2.5 hover:bg-red-50/50 dark:hover:bg-red-950/20 transition-colors duration-300">
              <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-zinc-900/7.5 group-hover:ring-red-500/20 dark:ring-white/10 dark:group-hover:ring-red-400/30 transition-colors duration-300" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Unhealthy</h3>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/10 dark:bg-red-400/10 group-hover:bg-red-500/20 dark:group-hover:bg-red-400/20 transition-colors duration-300">
                    <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-bold text-zinc-900 dark:text-white">
                    {services.filter(s => s.status === 'unhealthy' || s.status === 'error').length}
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Need attention</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Backend Stack */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-8">
            Backend Stack
          </h2>
          <div className="not-prose grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <BackendServiceCard
              title="Database"
              services={backendCategories.database}
              icon={Database}
              description="PostgreSQL and data persistence layer"
            />
            <BackendServiceCard
              title="API"
              services={backendCategories.api}
              icon={Globe}
              description="GraphQL and REST API services"
            />
            <BackendServiceCard
              title="Authentication"
              services={backendCategories.authentication}
              icon={Shield}
              description="User management and security"
            />
            <BackendServiceCard
              title="Storage"
              services={backendCategories.storage}
              icon={HardDrive}
              description="Object storage and caching services"
            />
            <BackendServiceCard
              title="Mail"
              services={backendCategories.mail}
              icon={Mail}
              description="Email testing and delivery"
            />
            <BackendServiceCard
              title="Monitoring"
              services={backendCategories.monitoring}
              icon={Eye}
              description="Metrics, logs, and observability"
            />
            <BackendServiceCard
              title="Workers"
              services={backendCategories.workers}
              icon={Briefcase}
              description="Background job processors"
            />
            <BackendServiceCard
              title="Services"
              services={backendCategories.services}
              icon={Terminal}
              description="Custom backend services"
            />
            <BackendServiceCard
              title="Applications"
              services={backendCategories.applications}
              icon={Globe}
              description="Frontend applications"
            />
          </div>
        </div>
        
        {/* Container Services Table */}
        <ContainersTable services={services} />
        
        {/* Guides */}
        <Guides />
        
        {/* Resources */}
        <Resources />
      </div>
    </>
  )
}