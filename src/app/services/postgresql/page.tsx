'use client'

import { useState, useEffect } from 'react'
import { 
  Database, Play, Save, RefreshCw, AlertCircle, CheckCircle,
  Activity, HardDrive, Users, Lock, Clock, TrendingUp,
  Server, Zap, Copy, Download, Settings, Terminal, Search,
  Eye, Edit3, Trash2, BarChart3, Shield, Network, AlertTriangle
} from 'lucide-react'
import { HeroPattern } from '@/components/ui/hero-pattern'
import { Button } from '@/components/Button'

interface DatabaseStats {
  version: string
  uptime: string
  status: 'healthy' | 'warning' | 'error'
  databases: number
  tables: number
  size: string
  connections: {
    active: number
    idle: number
    max: number
    utilization: number
  }
  performance: {
    hitRatio: number
    cacheSize: string
    qps: number
    avgQueryTime: number
  }
  replication: {
    status: 'streaming' | 'lag' | 'broken'
    lag: number
    replicas: number
  }
  memory: {
    used: string
    total: string
    utilization: number
  }
}

interface QueryResult {
  columns: string[]
  rows: any[]
  rowCount: number
  executionTime: number
  error?: string
}

interface TableInfo {
  id: string
  name: string
  schema: string
  rows: number
  size: string
  indexes: number
  lastAccess: string
  status: 'active' | 'inactive' | 'maintenance'
}

interface DatabaseProcess {
  pid: number
  user: string
  database: string
  state: 'active' | 'idle' | 'blocked'
  query: string
  duration: string
  clientAddr: string
}

interface SlowQuery {
  id: string
  query: string
  duration: number
  calls: number
  meanTime: number
  totalTime: number
  timestamp: string
}

export default function PostgreSQLPage() {
  const [stats, setStats] = useState<DatabaseStats | null>(null)
  const [query, setQuery] = useState('')
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null)
  const [executing, setExecuting] = useState(false)
  const [selectedDatabase, setSelectedDatabase] = useState('postgres')
  const [tables, setTables] = useState<TableInfo[]>([])
  const [activeTab, setActiveTab] = useState('query')
  const [loading, setLoading] = useState(true)
  const [slowQueries, setSlowQueries] = useState<any[]>([])
  const [locks, setLocks] = useState<any[]>([])

  useEffect(() => {
    fetchDatabaseStats()
    fetchTables()
    fetchSlowQueries()
    fetchLocks()
  }, [selectedDatabase])

  const fetchDatabaseStats = async () => {
    try {
      // Mock data - would fetch from API
      setStats({
        version: 'PostgreSQL 15.3',
        uptime: '7 days 14:23:45',
        databases: 5,
        tables: 47,
        size: '1.2 GB',
        connections: {
          active: 8,
          idle: 4,
          max: 100
        },
        cache: {
          hitRatio: 98.7,
          size: '256 MB'
        },
        replication: {
          status: 'streaming',
          lag: 0.002,
          slaves: 1
        }
      })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTables = async () => {
    try {
      // Mock data
      setTables([
        { name: 'users', schema: 'public', rows: 15234, size: '12.5 MB', indexes: 3 },
        { name: 'sessions', schema: 'public', rows: 45821, size: '35.2 MB', indexes: 2 },
        { name: 'products', schema: 'public', rows: 823, size: '5.8 MB', indexes: 4 },
        { name: 'orders', schema: 'public', rows: 9521, size: '18.3 MB', indexes: 5 },
        { name: 'auth_migrations', schema: 'auth', rows: 28, size: '128 KB', indexes: 1 }
      ])
    } catch (error) {
      console.error('Failed to fetch tables:', error)
    }
  }

  const fetchSlowQueries = async () => {
    try {
      // Mock data
      setSlowQueries([
        {
          query: 'SELECT * FROM users WHERE email LIKE "%@example.com"',
          duration: '2.3s',
          calls: 152,
          meanTime: '1.8s'
        },
        {
          query: 'SELECT COUNT(*) FROM orders JOIN products ON ...',
          duration: '1.5s',
          calls: 89,
          meanTime: '1.2s'
        }
      ])
    } catch (error) {
      console.error('Failed to fetch slow queries:', error)
    }
  }

  const fetchLocks = async () => {
    try {
      // Mock data
      setLocks([
        {
          pid: 12345,
          user: 'app_user',
          database: 'production',
          relation: 'users',
          mode: 'AccessShareLock',
          granted: true,
          duration: '00:00:12'
        }
      ])
    } catch (error) {
      console.error('Failed to fetch locks:', error)
    }
  }

  const executeQuery = async () => {
    if (!query.trim()) return
    
    setExecuting(true)
    setQueryResult(null)
    
    try {
      // Simulate query execution
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Mock result
      setQueryResult({
        columns: ['id', 'name', 'email', 'created_at'],
        rows: [
          { id: 1, name: 'John Doe', email: 'john@example.com', created_at: '2024-01-15' },
          { id: 2, name: 'Jane Smith', email: 'jane@example.com', created_at: '2024-01-16' },
          { id: 3, name: 'Bob Johnson', email: 'bob@example.com', created_at: '2024-01-17' }
        ],
        rowCount: 3,
        executionTime: 0.023
      })
    } catch (error: any) {
      setQueryResult({
        columns: [],
        rows: [],
        rowCount: 0,
        executionTime: 0,
        error: error.message
      })
    } finally {
      setExecuting(false)
    }
  }

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    if (bytes === 0) return '0 B'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Database className="h-8 w-8" />
            PostgreSQL
          </h1>
          <p className="text-muted-foreground mt-1">Database management and query console</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-1" />
            Configure
          </Button>
          <Button variant="outline" size="sm">
            <Terminal className="h-4 w-4 mr-1" />
            psql
          </Button>
          <Button size="sm" onClick={fetchDatabaseStats}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Connections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.connections.active}/{stats.connections.max}
              </div>
              <Progress 
                value={(stats.connections.active / stats.connections.max) * 100} 
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {stats.connections.idle} idle
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Cache Hit Ratio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.cache.hitRatio}%</div>
              <Progress value={stats.cache.hitRatio} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                Cache size: {stats.cache.size}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Database Size</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.size}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.tables} tables
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Replication</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-lg font-bold capitalize">{stats.replication.status}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Lag: {stats.replication.lag}s • {stats.replication.slaves} slaves
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="query">Query Console</TabsTrigger>
          <TabsTrigger value="tables">Tables</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="replication">Replication</TabsTrigger>
          <TabsTrigger value="connections">Connections</TabsTrigger>
          <TabsTrigger value="locks">Locks</TabsTrigger>
        </TabsList>

        {/* Query Console */}
        <TabsContent value="query" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>SQL Query Console</CardTitle>
                <Select value={selectedDatabase} onValueChange={setSelectedDatabase}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="postgres">postgres</SelectItem>
                    <SelectItem value="hasura">hasura</SelectItem>
                    <SelectItem value="auth">auth</SelectItem>
                    <SelectItem value="storage">storage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Enter SQL query..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="font-mono min-h-[150px]"
              />
              
              <div className="flex gap-2">
                <Button onClick={executeQuery} disabled={executing}>
                  <Play className="h-4 w-4 mr-1" />
                  {executing ? 'Executing...' : 'Execute'}
                </Button>
                <Button variant="outline" onClick={() => setQuery('')}>
                  Clear
                </Button>
                <Button variant="outline">
                  <Save className="h-4 w-4 mr-1" />
                  Save Query
                </Button>
              </div>

              {queryResult && (
                <div className="space-y-4">
                  {queryResult.error ? (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Query Error</AlertTitle>
                      <AlertDescription>{queryResult.error}</AlertDescription>
                    </Alert>
                  ) : (
                    <>
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-muted-foreground">
                          {queryResult.rowCount} rows • {queryResult.executionTime}s
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Export
                        </Button>
                      </div>
                      
                      <ScrollArea className="h-96">
                        <table className="w-full border">
                          <thead>
                            <tr className="border-b bg-muted">
                              {queryResult.columns.map((col) => (
                                <th key={col} className="text-left p-2 font-medium">
                                  {col}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {queryResult.rows.map((row, i) => (
                              <tr key={i} className="border-b hover:bg-accent">
                                {queryResult.columns.map((col) => (
                                  <td key={col} className="p-2 font-mono text-sm">
                                    {row[col]}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </ScrollArea>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tables */}
        <TabsContent value="tables">
          <Card>
            <CardHeader>
              <CardTitle>Database Tables</CardTitle>
              <CardDescription>Browse and manage database tables</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {tables.map((table) => (
                  <div key={table.name} className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent">
                    <div className="flex items-center gap-3">
                      <Database className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{table.schema}.{table.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {table.rows.toLocaleString()} rows • {table.size}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{table.indexes} indexes</Badge>
                      <Button variant="ghost" size="sm">View</Button>
                      <Button variant="ghost" size="sm">Query</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance */}
        <TabsContent value="performance">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Slow Queries</CardTitle>
                <CardDescription>Queries taking longer than 1 second</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {slowQueries.map((q, i) => (
                    <div key={i} className="p-3 rounded-lg border">
                      <pre className="text-sm font-mono text-wrap">{q.query}</pre>
                      <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                        <span>Duration: {q.duration}</span>
                        <span>Calls: {q.calls}</span>
                        <span>Mean: {q.meanTime}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Query Performance Tuning</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Alert>
                    <TrendingUp className="h-4 w-4" />
                    <AlertTitle>Optimization Suggestions</AlertTitle>
                    <AlertDescription>
                      Consider adding an index on users.email for faster lookups
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Replication */}
        <TabsContent value="replication">
          <Card>
            <CardHeader>
              <CardTitle>Replication Status</CardTitle>
              <CardDescription>Master-slave replication configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Replication is active and healthy</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Primary Server</p>
                    <p className="font-medium">postgres-master</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Replication Lag</p>
                    <p className="font-medium">0.002 seconds</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Replica Servers</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 rounded border">
                      <span>postgres-slave-1</span>
                      <Badge className="bg-green-500">Streaming</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Connections */}
        <TabsContent value="connections">
          <Card>
            <CardHeader>
              <CardTitle>Active Connections</CardTitle>
              <CardDescription>Current database connections and pools</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4">
                <Users className="h-4 w-4" />
                <AlertTitle>Connection Pool Status</AlertTitle>
                <AlertDescription>
                  {stats?.connections.active} active, {stats?.connections.idle} idle of {stats?.connections.max} max connections
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <div className="grid grid-cols-5 gap-2 p-2 font-medium text-sm border-b">
                  <span>PID</span>
                  <span>User</span>
                  <span>Database</span>
                  <span>State</span>
                  <span>Duration</span>
                </div>
                {[1,2,3].map(i => (
                  <div key={i} className="grid grid-cols-5 gap-2 p-2 text-sm hover:bg-accent rounded">
                    <span className="font-mono">1234{i}</span>
                    <span>app_user</span>
                    <span>postgres</span>
                    <Badge variant="outline" className="w-fit">active</Badge>
                    <span>00:02:15</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Locks */}
        <TabsContent value="locks">
          <Card>
            <CardHeader>
              <CardTitle>Database Locks</CardTitle>
              <CardDescription>Current lock status and blocking queries</CardDescription>
            </CardHeader>
            <CardContent>
              {locks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No active locks detected
                </div>
              ) : (
                <div className="space-y-2">
                  {locks.map((lock, i) => (
                    <div key={i} className="p-3 rounded-lg border">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">PID:</span> {lock.pid}
                        </div>
                        <div>
                          <span className="text-muted-foreground">User:</span> {lock.user}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Table:</span> {lock.relation}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Mode:</span> {lock.mode}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}