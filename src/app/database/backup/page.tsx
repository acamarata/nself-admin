'use client'

import { PageTemplate } from '@/components/PageTemplate'
import { TableSkeleton } from '@/components/skeletons'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import type { Backup } from '@/types/database'
import {
  Archive,
  Calendar,
  CheckCircle,
  Clock,
  Database,
  Download,
  FileArchive,
  HardDrive,
  Loader2,
  RefreshCw,
  Save,
  Terminal,
  Trash2,
  XCircle,
} from 'lucide-react'
import { Suspense, useState } from 'react'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface BackupFormData {
  name: string
  type: 'full' | 'data' | 'schema'
  compress: boolean
  tables: string[]
  excludeTables: string[]
}

function DatabaseBackupContent() {
  const {
    data: backupData,
    error,
    isLoading,
    mutate: refreshBackups,
  } = useSWR('/api/database/backup', fetcher, {
    refreshInterval: 30000,
  })

  const [isCreating, setIsCreating] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [lastOutput, setLastOutput] = useState<string>('')
  const [formData, setFormData] = useState<BackupFormData>({
    name: '',
    type: 'full',
    compress: true,
    tables: [],
    excludeTables: [],
  })

  const backups: Backup[] = backupData?.data || []

  const createBackup = async () => {
    setIsCreating(true)
    setLastOutput('')

    try {
      const response = await fetch('/api/database/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name || undefined,
          dataOnly: formData.type === 'data',
          schemaOnly: formData.type === 'schema',
          compress: formData.compress,
          tables: formData.tables.length > 0 ? formData.tables : undefined,
          excludeTables:
            formData.excludeTables.length > 0
              ? formData.excludeTables
              : undefined,
        }),
      })

      const data = await response.json()
      setLastOutput(
        data.data?.output || data.details || JSON.stringify(data, null, 2),
      )

      if (data.success) {
        refreshBackups()
        setFormData({
          name: '',
          type: 'full',
          compress: true,
          tables: [],
          excludeTables: [],
        })
      }
    } catch (err) {
      setLastOutput(
        err instanceof Error ? err.message : 'Backup creation failed',
      )
    } finally {
      setIsCreating(false)
    }
  }

  const deleteBackup = async (backupId: string, backupName: string) => {
    if (!confirm(`Are you sure you want to delete "${backupName}"?`)) {
      return
    }

    setIsDeleting(backupId)

    try {
      const response = await fetch(
        `/api/database/backup/${encodeURIComponent(backupId)}`,
        {
          method: 'DELETE',
        },
      )

      const data = await response.json()

      if (data.success) {
        refreshBackups()
      } else {
        alert(data.error || 'Failed to delete backup')
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setIsDeleting(null)
    }
  }

  const downloadBackup = (backup: Backup) => {
    window.open(
      `/api/database/backup/${encodeURIComponent(backup.id)}/download`,
      '_blank',
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      relative: getRelativeTime(date),
    }
  }

  const getRelativeTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    return 'Just now'
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'full':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'data':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
      case 'schema':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20'
      default:
        return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
    }
  }

  const getEnvironmentColor = (env: string) => {
    switch (env) {
      case 'production':
        return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'staging':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20'
      default:
        return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
    }
  }

  const totalSize = backups.reduce((acc, b) => {
    const match = b.size.match(/(\d+(?:\.\d+)?)\s*(B|KB|MB|GB)/i)
    if (!match) return acc
    const value = parseFloat(match[1])
    const unit = match[2].toUpperCase()
    const multipliers: Record<string, number> = {
      B: 1,
      KB: 1024,
      MB: 1024 * 1024,
      GB: 1024 * 1024 * 1024,
    }
    return acc + value * (multipliers[unit] || 1)
  }, 0)

  const formatTotalSize = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 B'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <PageTemplate
      title="Database Backups"
      description="Create, manage, and download database backups using nself CLI"
    >
      <div className="space-y-6">
        {/* Info Alert */}
        <Alert>
          <Database className="h-4 w-4" />
          <AlertTitle>nself CLI Integration</AlertTitle>
          <AlertDescription>
            This page executes{' '}
            <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">
              nself db backup
            </code>{' '}
            to create database backups. Backups are stored in your
            project&apos;s backups directory.
          </AlertDescription>
        </Alert>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-500">
                    Total Backups
                  </p>
                  <p className="mt-1 text-2xl font-bold">{backups.length}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                  <Archive className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-500">
                    Total Size
                  </p>
                  <p className="mt-1 text-2xl font-bold">
                    {formatTotalSize(totalSize)}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10">
                  <HardDrive className="h-6 w-6 text-emerald-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-500">
                    Latest Backup
                  </p>
                  <p className="mt-1 text-2xl font-bold">
                    {backups[0]
                      ? formatDate(backups[0].createdAt).relative
                      : 'Never'}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/10">
                  <Clock className="h-6 w-6 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-500">
                    Compressed
                  </p>
                  <p className="mt-1 text-2xl font-bold">
                    {backups.filter((b) => b.compressed).length} /{' '}
                    {backups.length}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10">
                  <FileArchive className="h-6 w-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Create Backup Form */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Save className="h-5 w-5 text-blue-600" />
                <CardTitle>Create Backup</CardTitle>
              </div>
              <CardDescription>
                Create a new database backup with custom options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="backup-name">Backup Name (optional)</Label>
                  <Input
                    id="backup-name"
                    placeholder="my-backup-2024-01-15"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                  <p className="text-xs text-zinc-500">
                    Leave blank for auto-generated timestamp name
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Backup Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: string) =>
                      setFormData({
                        ...formData,
                        type: value as 'full' | 'data' | 'schema',
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Full Database</SelectItem>
                      <SelectItem value="data">Data Only</SelectItem>
                      <SelectItem value="schema">Schema Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4 dark:border-zinc-700">
                  <div>
                    <p className="text-sm font-medium">Compression</p>
                    <p className="text-xs text-zinc-500">
                      Compress backup with gzip (recommended)
                    </p>
                  </div>
                  <Switch
                    checked={formData.compress}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, compress: checked })
                    }
                  />
                </div>
              </div>

              <Button
                onClick={createBackup}
                disabled={isCreating}
                className="w-full"
                size="lg"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating backup...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Create Backup
                  </>
                )}
              </Button>

              {/* Command Preview */}
              <div className="rounded-lg bg-zinc-900 p-4 font-mono text-sm text-green-400">
                <div className="flex items-center gap-2 text-zinc-500">
                  <Terminal className="h-4 w-4" />
                  <span>Command:</span>
                </div>
                <div className="mt-2">
                  $ nself db backup
                  {formData.name && ` --name=${formData.name}`}
                  {formData.type === 'data' && ' --data-only'}
                  {formData.type === 'schema' && ' --schema-only'}
                  {formData.compress && ' --compress'}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CLI Output */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5" />
                CLI Output
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-80 rounded-lg bg-zinc-950 p-4">
                {lastOutput ? (
                  <pre className="font-mono text-xs whitespace-pre-wrap text-zinc-300">
                    {lastOutput}
                  </pre>
                ) : (
                  <div className="flex h-full items-center justify-center text-zinc-500">
                    Create a backup to see output here
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Backup List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Archive className="h-5 w-5" />
                  Backup History
                </CardTitle>
                <CardDescription>
                  All database backups stored in your project
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refreshBackups()}
                disabled={isLoading}
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
                />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="py-8 text-center">
                <XCircle className="mx-auto mb-2 h-8 w-8 text-red-500" />
                <p className="text-zinc-500">Failed to load backups</p>
                <Button
                  variant="link"
                  className="mt-2"
                  onClick={() => refreshBackups()}
                >
                  Retry
                </Button>
              </div>
            ) : isLoading && backups.length === 0 ? (
              <div className="py-8 text-center">
                <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin text-zinc-400" />
                <p className="text-zinc-500">Loading backups...</p>
              </div>
            ) : backups.length === 0 ? (
              <div className="py-8 text-center text-zinc-500">
                <Archive className="mx-auto mb-2 h-8 w-8 opacity-50" />
                <p>No backups found</p>
                <p className="mt-1 text-sm">Create your first backup above</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b dark:border-zinc-700">
                      <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">
                        Size
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">
                        Environment
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">
                        Created
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-zinc-700">
                    {backups.map((backup) => {
                      const dateInfo = formatDate(backup.createdAt)
                      return (
                        <tr
                          key={backup.id}
                          className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex h-10 w-10 items-center justify-center rounded-lg ${getTypeColor(backup.type)}`}
                              >
                                <Database className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-zinc-900 dark:text-white">
                                  {backup.name}
                                </p>
                                <p className="text-xs text-zinc-500">
                                  {backup.filename}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              variant="outline"
                              className={getTypeColor(backup.type)}
                            >
                              {backup.type}
                              {backup.compressed && ' (gz)'}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                            {backup.size}
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              variant="outline"
                              className={getEnvironmentColor(
                                backup.environment,
                              )}
                            >
                              {backup.environment}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-zinc-400" />
                              <div>
                                <p className="text-sm text-zinc-900 dark:text-white">
                                  {dateInfo.date}
                                </p>
                                <p className="text-xs text-zinc-500">
                                  {dateInfo.time}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => downloadBackup(backup)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-600"
                                onClick={() =>
                                  deleteBackup(backup.id, backup.name)
                                }
                                disabled={isDeleting === backup.id}
                              >
                                {isDeleting === backup.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Success Indicator */}
        {lastOutput && lastOutput.toLowerCase().includes('success') && (
          <div className="fixed right-4 bottom-4 flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white shadow-lg">
            <CheckCircle className="h-4 w-4" />
            Backup created successfully
          </div>
        )}
      </div>
    </PageTemplate>
  )
}

export default function DatabaseBackupPage() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <DatabaseBackupContent />
    </Suspense>
  )
}
