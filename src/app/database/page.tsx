'use client'

import { Button } from '@/components/Button'
import { useDatabaseData } from '@/hooks/useDatabaseData'
import { usePageData } from '@/hooks/usePageData'
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion'
import {
  Activity,
  AlertCircle,
  Clock,
  Copy,
  Database,
  Download,
  Edit,
  Eye,
  FileText,
  HardDrive,
  Play,
  Plus,
  RefreshCw,
  Search,
  Table2,
  Upload,
  Users,
  Zap,
} from 'lucide-react'
import { useMemo, useState } from 'react'

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
  icon: Icon,
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
      className="group relative rounded-2xl bg-zinc-50/90 p-6 transition-colors duration-300 hover:bg-blue-50/80 dark:bg-white/5 dark:hover:bg-blue-950/40"
    >
      <motion.div
        className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-200 to-blue-100 opacity-0 transition duration-300 group-hover:opacity-100 dark:from-blue-500/40 dark:to-blue-400/30"
        style={{
          maskImage: useMotionTemplate`radial-gradient(250px at ${mouseX}px ${mouseY}px, white, transparent)`,
          WebkitMaskImage: useMotionTemplate`radial-gradient(250px at ${mouseX}px ${mouseY}px, white, transparent)`,
        }}
      />
      <div className="absolute inset-0 rounded-2xl ring-1 ring-zinc-900/10 transition-colors duration-300 ring-inset group-hover:ring-blue-500/50 dark:ring-white/20 dark:group-hover:ring-blue-400/60" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
            {title}
          </h3>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20 transition-colors duration-300 group-hover:bg-blue-500/40 dark:bg-blue-400/20 dark:group-hover:bg-blue-400/40">
            <Icon className="h-4 w-4 text-blue-600 group-hover:text-blue-500 dark:text-blue-400 dark:group-hover:text-blue-300" />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-2xl font-bold text-zinc-900 dark:text-white">
            {value}
          </div>
          {percentage !== undefined && (
            <div className="mt-2 h-2 rounded-full bg-zinc-200 dark:bg-zinc-800">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
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
  onSelect,
}: {
  table: TableInfo
  onSelect: (table: TableInfo) => Promise<void>
}) {
  const typeColors = {
    table: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    view: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
  }

  return (
    <tr
      className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
      onClick={() => onSelect(table)}
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Table2 className="h-4 w-4 text-zinc-500" />
          <div>
            <div className="text-sm font-medium text-zinc-900 dark:text-white">
              {table.name}
            </div>
            <div className="text-xs text-zinc-500">{table.schema}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${typeColors[table.type]}`}
        >
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
          <button className="rounded p-1 hover:bg-zinc-100 dark:hover:bg-zinc-700">
            <Eye className="h-4 w-4 text-zinc-500" />
          </button>
          <button className="rounded p-1 hover:bg-zinc-100 dark:hover:bg-zinc-700">
            <Edit className="h-4 w-4 text-zinc-500" />
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
    refreshInterval: 5000, // Auto-refresh every 5 seconds
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
    version,
  } = useDatabaseData()

  const [_selectedTable, setSelectedTable] = useState<TableInfo | null>(null)
  const [_tableData, setTableData] = useState<any>(null)
  const [_loadingTableData, setLoadingTableData] = useState(false)
  const [query, setQuery] = useState('')
  const [queryResults, setQueryResults] = useState<any>(null)
  const [executing, setExecuting] = useState(false)
  const [activeTab, setActiveTab] = useState<'tables' | 'query' | 'backup'>(
    'tables',
  )
  const [searchTerm, setSearchTerm] = useState('')
  const [_showTableDetails, setShowTableDetails] = useState(false)

  // Handle table selection and load its data
  const handleTableSelect = async (table: TableInfo) => {
    setSelectedTable(table)
    setLoadingTableData(true)
    try {
      const data = await getTableData(table.name, table.schema)
      setTableData(data)
      setShowTableDetails(true)
    } catch (_error) {
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
      setQueryResults({
        columns: [],
        rows: [],
        rowCount: 0,
        executionTime: '0ms',
        error: error.message || 'Query execution failed',
      })
      setExecuting(false)
    }
  }

  // Memoize filtered tables to avoid re-filtering on every render
  const filteredTables = useMemo(() => {
    return tables.filter(
      (table) =>
        table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        table.schema.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [tables, searchTerm])

  // Show loading state during initial fetch
  if (isLoading) {
    return (
      <>
        <div className="flex h-96 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
        </div>
      </>
    )
  }

  // Show error state if database connection failed
  if (error && !hasData) {
    return (
      <>
        <div className="flex h-96 flex-col items-center justify-center gap-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Failed to connect to database
          </p>
          <p className="text-sm text-zinc-500">{error}</p>
          <Button variant="primary" onClick={refresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
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
        <h1 className="bg-gradient-to-r from-blue-600 to-black bg-clip-text text-4xl/tight font-extrabold text-transparent sm:text-6xl/tight dark:from-blue-400 dark:to-white">
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
            title="Tables / Views"
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
            value={stats ? '98%' : '...'}
            percentage={stats ? 98 : undefined}
            description="Query response time"
            icon={Zap}
          />
        </div>
      </div>

      {/* Database Info Bar */}
      <div className="mb-6 rounded-xl bg-white p-4 ring-1 ring-zinc-200 dark:bg-zinc-900/50 dark:ring-zinc-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium">{version}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-zinc-500" />
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                Uptime: {uptime}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600 dark:text-green-400">
                Connected
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" className="flex items-center gap-1">
              <Download className="h-3 w-3" />
              Backup
            </Button>
            <Button variant="outline" className="flex items-center gap-1">
              <Upload className="h-3 w-3" />
              Restore
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-1"
              onClick={refresh}
            >
              <RefreshCw className="h-3 w-3" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="flex inline-flex items-center gap-1 rounded-lg bg-zinc-100 p-0.5 dark:bg-zinc-800">
          <button
            onClick={() => setActiveTab('tables')}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
              activeTab === 'tables'
                ? 'bg-white text-blue-600 shadow-sm dark:bg-zinc-700 dark:text-blue-400'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
            }`}
          >
            Tables & Views
          </button>
          <button
            onClick={() => setActiveTab('query')}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
              activeTab === 'query'
                ? 'bg-white text-blue-600 shadow-sm dark:bg-zinc-700 dark:text-blue-400'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
            }`}
          >
            Query Editor
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
              activeTab === 'backup'
                ? 'bg-white text-blue-600 shadow-sm dark:bg-zinc-700 dark:text-blue-400'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
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
            <div className="relative max-w-md flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search tables..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-white py-2 pr-4 pl-10 dark:border-zinc-700 dark:bg-zinc-800"
              />
            </div>
            <Button variant="primary" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Table
            </Button>
          </div>

          {/* Tables List */}
          <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-50 dark:bg-zinc-900/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">
                      Table
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">
                      Structure
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">
                      Records
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">
                      Size
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                  {filteredTables.map((table) => (
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
          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                SQL Query Editor
              </h3>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  History
                </Button>
                <Button variant="outline" className="flex items-center gap-1">
                  <Copy className="h-3 w-3" />
                  Templates
                </Button>
              </div>
            </div>

            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your SQL query here..."
              className="h-40 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
            />

            <div className="mt-4 flex items-center justify-between">
              <div className="text-xs text-zinc-500">
                Use Ctrl+Enter to execute query
              </div>
              <Button
                variant="primary"
                onClick={executeQuery}
                disabled={executing || !query}
                className="flex items-center gap-2"
              >
                {executing ? (
                  <>
                    <div className="h-3 w-3 animate-spin rounded-full border-b-2 border-white"></div>
                    Executing...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Execute Query
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Query Results */}
          {queryResults && (
            <div className="rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
              <div className="border-b border-zinc-200 p-4 dark:border-zinc-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-zinc-900 dark:text-white">
                      Query Results
                    </span>
                    {!queryResults.error && (
                      <span className="text-xs text-zinc-500">
                        {queryResults.rowCount} rows in{' '}
                        {queryResults.executionTime}
                      </span>
                    )}
                  </div>
                  {!queryResults.error && (
                    <Button
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <Download className="h-3 w-3" />
                      Export
                    </Button>
                  )}
                </div>
              </div>

              {queryResults.error ? (
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 text-red-500" />
                    <div>
                      <p className="text-sm font-medium text-red-600 dark:text-red-400">
                        Query Error
                      </p>
                      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                        {queryResults.error}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-zinc-50 dark:bg-zinc-900/50">
                      <tr>
                        {queryResults.columns.map((col: string) => (
                          <th
                            key={col}
                            className="px-4 py-2 text-left text-xs font-medium text-zinc-500 uppercase"
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                      {queryResults.rows.map((row: any[], idx: number) => (
                        <tr
                          key={idx}
                          className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                        >
                          {row.map((cell, cellIdx) => (
                            <td
                              key={cellIdx}
                              className="px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400"
                            >
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
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Backup Section */}
          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
            <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
              Create Backup
            </h3>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Backup Type
                </label>
                <select className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900">
                  <option>Full Database</option>
                  <option>Schema Only</option>
                  <option>Data Only</option>
                  <option>Selected Tables</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Compression
                </label>
                <select className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900">
                  <option>None</option>
                  <option>gzip</option>
                  <option>bzip2</option>
                </select>
              </div>
              <Button variant="primary" className="w-full">
                Start Backup
              </Button>
            </div>
          </div>

          {/* Restore Section */}
          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
            <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
              Restore Database
            </h3>
            <div className="space-y-4">
              <div className="rounded-lg border-2 border-dashed border-zinc-300 p-8 text-center dark:border-zinc-600">
                <Upload className="mx-auto mb-2 h-8 w-8 text-zinc-400" />
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Drop backup file here or click to browse
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="dropExisting" className="rounded" />
                <label
                  htmlFor="dropExisting"
                  className="text-sm text-zinc-600 dark:text-zinc-400"
                >
                  Drop existing database before restore
                </label>
              </div>
              <Button variant="primary" className="w-full" disabled>
                Start Restore
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
