'use client'

import { Button } from '@/components/Button'
import { HeroPattern } from '@/components/HeroPattern'
import { TableSkeleton } from '@/components/skeletons'
import {
  Activity,
  Download,
  FileText,
  Filter,
  Loader2,
  Search,
  User,
} from 'lucide-react'
import { Suspense, useEffect, useState } from 'react'

interface AuditEntry {
  id: string
  timestamp: string
  user: string
  action: string
  resource: string
  result: 'success' | 'failure'
  ipAddress: string
  details?: string
}

function SystemAuditContent() {
  const [entries, setEntries] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [_filter, _setFilter] = useState({
    user: '',
    action: '',
    result: '',
    dateFrom: '',
    dateTo: '',
  })

  useEffect(() => {
    const mockEntries: AuditEntry[] = [
      {
        id: '1',
        timestamp: new Date().toISOString(),
        user: 'admin',
        action: 'login',
        resource: '/auth/login',
        result: 'success',
        ipAddress: '192.168.1.100',
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        user: 'admin',
        action: 'update_config',
        resource: '/config/env',
        result: 'success',
        ipAddress: '192.168.1.100',
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        user: 'user1',
        action: 'login',
        resource: '/auth/login',
        result: 'failure',
        ipAddress: '192.168.1.50',
        details: 'Invalid password',
      },
    ]
    setEntries(mockEntries)
    setLoading(false)
  }, [])

  const exportAuditLog = () => {
    // Export logic
  }

  if (loading) {
    return (
      <>
        <HeroPattern />
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <HeroPattern />
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="flex items-center gap-3 text-3xl font-bold text-zinc-900 dark:text-white">
                <FileText className="h-8 w-8 text-blue-500" />
                Audit Log
              </h1>
              <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                View all system activity and user actions
              </p>
            </div>
            <Button onClick={exportAuditLog} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search audit log..."
                  className="w-full rounded-lg border border-zinc-200 py-2 pr-4 pl-10 dark:border-zinc-700 dark:bg-zinc-900"
                />
              </div>
              <Button variant="outline" className="text-sm">
                <Filter className="mr-1 h-3 w-3" />
                Filters
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50 dark:bg-zinc-900/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">
                    Timestamp
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">
                    Action
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">
                    Resource
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">
                    Result
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">
                    IP Address
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                {entries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  >
                    <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                      {new Date(entry.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-zinc-400" />
                        <span className="text-sm">{entry.user}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-zinc-400" />
                        <span className="text-sm">{entry.action}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-zinc-600 dark:text-zinc-400">
                      {entry.resource}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded px-2 py-1 text-xs font-medium ${
                          entry.result === 'success'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}
                      >
                        {entry.result}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-zinc-600 dark:text-zinc-400">
                      {entry.ipAddress}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}

export default function SystemAuditPage() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <SystemAuditContent />
    </Suspense>
  )
}
