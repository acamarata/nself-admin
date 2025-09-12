'use client'

import { Button } from '@/components/Button'
import { HeroPattern } from '@/components/HeroPattern'
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  BarChart3,
  CheckCircle,
  Cpu,
  Download,
  MemoryStick,
  Monitor,
  RefreshCw,
  Search,
  Settings,
  TrendingUp,
  XCircle,
  Zap,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
  Line,
  BarChart as RechartsBarChart,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface MetricData {
  timestamp: string
  cpu: number
  memory: number
  disk: number
  network: number
}

interface Alert {
  id: string
  severity: 'critical' | 'warning' | 'info'
  title: string
  message: string
  source: string
  timestamp: string
  acknowledged: boolean
}

interface Service {
  name: string
  status: 'healthy' | 'warning' | 'critical'
  uptime: string
  responseTime: number
  lastCheck: string
}

export default function MonitorPage() {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<
    'overview' | 'metrics' | 'alerts' | 'health'
  >('overview')
  const [timeRange, setTimeRange] = useState('1h')
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Mock data - replace with real API calls
  const [metricsData, setMetricsData] = useState<MetricData[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [services, setServices] = useState<Service[]>([])

  useEffect(() => {
    fetchMonitoringData()

    if (autoRefresh) {
      const interval = setInterval(fetchMonitoringData, 5000)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, timeRange])

  const fetchMonitoringData = async () => {
    setLoading(true)

    try {
      // Generate mock time series data
      const now = Date.now()
      const points = 24

      const mockMetrics = Array.from({ length: points }, (_, i) => ({
        timestamp: new Date(now - (points - i) * 300000).toLocaleTimeString(),
        cpu: Math.random() * 40 + 30,
        memory: Math.random() * 20 + 60,
        disk: Math.random() * 15 + 20,
        network: Math.random() * 100 + 50,
      }))

      setMetricsData(mockMetrics)

      // Mock alerts
      setAlerts([
        {
          id: '1',
          severity: 'warning',
          title: 'High Memory Usage',
          message: 'Memory usage exceeded 85% threshold on main server',
          source: 'System Monitor',
          timestamp: new Date().toISOString(),
          acknowledged: false,
        },
        {
          id: '2',
          severity: 'critical',
          title: 'Database Connection Pool Full',
          message: 'PostgreSQL connection pool has reached maximum capacity',
          source: 'PostgreSQL',
          timestamp: new Date(Date.now() - 300000).toISOString(),
          acknowledged: false,
        },
        {
          id: '3',
          severity: 'info',
          title: 'Backup Completed Successfully',
          message: 'Daily backup job completed without errors',
          source: 'Backup Service',
          timestamp: new Date(Date.now() - 600000).toISOString(),
          acknowledged: true,
        },
      ])

      // Mock service health
      setServices([
        {
          name: 'PostgreSQL',
          status: 'healthy',
          uptime: '15d 6h',
          responseTime: 2.3,
          lastCheck: '30s ago',
        },
        {
          name: 'Hasura GraphQL',
          status: 'healthy',
          uptime: '15d 6h',
          responseTime: 45.2,
          lastCheck: '30s ago',
        },
        {
          name: 'Auth Service',
          status: 'warning',
          uptime: '2d 14h',
          responseTime: 125.7,
          lastCheck: '30s ago',
        },
        {
          name: 'Redis Cache',
          status: 'healthy',
          uptime: '15d 6h',
          responseTime: 1.8,
          lastCheck: '30s ago',
        },
        {
          name: 'MinIO Storage',
          status: 'healthy',
          uptime: '15d 6h',
          responseTime: 23.4,
          lastCheck: '30s ago',
        },
        {
          name: 'Nginx Proxy',
          status: 'healthy',
          uptime: '15d 6h',
          responseTime: 5.1,
          lastCheck: '30s ago',
        },
      ])
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 dark:text-green-400'
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'critical':
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-zinc-500 dark:text-zinc-400'
    }
  }

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-50 dark:bg-green-900/20'
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20'
      case 'critical':
        return 'bg-red-50 dark:bg-red-900/20'
      default:
        return 'bg-zinc-50 dark:bg-zinc-900/20'
    }
  }

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return XCircle
      case 'warning':
        return AlertTriangle
      default:
        return AlertCircle
    }
  }

  const currentMetrics = metricsData[metricsData.length - 1] || {
    cpu: 0,
    memory: 0,
    disk: 0,
    network: 0,
  }

  const stats = {
    totalAlerts: alerts.length,
    activeAlerts: alerts.filter((a) => !a.acknowledged).length,
    healthyServices: services.filter((s) => s.status === 'healthy').length,
    totalServices: services.length,
    avgResponseTime:
      services.reduce((acc, s) => acc + s.responseTime, 0) / services.length,
  }

  return (
    <>
      <HeroPattern />
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
                System Monitor
              </h1>
              <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                Real-time system metrics, health monitoring, and alerts
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
              >
                <option value="5m">Last 5 minutes</option>
                <option value="15m">Last 15 minutes</option>
                <option value="1h">Last hour</option>
                <option value="6h">Last 6 hours</option>
                <option value="24h">Last 24 hours</option>
              </select>
              <Button
                onClick={() => setAutoRefresh(!autoRefresh)}
                variant={autoRefresh ? 'filled' : 'outline'}
                className="flex items-center gap-2"
              >
                <RefreshCw
                  className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`}
                />
                {autoRefresh ? 'Auto' : 'Manual'}
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Configure
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
            <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    CPU Usage
                  </p>
                  <p className="text-2xl font-bold">
                    {currentMetrics.cpu.toFixed(1)}%
                  </p>
                </div>
                <Cpu className="h-8 w-8 text-blue-500" />
              </div>
              <div className="mt-2 h-1 rounded-full bg-zinc-200 dark:bg-zinc-700">
                <div
                  className="h-1 rounded-full bg-blue-500 transition-all"
                  style={{ width: `${Math.min(currentMetrics.cpu, 100)}%` }}
                />
              </div>
            </div>

            <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Memory
                  </p>
                  <p className="text-2xl font-bold">
                    {currentMetrics.memory.toFixed(1)}%
                  </p>
                </div>
                <MemoryStick className="h-8 w-8 text-green-500" />
              </div>
              <div className="mt-2 h-1 rounded-full bg-zinc-200 dark:bg-zinc-700">
                <div
                  className="h-1 rounded-full bg-green-500 transition-all"
                  style={{ width: `${Math.min(currentMetrics.memory, 100)}%` }}
                />
              </div>
            </div>

            <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Active Alerts
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {stats.activeAlerts}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
            </div>

            <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Healthy Services
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.healthyServices}/{stats.totalServices}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Avg Response
                  </p>
                  <p className="text-2xl font-bold">
                    {stats.avgResponseTime.toFixed(0)}ms
                  </p>
                </div>
                <Zap className="h-8 w-8 text-yellow-500" />
              </div>
            </div>
          </div>

          {/* Active Alerts Banner */}
          {stats.activeAlerts > 0 && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <div className="flex-1">
                  <h3 className="font-medium text-red-900 dark:text-red-100">
                    {stats.activeAlerts} Active Alert
                    {stats.activeAlerts > 1 ? 's' : ''}
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-200">
                    Immediate attention required for critical system issues
                  </p>
                </div>
                <Button
                  onClick={() => setActiveTab('alerts')}
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300"
                >
                  View Alerts
                </Button>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="mb-6 border-b border-zinc-200 dark:border-zinc-700">
            <nav className="flex space-x-8">
              {[
                { key: 'overview', label: 'Overview', icon: Monitor },
                { key: 'metrics', label: 'Metrics', icon: BarChart3 },
                {
                  key: 'alerts',
                  label: `Alerts (${stats.activeAlerts})`,
                  icon: AlertCircle,
                },
                { key: 'health', label: 'Health', icon: Activity },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as any)}
                  className={`flex items-center gap-2 border-b-2 px-1 py-2 text-sm font-medium ${
                    activeTab === key
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
              <h3 className="mb-4 text-lg font-semibold">CPU Usage</h3>
              <ResponsiveContainer width="100%" height={200}>
                <RechartsLineChart data={metricsData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="timestamp" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="cpu"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
              <h3 className="mb-4 text-lg font-semibold">Memory Usage</h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={metricsData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="timestamp" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="memory"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
              <h3 className="mb-4 text-lg font-semibold">Disk I/O</h3>
              <ResponsiveContainer width="100%" height={200}>
                <RechartsBarChart data={metricsData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="timestamp" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="disk" fill="#8b5cf6" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
              <h3 className="mb-4 text-lg font-semibold">Network Traffic</h3>
              <ResponsiveContainer width="100%" height={200}>
                <RechartsLineChart data={metricsData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="timestamp" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="network"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={false}
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="relative max-w-md flex-1">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search alerts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 bg-white py-2 pr-4 pl-10 dark:border-zinc-700 dark:bg-zinc-800"
                />
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Configure
              </Button>
            </div>

            <div className="space-y-4">
              {alerts.map((alert) => {
                const AlertIcon = getAlertIcon(alert.severity)
                return (
                  <div
                    key={alert.id}
                    className={`rounded-lg border p-4 ${
                      alert.acknowledged
                        ? 'border-zinc-200 opacity-60 dark:border-zinc-700'
                        : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <AlertIcon
                        className={`mt-0.5 h-5 w-5 ${getStatusColor(alert.severity)}`}
                      />
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <h4 className="font-medium text-zinc-900 dark:text-white">
                            {alert.title}
                          </h4>
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${
                              alert.acknowledged
                                ? 'bg-zinc-100 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300'
                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                            }`}
                          >
                            {alert.acknowledged ? 'Acknowledged' : 'Active'}
                          </span>
                        </div>
                        <p className="mb-2 text-zinc-600 dark:text-zinc-400">
                          {alert.message}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-zinc-500">
                          <span>{alert.source}</span>
                          <span>
                            {new Date(alert.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      {!alert.acknowledged && (
                        <Button variant="outline">Acknowledge</Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === 'health' && (
          <div className="space-y-6">
            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {services.map((service) => (
                <div
                  key={service.name}
                  className={`rounded-lg border p-4 ${getStatusBg(service.status)} ${
                    service.status === 'healthy'
                      ? 'border-green-200 dark:border-green-800'
                      : service.status === 'warning'
                        ? 'border-yellow-200 dark:border-yellow-800'
                        : 'border-red-200 dark:border-red-800'
                  }`}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-medium text-zinc-900 dark:text-white">
                      {service.name}
                    </h3>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        service.status === 'healthy'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                          : service.status === 'warning'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                      }`}
                    >
                      {service.status}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-600 dark:text-zinc-400">
                        Uptime
                      </span>
                      <span className="font-medium">{service.uptime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-600 dark:text-zinc-400">
                        Response Time
                      </span>
                      <span className="font-medium">
                        {service.responseTime}ms
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-600 dark:text-zinc-400">
                        Last Check
                      </span>
                      <span className="font-medium">{service.lastCheck}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'metrics' && (
          <div className="space-y-6">
            <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
              <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
                Advanced Metrics
              </h2>
              <p className="mb-6 text-zinc-600 dark:text-zinc-400">
                Detailed system performance metrics and historical data analysis
              </p>
              <div className="grid gap-4 lg:grid-cols-2">
                <Button
                  variant="outline"
                  className="flex h-auto items-center gap-2 p-4"
                >
                  <BarChart3 className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">Performance Dashboard</div>
                    <div className="text-sm text-zinc-500">
                      Detailed system metrics
                    </div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="flex h-auto items-center gap-2 p-4"
                >
                  <TrendingUp className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">Trend Analysis</div>
                    <div className="text-sm text-zinc-500">
                      Historical data patterns
                    </div>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
