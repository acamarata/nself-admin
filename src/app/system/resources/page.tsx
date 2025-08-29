'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/Button'
import { HeroPattern } from '@/components/HeroPattern'
import { 
  Cpu, HardDrive, Activity, Network, MemoryStick, Gauge, 
  RefreshCw, Settings, Zap, AlertTriangle, TrendingUp,
  TrendingDown, Server, Database, Clock, Eye, Square,
  Play, RotateCw, Trash2, Plus, Search, Filter,
  ChevronDown, ChevronUp, ExternalLink, Download,
  Bell, AlertCircle, CheckCircle, Info, X,
  BarChart3, LineChart, PieChart, MonitorSpeaker,
  Loader2, Thermometer, Battery, Wifi, Container
} from 'lucide-react'

interface SystemMetrics {
  cpu: {
    usage: number
    cores: number
    temperature?: number
    frequency: number
    processes: number
  }
  memory: {
    total: number
    used: number
    free: number
    cached: number
    buffers: number
    usage: number
  }
  disk: {
    total: number
    used: number
    free: number
    usage: number
    disks: DiskInfo[]
  }
  network: {
    bytesIn: number
    bytesOut: number
    packetsIn: number
    packetsOut: number
    interfaces: NetworkInterface[]
  }
  containers: ContainerResource[]
  processes: ProcessInfo[]
  uptime: number
  loadAverage: number[]
}

interface DiskInfo {
  device: string
  mountpoint: string
  filesystem: string
  size: number
  used: number
  available: number
  usage: number
}

interface NetworkInterface {
  name: string
  bytesIn: number
  bytesOut: number
  packetsIn: number
  packetsOut: number
  speed: number
  status: 'up' | 'down'
}

interface ContainerResource {
  id: string
  name: string
  image: string
  cpuUsage: number
  memoryUsage: number
  memoryLimit: number
  networkIn: number
  networkOut: number
  diskRead: number
  diskWrite: number
  status: 'running' | 'stopped' | 'paused'
}

interface ProcessInfo {
  pid: number
  name: string
  user: string
  cpuUsage: number
  memoryUsage: number
  status: string
  runtime: number
  command: string
}

interface ResourceAlert {
  id: string
  type: 'cpu' | 'memory' | 'disk' | 'network'
  threshold: number
  condition: 'above' | 'below'
  enabled: boolean
  notification: 'email' | 'webhook' | 'both'
  lastTriggered?: string
}

function MetricsCard({ 
  title, 
  value, 
  unit, 
  percentage, 
  trend, 
  icon: Icon,
  color = 'blue',
  details = []
}: {
  title: string
  value: string | number
  unit?: string
  percentage?: number
  trend?: 'up' | 'down' | 'stable'
  icon: any
  color?: 'blue' | 'green' | 'red' | 'yellow'
  details?: string[]
}) {
  const colorClasses = {
    blue: 'text-blue-500',
    green: 'text-green-500',
    red: 'text-red-500',
    yellow: 'text-yellow-500'
  }
  
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Activity
  
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Icon className={`w-5 h-5 ${colorClasses[color]}`} />
            <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{title}</h3>
          </div>
          
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-2xl font-bold text-zinc-900 dark:text-white">
              {value}
            </span>
            {unit && (
              <span className="text-sm text-zinc-500">{unit}</span>
            )}
          </div>
          
          {percentage !== undefined && (
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
                <span>Usage</span>
                <span>{percentage.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all ${
                    percentage > 90 ? 'bg-red-500' :
                    percentage > 70 ? 'bg-yellow-500' : 
                    'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
            </div>
          )}
          
          {details.length > 0 && (
            <div className="space-y-1">
              {details.map((detail, i) => (
                <div key={i} className="text-xs text-zinc-500">{detail}</div>
              ))}
            </div>
          )}
        </div>
        
        {trend && (
          <div className={`flex items-center gap-1 ${
            trend === 'up' ? 'text-red-500' : 
            trend === 'down' ? 'text-green-500' : 
            'text-zinc-500'
          }`}>
            <TrendIcon className="w-4 h-4" />
          </div>
        )}
      </div>
    </div>
  )
}

function ResourceChart({ 
  title, 
  data, 
  type = 'line',
  height = 200 
}: { 
  title: string
  data: Array<{ timestamp: string; value: number }>
  type?: 'line' | 'bar' | 'area'
  height?: number 
}) {
  // This would integrate with a charting library like Chart.js or Recharts
  // For now, showing a placeholder
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">{title}</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="text-xs">
            <Download className="w-3 h-3 mr-1" />
            Export
          </Button>
          <select className="px-2 py-1 text-xs rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800">
            <option>Last Hour</option>
            <option>Last 6 Hours</option>
            <option>Last 24 Hours</option>
            <option>Last Week</option>
          </select>
        </div>
      </div>
      
      <div 
        className="bg-zinc-50 dark:bg-zinc-900/50 rounded-lg flex items-center justify-center"
        style={{ height: `${height}px` }}
      >
        <div className="text-center text-zinc-500">
          <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Interactive Chart Placeholder</p>
          <p className="text-xs">({data.length} data points)</p>
        </div>
      </div>
    </div>
  )
}

function DiskUsageBreakdown({ disks }: { disks: DiskInfo[] }) {
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Disk Usage</h3>
      
      <div className="space-y-4">
        {disks.map((disk, index) => (
          <div key={index} className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-zinc-500" />
                <span className="font-medium text-zinc-900 dark:text-white">{disk.device}</span>
                <span className="text-sm text-zinc-500">({disk.filesystem})</span>
              </div>
              <span className="text-sm text-zinc-500">{disk.mountpoint}</span>
            </div>
            
            <div className="flex items-center justify-between text-sm text-zinc-600 dark:text-zinc-400 mb-2">
              <span>
                {(disk.used / (1024**3)).toFixed(1)} GB / {(disk.size / (1024**3)).toFixed(1)} GB
              </span>
              <span>{disk.usage.toFixed(1)}% used</span>
            </div>
            
            <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all ${
                  disk.usage > 90 ? 'bg-red-500' :
                  disk.usage > 70 ? 'bg-yellow-500' : 
                  'bg-green-500'
                }`}
                style={{ width: `${Math.min(disk.usage, 100)}%` }}
              />
            </div>
            
            <div className="text-xs text-zinc-500 mt-2">
              Available: {(disk.available / (1024**3)).toFixed(1)} GB
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProcessManager({ processes, onProcessAction }: { 
  processes: ProcessInfo[]
  onProcessAction: (action: string, pid: number) => void 
}) {
  const [sortBy, setSortBy] = useState<'cpu' | 'memory' | 'name'>('cpu')
  const [filterUser, setFilterUser] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  
  const users = ['all', ...Array.from(new Set(processes.map(p => p.user)))]
  
  const filteredProcesses = processes
    .filter(process => {
      if (filterUser !== 'all' && process.user !== filterUser) return false
      if (searchQuery && !process.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !process.command.toLowerCase().includes(searchQuery.toLowerCase())) return false
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'cpu': return b.cpuUsage - a.cpuUsage
        case 'memory': return b.memoryUsage - a.memoryUsage
        case 'name': return a.name.localeCompare(b.name)
        default: return 0
      }
    })
    .slice(0, 20) // Top 20 processes
  
  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }
  
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Process Manager</h3>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="text-xs">
              <RefreshCw className="w-3 h-3 mr-1" />
              Refresh
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search processes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm"
            />
          </div>
          
          <select
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            className="px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm"
          >
            {users.map(user => (
              <option key={user} value={user}>
                {user === 'all' ? 'All Users' : user}
              </option>
            ))}
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'cpu' | 'memory' | 'name')}
            className="px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm"
          >
            <option value="cpu">Sort by CPU</option>
            <option value="memory">Sort by Memory</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-zinc-50 dark:bg-zinc-900/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">PID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Process</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">User</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">CPU %</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Memory</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Runtime</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
            {filteredProcesses.map(process => (
              <tr key={process.pid} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                <td className="px-4 py-3 text-sm font-mono text-zinc-900 dark:text-white">
                  {process.pid}
                </td>
                <td className="px-4 py-3">
                  <div>
                    <div className="text-sm font-medium text-zinc-900 dark:text-white">
                      {process.name}
                    </div>
                    <div className="text-xs text-zinc-500 font-mono truncate max-w-xs">
                      {process.command}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                  {process.user}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {process.cpuUsage.toFixed(1)}%
                    </span>
                    <div className="w-16 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all ${
                          process.cpuUsage > 50 ? 'bg-red-500' :
                          process.cpuUsage > 20 ? 'bg-yellow-500' : 
                          'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(process.cpuUsage, 100)}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                  {(process.memoryUsage / (1024**2)).toFixed(1)} MB
                </td>
                <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                  {formatUptime(process.runtime)}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    process.status === 'running' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                    process.status === 'sleeping' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                  }`}>
                    {process.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onProcessAction('restart', process.pid)}
                      className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700"
                     
                    >
                      <RotateCw className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onProcessAction('kill', process.pid)}
                      className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600"
                     
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ContainerResourceAllocation({ containers }: { containers: ContainerResource[] }) {
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-700">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Container Resource Allocation</h3>
      </div>
      
      <div className="p-6">
        <div className="grid gap-4">
          {containers.map(container => (
            <div key={container.id} className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium text-zinc-900 dark:text-white">{container.name}</h4>
                  <p className="text-sm text-zinc-500 font-mono">{container.image}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  container.status === 'running' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                  container.status === 'stopped' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                }`}>
                  {container.status}
                </span>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
                    <span>CPU</span>
                    <span>{container.cpuUsage.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all"
                      style={{ width: `${Math.min(container.cpuUsage, 100)}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
                    <span>Memory</span>
                    <span>{((container.memoryUsage / container.memoryLimit) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 transition-all"
                      style={{ width: `${Math.min((container.memoryUsage / container.memoryLimit) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-zinc-500 mt-1">
                    {(container.memoryUsage / (1024**2)).toFixed(1)} MB / {(container.memoryLimit / (1024**2)).toFixed(1)} MB
                  </div>
                </div>
                
                <div>
                  <div className="text-xs text-zinc-500 mb-1">Network I/O</div>
                  <div className="text-xs">
                    <div className="text-green-600">↓ {(container.networkIn / (1024**2)).toFixed(1)} MB</div>
                    <div className="text-blue-600">↑ {(container.networkOut / (1024**2)).toFixed(1)} MB</div>
                  </div>
                </div>
                
                <div>
                  <div className="text-xs text-zinc-500 mb-1">Disk I/O</div>
                  <div className="text-xs">
                    <div className="text-green-600">Read: {(container.diskRead / (1024**2)).toFixed(1)} MB</div>
                    <div className="text-red-600">Write: {(container.diskWrite / (1024**2)).toFixed(1)} MB</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ResourceAlerts({ alerts, onAlertUpdate }: { 
  alerts: ResourceAlert[]
  onAlertUpdate: (alert: ResourceAlert) => void 
}) {
  const [isCreating, setIsCreating] = useState(false)
  
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Resource Alerts</h3>
          <Button onClick={() => setIsCreating(true)} className="text-sm">
            <Plus className="w-4 h-4 mr-1" />
            Add Alert
          </Button>
        </div>
      </div>
      
      <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
        {alerts.map(alert => (
          <div key={alert.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-medium text-zinc-900 dark:text-white">
                    {alert.type.toUpperCase()} Alert
                  </h4>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    alert.enabled 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                  }`}>
                    {alert.enabled ? 'Active' : 'Disabled'}
                  </span>
                </div>
                
                <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                  Trigger when {alert.type} usage is {alert.condition} {alert.threshold}%
                </div>
                
                <div className="flex items-center gap-4 text-xs text-zinc-500">
                  <span>Notification: {alert.notification}</span>
                  {alert.lastTriggered && (
                    <span>Last triggered: {new Date(alert.lastTriggered).toLocaleString()}</span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                <Button
                  onClick={() => onAlertUpdate({ ...alert, enabled: !alert.enabled })}
                  variant="outline"
                  className="text-xs"
                >
                  {alert.enabled ? 'Disable' : 'Enable'}
                </Button>
                <Button variant="outline" className="text-xs">
                  Edit
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function SystemResourcesPage() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null)
  const [alerts, setAlerts] = useState<ResourceAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTab, setSelectedTab] = useState<'overview' | 'processes' | 'containers' | 'alerts'>('overview')
  const [autoRefresh, setAutoRefresh] = useState(true)
  
  const fetchMetrics = useCallback(async () => {
    try {
      // Mock data for demonstration
      const mockMetrics: SystemMetrics = {
        cpu: {
          usage: 42.5,
          cores: 8,
          temperature: 65,
          frequency: 2.8,
          processes: 157
        },
        memory: {
          total: 16 * 1024**3, // 16GB
          used: 8.5 * 1024**3, // 8.5GB
          free: 7.5 * 1024**3, // 7.5GB
          cached: 2.1 * 1024**3, // 2.1GB
          buffers: 0.4 * 1024**3, // 0.4GB
          usage: 53.1
        },
        disk: {
          total: 500 * 1024**3, // 500GB
          used: 325 * 1024**3, // 325GB
          free: 175 * 1024**3, // 175GB
          usage: 65.0,
          disks: [
            {
              device: '/dev/sda1',
              mountpoint: '/',
              filesystem: 'ext4',
              size: 250 * 1024**3,
              used: 162 * 1024**3,
              available: 88 * 1024**3,
              usage: 64.8
            },
            {
              device: '/dev/sda2',
              mountpoint: '/var',
              filesystem: 'ext4',
              size: 250 * 1024**3,
              used: 163 * 1024**3,
              available: 87 * 1024**3,
              usage: 65.2
            }
          ]
        },
        network: {
          bytesIn: 1.2 * 1024**3, // 1.2GB
          bytesOut: 856 * 1024**2, // 856MB
          packetsIn: 2450000,
          packetsOut: 1890000,
          interfaces: [
            {
              name: 'eth0',
              bytesIn: 1.1 * 1024**3,
              bytesOut: 756 * 1024**2,
              packetsIn: 2200000,
              packetsOut: 1650000,
              speed: 1000,
              status: 'up'
            },
            {
              name: 'docker0',
              bytesIn: 100 * 1024**2,
              bytesOut: 100 * 1024**2,
              packetsIn: 250000,
              packetsOut: 240000,
              speed: 1000,
              status: 'up'
            }
          ]
        },
        containers: [
          {
            id: 'cont1',
            name: 'nself_postgres',
            image: 'postgres:15',
            cpuUsage: 12.5,
            memoryUsage: 512 * 1024**2,
            memoryLimit: 1024 * 1024**2,
            networkIn: 45 * 1024**2,
            networkOut: 23 * 1024**2,
            diskRead: 156 * 1024**2,
            diskWrite: 89 * 1024**2,
            status: 'running'
          },
          {
            id: 'cont2',
            name: 'nself_hasura',
            image: 'hasura/graphql-engine:latest',
            cpuUsage: 8.3,
            memoryUsage: 256 * 1024**2,
            memoryLimit: 512 * 1024**2,
            networkIn: 89 * 1024**2,
            networkOut: 156 * 1024**2,
            diskRead: 23 * 1024**2,
            diskWrite: 12 * 1024**2,
            status: 'running'
          }
        ],
        processes: [
          {
            pid: 1234,
            name: 'postgres',
            user: 'postgres',
            cpuUsage: 15.2,
            memoryUsage: 512 * 1024**2,
            status: 'running',
            runtime: 86400,
            command: '/usr/lib/postgresql/15/bin/postgres -D /var/lib/postgresql/data'
          },
          {
            pid: 5678,
            name: 'hasura',
            user: 'hasura',
            cpuUsage: 8.7,
            memoryUsage: 256 * 1024**2,
            status: 'running',
            runtime: 3600,
            command: 'graphql-engine --database-url postgresql://...'
          }
        ],
        uptime: 172800, // 2 days
        loadAverage: [1.2, 1.1, 0.9]
      }
      
      const mockAlerts: ResourceAlert[] = [
        {
          id: '1',
          type: 'cpu',
          threshold: 80,
          condition: 'above',
          enabled: true,
          notification: 'both',
          lastTriggered: '2024-01-14T15:30:00Z'
        },
        {
          id: '2',
          type: 'memory',
          threshold: 90,
          condition: 'above',
          enabled: true,
          notification: 'email'
        },
        {
          id: '3',
          type: 'disk',
          threshold: 85,
          condition: 'above',
          enabled: false,
          notification: 'webhook'
        }
      ]
      
      setMetrics(mockMetrics)
      setAlerts(mockAlerts)
      setLoading(false)
    } catch (err) {
      setError('Failed to fetch system metrics')
      setLoading(false)
    }
  }, [])
  
  useEffect(() => {
    fetchMetrics()
    if (autoRefresh) {
      const interval = setInterval(fetchMetrics, 5000) // Refresh every 5 seconds
      return () => clearInterval(interval)
    }
  }, [fetchMetrics, autoRefresh])
  
  const handleProcessAction = (action: string, pid: number) => {
    // Process action logic would go here
  }
  
  const handleAlertUpdate = (alert: ResourceAlert) => {
    setAlerts(prev => prev.map(a => a.id === alert.id ? alert : a))
  }
  
  if (loading) {
    return (
      <>
        <HeroPattern />
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <span className="ml-2 text-zinc-600 dark:text-zinc-400">Loading system metrics...</span>
          </div>
        </div>
      </>
    )
  }
  
  if (!metrics) {
    return (
      <>
        <HeroPattern />
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
              Unable to load system metrics
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              {error || 'An unexpected error occurred'}
            </p>
            <Button onClick={fetchMetrics}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </>
    )
  }
  
  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
  }
  
  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${days}d ${hours}h ${minutes}m`
  }
  
  return (
    <>
      <HeroPattern />
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">System Resources</h1>
              <p className="text-zinc-600 dark:text-zinc-400 mt-1">
                Monitor CPU, memory, disk, and network usage
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded"
                />
                Auto-refresh
              </label>
              <Button
                onClick={fetchMetrics}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-1 mb-6 bg-white dark:bg-zinc-800 rounded-lg p-1 border border-zinc-200 dark:border-zinc-700 w-fit">
            <button
              onClick={() => setSelectedTab('overview')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedTab === 'overview'
                  ? 'bg-blue-500 text-white'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setSelectedTab('processes')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedTab === 'processes'
                  ? 'bg-blue-500 text-white'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700'
              }`}
            >
              Processes
            </button>
            <button
              onClick={() => setSelectedTab('containers')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedTab === 'containers'
                  ? 'bg-blue-500 text-white'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700'
              }`}
            >
              Containers
            </button>
            <button
              onClick={() => setSelectedTab('alerts')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedTab === 'alerts'
                  ? 'bg-blue-500 text-white'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700'
              }`}
            >
              Alerts
            </button>
          </div>
        </div>
        
        {selectedTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricsCard
                title="CPU Usage"
                value={metrics.cpu.usage.toFixed(1)}
                unit="%"
                percentage={metrics.cpu.usage}
                trend={metrics.cpu.usage > 50 ? 'up' : 'stable'}
                icon={Cpu}
                color={metrics.cpu.usage > 80 ? 'red' : metrics.cpu.usage > 50 ? 'yellow' : 'green'}
                details={[
                  `${metrics.cpu.cores} cores @ ${metrics.cpu.frequency} GHz`,
                  `${metrics.cpu.processes} processes`,
                  metrics.cpu.temperature ? `${metrics.cpu.temperature}°C` : ''
                ].filter(Boolean)}
              />
              
              <MetricsCard
                title="Memory"
                value={formatBytes(metrics.memory.used)}
                percentage={metrics.memory.usage}
                trend={metrics.memory.usage > 70 ? 'up' : 'stable'}
                icon={MemoryStick}
                color={metrics.memory.usage > 90 ? 'red' : metrics.memory.usage > 70 ? 'yellow' : 'green'}
                details={[
                  `Total: ${formatBytes(metrics.memory.total)}`,
                  `Free: ${formatBytes(metrics.memory.free)}`,
                  `Cached: ${formatBytes(metrics.memory.cached)}`
                ]}
              />
              
              <MetricsCard
                title="Disk Usage"
                value={formatBytes(metrics.disk.used)}
                percentage={metrics.disk.usage}
                trend="stable"
                icon={HardDrive}
                color={metrics.disk.usage > 90 ? 'red' : metrics.disk.usage > 70 ? 'yellow' : 'green'}
                details={[
                  `Total: ${formatBytes(metrics.disk.total)}`,
                  `Free: ${formatBytes(metrics.disk.free)}`,
                  `${metrics.disk.disks.length} drives`
                ]}
              />
              
              <MetricsCard
                title="Network"
                value={formatBytes(metrics.network.bytesIn + metrics.network.bytesOut)}
                trend="up"
                icon={Network}
                color="blue"
                details={[
                  `In: ${formatBytes(metrics.network.bytesIn)}`,
                  `Out: ${formatBytes(metrics.network.bytesOut)}`,
                  `${metrics.network.interfaces.length} interfaces`
                ]}
              />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ResourceChart
                title="CPU History"
                data={[
                  { timestamp: '10:00', value: 35 },
                  { timestamp: '10:15', value: 42 },
                  { timestamp: '10:30', value: 38 },
                  { timestamp: '10:45', value: 45 }
                ]}
              />
              
              <ResourceChart
                title="Memory History"
                data={[
                  { timestamp: '10:00', value: 48 },
                  { timestamp: '10:15', value: 52 },
                  { timestamp: '10:30', value: 51 },
                  { timestamp: '10:45', value: 53 }
                ]}
              />
            </div>
            
            <DiskUsageBreakdown disks={metrics.disk.disks} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">System Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-zinc-600 dark:text-zinc-400">Uptime</span>
                    <span className="font-medium">{formatUptime(metrics.uptime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-600 dark:text-zinc-400">Load Average</span>
                    <span className="font-medium">{metrics.loadAverage.join(', ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-600 dark:text-zinc-400">Running Processes</span>
                    <span className="font-medium">{metrics.cpu.processes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-600 dark:text-zinc-400">Active Containers</span>
                    <span className="font-medium">{metrics.containers.filter(c => c.status === 'running').length}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Network Interfaces</h3>
                <div className="space-y-3">
                  {metrics.network.interfaces.map(interface_ => (
                    <div key={interface_.name} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${interface_.status === 'up' ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="font-medium">{interface_.name}</span>
                        <span className="text-sm text-zinc-500">{interface_.speed} Mbps</span>
                      </div>
                      <div className="text-sm text-zinc-600 dark:text-zinc-400">
                        ↓{formatBytes(interface_.bytesIn)} ↑{formatBytes(interface_.bytesOut)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {selectedTab === 'processes' && (
          <ProcessManager processes={metrics.processes} onProcessAction={handleProcessAction} />
        )}
        
        {selectedTab === 'containers' && (
          <ContainerResourceAllocation containers={metrics.containers} />
        )}
        
        {selectedTab === 'alerts' && (
          <ResourceAlerts alerts={alerts} onAlertUpdate={handleAlertUpdate} />
        )}
      </div>
    </>
  )
}