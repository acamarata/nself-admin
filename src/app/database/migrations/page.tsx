'use client'

import { PageTemplate } from '@/components/PageTemplate'
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
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  ArrowDown,
  ArrowUp,
  CheckCircle,
  Clock,
  Database,
  GitBranch,
  Loader2,
  Play,
  RefreshCw,
  Terminal,
  XCircle,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

interface MigrationResult {
  success: boolean
  output?: string
  error?: string
  timestamp: string
  target?: string
  direction?: 'up' | 'down'
}

interface MigrationStatus {
  pending: number
  applied: number
  lastMigration?: string
  output?: string
}

export default function DatabaseMigrationsPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [targetVersion, setTargetVersion] = useState('')
  const [migrationResults, setMigrationResults] = useState<MigrationResult[]>(
    [],
  )
  const [lastOutput, setLastOutput] = useState<string>('')
  const [status, setStatus] = useState<MigrationStatus | null>(null)
  const [isLoadingStatus, setIsLoadingStatus] = useState(true)

  /**
   * Fetch current migration status from nself CLI
   */
  const fetchMigrationStatus = useCallback(async () => {
    setIsLoadingStatus(true)
    try {
      const response = await fetch('/api/database/cli', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'migrate', options: { status: true } }),
      })

      const data = await response.json()

      if (data.success) {
        // Parse the output to extract status information
        const output = data.data?.output || ''
        setStatus({
          pending: (output.match(/pending/gi) || []).length,
          applied: (output.match(/applied|completed/gi) || []).length,
          lastMigration: output,
          output: output,
        })
        setLastOutput(output)
      }
    } catch (error) {
      console.error('Failed to fetch migration status:', error)
    } finally {
      setIsLoadingStatus(false)
    }
  }, [])

  useEffect(() => {
    fetchMigrationStatus()
  }, [fetchMigrationStatus])

  /**
   * Execute nself db migrate via the CLI API
   */
  const runMigrate = async (direction: 'up' | 'down' = 'up') => {
    setIsRunning(true)
    setLastOutput('')

    try {
      const response = await fetch('/api/database/cli', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'migrate',
          options: {
            target: targetVersion.trim() || undefined,
            direction,
          },
        }),
      })

      const data = await response.json()

      const result: MigrationResult = {
        success: data.success,
        output: data.data?.output || data.details,
        error: data.error,
        timestamp: new Date().toLocaleString(),
        target: targetVersion || 'latest',
        direction,
      }

      setMigrationResults((prev) => [result, ...prev.slice(0, 9)])
      setLastOutput(data.data?.output || data.details || '')

      // Refresh status after migration
      await fetchMigrationStatus()
    } catch (error) {
      const result: MigrationResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Migration failed',
        timestamp: new Date().toLocaleString(),
        direction,
      }
      setMigrationResults((prev) => [result, ...prev.slice(0, 9)])
    } finally {
      setIsRunning(false)
    }
  }

  /**
   * Run all pending migrations
   */
  const runAllPending = async () => {
    setTargetVersion('')
    await runMigrate('up')
  }

  /**
   * Rollback last migration
   */
  const rollbackLast = async () => {
    setTargetVersion('')
    await runMigrate('down')
  }

  return (
    <PageTemplate description="Run database migrations using nself CLI">
      <div className="space-y-6">
        <Alert>
          <Database className="h-4 w-4" />
          <AlertTitle>nself CLI Integration</AlertTitle>
          <AlertDescription>
            This page executes{' '}
            <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">
              nself db migrate
            </code>{' '}
            to manage your database schema migrations.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Migration Controls */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-blue-600" />
                <CardTitle>Database Migrations</CardTitle>
              </div>
              <CardDescription>
                Run or rollback migrations to manage your database schema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Status Summary */}
              {isLoadingStatus ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-green-700 dark:text-green-400">
                        Applied
                      </span>
                    </div>
                    <p className="mt-1 text-2xl font-bold text-green-700 dark:text-green-300">
                      {status?.applied || 0}
                    </p>
                  </div>
                  <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
                        Pending
                      </span>
                    </div>
                    <p className="mt-1 text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                      {status?.pending || 0}
                    </p>
                  </div>
                </div>
              )}

              {/* Target Version Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Target Version (optional)
                </label>
                <Input
                  placeholder="Leave blank for latest"
                  value={targetVersion}
                  onChange={(e) => setTargetVersion(e.target.value)}
                />
                <p className="text-xs text-zinc-500">
                  Specify a migration version to migrate to, or leave blank to
                  run all pending
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={runAllPending}
                  disabled={isRunning}
                  className="w-full"
                  size="lg"
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Run Migrations
                    </>
                  )}
                </Button>
                <Button
                  onClick={rollbackLast}
                  disabled={isRunning}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Rolling back...
                    </>
                  ) : (
                    <>
                      <ArrowDown className="mr-2 h-4 w-4" />
                      Rollback
                    </>
                  )}
                </Button>
              </div>

              <Button
                onClick={fetchMigrationStatus}
                disabled={isLoadingStatus}
                variant="outline"
                className="w-full"
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${isLoadingStatus ? 'animate-spin' : ''}`}
                />
                Refresh Status
              </Button>

              {/* Command Preview */}
              <div className="rounded-lg bg-zinc-900 p-4 font-mono text-sm text-green-400">
                <div className="flex items-center gap-2 text-zinc-500">
                  <Terminal className="h-4 w-4" />
                  <span>Command:</span>
                </div>
                <div className="mt-2">
                  $ nself db migrate{targetVersion ? ` --target=${targetVersion}` : ''}
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
                  <pre className="whitespace-pre-wrap font-mono text-xs text-zinc-300">
                    {lastOutput}
                  </pre>
                ) : (
                  <div className="flex h-full items-center justify-center text-zinc-500">
                    Run a migration to see output here
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Migration History */}
        <Card>
          <CardHeader>
            <CardTitle>Migration History</CardTitle>
            <CardDescription>
              History of migration operations from this session
            </CardDescription>
          </CardHeader>
          <CardContent>
            {migrationResults.length === 0 ? (
              <div className="py-8 text-center text-zinc-500">
                No migration operations performed yet
              </div>
            ) : (
              <div className="space-y-3">
                {migrationResults.map((result, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-3">
                      {result.success ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <div>
                        <div className="flex items-center gap-2 font-medium">
                          {result.direction === 'up' ? (
                            <ArrowUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <ArrowDown className="h-4 w-4 text-orange-600" />
                          )}
                          {result.direction === 'up'
                            ? 'Migrate Up'
                            : 'Rollback'}
                          {result.target && (
                            <span className="text-zinc-500">
                              → {result.target}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-zinc-500">
                          {result.timestamp}
                        </div>
                      </div>
                    </div>
                    <Badge variant={result.success ? 'default' : 'destructive'}>
                      {result.success ? 'Completed' : 'Error'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageTemplate>
  )
}
