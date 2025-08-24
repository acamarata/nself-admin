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
  Package
} from 'lucide-react'
import { GridPattern } from '@/components/GridPattern'


interface SystemMetrics {
  cpu: number
  memory: { used: number; total: number; percentage: number }
  disk: { used: number; total: number; percentage: number }
  network: { rx: number; tx: number }
}

interface DockerMetrics {
  cpu: number
  memory: { used: number; total: number; percentage: number }
  containers: number
  storage: { used: number; total: number }
  network: { rx: number; tx: number }
}

interface ServiceStatus {
  name: string
  status: 'running' | 'stopped' | 'error' | 'healthy' | 'unhealthy'
  health?: string
  uptime?: string
  cpu?: number
  memory?: number
  port?: string
}

interface ProjectInfoCardProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
  pattern: Omit<React.ComponentPropsWithoutRef<typeof GridPattern>, 'width' | 'height' | 'x'>
}

function ProjectInfoIcon({ icon: Icon }: { icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900/5 ring-1 ring-zinc-900/25 backdrop-blur-[2px] transition duration-300 group-hover:bg-white/50 group-hover:ring-zinc-900/25 dark:bg-white/7.5 dark:ring-white/15 dark:group-hover:bg-blue-400/10 dark:group-hover:ring-blue-400">
      <Icon className="h-4 w-4 stroke-zinc-700 transition-colors duration-300 group-hover:stroke-zinc-900 dark:stroke-zinc-400 dark:group-hover:stroke-blue-400" />
    </div>
  )
}

function ProjectInfoPattern({
  mouseX,
  mouseY,
  ...gridProps
}: ProjectInfoCardProps['pattern'] & {
  mouseX: MotionValue<number>
  mouseY: MotionValue<number>
}) {
  let maskImage = useMotionTemplate`radial-gradient(180px at ${mouseX}px ${mouseY}px, white, transparent)`
  let style = { maskImage, WebkitMaskImage: maskImage }

  return (
    <div className="pointer-events-none">
      <div className="absolute inset-0 rounded-2xl mask-[linear-gradient(white,transparent)] transition duration-300 group-hover:opacity-50">
        <GridPattern
          width={72}
          height={56}
          x="50%"
          className="absolute inset-x-0 inset-y-[-30%] h-[160%] w-full skew-y-[-18deg] fill-black/2 stroke-black/5 dark:fill-white/1 dark:stroke-white/2.5"
          {...gridProps}
        />
      </div>
      <motion.div
        className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-50 to-blue-100 opacity-0 transition duration-300 group-hover:opacity-100 dark:from-blue-900/20 dark:to-blue-800/20"
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
          className="absolute inset-x-0 inset-y-[-30%] h-[160%] w-full skew-y-[-18deg] fill-blue-400/50 stroke-blue-500/70 dark:fill-blue-400/10 dark:stroke-blue-400/30"
          {...gridProps}
        />
      </motion.div>
    </div>
  )
}

function ProjectInfoCard({ icon, label, value, pattern }: ProjectInfoCardProps) {
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
      <ProjectInfoPattern {...pattern} mouseX={mouseX} mouseY={mouseY} />
      <div className="absolute inset-0 rounded-2xl ring-1 ring-zinc-900/7.5 ring-inset group-hover:ring-zinc-900/10 dark:ring-white/10 dark:group-hover:ring-white/20" />
      <div className="relative rounded-2xl px-4 pt-12 pb-4 w-full text-center">
        <div className="mx-auto mb-4">
          <ProjectInfoIcon icon={icon} />
        </div>
        <div className="text-sm font-medium text-zinc-900 dark:text-white mb-1">
          {label}
        </div>
        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          {value}
        </div>
      </div>
    </div>
  )
}

// Helper function to get service category
function getServiceCategory(name: string): 'required' | 'optional' | 'user' {
  const lowerName = name.toLowerCase()
  
  // Required services (core stack)
  if (['postgres', 'postgresql', 'database', 'db'].some(n => lowerName.includes(n))) return 'required'
  if (['hasura', 'graphql'].some(n => lowerName.includes(n))) return 'required'
  if (['auth', 'keycloak', 'supabase'].some(n => lowerName.includes(n))) return 'required'
  if (['nginx', 'proxy', 'gateway', 'traefik'].some(n => lowerName.includes(n))) return 'required'
  
  // Optional services (infrastructure) - but NOT user workers
  if (lowerName.includes('bullmq') || lowerName.includes('bull')) return 'user' // BullMQ workers are user services
  if (['minio', 's3'].some(n => lowerName.includes(n))) return 'optional'
  if (lowerName.includes('storage') && !lowerName.includes('minio')) return 'optional'
  if (['mailpit'].some(n => lowerName.includes(n))) return 'optional'
  if (['redis', 'cache', 'memcached'].some(n => lowerName.includes(n))) return 'optional'
  if (['grafana', 'prometheus', 'loki', 'jaeger', 'alertmanager', 'monitoring'].some(n => lowerName.includes(n))) return 'optional'
  if (['kafka', 'rabbitmq', 'nats', 'amqp'].some(n => lowerName.includes(n))) return 'optional'
  if (['elasticsearch', 'elastic', 'kibana', 'logstash'].some(n => lowerName.includes(n))) return 'optional'
  
  // Everything else is user services (including workers)
  return 'user'
}

// Helper to get service order for default sorting
function getServiceDefaultOrder(name: string, category: 'required' | 'optional' | 'user'): number {
  const lowerName = name.toLowerCase()
  
  if (category === 'required') {
    // Required services order
    if (lowerName.includes('postgres')) return 1
    if (lowerName.includes('hasura')) return 2
    if (lowerName.includes('auth')) return 3
    if (lowerName.includes('nginx')) return 4
    return 100
  }
  
  if (category === 'optional') {
    // Optional services order
    if (lowerName.includes('minio')) return 1
    if (lowerName.includes('storage') && !lowerName.includes('minio')) return 2
    if (lowerName.includes('mailpit')) return 3
    if (lowerName.includes('redis')) return 4
    if (lowerName.includes('grafana')) return 5
    if (lowerName.includes('prometheus')) return 6
    if (lowerName.includes('loki')) return 7
    if (lowerName.includes('jaeger')) return 8
    if (lowerName.includes('alertmanager')) return 9
    return 100
  }
  
  // User services order (alphabetical within type)
  if (lowerName.includes('nest')) return 10
  if (lowerName.includes('bull')) return 20
  if (lowerName.includes('go')) return 30
  if (lowerName.includes('py') || lowerName.includes('python')) return 40
  return 100
}

// Helper to get service sort order within optional category
function getOptionalServiceOrder(name: string): number {
  const lowerName = name.toLowerCase()
  
  // Define the preferred order for optional services
  if (lowerName.includes('minio')) return 1
  if (lowerName.includes('storage') && !lowerName.includes('minio')) return 2
  if (lowerName.includes('mailpit') || lowerName.includes('mail')) return 3
  if (lowerName.includes('redis') || lowerName.includes('cache')) return 4
  if (lowerName.includes('grafana')) return 5
  if (lowerName.includes('prometheus')) return 6
  if (lowerName.includes('loki')) return 7
  if (lowerName.includes('jaeger')) return 8
  if (lowerName.includes('alertmanager')) return 9
  
  // Other optional services come after
  return 100
}

// Helper to get service display name
function getServiceDisplayName(name: string): string {
  const lowerName = name.toLowerCase()
  
  // Core services
  if (lowerName.includes('postgres')) return 'PostgreSQL'
  if (lowerName.includes('hasura')) return 'Hasura GraphQL'
  if (lowerName.includes('auth')) return 'Authentication'
  if (lowerName.includes('nginx')) return 'Nginx Proxy'
  
  // Storage services
  if (lowerName.includes('minio')) return 'MinIO Storage'
  if (lowerName.includes('storage') && !lowerName.includes('minio')) return 'Storage Volume'
  
  // Mail service
  if (lowerName.includes('mailpit')) return 'Mailpit'
  if (lowerName.includes('mail') && !lowerName.includes('mailpit')) return 'Mail Service'
  
  // Cache
  if (lowerName.includes('redis')) return 'Redis Cache'
  
  // Monitoring stack
  if (lowerName.includes('grafana')) return 'Grafana'
  if (lowerName.includes('prometheus')) return 'Prometheus'
  if (lowerName.includes('loki')) return 'Loki'
  if (lowerName.includes('jaeger')) return 'Jaeger'
  if (lowerName.includes('alertmanager')) return 'Alert Manager'
  
  // User services
  if (lowerName.includes('nest')) return 'NestJS API'
  if (lowerName.includes('bullmq') || lowerName.includes('bull')) return 'BullMQ Worker'
  if (lowerName.includes('python') || lowerName.includes('py')) return 'Python Service'
  if (lowerName.includes('go') && !lowerName.includes('golang')) return 'Go Service'
  
  // Other infrastructure
  if (lowerName.includes('traefik')) return 'Traefik Proxy'
  if (lowerName.includes('keycloak')) return 'Keycloak Auth'
  if (lowerName.includes('supabase')) return 'Supabase'
  if (lowerName.includes('kafka')) return 'Apache Kafka'
  if (lowerName.includes('rabbitmq')) return 'RabbitMQ'
  if (lowerName.includes('nats')) return 'NATS'
  if (lowerName.includes('elasticsearch') || lowerName.includes('elastic')) return 'Elasticsearch'
  if (lowerName.includes('kibana')) return 'Kibana'
  if (lowerName.includes('logstash')) return 'Logstash'
  
  // Clean up nself_ prefix for display
  let displayName = name.replace(/^nself[_-]/i, '')
  
  // Capitalize first letter of each word
  return displayName
    .split(/[_-]/)
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
    
    return (
      <tr key={`${service.name}-${index}`} className="group hover:bg-blue-50/30 dark:hover:bg-blue-950/10 transition-colors">
        <td className="px-6 py-4 border-b border-zinc-200/50 dark:border-zinc-700/50">
          <div>
            <div className="text-sm font-medium text-zinc-900 dark:text-white">
              {getServiceDisplayName(service.name)}
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {service.name}
            </div>
          </div>
        </td>
        <td className="px-6 py-4 border-b border-zinc-200/50 dark:border-zinc-700/50">
          <div>
            <div className="flex items-center">
              <div className={`h-2 w-2 rounded-full mr-2 ${
                healthStatus === 'healthy' ? 'bg-green-500' :
                healthStatus === 'unhealthy' ? 'bg-red-500' :
                healthStatus === 'stopped' ? 'bg-gray-500' :
                'bg-yellow-500'
              }`} />
              <span className={`text-sm font-medium capitalize ${
                healthStatus === 'healthy' ? 'text-green-600 dark:text-green-400' :
                healthStatus === 'unhealthy' ? 'text-red-600 dark:text-red-400' :
                healthStatus === 'stopped' ? 'text-gray-600 dark:text-gray-400' :
                'text-yellow-600 dark:text-yellow-400'
              }`}>
                {healthStatus}
              </span>
            </div>
            {uptime && (
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 ml-4">
                Up {uptime}
              </div>
            )}
          </div>
        </td>
        <td className="px-6 py-4 border-b border-zinc-200/50 dark:border-zinc-700/50">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-zinc-700 dark:text-zinc-300">
              {service.cpu ? `${service.cpu.toFixed(1)}%` : '0%'}
            </span>
            <div className="w-16 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${Math.min(service.cpu || 0, 100)}%` }}
              />
            </div>
          </div>
        </td>
        <td className="px-6 py-4 border-b border-zinc-200/50 dark:border-zinc-700/50">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-zinc-700 dark:text-zinc-300">
              {service.memory ? `${service.memory.toFixed(1)}%` : '0%'}
            </span>
            <div className="w-16 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${Math.min(service.memory || 0, 100)}%` }}
              />
            </div>
          </div>
        </td>
        <td className="px-6 py-4 border-b border-zinc-200/50 dark:border-zinc-700/50">
          {service.port ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
              {service.port}
            </span>
          ) : (
            <span className="text-sm text-zinc-400 dark:text-zinc-500">-</span>
          )}
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
      
      <div className="not-prose overflow-hidden rounded-2xl bg-white dark:bg-zinc-900/50 ring-1 ring-zinc-200 dark:ring-zinc-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Service / Container
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Status / Uptime
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  CPU Usage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Memory
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Port
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
              
              {services.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
                    No containers found. Start your nself services to see them here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

interface BackendServiceCardProps {
  title: string
  services: ServiceStatus[]
  icon: React.ComponentType<{ className?: string }>
  description: string
  color: 'blue' | 'emerald' | 'purple' | 'red' | 'orange' | 'violet'
}

function BackendServiceCard({ title, services, icon: Icon, description, color }: BackendServiceCardProps) {
  const runningCount = services.filter(s => s.status === 'healthy' || s.status === 'running').length
  const totalCount = services.length
  const isHealthy = runningCount === totalCount && totalCount > 0
  
  const colorClasses = {
    blue: {
      bg: 'hover:bg-blue-50/50 dark:hover:bg-blue-950/20',
      ring: 'group-hover:ring-blue-500/20 dark:group-hover:ring-blue-400/30',
      icon: 'bg-blue-500/10 dark:bg-blue-400/10 group-hover:bg-blue-500/20 dark:group-hover:bg-blue-400/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
      status: isHealthy ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'
    },
    emerald: {
      bg: 'hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20',
      ring: 'group-hover:ring-emerald-500/20 dark:group-hover:ring-emerald-400/30',
      icon: 'bg-emerald-500/10 dark:bg-emerald-400/10 group-hover:bg-emerald-500/20 dark:group-hover:bg-emerald-400/20',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      status: isHealthy ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
    },
    purple: {
      bg: 'hover:bg-purple-50/50 dark:hover:bg-purple-950/20',
      ring: 'group-hover:ring-purple-500/20 dark:group-hover:ring-purple-400/30',
      icon: 'bg-purple-500/10 dark:bg-purple-400/10 group-hover:bg-purple-500/20 dark:group-hover:bg-purple-400/20',
      iconColor: 'text-purple-600 dark:text-purple-400',
      status: isHealthy ? 'text-purple-600 dark:text-purple-400' : 'text-red-600 dark:text-red-400'
    },
    red: {
      bg: 'hover:bg-red-50/50 dark:hover:bg-red-950/20',
      ring: 'group-hover:ring-red-500/20 dark:group-hover:ring-red-400/30',
      icon: 'bg-red-500/10 dark:bg-red-400/10 group-hover:bg-red-500/20 dark:group-hover:bg-red-400/20',
      iconColor: 'text-red-600 dark:text-red-400',
      status: isHealthy ? 'text-red-600 dark:text-red-400' : 'text-red-600 dark:text-red-400'
    },
    orange: {
      bg: 'hover:bg-orange-50/50 dark:hover:bg-orange-950/20',
      ring: 'group-hover:ring-orange-500/20 dark:group-hover:ring-orange-400/30',
      icon: 'bg-orange-500/10 dark:bg-orange-400/10 group-hover:bg-orange-500/20 dark:group-hover:bg-orange-400/20',
      iconColor: 'text-orange-600 dark:text-orange-400',
      status: isHealthy ? 'text-orange-600 dark:text-orange-400' : 'text-red-600 dark:text-red-400'
    },
    violet: {
      bg: 'hover:bg-violet-50/50 dark:hover:bg-violet-950/20',
      ring: 'group-hover:ring-violet-500/20 dark:group-hover:ring-violet-400/30',
      icon: 'bg-violet-500/10 dark:bg-violet-400/10 group-hover:bg-violet-500/20 dark:group-hover:bg-violet-400/20',
      iconColor: 'text-violet-600 dark:text-violet-400',
      status: isHealthy ? 'text-violet-600 dark:text-violet-400' : 'text-red-600 dark:text-red-400'
    }
  }

  const classes = colorClasses[color]

  return (
    <div className={`group relative rounded-2xl bg-zinc-50 p-6 dark:bg-white/2.5 transition-colors duration-300 ${classes.bg}`}>
      <div className={`absolute inset-0 rounded-2xl ring-1 ring-zinc-900/7.5 ring-inset dark:ring-white/10 transition-colors duration-300 ${classes.ring}`} />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-300 ${classes.icon}`}>
            <Icon className={`h-4 w-4 ${classes.iconColor}`} />
          </div>
          <div className={`text-lg font-bold ${classes.status}`}>
            {totalCount > 0 ? `${runningCount}/${totalCount}` : '0'}
          </div>
        </div>
        
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-2">
          {title}
        </h3>
        
        <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-4">
          {description}
        </p>
        
        {services.length > 0 && (
          <div className="space-y-1">
            {services.slice(0, 3).map((service, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <span className="text-zinc-700 dark:text-zinc-300 truncate">
                  {service.name}
                </span>
                <div className="flex items-center">
                  <div className={`h-1.5 w-1.5 rounded-full mr-1 ${
                    service.status === 'healthy' || service.status === 'running' 
                      ? 'bg-green-500' 
                      : service.status === 'stopped' 
                        ? 'bg-gray-500' 
                        : 'bg-red-500'
                  }`} />
                  <span className="text-zinc-500 dark:text-zinc-400 capitalize text-xs">
                    {service.status === 'healthy' ? 'up' : service.status}
                  </span>
                </div>
              </div>
            ))}
            {services.length > 3 && (
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                +{services.length - 3} more
              </div>
            )}
          </div>
        )}
        
        {services.length === 0 && (
          <div className="text-xs text-zinc-500 dark:text-zinc-400 italic">
            No services detected
          </div>
        )}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null)
  const [dockerMetrics, setDockerMetrics] = useState<DockerMetrics | null>(null)
  const [services, setServices] = useState<ServiceStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    try {
      setRefreshing(true)

      // Silent project status check
      try {
        const projectRes = await fetch('/api/project/status')
        const projectData = await projectRes.json()
        if (projectData.success && projectData.needsSetup) {
          localStorage.removeItem('nself_project_setup_confirmed')
          window.location.href = '/setup'
          return
        }
      } catch (error) {
        console.error('Silent project status check failed:', error)
      }

      // Fetch system metrics
      const metricsRes = await fetch('/api/system/metrics')
      const metricsData = await metricsRes.json()
      if (metricsData.success) {
        setSystemMetrics(metricsData.data.system)
        setDockerMetrics(metricsData.data.docker)
      }

      // Fetch container status
      const containersRes = await fetch('/api/docker/containers')
      const containersData = await containersRes.json()
      if (containersData.success) {
        const serviceList = containersData.data.containers.map((c: any) => ({
          name: c.name || 'unknown',
          status: c.state === 'running' ? 'healthy' : 'stopped',
          health: c.status,
          cpu: c.stats?.cpu?.percentage || 0,
          memory: c.stats?.memory?.percentage || 0,
          port: c.ports?.[0]?.public
        }))
        setServices(serviceList)
      }

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
    const interval = setInterval(fetchDashboardData, 10000)
    return () => clearInterval(interval)
  }, [])

  const runningServices = services.filter(s => s.status === 'healthy' || s.status === 'running').length
  const totalServices = services.length
  const hasRunningServices = runningServices > 0

  const [starting, setStarting] = useState(false)
  const [projectInfo, setProjectInfo] = useState<any>(null)

  // Fetch project info when no services are running
  useEffect(() => {
    if (!hasRunningServices && !loading) {
      fetchProjectInfo()
    }
  }, [hasRunningServices, loading])

  const fetchProjectInfo = async () => {
    try {
      const res = await fetch('/api/project/info')
      const data = await res.json()
      if (data.success) {
        setProjectInfo(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch project info:', error)
    }
  }

  const startServices = async () => {
    try {
      setStarting(true)
      const res = await fetch('/api/nself/start', { method: 'POST' })
      const data = await res.json()
      
      if (data.success) {
        // Wait a moment then refresh to see the started services
        setTimeout(() => {
          fetchDashboardData()
        }, 3000)
      } else {
        console.error('Failed to start services:', data.error)
      }
    } catch (error) {
      console.error('Failed to start services:', error)
    } finally {
      setStarting(false)
    }
  }

  if (loading) {
    return (
      <>
        <HeroPattern />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </>
    )
  }

  return (
    <>
      <HeroPattern />

      {/* Hero Section */}
      <div className="mb-16">
        <h1 className="text-4xl/tight font-extrabold bg-gradient-to-r from-blue-600 to-black bg-clip-text text-transparent sm:text-6xl/tight dark:from-blue-400 dark:to-white">
          Dashboard
        </h1>
      </div>

      {!hasRunningServices ? (
        /* Empty State - No Services Running */
        <div className="mb-16">
          <div className="group relative rounded-2xl bg-zinc-50 p-8 dark:bg-white/2.5">
            <div className="absolute inset-0 rounded-2xl ring-1 ring-zinc-900/7.5 ring-inset group-hover:ring-zinc-900/10 dark:ring-white/10 dark:group-hover:ring-white/20" />
            <div className="relative text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center dark:bg-blue-500/10">
                <div className="h-6 w-6 rounded-full bg-blue-500" />
              </div>
              <h2 className="mt-4 text-xl font-semibold text-zinc-900 dark:text-white">
                Services Not Running
              </h2>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
                Your nself project is configured but services are not currently running. 
                {projectInfo?.projectName && ` Project: ${projectInfo.projectName}`}
              </p>
              
              {projectInfo && (
                <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3 max-w-3xl mx-auto">
                  <ProjectInfoCard
                    icon={Server}
                    label="Services"
                    value={projectInfo.services?.length || 0}
                    pattern={{
                      y: 16,
                      squares: [[0, 1], [1, 3]]
                    }}
                  />
                  <ProjectInfoCard
                    icon={Database}
                    label="Database"
                    value={projectInfo.database || 'PostgreSQL'}
                    pattern={{
                      y: -6,
                      squares: [[-1, 2], [1, 3]]
                    }}
                  />
                  <ProjectInfoCard
                    icon={CheckCircle}
                    label="Status"
                    value="Built"
                    pattern={{
                      y: 22,
                      squares: [[0, 1]]
                    }}
                  />
                </div>
              )}

              <div className="mt-8">
                <Button 
                  onClick={startServices}
                  variant="solid"
                  disabled={starting}
                  className="px-8 py-3"
                >
                  {starting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Starting Services...
                    </>
                  ) : (
                    'Start Services'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Running Services Dashboard */
        <>
          {/* System Overview Cards */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-8">
              System Overview
            </h2>
            <div className="not-prose grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-4">
              {/* Docker CPU Usage */}
              <div className="group relative rounded-2xl bg-zinc-50 p-6 dark:bg-white/2.5 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-colors duration-300">
                <div className="absolute inset-0 rounded-2xl ring-1 ring-zinc-900/7.5 ring-inset group-hover:ring-blue-500/20 dark:ring-white/10 dark:group-hover:ring-blue-400/30 transition-colors duration-300" />
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Docker CPU</h3>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10 dark:bg-blue-400/10 group-hover:bg-blue-500/20 dark:group-hover:bg-blue-400/20 transition-colors duration-300">
                      <Cpu className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-2xl font-bold text-zinc-900 dark:text-white">
                      {dockerMetrics?.cpu || 0}%
                    </div>
                    <div className="mt-2 h-2 bg-zinc-200 rounded-full dark:bg-zinc-800">
                      <div 
                        className="h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300"
                        style={{ width: `${dockerMetrics?.cpu || 0}%` }}
                      />
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                    System: {systemMetrics?.cpu || 0}%
                  </p>
                </div>
              </div>

              {/* Docker Memory Usage */}
              <div className="group relative rounded-2xl bg-zinc-50 p-6 dark:bg-white/2.5 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-colors duration-300">
                <div className="absolute inset-0 rounded-2xl ring-1 ring-zinc-900/7.5 ring-inset group-hover:ring-blue-500/20 dark:ring-white/10 dark:group-hover:ring-blue-400/30 transition-colors duration-300" />
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Docker RAM</h3>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10 dark:bg-blue-400/10 group-hover:bg-blue-500/20 dark:group-hover:bg-blue-400/20 transition-colors duration-300">
                      <MemoryStick className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-2xl font-bold text-zinc-900 dark:text-white">
                      {Math.round((dockerMetrics?.memory.used || 0) / (systemMetrics?.memory.total || 1) * 100) || 0}%
                    </div>
                    <div className="mt-2 h-2 bg-zinc-200 rounded-full dark:bg-zinc-800">
                      <div 
                        className="h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300"
                        style={{ width: `${Math.round((dockerMetrics?.memory.used || 0) / (systemMetrics?.memory.total || 1) * 100) || 0}%` }}
                      />
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                    {dockerMetrics?.memory.used || 0}GB / {systemMetrics?.memory.total || 0}GB
                  </p>
                </div>
              </div>

              {/* Docker Storage */}
              <div className="group relative rounded-2xl bg-zinc-50 p-6 dark:bg-white/2.5 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-colors duration-300">
                <div className="absolute inset-0 rounded-2xl ring-1 ring-zinc-900/7.5 ring-inset group-hover:ring-blue-500/20 dark:ring-white/10 dark:group-hover:ring-blue-400/30 transition-colors duration-300" />
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Docker Storage</h3>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10 dark:bg-blue-400/10 group-hover:bg-blue-500/20 dark:group-hover:bg-blue-400/20 transition-colors duration-300">
                      <HardDrive className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-2xl font-bold text-zinc-900 dark:text-white">
                      {Math.round((dockerMetrics?.storage.used || 0) / (systemMetrics?.disk.total || 1) * 100) || 0}%
                    </div>
                    <div className="mt-2 h-2 bg-zinc-200 rounded-full dark:bg-zinc-800">
                      <div 
                        className="h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300"
                        style={{ width: `${Math.round((dockerMetrics?.storage.used || 0) / (systemMetrics?.disk.total || 1) * 100) || 0}%` }}
                      />
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                    {dockerMetrics?.storage.used || 0}GB / {systemMetrics?.disk.total || 0}GB
                  </p>
                </div>
              </div>

              {/* Docker Network */}
              <div className="group relative rounded-2xl bg-zinc-50 p-6 dark:bg-white/2.5 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-colors duration-300">
                <div className="absolute inset-0 rounded-2xl ring-1 ring-zinc-900/7.5 ring-inset group-hover:ring-blue-500/20 dark:ring-white/10 dark:group-hover:ring-blue-400/30 transition-colors duration-300" />
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Network I/O</h3>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10 dark:bg-blue-400/10 group-hover:bg-blue-500/20 dark:group-hover:bg-blue-400/20 transition-colors duration-300">
                      <Network className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-xl font-bold text-zinc-900 dark:text-white">
                      ↓{dockerMetrics?.network?.rx || 0}MB
                    </div>
                    <div className="text-xl font-bold text-zinc-900 dark:text-white">
                      ↑{dockerMetrics?.network?.tx || 0}MB
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                    RX / TX data transfer
                  </p>
                </div>
              </div>
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
                <div className="absolute inset-0 rounded-2xl ring-1 ring-zinc-900/7.5 ring-inset group-hover:ring-green-500/20 dark:ring-white/10 dark:group-hover:ring-green-400/30 transition-colors duration-300" />
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
                  </div>
                </div>
              </div>

              {/* Healthy Containers */}
              <div className="group relative rounded-2xl bg-zinc-50 p-6 dark:bg-white/2.5 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-colors duration-300">
                <div className="absolute inset-0 rounded-2xl ring-1 ring-zinc-900/7.5 ring-inset group-hover:ring-blue-500/20 dark:ring-white/10 dark:group-hover:ring-blue-400/30 transition-colors duration-300" />
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
                  </div>
                </div>
              </div>

              {/* Stopped Containers */}
              <div className="group relative rounded-2xl bg-zinc-50 p-6 dark:bg-white/2.5 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/20 transition-colors duration-300">
                <div className="absolute inset-0 rounded-2xl ring-1 ring-zinc-900/7.5 ring-inset group-hover:ring-zinc-500/20 dark:ring-white/10 dark:group-hover:ring-zinc-400/30 transition-colors duration-300" />
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Stopped</h3>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-500/10 dark:bg-zinc-400/10 group-hover:bg-zinc-500/20 dark:group-hover:bg-zinc-400/20 transition-colors duration-300">
                      <Clock className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-2xl font-bold text-zinc-900 dark:text-white">
                      {services.filter(s => s.status === 'stopped').length}
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Containers */}
              <div className="group relative rounded-2xl bg-zinc-50 p-6 dark:bg-white/2.5 hover:bg-red-50/50 dark:hover:bg-red-950/20 transition-colors duration-300">
                <div className="absolute inset-0 rounded-2xl ring-1 ring-zinc-900/7.5 ring-inset group-hover:ring-red-500/20 dark:ring-white/10 dark:group-hover:ring-red-400/30 transition-colors duration-300" />
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Error</h3>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/10 dark:bg-red-400/10 group-hover:bg-red-500/20 dark:group-hover:bg-red-400/20 transition-colors duration-300">
                      <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-2xl font-bold text-zinc-900 dark:text-white">
                      {services.filter(s => s.status === 'error' || s.status === 'unhealthy').length}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Backend Stack Overview */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-8">
              Backend Stack
            </h2>
            <div className="not-prose grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Database Services */}
              <BackendServiceCard
                title="Database Layer"
                services={services.filter(s => 
                  ['postgres', 'postgresql', 'database', 'db'].some(name => 
                    s.name.toLowerCase().includes(name)
                  )
                )}
                icon={Database}
                description="PostgreSQL database with backup & replication"
                color="blue"
              />
              
              {/* API & GraphQL */}
              <BackendServiceCard
                title="API Gateway"
                services={services.filter(s => 
                  ['hasura', 'graphql', 'api', 'gateway', 'nginx'].some(name => 
                    s.name.toLowerCase().includes(name)
                  )
                )}
                icon={Globe}
                description="Hasura GraphQL Engine with API gateway"
                color="emerald"
              />
              
              {/* Authentication */}
              <BackendServiceCard
                title="Authentication"
                services={services.filter(s => 
                  ['auth', 'jwt', 'oauth', 'keycloak', 'supabase'].some(name => 
                    s.name.toLowerCase().includes(name)
                  )
                )}
                icon={Lock}
                description="JWT-based auth with session management"
                color="purple"
              />
              
              {/* Cache & Redis */}
              <BackendServiceCard
                title="Cache Layer"
                services={services.filter(s => 
                  ['redis', 'cache', 'memcached'].some(name => 
                    s.name.toLowerCase().includes(name)
                  )
                )}
                icon={Zap}
                description="Redis caching and session store"
                color="red"
              />
              
              {/* Message Queue */}
              <BackendServiceCard
                title="Queue System"
                services={services.filter(s => 
                  ['bullmq', 'queue', 'worker', 'job', 'bull'].some(name => 
                    s.name.toLowerCase().includes(name)
                  )
                )}
                icon={Truck}
                description="BullMQ job processing and queues"
                color="orange"
              />
              
              {/* Application Services */}
              <BackendServiceCard
                title="Applications"
                services={services.filter(s => 
                  ['nest', 'fastapi', 'go', 'node', 'api', 'app'].some(name => 
                    s.name.toLowerCase().includes(name) && 
                    !['postgres', 'redis', 'hasura', 'nginx', 'auth'].some(exclude => 
                      s.name.toLowerCase().includes(exclude)
                    )
                  )
                )}
                icon={Code}
                description="Custom application services & functions"
                color="violet"
              />
            </div>
          </div>

          {/* Containers Table */}
          <ContainersTable services={services} />
        </>
      )}

      <Guides />

      <Resources />
    </>
  )
}