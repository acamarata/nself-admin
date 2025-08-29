'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  Activity, AlertCircle, CheckCircle, XCircle, Clock, RefreshCw,
  TrendingUp, TrendingDown, Minus, Server, Database, Shield,
  Globe, HardDrive, Zap, Mail, GitBranch, Box, Network
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ServiceHealth {
  name: string
  displayName: string
  status: 'healthy' | 'degraded' | 'unhealthy' | 'offline'
  uptime: number
  responseTime: number
  errorRate: number
  cpu: number
  memory: number
  dependencies: string[]
  lastCheck: string
  metrics: {
    requests?: number
    errors?: number
    latency?: number
    throughput?: number
  }
}

interface HealthMatrix {
  services: ServiceHealth[]
  overall: 'healthy' | 'degraded' | 'critical'
  timestamp: string
}

export default function ServiceHealthPage() {
  const [healthMatrix, setHealthMatrix] = useState<HealthMatrix | null>(null)
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [viewMode, setViewMode] = useState<'matrix' | 'list' | 'dependencies'>('matrix')

  useEffect(() => {
    fetchHealthData()
    
    if (autoRefresh) {
      const interval = setInterval(fetchHealthData, 5000)
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const fetchHealthData = async () => {
    try {
      // Simulate fetching health data
      const mockServices: ServiceHealth[] = [
        {
          name: 'postgres',
          displayName: 'PostgreSQL',
          status: 'healthy',
          uptime: 99.99,
          responseTime: 5,
          errorRate: 0,
          cpu: 15,
          memory: 35,
          dependencies: [],
          lastCheck: new Date().toISOString(),
          metrics: { requests: 15420, errors: 2, latency: 5, throughput: 250 }
        },
        {
          name: 'hasura',
          displayName: 'Hasura GraphQL',
          status: 'healthy',
          uptime: 99.95,
          responseTime: 25,
          errorRate: 0.1,
          cpu: 8,
          memory: 28,
          dependencies: ['postgres'],
          lastCheck: new Date().toISOString(),
          metrics: { requests: 8932, errors: 8, latency: 25, throughput: 150 }
        },
        {
          name: 'auth',
          displayName: 'Auth Service',
          status: 'healthy',
          uptime: 99.98,
          responseTime: 15,
          errorRate: 0.05,
          cpu: 5,
          memory: 18,
          dependencies: ['postgres', 'hasura'],
          lastCheck: new Date().toISOString(),
          metrics: { requests: 3251, errors: 1, latency: 15, throughput: 50 }
        },
        {
          name: 'minio',
          displayName: 'MinIO Storage',
          status: 'healthy',
          uptime: 100,
          responseTime: 10,
          errorRate: 0,
          cpu: 12,
          memory: 25,
          dependencies: [],
          lastCheck: new Date().toISOString(),
          metrics: { requests: 5821, errors: 0, latency: 10, throughput: 100 }
        },
        {
          name: 'redis',
          displayName: 'Redis Cache',
          status: 'healthy',
          uptime: 100,
          responseTime: 2,
          errorRate: 0,
          cpu: 3,
          memory: 8,
          dependencies: [],
          lastCheck: new Date().toISOString(),
          metrics: { requests: 45231, errors: 0, latency: 2, throughput: 1000 }
        },
        {
          name: 'nginx',
          displayName: 'Nginx',
          status: 'healthy',
          uptime: 100,
          responseTime: 1,
          errorRate: 0,
          cpu: 2,
          memory: 5,
          dependencies: [],
          lastCheck: new Date().toISOString(),
          metrics: { requests: 82341, errors: 0, latency: 1, throughput: 2000 }
        },
        {
          name: 'mailpit',
          displayName: 'Mailpit',
          status: 'degraded',
          uptime: 98.5,
          responseTime: 50,
          errorRate: 2,
          cpu: 1,
          memory: 3,
          dependencies: [],
          lastCheck: new Date().toISOString(),
          metrics: { requests: 521, errors: 10, latency: 50, throughput: 10 }
        },
        {
          name: 'grafana',
          displayName: 'Grafana',
          status: 'healthy',
          uptime: 99.9,
          responseTime: 35,
          errorRate: 0.1,
          cpu: 6,
          memory: 15,
          dependencies: ['prometheus'],
          lastCheck: new Date().toISOString(),
          metrics: { requests: 1823, errors: 1, latency: 35, throughput: 30 }
        },
        {
          name: 'prometheus',
          displayName: 'Prometheus',
          status: 'healthy',
          uptime: 100,
          responseTime: 8,
          errorRate: 0,
          cpu: 10,
          memory: 22,
          dependencies: [],
          lastCheck: new Date().toISOString(),
          metrics: { requests: 9821, errors: 0, latency: 8, throughput: 200 }
        }
      ]

      const overallStatus = mockServices.some(s => s.status === 'unhealthy' || s.status === 'offline') 
        ? 'critical' 
        : mockServices.some(s => s.status === 'degraded')
        ? 'degraded'
        : 'healthy'

      setHealthMatrix({
        services: mockServices,
        overall: overallStatus,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500'
      case 'degraded': return 'bg-yellow-500'
      case 'unhealthy': return 'bg-orange-500'
      case 'offline': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'degraded': return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'unhealthy': return <XCircle className="h-4 w-4 text-orange-500" />
      case 'offline': return <XCircle className="h-4 w-4 text-red-500" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getServiceIcon = (name: string) => {
    const icons: Record<string, any> = {
      postgres: Database,
      hasura: GitBranch,
      auth: Shield,
      minio: HardDrive,
      redis: Zap,
      nginx: Globe,
      mailpit: Mail,
      grafana: Activity,
      prometheus: Activity
    }
    const Icon = icons[name] || Server
    return <Icon className="h-5 w-5" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!healthMatrix) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Service Health Matrix</h1>
          <p className="text-muted-foreground mt-1">Real-time health monitoring and dependency tracking</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={autoRefresh ? 'default' : 'outline'}
           
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={cn("h-4 w-4", autoRefresh && "animate-spin")} />
            {autoRefresh ? 'Auto' : 'Manual'}
          </Button>
          <Button variant="outline" onClick={fetchHealthData}>
            Refresh Now
          </Button>
        </div>
      </div>

      {/* Overall Health Status */}
      <Card className={cn(
        "border-2",
        healthMatrix.overall === 'critical' ? 'border-red-500' :
        healthMatrix.overall === 'degraded' ? 'border-yellow-500' :
        'border-green-500'
      )}>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>System Health Status</CardTitle>
            <Badge className={cn(
              healthMatrix.overall === 'critical' ? 'bg-red-500' :
              healthMatrix.overall === 'degraded' ? 'bg-yellow-500' :
              'bg-green-500'
            )}>
              {healthMatrix.overall.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Services</p>
              <p className="text-2xl font-bold">{healthMatrix.services.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Healthy</p>
              <p className="text-2xl font-bold text-green-500">
                {healthMatrix.services.filter(s => s.status === 'healthy').length}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Degraded</p>
              <p className="text-2xl font-bold text-yellow-500">
                {healthMatrix.services.filter(s => s.status === 'degraded').length}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Unhealthy</p>
              <p className="text-2xl font-bold text-red-500">
                {healthMatrix.services.filter(s => s.status === 'unhealthy' || s.status === 'offline').length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Mode Tabs */}
      <Tabs value={viewMode} onValueChange={(v: any) => setViewMode(v)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="matrix">Health Matrix</TabsTrigger>
          <TabsTrigger value="list">Service List</TabsTrigger>
          <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
        </TabsList>

        {/* Health Matrix View */}
        <TabsContent value="matrix" className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {healthMatrix.services.map((service) => (
              <Card 
                key={service.name}
                className={cn(
                  "cursor-pointer hover:shadow-lg transition-all",
                  selectedService === service.name && "ring-2 ring-primary"
                )}
                onClick={() => setSelectedService(service.name)}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      {getServiceIcon(service.name)}
                      <CardTitle className="text-base">{service.displayName}</CardTitle>
                    </div>
                    {getStatusIcon(service.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Uptime</p>
                      <p className="font-medium">{service.uptime}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Response</p>
                      <p className="font-medium">{service.responseTime}ms</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">CPU</p>
                      <Progress value={service.cpu} className="h-1 mt-1" />
                      <p className="text-xs">{service.cpu}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Memory</p>
                      <Progress value={service.memory} className="h-1 mt-1" />
                      <p className="text-xs">{service.memory}%</p>
                    </div>
                  </div>
                  
                  {service.metrics && (
                    <div className="pt-2 border-t">
                      <div className="flex justify-between text-xs">
                        <span>Requests: {service.metrics.requests?.toLocaleString()}</span>
                        <span className="text-red-500">Errors: {service.metrics.errors}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Selected Service Details */}
          {selectedService && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {healthMatrix.services.find(s => s.name === selectedService)?.displayName} Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const service = healthMatrix.services.find(s => s.name === selectedService)
                  if (!service) return null
                  
                  return (
                    <div className="space-y-4">
                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Status</p>
                          <div className="flex items-center gap-2 mt-1">
                            {getStatusIcon(service.status)}
                            <span className="font-medium capitalize">{service.status}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Error Rate</p>
                          <p className="font-medium">{service.errorRate}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Throughput</p>
                          <p className="font-medium">{service.metrics?.throughput} req/s</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Last Check</p>
                          <p className="font-medium text-xs">
                            {new Date(service.lastCheck).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      
                      {service.dependencies.length > 0 && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Dependencies</p>
                          <div className="flex gap-2">
                            {service.dependencies.map(dep => (
                              <Badge key={dep} variant="outline">
                                {dep}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })()}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Service List View */}
        <TabsContent value="list">
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="text-left p-4">Service</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Uptime</th>
                    <th className="text-left p-4">Response Time</th>
                    <th className="text-left p-4">CPU</th>
                    <th className="text-left p-4">Memory</th>
                    <th className="text-left p-4">Error Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {healthMatrix.services.map((service) => (
                    <tr key={service.name} className="border-b hover:bg-accent">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {getServiceIcon(service.name)}
                          <span className="font-medium">{service.displayName}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(service.status)}
                          <span className="capitalize">{service.status}</span>
                        </div>
                      </td>
                      <td className="p-4">{service.uptime}%</td>
                      <td className="p-4">{service.responseTime}ms</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Progress value={service.cpu} className="w-16 h-2" />
                          <span className="text-sm">{service.cpu}%</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Progress value={service.memory} className="w-16 h-2" />
                          <span className="text-sm">{service.memory}%</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={cn(
                          service.errorRate > 1 ? 'text-red-500' :
                          service.errorRate > 0 ? 'text-yellow-500' :
                          'text-green-500'
                        )}>
                          {service.errorRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dependencies View */}
        <TabsContent value="dependencies">
          <Card>
            <CardHeader>
              <CardTitle>Service Dependencies</CardTitle>
              <CardDescription>Dependency graph and impact analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {healthMatrix.services.filter(s => s.dependencies.length > 0).map((service) => (
                  <div key={service.name} className="flex items-center gap-4 p-3 rounded-lg border">
                    <div className="flex items-center gap-2 min-w-[150px]">
                      {getServiceIcon(service.name)}
                      <span className="font-medium">{service.displayName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Network className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">depends on</span>
                    </div>
                    <div className="flex gap-2">
                      {service.dependencies.map(dep => {
                        const depService = healthMatrix.services.find(s => s.name === dep)
                        return (
                          <Badge 
                            key={dep}
                            className={cn(
                              depService?.status === 'healthy' ? 'bg-green-500' :
                              depService?.status === 'degraded' ? 'bg-yellow-500' :
                              'bg-red-500'
                            )}
                          >
                            {dep}
                          </Badge>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}