'use client'

import { HeroPattern } from '@/components/HeroPattern'
import {
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  CheckCircle,
  ChevronDown,
  Clock,
  Database,
  Download,
  Eye,
  Filter,
  RefreshCw,
  RotateCcw,
  XCircle,
} from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'

interface Migration {
  id: string
  name: string
  version: string
  status: 'applied' | 'pending' | 'failed' | 'rolled_back'
  appliedAt?: string
  duration?: number
  direction: 'up' | 'down'
  description?: string
  appliedBy?: string
  changes?: string[]
}

export default function MigrationHistoryPage() {
  const [loading, setLoading] = useState(true)
  const [migrations, setMigrations] = useState<Migration[]>([])
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const fetchMigrations = useCallback(async () => {
    try {
      // Mock data - replace with real API
      const mockMigrations: Migration[] = [
        {
          id: 'mig-1',
          name: 'add_user_preferences',
          version: '20240120_001',
          status: 'applied',
          appliedAt: new Date(Date.now() - 86400000).toISOString(),
          duration: 2500,
          direction: 'up',
          description: 'Add user preferences table with default settings',
          appliedBy: 'developer@example.com',
          changes: [
            'CREATE TABLE user_preferences',
            'ADD INDEX idx_user_id',
            'INSERT default settings',
          ],
        },
        {
          id: 'mig-2',
          name: 'add_notifications_table',
          version: '20240118_001',
          status: 'applied',
          appliedAt: new Date(Date.now() - 172800000).toISOString(),
          duration: 1800,
          direction: 'up',
          description: 'Create notifications table for user alerts',
          appliedBy: 'developer@example.com',
          changes: ['CREATE TABLE notifications', 'ADD FOREIGN KEY to users'],
        },
        {
          id: 'mig-3',
          name: 'update_user_schema',
          version: '20240115_001',
          status: 'applied',
          appliedAt: new Date(Date.now() - 345600000).toISOString(),
          duration: 3200,
          direction: 'up',
          description: 'Add new fields to user table',
          appliedBy: 'admin@example.com',
          changes: [
            'ALTER TABLE users ADD avatar_url',
            'ALTER TABLE users ADD bio',
          ],
        },
        {
          id: 'mig-4',
          name: 'add_analytics_tables',
          version: '20240110_001',
          status: 'rolled_back',
          appliedAt: new Date(Date.now() - 604800000).toISOString(),
          duration: 4500,
          direction: 'down',
          description:
            'Analytics tables (rolled back due to performance issues)',
          appliedBy: 'developer@example.com',
          changes: ['DROP TABLE page_views', 'DROP TABLE events'],
        },
        {
          id: 'mig-5',
          name: 'initial_schema',
          version: '20240101_001',
          status: 'applied',
          appliedAt: new Date(Date.now() - 2592000000).toISOString(),
          duration: 8000,
          direction: 'up',
          description: 'Initial database schema',
          appliedBy: 'admin@example.com',
          changes: [
            'CREATE TABLE users',
            'CREATE TABLE sessions',
            'CREATE TABLE config',
          ],
        },
        {
          id: 'mig-6',
          name: 'add_audit_log',
          version: '20240125_001',
          status: 'pending',
          direction: 'up',
          description: 'Add audit log table for tracking changes',
          changes: ['CREATE TABLE audit_log', 'ADD trigger for changes'],
        },
      ]

      let filtered = mockMigrations
      if (filterStatus !== 'all') {
        filtered = filtered.filter((m) => m.status === filterStatus)
      }

      setMigrations(filtered)
    } catch (_error) {
      // Handle error silently
    } finally {
      setLoading(false)
    }
  }, [filterStatus])

  useEffect(() => {
    fetchMigrations()
  }, [fetchMigrations])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'applied':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'rolled_back':
        return <RotateCcw className="h-5 w-5 text-orange-500" />
      default:
        return <Database className="h-5 w-5 text-zinc-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'applied':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'failed':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'rolled_back':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
      default:
        return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300'
    }
  }

  if (loading) {
    return (
      <>
        <HeroPattern />
        <div className="relative mx-auto max-w-7xl">
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
          </div>
        </div>
      </>
    )
  }

  const appliedCount = migrations.filter((m) => m.status === 'applied').length
  const pendingCount = migrations.filter((m) => m.status === 'pending').length
  const rolledBackCount = migrations.filter(
    (m) => m.status === 'rolled_back',
  ).length

  return (
    <>
      <HeroPattern />
      <div className="relative mx-auto max-w-7xl">
        <div className="mb-10 border-b border-zinc-200 pb-8 dark:border-zinc-800">
          <Link
            href="/history"
            className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to History
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="bg-gradient-to-r from-green-600 to-emerald-400 bg-clip-text text-4xl font-bold text-transparent dark:from-green-400 dark:to-emerald-300">
                Migration History
              </h1>
              <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
                Track database schema changes and migrations
              </p>
            </div>
            <button className="flex items-center gap-2 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
            <div className="flex items-center gap-3">
              <Database className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Total Migrations
                </p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                  {migrations.length}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Applied
                </p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                  {appliedCount}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Pending
                </p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                  {pendingCount}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
            <div className="flex items-center gap-3">
              <RotateCcw className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Rolled Back
                </p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                  {rolledBackCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Warning */}
        {pendingCount > 0 && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600 dark:text-yellow-400" />
            <div>
              <p className="font-medium text-yellow-800 dark:text-yellow-300">
                {pendingCount} Pending Migration{pendingCount > 1 ? 's' : ''}
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                Run{' '}
                <code className="rounded bg-yellow-200 px-1 dark:bg-yellow-800">
                  nself db migrate
                </code>{' '}
                to apply pending migrations.
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-zinc-500" />
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              Filters:
            </span>
          </div>
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="appearance-none rounded-lg border border-zinc-300 bg-white px-4 py-2 pr-10 text-sm text-zinc-900 capitalize focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
            >
              <option value="all">All Statuses</option>
              <option value="applied">Applied</option>
              <option value="pending">Pending</option>
              <option value="rolled_back">Rolled Back</option>
              <option value="failed">Failed</option>
            </select>
            <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          </div>
        </div>

        {/* Migration List */}
        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
          {migrations.length === 0 ? (
            <div className="py-12 text-center">
              <Database className="mx-auto mb-4 h-12 w-12 text-zinc-400" />
              <p className="text-zinc-600 dark:text-zinc-400">
                No migrations found matching your filters.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
              {migrations.map((migration) => (
                <div
                  key={migration.id}
                  className="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-700/50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      {getStatusIcon(migration.status)}
                      <div>
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span className="font-mono text-lg font-semibold text-zinc-900 dark:text-white">
                            {migration.name}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${getStatusBadge(migration.status)}`}
                          >
                            {migration.status.replace('_', ' ')}
                          </span>
                          {migration.direction === 'up' ? (
                            <ArrowUp className="h-4 w-4 text-green-500" />
                          ) : (
                            <ArrowDown className="h-4 w-4 text-orange-500" />
                          )}
                        </div>

                        <p className="mb-2 text-sm text-zinc-500 dark:text-zinc-400">
                          Version: {migration.version}
                        </p>

                        {migration.description && (
                          <p className="mb-2 text-sm text-zinc-600 dark:text-zinc-400">
                            {migration.description}
                          </p>
                        )}

                        {migration.changes && migration.changes.length > 0 && (
                          <div className="mb-2">
                            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                              Changes:
                            </p>
                            <ul className="mt-1 space-y-0.5">
                              {migration.changes.map((change, idx) => (
                                <li
                                  key={idx}
                                  className="font-mono text-xs text-zinc-600 dark:text-zinc-400"
                                >
                                  {change}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {migration.appliedAt && (
                          <div className="mt-2 flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(migration.appliedAt).toLocaleString()}
                            </span>
                            {migration.duration && (
                              <span>{migration.duration}ms</span>
                            )}
                            {migration.appliedBy && (
                              <span>{migration.appliedBy}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-700"
                        title="View SQL"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {migration.status === 'applied' && (
                        <button
                          className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-700"
                          title="Rollback migration"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </button>
                      )}
                      {migration.status === 'pending' && (
                        <button
                          className="rounded-lg p-2 text-green-500 transition-colors hover:bg-green-100 dark:hover:bg-green-900/30"
                          title="Apply migration"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CLI Reference */}
        <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
          <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
            CLI Commands Reference
          </h3>
          <div className="space-y-2 font-mono text-sm">
            <p className="text-zinc-600 dark:text-zinc-400">
              <span className="text-green-500">nself db migrate</span> - Apply
              all pending migrations
            </p>
            <p className="text-zinc-600 dark:text-zinc-400">
              <span className="text-green-500">nself db migrate --status</span>{' '}
              - Show migration status
            </p>
            <p className="text-zinc-600 dark:text-zinc-400">
              <span className="text-green-500">
                nself db migrate --rollback
              </span>{' '}
              - Rollback last migration
            </p>
            <p className="text-zinc-600 dark:text-zinc-400">
              <span className="text-green-500">
                nself db migrate --to=20240118_001
              </span>{' '}
              - Migrate to specific version
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
