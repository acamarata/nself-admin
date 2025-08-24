'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/Button'
import { HeroPattern } from '@/components/HeroPattern'
import { 
  RefreshCw, Settings, Terminal, Download, Upload, Play, Save, 
  Eye, EyeOff, Edit, Copy, Trash2, Plus, Search, Filter,
  Database, Layers, Shield, Zap, Activity, Clock, Users,
  AlertCircle, CheckCircle, ExternalLink, FileText, Grid,
  List, BarChart3, TrendingUp, Globe, Lock, Key, Hash,
  GitBranch, Package, Webhook, Code, Server, Gauge
} from 'lucide-react'

interface HasuraStats {
  version: string
  uptime: string
  totalQueries: number
  avgResponseTime: number
  cacheHitRatio: number
  activeConnections: number
  errorsLast24h: number
  subscriptions: number
}

interface GraphQLSchema {
  tables: SchemaTable[]
  views: SchemaView[]
  functions: SchemaFunction[]
  relationships: Relationship[]
}

interface SchemaTable {
  name: string
  schema: string
  columns: Column[]
  primaryKey: string[]
  foreignKeys: ForeignKey[]
  permissions: TablePermission[]
  isTracked: boolean
  rowCount: number
}

interface Column {
  name: string
  type: string
  nullable: boolean
  default?: string
  isGenerated: boolean
}

interface ForeignKey {
  column: string
  references: {
    table: string
    column: string
  }
}

interface SchemaView {
  name: string
  schema: string
  definition: string
  isTracked: boolean
}

interface SchemaFunction {
  name: string
  schema: string
  language: string
  returnType: string
  isTracked: boolean
}

interface Relationship {
  name: string
  type: 'object' | 'array'
  fromTable: string
  toTable: string
  mapping: Record<string, string>
}

interface TablePermission {
  role: string
  permission: 'select' | 'insert' | 'update' | 'delete'
  filter?: object
  columns?: string[]
  check?: object
}

interface EventTrigger {
  name: string
  table: string
  events: ('insert' | 'update' | 'delete')[]
  webhook: string
  status: 'active' | 'inactive'
  retryConfig: {
    numRetries: number
    timeoutSeconds: number
    intervalSeconds: number
  }
  headers: Record<string, string>
  lastInvocation?: {
    status: 'success' | 'error'
    timestamp: string
    response: number
  }
}

interface Action {
  name: string
  definition: {
    handler: string
    type: 'query' | 'mutation'
    arguments: Record<string, string>
    outputType: string
  }
  permissions: string[]
  comment?: string
}

interface RemoteSchema {
  name: string
  url: string
  headers: Record<string, string>
  timeoutSeconds: number
  status: 'connected' | 'error' | 'loading'
  lastSync: string
}

interface QueryMetric {
  query: string
  operationType: 'query' | 'mutation' | 'subscription'
  avgExecutionTime: number
  totalExecutions: number
  errorRate: number
  lastExecuted: string
}

function StatsOverview({ stats }: { stats: HasuraStats }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Queries/min</p>
            <p className="text-2xl font-bold">{stats.totalQueries.toLocaleString()}</p>
          </div>
          <BarChart3 className="w-6 h-6 text-blue-500" />
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Avg Response</p>
            <p className="text-2xl font-bold">{stats.avgResponseTime}ms</p>
          </div>
          <Clock className="w-6 h-6 text-green-500" />
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Cache Hit Rate</p>
            <p className="text-2xl font-bold">{stats.cacheHitRatio}%</p>
          </div>
          <TrendingUp className="w-6 h-6 text-purple-500" />
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Active Subs</p>
            <p className="text-2xl font-bold">{stats.subscriptions}</p>
          </div>
          <Activity className="w-6 h-6 text-orange-500" />
        </div>
      </div>
    </div>
  )
}

function GraphQLConsole() {
  const [query, setQuery] = useState(`# Welcome to the GraphQL Console
query GetUsers {
  users {
    id
    name
    email
    created_at
    profile {
      avatar_url
      bio
    }
  }
}`)
  
  const [variables, setVariables] = useState('{}')
  const [headers, setHeaders] = useState('{}')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'query' | 'variables' | 'headers'>('query')

  const executeQuery = async () => {
    setLoading(true)
    try {
      // Simulate GraphQL execution
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Mock result based on query type
      const mockResult = {
        data: {
          users: [
            {
              id: 1,
              name: "John Doe",
              email: "john@example.com",
              created_at: "2024-01-15T10:30:00.000Z",
              profile: {
                avatar_url: "https://avatar.example.com/john.jpg",
                bio: "Software developer"
              }
            },
            {
              id: 2,
              name: "Jane Smith", 
              email: "jane@example.com",
              created_at: "2024-01-16T14:20:00.000Z",
              profile: {
                avatar_url: "https://avatar.example.com/jane.jpg",
                bio: "Product manager"
              }
            }
          ]
        },
        extensions: {
          tracing: {
            version: 1,
            startTime: "2024-01-17T10:30:00.000Z",
            endTime: "2024-01-17T10:30:00.125Z",
            duration: 125000000
          }
        }
      }
      
      setResult(mockResult)
    } catch (error) {
      setResult({
        errors: [
          {
            message: "Query execution failed",
            extensions: {
              code: "INTERNAL_ERROR"
            }
          }
        ]
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">GraphQL Console</h3>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="text-xs">
              <Save className="w-3 h-3 mr-1" />
              Save Query
            </Button>
            <Button variant="outline" className="text-xs">
              <ExternalLink className="w-3 h-3 mr-1" />
              Open in GraphiQL
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
        {/* Query Input */}
        <div className="space-y-4">
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-700 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('query')}
              className={`px-3 py-1 text-sm rounded ${activeTab === 'query' ? 'bg-white dark:bg-zinc-600 shadow-sm' : ''}`}
            >
              Query
            </button>
            <button
              onClick={() => setActiveTab('variables')}
              className={`px-3 py-1 text-sm rounded ${activeTab === 'variables' ? 'bg-white dark:bg-zinc-600 shadow-sm' : ''}`}
            >
              Variables
            </button>
            <button
              onClick={() => setActiveTab('headers')}
              className={`px-3 py-1 text-sm rounded ${activeTab === 'headers' ? 'bg-white dark:bg-zinc-600 shadow-sm' : ''}`}
            >
              Headers
            </button>
          </div>

          {activeTab === 'query' && (
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-80 p-3 font-mono text-sm rounded-lg border border-zinc-200 dark:border-zinc-700"
              placeholder="Enter your GraphQL query..."
            />
          )}

          {activeTab === 'variables' && (
            <textarea
              value={variables}
              onChange={(e) => setVariables(e.target.value)}
              className="w-full h-80 p-3 font-mono text-sm rounded-lg border border-zinc-200 dark:border-zinc-700"
              placeholder="Enter query variables (JSON)..."
            />
          )}

          {activeTab === 'headers' && (
            <textarea
              value={headers}
              onChange={(e) => setHeaders(e.target.value)}
              className="w-full h-80 p-3 font-mono text-sm rounded-lg border border-zinc-200 dark:border-zinc-700"
              placeholder="Enter custom headers (JSON)..."
            />
          )}

          <Button
            onClick={executeQuery}
            disabled={loading}
            className="w-full"
          >
            <Play className="w-4 h-4 mr-2" />
            {loading ? 'Executing...' : 'Execute Query'}
          </Button>
        </div>

        {/* Query Result */}
        <div>
          <h4 className="text-sm font-medium mb-2">Result</h4>
          <div className="h-96 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-auto">
            {result ? (
              <pre className="p-3 text-sm">
                {JSON.stringify(result, null, 2)}
              </pre>
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-500">
                Execute a query to see results
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function SchemaManagement({ schema }: { schema: GraphQLSchema }) {
  const [selectedTable, setSelectedTable] = useState<SchemaTable | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'tracked' | 'untracked'>('all')

  const filteredTables = schema.tables.filter(table => {
    const matchesSearch = table.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || 
      (filter === 'tracked' && table.isTracked) ||
      (filter === 'untracked' && !table.isTracked)
    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Database Schema</h3>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="text-xs">
                <RefreshCw className="w-3 h-3 mr-1" />
                Reload Schema
              </Button>
              <Button variant="outline" className="text-xs">
                <Download className="w-3 h-3 mr-1" />
                Export Metadata
              </Button>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search tables..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700"
              />
            </div>
            
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700"
            >
              <option value="all">All Tables</option>
              <option value="tracked">Tracked</option>
              <option value="untracked">Untracked</option>
            </select>
          </div>

          <div className="space-y-2">
            {filteredTables.map((table) => (
              <div
                key={`${table.schema}.${table.name}`}
                className="flex items-center justify-between p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-blue-500" />
                    <div>
                      <div className="font-medium text-sm">
                        {table.schema}.{table.name}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {table.columns.length} columns • {table.rowCount.toLocaleString()} rows
                      </div>
                    </div>
                  </div>
                  
                  {table.isTracked ? (
                    <span className="px-2 py-1 text-xs rounded bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400">
                      Tracked
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs rounded bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400">
                      Untracked
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedTable(table)}
                    className="text-xs"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    View
                  </Button>
                  
                  {table.isTracked ? (
                    <Button variant="outline" className="text-xs">
                      <EyeOff className="w-3 h-3 mr-1" />
                      Untrack
                    </Button>
                  ) : (
                    <Button className="text-xs">
                      <Plus className="w-3 h-3 mr-1" />
                      Track
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedTable && (
        <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-700">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold">
                {selectedTable.schema}.{selectedTable.name}
              </h4>
              <Button
                variant="outline"
                onClick={() => setSelectedTable(null)}
                className="text-xs"
              >
                Close
              </Button>
            </div>
          </div>

          <div className="p-4">
            <div className="space-y-4">
              <div>
                <h5 className="text-sm font-medium mb-2">Columns</h5>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-700">
                        <th className="text-left py-2">Name</th>
                        <th className="text-left py-2">Type</th>
                        <th className="text-left py-2">Nullable</th>
                        <th className="text-left py-2">Default</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedTable.columns.map((column) => (
                        <tr key={column.name} className="border-b border-zinc-100 dark:border-zinc-800">
                          <td className="py-2 font-mono">{column.name}</td>
                          <td className="py-2">{column.type}</td>
                          <td className="py-2">
                            {column.nullable ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-red-500" />
                            )}
                          </td>
                          <td className="py-2 font-mono text-xs">
                            {column.default || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h5 className="text-sm font-medium mb-2">Permissions</h5>
                <div className="space-y-2">
                  {selectedTable.permissions.map((perm, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded bg-zinc-50 dark:bg-zinc-900">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium">{perm.role}</span>
                        <span className="text-xs px-2 py-1 rounded bg-zinc-200 dark:bg-zinc-700">
                          {perm.permission}
                        </span>
                      </div>
                      <Button variant="outline" className="text-xs">
                        <Edit className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function PermissionsMatrix({ tables }: { tables: SchemaTable[] }) {
  const [selectedRole, setSelectedRole] = useState('user')
  
  const roles = ['anonymous', 'user', 'admin', 'manager']
  const permissions = ['select', 'insert', 'update', 'delete'] as const

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Permissions Matrix</h3>
          <div className="flex items-center gap-2">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-3 py-1 text-sm rounded border border-zinc-200 dark:border-zinc-700"
            >
              {roles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
            <Button variant="outline" className="text-xs">
              <Plus className="w-3 h-3 mr-1" />
              Add Role
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-700">
                <th className="text-left py-3 px-2">Table</th>
                {permissions.map(perm => (
                  <th key={perm} className="text-center py-3 px-2 capitalize">
                    {perm}
                  </th>
                ))}
                <th className="text-center py-3 px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tables.slice(0, 10).map((table) => (
                <tr key={`${table.schema}.${table.name}`} className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="py-3 px-2 font-mono">
                    {table.schema}.{table.name}
                  </td>
                  {permissions.map(perm => {
                    const hasPermission = table.permissions.some(
                      p => p.role === selectedRole && p.permission === perm
                    )
                    return (
                      <td key={perm} className="py-3 px-2 text-center">
                        <button
                          className={`w-6 h-6 rounded-full border-2 ${
                            hasPermission
                              ? 'bg-green-500 border-green-500'
                              : 'border-zinc-300 dark:border-zinc-600'
                          }`}
                        >
                          {hasPermission && (
                            <CheckCircle className="w-4 h-4 text-white mx-auto" />
                          )}
                        </button>
                      </td>
                    )
                  })}
                  <td className="py-3 px-2 text-center">
                    <Button variant="outline" className="text-xs">
                      <Edit className="w-3 h-3" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function EventTriggers({ triggers }: { triggers: EventTrigger[] }) {
  const [selectedTrigger, setSelectedTrigger] = useState<EventTrigger | null>(null)

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Event Triggers</h3>
            <Button className="text-xs">
              <Plus className="w-3 h-3 mr-1" />
              Create Trigger
            </Button>
          </div>
        </div>

        <div className="p-4">
          <div className="space-y-3">
            {triggers.map((trigger) => (
              <div
                key={trigger.name}
                className="flex items-center justify-between p-3 rounded-lg border border-zinc-200 dark:border-zinc-700"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Webhook className="w-4 h-4 text-purple-500" />
                    <div>
                      <div className="font-medium text-sm">{trigger.name}</div>
                      <div className="text-xs text-zinc-500">
                        {trigger.table} • {trigger.events.join(', ')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {trigger.status === 'active' ? (
                      <span className="px-2 py-1 text-xs rounded bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs rounded bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400">
                        Inactive
                      </span>
                    )}

                    {trigger.lastInvocation && (
                      <span className={`px-2 py-1 text-xs rounded ${
                        trigger.lastInvocation.status === 'success'
                          ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                          : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                      }`}>
                        Last: {trigger.lastInvocation.status}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedTrigger(trigger)}
                    className="text-xs"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    Details
                  </Button>
                  <Button variant="outline" className="text-xs">
                    <Edit className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedTrigger && (
        <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-700">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold">{selectedTrigger.name}</h4>
              <Button
                variant="outline"
                onClick={() => setSelectedTrigger(null)}
                className="text-xs"
              >
                Close
              </Button>
            </div>
          </div>

          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Webhook URL</label>
                <div className="font-mono text-sm bg-zinc-50 dark:bg-zinc-900 rounded p-2 mt-1">
                  {selectedTrigger.webhook}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Events</label>
                <div className="flex gap-1 mt-1">
                  {selectedTrigger.events.map(event => (
                    <span key={event} className="px-2 py-1 text-xs rounded bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">
                      {event}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Retry Configuration</label>
              <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                <div>
                  <span className="text-zinc-500">Retries:</span> {selectedTrigger.retryConfig.numRetries}
                </div>
                <div>
                  <span className="text-zinc-500">Timeout:</span> {selectedTrigger.retryConfig.timeoutSeconds}s
                </div>
                <div>
                  <span className="text-zinc-500">Interval:</span> {selectedTrigger.retryConfig.intervalSeconds}s
                </div>
              </div>
            </div>

            {Object.keys(selectedTrigger.headers).length > 0 && (
              <div>
                <label className="text-sm font-medium">Headers</label>
                <div className="mt-2 space-y-1">
                  {Object.entries(selectedTrigger.headers).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2 text-sm">
                      <span className="font-mono text-zinc-600 dark:text-zinc-400">{key}:</span>
                      <span className="font-mono">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function ActionsAndRemoteSchemas({ actions, remoteSchemas }: { 
  actions: Action[]
  remoteSchemas: RemoteSchema[] 
}) {
  const [activeSection, setActiveSection] = useState<'actions' | 'remote'>('actions')

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-1 bg-white dark:bg-zinc-800 rounded-lg p-1 border border-zinc-200 dark:border-zinc-700">
        <button
          onClick={() => setActiveSection('actions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeSection === 'actions'
              ? 'bg-blue-500 text-white'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <Zap className="w-4 h-4" />
          Actions ({actions.length})
        </button>
        <button
          onClick={() => setActiveSection('remote')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeSection === 'remote'
              ? 'bg-blue-500 text-white'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <Globe className="w-4 h-4" />
          Remote Schemas ({remoteSchemas.length})
        </button>
      </div>

      {activeSection === 'actions' && (
        <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Actions</h3>
              <Button className="text-xs">
                <Plus className="w-3 h-3 mr-1" />
                Create Action
              </Button>
            </div>
          </div>

          <div className="p-4">
            <div className="space-y-3">
              {actions.map((action) => (
                <div
                  key={action.name}
                  className="flex items-center justify-between p-3 rounded-lg border border-zinc-200 dark:border-zinc-700"
                >
                  <div className="flex items-center gap-3">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <div>
                      <div className="font-medium text-sm">{action.name}</div>
                      <div className="text-xs text-zinc-500">
                        {action.definition.type} • {action.definition.handler}
                      </div>
                    </div>
                    <span className="px-2 py-1 text-xs rounded bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">
                      {action.definition.type}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500">
                      {action.permissions.length} roles
                    </span>
                    <Button variant="outline" className="text-xs">
                      <Edit className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSection === 'remote' && (
        <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Remote Schemas</h3>
              <Button className="text-xs">
                <Plus className="w-3 h-3 mr-1" />
                Add Remote Schema
              </Button>
            </div>
          </div>

          <div className="p-4">
            <div className="space-y-3">
              {remoteSchemas.map((schema) => (
                <div
                  key={schema.name}
                  className="flex items-center justify-between p-3 rounded-lg border border-zinc-200 dark:border-zinc-700"
                >
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-green-500" />
                    <div>
                      <div className="font-medium text-sm">{schema.name}</div>
                      <div className="text-xs text-zinc-500 font-mono">
                        {schema.url}
                      </div>
                    </div>
                    
                    {schema.status === 'connected' && (
                      <span className="px-2 py-1 text-xs rounded bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400">
                        Connected
                      </span>
                    )}
                    {schema.status === 'error' && (
                      <span className="px-2 py-1 text-xs rounded bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400">
                        Error
                      </span>
                    )}
                    {schema.status === 'loading' && (
                      <span className="px-2 py-1 text-xs rounded bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400">
                        Loading
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500">
                      Sync: {schema.lastSync}
                    </span>
                    <Button variant="outline" className="text-xs">
                      <RefreshCw className="w-3 h-3" />
                    </Button>
                    <Button variant="outline" className="text-xs">
                      <Edit className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function QueryMetrics({ metrics }: { metrics: QueryMetric[] }) {
  const [sortBy, setSortBy] = useState<'executions' | 'time' | 'errors'>('executions')

  const sortedMetrics = [...metrics].sort((a, b) => {
    switch (sortBy) {
      case 'executions': return b.totalExecutions - a.totalExecutions
      case 'time': return b.avgExecutionTime - a.avgExecutionTime  
      case 'errors': return b.errorRate - a.errorRate
      default: return 0
    }
  })

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Query Performance Metrics</h3>
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1 text-sm rounded border border-zinc-200 dark:border-zinc-700"
            >
              <option value="executions">Sort by Executions</option>
              <option value="time">Sort by Response Time</option>
              <option value="errors">Sort by Error Rate</option>
            </select>
            <Button variant="outline" className="text-xs">
              <Download className="w-3 h-3 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="space-y-3">
          {sortedMetrics.map((metric, i) => (
            <div key={i} className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs rounded ${
                    metric.operationType === 'query' 
                      ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                      : metric.operationType === 'mutation'
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                      : 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400'
                  }`}>
                    {metric.operationType}
                  </span>
                  <span className="text-xs text-zinc-500">
                    Last executed: {metric.lastExecuted}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-right">
                    <div className="text-zinc-500 text-xs">Executions</div>
                    <div className="font-medium">{metric.totalExecutions.toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-zinc-500 text-xs">Avg Time</div>
                    <div className="font-medium">{metric.avgExecutionTime}ms</div>
                  </div>
                  <div className="text-right">
                    <div className="text-zinc-500 text-xs">Error Rate</div>
                    <div className={`font-medium ${metric.errorRate > 5 ? 'text-red-600' : 'text-green-600'}`}>
                      {metric.errorRate}%
                    </div>
                  </div>
                </div>
              </div>
              
              <pre className="text-xs font-mono bg-zinc-50 dark:bg-zinc-900 rounded p-2 overflow-x-auto">
{metric.query.length > 200 ? metric.query.substring(0, 200) + '...' : metric.query}
              </pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function HasuraPage() {
  const [activeTab, setActiveTab] = useState('console')

  // Mock data
  const [stats] = useState<HasuraStats>({
    version: 'Hasura GraphQL Engine v2.34.0',
    uptime: '7 days 14:23:45',
    totalQueries: 15234,
    avgResponseTime: 125,
    cacheHitRatio: 85.3,
    activeConnections: 24,
    errorsLast24h: 12,
    subscriptions: 56
  })

  const [schema] = useState<GraphQLSchema>({
    tables: [
      {
        name: 'users',
        schema: 'public',
        columns: [
          { name: 'id', type: 'integer', nullable: false, isGenerated: true },
          { name: 'email', type: 'text', nullable: false, isGenerated: false },
          { name: 'name', type: 'text', nullable: true, isGenerated: false },
          { name: 'created_at', type: 'timestamptz', nullable: false, default: 'now()', isGenerated: false }
        ],
        primaryKey: ['id'],
        foreignKeys: [],
        permissions: [
          { role: 'user', permission: 'select', columns: ['id', 'name', 'email'] },
          { role: 'admin', permission: 'select' },
          { role: 'admin', permission: 'insert' },
          { role: 'admin', permission: 'update' },
          { role: 'admin', permission: 'delete' }
        ],
        isTracked: true,
        rowCount: 15234
      },
      {
        name: 'posts',
        schema: 'public',
        columns: [
          { name: 'id', type: 'integer', nullable: false, isGenerated: true },
          { name: 'title', type: 'text', nullable: false, isGenerated: false },
          { name: 'content', type: 'text', nullable: true, isGenerated: false },
          { name: 'user_id', type: 'integer', nullable: false, isGenerated: false },
          { name: 'published', type: 'boolean', nullable: false, default: 'false', isGenerated: false }
        ],
        primaryKey: ['id'],
        foreignKeys: [
          { column: 'user_id', references: { table: 'users', column: 'id' } }
        ],
        permissions: [
          { role: 'user', permission: 'select', filter: { user_id: { _eq: 'X-Hasura-User-Id' } } },
          { role: 'admin', permission: 'select' }
        ],
        isTracked: true,
        rowCount: 8923
      },
      {
        name: 'comments',
        schema: 'public',
        columns: [
          { name: 'id', type: 'integer', nullable: false, isGenerated: true },
          { name: 'content', type: 'text', nullable: false, isGenerated: false },
          { name: 'post_id', type: 'integer', nullable: false, isGenerated: false },
          { name: 'user_id', type: 'integer', nullable: false, isGenerated: false }
        ],
        primaryKey: ['id'],
        foreignKeys: [
          { column: 'post_id', references: { table: 'posts', column: 'id' } },
          { column: 'user_id', references: { table: 'users', column: 'id' } }
        ],
        permissions: [],
        isTracked: false,
        rowCount: 0
      }
    ],
    views: [],
    functions: [],
    relationships: []
  })

  const [eventTriggers] = useState<EventTrigger[]>([
    {
      name: 'user_created_notification',
      table: 'users',
      events: ['insert'],
      webhook: 'https://api.example.com/webhooks/user-created',
      status: 'active',
      retryConfig: {
        numRetries: 3,
        timeoutSeconds: 60,
        intervalSeconds: 10
      },
      headers: {
        'Authorization': 'Bearer ***',
        'Content-Type': 'application/json'
      },
      lastInvocation: {
        status: 'success',
        timestamp: '2024-01-17 10:25:30',
        response: 200
      }
    },
    {
      name: 'post_updated_sync',
      table: 'posts',
      events: ['update'],
      webhook: 'https://sync.example.com/post-updated',
      status: 'inactive',
      retryConfig: {
        numRetries: 5,
        timeoutSeconds: 30,
        intervalSeconds: 5
      },
      headers: {}
    }
  ])

  const [actions] = useState<Action[]>([
    {
      name: 'sendEmail',
      definition: {
        handler: 'https://api.example.com/send-email',
        type: 'mutation',
        arguments: {
          email: 'String!',
          subject: 'String!',
          body: 'String!'
        },
        outputType: 'EmailResponse'
      },
      permissions: ['user', 'admin']
    },
    {
      name: 'getRecommendations',
      definition: {
        handler: 'https://ml.example.com/recommendations',
        type: 'query',
        arguments: {
          userId: 'Int!',
          limit: 'Int'
        },
        outputType: '[Recommendation]'
      },
      permissions: ['user']
    }
  ])

  const [remoteSchemas] = useState<RemoteSchema[]>([
    {
      name: 'auth_service',
      url: 'https://auth.example.com/graphql',
      headers: {
        'Authorization': 'Bearer ***'
      },
      timeoutSeconds: 60,
      status: 'connected',
      lastSync: '2 min ago'
    },
    {
      name: 'payment_service',
      url: 'https://payments.example.com/graphql',
      headers: {},
      timeoutSeconds: 30,
      status: 'error',
      lastSync: '1 hour ago'
    }
  ])

  const [queryMetrics] = useState<QueryMetric[]>([
    {
      query: 'query GetUsers { users { id name email } }',
      operationType: 'query',
      avgExecutionTime: 45,
      totalExecutions: 8234,
      errorRate: 0.2,
      lastExecuted: '2 min ago'
    },
    {
      query: 'mutation CreatePost($title: String!, $content: String!) { insert_posts_one(object: {title: $title, content: $content}) { id } }',
      operationType: 'mutation',
      avgExecutionTime: 180,
      totalExecutions: 1523,
      errorRate: 2.1,
      lastExecuted: '5 min ago'
    },
    {
      query: 'subscription OnlineUsers { users(where: {last_seen: {_gte: "now() - interval \'5 minutes\'"}}) { id name } }',
      operationType: 'subscription',
      avgExecutionTime: 12,
      totalExecutions: 456,
      errorRate: 0.0,
      lastExecuted: '1 min ago'
    }
  ])

  const tabs = [
    { id: 'console', label: 'GraphQL Console', icon: Code },
    { id: 'schema', label: 'Schema', icon: Database },
    { id: 'permissions', label: 'Permissions', icon: Shield },
    { id: 'events', label: 'Event Triggers', icon: Webhook },
    { id: 'actions', label: 'Actions & Remote', icon: Zap },
    { id: 'metrics', label: 'Metrics', icon: BarChart3 }
  ]

  return (
    <>
      <HeroPattern />
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
                <Layers className="w-8 h-8 text-purple-500" />
                Hasura GraphQL
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400 mt-1">
                GraphQL API management, schema design, and performance monitoring
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline">
                <ExternalLink className="w-4 h-4 mr-2" />
                Hasura Console
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Metadata
              </Button>
              <Button variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Stats Overview */}
          <StatsOverview stats={stats} />

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 bg-white dark:bg-zinc-800 rounded-lg p-1 border border-zinc-200 dark:border-zinc-700 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'console' && <GraphQLConsole />}
        {activeTab === 'schema' && <SchemaManagement schema={schema} />}
        {activeTab === 'permissions' && <PermissionsMatrix tables={schema.tables} />}
        {activeTab === 'events' && <EventTriggers triggers={eventTriggers} />}
        {activeTab === 'actions' && (
          <ActionsAndRemoteSchemas actions={actions} remoteSchemas={remoteSchemas} />
        )}
        {activeTab === 'metrics' && <QueryMetrics metrics={queryMetrics} />}
      </div>
    </>
  )
}