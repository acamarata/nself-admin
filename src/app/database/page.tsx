'use client'

import { useState, useMemo } from 'react'
import { useDatabaseData } from '@/hooks/useDatabaseData'
import { usePageData } from '@/hooks/usePageData'
import { Button } from '@/components/Button'
import { HeroPattern } from '@/components/HeroPattern'
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  type MotionValue,
} from 'framer-motion'
import { 
  Database, 
  Table2, 
  Play, 
  RefreshCw, 
  Download,
  Upload,
  Plus,
  Trash2,
  Edit,
  Eye,
  ChevronRight,
  ChevronDown,
  Search,
  Filter,
  Settings,
  Activity,
  HardDrive,
  Users,
  Lock,
  Unlock,
  Copy,
  Check,
  X,
  AlertCircle,
  Info,
  Terminal,
  FileText,
  BarChart3,
  Clock,
  Zap
} from 'lucide-react'

// Using types from the store
type TableInfo = {
  name: string
  schema: string
  rowCount: number
  size: string
  type: 'table' | 'view'
  columns: number
}

// Metric Card Component with mouse tracking effect
function MetricCard({ 
  title, 
  value, 
  percentage, 
  description, 
  icon: Icon 
}: {
  title: string
  value: string | number
  percentage?: number
  description?: string
  icon: React.ComponentType<{ className?: string }>
}) {
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
      className="group relative rounded-2xl bg-zinc-50/90 p-6 dark:bg-white/5 hover:bg-blue-50/80 dark:hover:bg-blue-950/40 transition-colors duration-300"
    >
      <motion.div
        className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-200 to-blue-100 opacity-0 transition duration-300 group-hover:opacity-100 dark:from-blue-500/40 dark:to-blue-400/30"
        style={{
          maskImage: useMotionTemplate`radial-gradient(250px at ${mouseX}px ${mouseY}px, white, transparent)`,
          WebkitMaskImage: useMotionTemplate`radial-gradient(250px at ${mouseX}px ${mouseY}px, white, transparent)`,
        }}
      />
      <div className="absolute inset-0 rounded-2xl ring-1 ring-zinc-900/10 ring-inset group-hover:ring-blue-500/50 dark:ring-white/20 dark:group-hover:ring-blue-400/60 transition-colors duration-300" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">{title}</h3>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20 dark:bg-blue-400/20 group-hover:bg-blue-500/40 dark:group-hover:bg-blue-400/40 transition-colors duration-300">
            <Icon className="h-4 w-4 text-blue-600 dark:text-blue-400 group-hover:text-blue-500 dark:group-hover:text-blue-300" />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-2xl font-bold text-zinc-900 dark:text-white">
            {value}
          </div>
          {percentage !== undefined && (
            <div className="mt-2 h-2 bg-zinc-200 rounded-full dark:bg-zinc-800">
              <div 
                className="h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
          )}
        </div>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {description}
        </p>
      </div>
    </div>
  )
}

function TableRow({ 
  table, 
  onSelect 
}: { 
  table: TableInfo
  onSelect: (table: TableInfo) => Promise<void>
}) {
  const typeColors = {
    table: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    view: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
  }
  
  return (
    <tr 
      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer"
      onClick={() => onSelect(table)}
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Table2 className="w-4 h-4 text-zinc-500" />
          <div>
            <div className="font-medium text-sm text-zinc-900 dark:text-white">{table.name}</div>
            <div className="text-xs text-zinc-500">{table.schema}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${typeColors[table.type]}`}>
          {table.type}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
        {table.columns} columns
      </td>
      <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
        {table.rowCount.toLocaleString()} rows
      </td>
      <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
        {table.size}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <button className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700">
            <Eye className="w-4 h-4 text-zinc-500" />
          </button>
          <button className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700">
            <Edit className="w-4 h-4 text-zinc-500" />
          </button>
        </div>
      </td>
    </tr>
  )
}

export default function DatabasePage() {
  // Fetch database data for this page
  const { refresh } = usePageData({
    database: { maxAge: 5000 }, // 5s cache for database
    refreshInterval: 5000 // Auto-refresh every 5 seconds
  })
  
  // Use the custom hook for real-time database data
  const {
    stats,
    tables,
    isLoading,
    error,
    hasData,
    executeQuery: executeDbQuery,
    getTableData,
    totalTables,
    totalViews,
    databaseSize,
    connections,
    uptime,
    version
  } = useDatabaseData()
  
  const [selectedTable, setSelectedTable] = useState<TableInfo | null>(null)
  const [tableData, setTableData] = useState<any>(null)
  const [loadingTableData, setLoadingTableData] = useState(false)
  const [query, setQuery] = useState('')
  const [queryResults, setQueryResults] = useState<any>(null)
  const [executing, setExecuting] = useState(false)
  const [activeTab, setActiveTab] = useState<'tables' | 'query' | 'backup'>('tables')
  const [searchTerm, setSearchTerm] = useState('')
  const [showTableDetails, setShowTableDetails] = useState(false)

  // Handle table selection and load its data
  const handleTableSelect = async (table: TableInfo) => {
    setSelectedTable(table)
    setLoadingTableData(true)
    try {
      const data = await getTableData(table.name, table.schema)
      setTableData(data)
      setShowTableDetails(true)
    } catch (error) {
      console.error('Failed to load table data:', error)
      setTableData(null)
    } finally {
      setLoadingTableData(false)
    }
  }

  const executeQuery = async () => {
    try {
      setExecuting(true)
      const result = await executeDbQuery(query)
      setQueryResults(result)
      setExecuting(false)
    } catch (error: any) {
      console.error('Query execution failed:', error)
      setQueryResults({
        columns: [],
        rows: [],
        rowCount: 0,
        executionTime: '0ms',
        error: error.message || 'Query execution failed'
      })
      setExecuting(false)
    }
  }

  // Memoize filtered tables to avoid re-filtering on every render
  const filteredTables = useMemo(() => {
    return tables.filter(table => 
      table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      table.schema.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [tables, searchTerm])

  // Show loading state during initial fetch
  if (isLoading) {
    return (
      <>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </>
    )
  }

  // Show error state if database connection failed
  if (error && !hasData) {
    return (
      <>
        <div className="flex flex-col items-center justify-center h-96 gap-4">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <p className="text-lg text-zinc-600 dark:text-zinc-400">Failed to connect to database</p>
          <p className="text-sm text-zinc-500">{error}</p>
          <Button variant="solid" onClick={refresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry Connection
          </Button>
        </div>
      </>
    )
  }

  return (
    <>
      
      {/* Hero Section with Dashboard-style Title */}
      <div className="mt-12 mb-4">
        <h1 className="text-4xl/tight font-extrabold bg-gradient-to-r from-blue-600 to-black bg-clip-text text-transparent sm:text-6xl/tight dark:from-blue-400 dark:to-white">
          Database
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Manage your PostgreSQL database, tables, and execute queries
        </p>
      </div>
      
      {/* Top 4 Metric Cards */}
      <div className="mb-16">
        <div className="not-prose grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Database Size"
            value={databaseSize}
            percentage={stats ? 35 : undefined}
            description="Total storage used"
            icon={HardDrive}
          />
          
          <MetricCard
            title="Tables & Views"
            value={`${totalTables} / ${totalViews}`}
            percentage={stats ? 80 : undefined}
            description="Active database objects"
            icon={Table2}
          />
          
          <MetricCard
            title="Connections"
            value={connections}
            percentage={stats ? (connections / 100) * 100 : undefined}
            description="Active connections"
            icon={Users}
          />
          
          <MetricCard
            title="Performance"
            value={stats ? "98%" : '...'}
            percentage={stats ? 98 : undefined}
            description="Query response time"
            icon={Zap}
          />
        </div>
      </div>
      
      {/* Database Info Bar */}
      <div className="mb-6 p-4 rounded-xl bg-white dark:bg-zinc-900/50 ring-1 ring-zinc-200 dark:ring-zinc-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium">{version}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-zinc-500" />
              <span className="text-sm text-zinc-600 dark:text-zinc-400">Uptime: {uptime}</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-600 dark:text-green-400">Connected</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="xs" className="flex items-center gap-1">
              <Download className="w-3 h-3" />
              Backup
            </Button>
            <Button variant="outline" size="xs" className="flex items-center gap-1">
              <Upload className="w-3 h-3" />
              Restore
            </Button>
            <Button 
              variant="outline" 
              size="xs" 
              className="flex items-center gap-1"
              onClick={refresh}
            >
              <RefreshCw className="w-3 h-3" />
              Refresh
            </Button>
          </div>
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 inline-flex">
          <button
            onClick={() => setActiveTab('tables')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'tables'
                ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Tables & Views
          </button>
          <button
            onClick={() => setActiveTab('query')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'query'
                ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Query Editor
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'backup'
                ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Backup & Restore
          </button>
        </div>
      </div>
      
      {/* Tab Content */}
      {activeTab === 'tables' && (
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search tables..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
              />
            </div>
            <Button variant="solid" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Table
            </Button>
          </div>
          
          {/* Tables List */}
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-50 dark:bg-zinc-900/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Table</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Structure</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Records</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Size</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                  {filteredTables.map(table => (
                    <TableRow 
                      key={`${table.schema}.${table.name}`} 
                      table={table} 
                      onSelect={handleTableSelect}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'query' && (
        <div className="space-y-6">
          {/* Query Editor */}
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">SQL Query Editor</h3>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="xs"
                  className="flex items-center gap-1"
                >
                  <FileText className="w-3 h-3" />
                  History
                </Button>
                <Button 
                  variant="outline" 
                  size="xs"
                  className="flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  Templates
                </Button>
              </div>
            </div>
            
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your SQL query here..."
              className="w-full h-40 px-4 py-3 font-mono text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <div className="mt-4 flex items-center justify-between">
              <div className="text-xs text-zinc-500">
                Use Ctrl+Enter to execute query
              </div>
              <Button 
                variant="solid"
                onClick={executeQuery}
                disabled={executing || !query}
                className="flex items-center gap-2"
              >
                {executing ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    Executing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Execute Query
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {/* Query Results */}
          {queryResults && (
            <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700">
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-zinc-900 dark:text-white">
                      Query Results
                    </span>
                    {!queryResults.error && (
                      <span className="text-xs text-zinc-500">
                        {queryResults.rowCount} rows in {queryResults.executionTime}
                      </span>
                    )}
                  </div>
                  {!queryResults.error && (
                    <Button variant="outline" size="xs" className="flex items-center gap-1">
                      <Download className="w-3 h-3" />
                      Export
                    </Button>
                  )}
                </div>
              </div>
              
              {queryResults.error ? (
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-600 dark:text-red-400">Query Error</p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">{queryResults.error}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-zinc-50 dark:bg-zinc-900/50">
                      <tr>
                        {queryResults.columns.map((col: string) => (
                          <th key={col} className="px-4 py-2 text-left text-xs font-medium text-zinc-500 uppercase">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                      {queryResults.rows.map((row: any[], idx: number) => (
                        <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                          {row.map((cell, cellIdx) => (
                            <td key={cellIdx} className="px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'backup' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Backup Section */}
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-6">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Create Backup</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Backup Type
                </label>
                <select className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900">
                  <option>Full Database</option>
                  <option>Schema Only</option>
                  <option>Data Only</option>
                  <option>Selected Tables</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Compression
                </label>
                <select className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900">
                  <option>None</option>
                  <option>gzip</option>
                  <option>bzip2</option>
                </select>
              </div>
              <Button variant="solid" className="w-full">
                Start Backup
              </Button>
            </div>
          </div>
          
          {/* Restore Section */}
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-6">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Restore Database</h3>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-lg p-8 text-center">
                <Upload className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Drop backup file here or click to browse
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="dropExisting" className="rounded" />
                <label htmlFor="dropExisting" className="text-sm text-zinc-600 dark:text-zinc-400">
                  Drop existing database before restore
                </label>
              </div>
              <Button variant="solid" className="w-full" disabled>
                Start Restore
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}