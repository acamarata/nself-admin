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
  AlertTriangle,
  CheckCircle,
  Database,
  FileArchive,
  Loader2,
  RotateCcw,
  Terminal,
  Upload,
  XCircle,
} from 'lucide-react'
import { useState } from 'react'

interface RestoreResult {
  success: boolean
  output?: string
  error?: string
  timestamp: string
  backupFile?: string
}

export default function DatabaseRestorePage() {
  const [isRunning, setIsRunning] = useState(false)
  const [backupPath, setBackupPath] = useState('')
  const [restoreResults, setRestoreResults] = useState<RestoreResult[]>([])
  const [lastOutput, setLastOutput] = useState<string>('')

  /**
   * Execute nself db restore via the CLI API
   */
  const runRestore = async () => {
    if (!backupPath.trim()) {
      setLastOutput('Error: Please enter a backup file path')
      return
    }

    setIsRunning(true)
    setLastOutput('')

    try {
      const response = await fetch('/api/database/cli', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'restore',
          options: { backupPath: backupPath.trim() },
        }),
      })

      const data = await response.json()

      const result: RestoreResult = {
        success: data.success,
        output: data.data?.output || data.details,
        error: data.error,
        timestamp: new Date().toLocaleString(),
        backupFile: backupPath,
      }

      setRestoreResults((prev) => [result, ...prev.slice(0, 9)])
      setLastOutput(data.data?.output || data.details || '')
    } catch (error) {
      const result: RestoreResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Restore failed',
        timestamp: new Date().toLocaleString(),
      }
      setRestoreResults((prev) => [result, ...prev.slice(0, 9)])
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <PageTemplate description="Restore database from backup using nself CLI">
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Warning: Destructive Operation</AlertTitle>
          <AlertDescription>
            Restoring a database will overwrite all existing data. Make sure you
            have a recent backup before proceeding.
          </AlertDescription>
        </Alert>

        <Alert>
          <Database className="h-4 w-4" />
          <AlertTitle>nself CLI Integration</AlertTitle>
          <AlertDescription>
            This page executes{' '}
            <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">
              nself db restore
            </code>{' '}
            to restore your database.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-orange-600" />
                <CardTitle>Database Restore</CardTitle>
              </div>
              <CardDescription>
                Restore your PostgreSQL database from a backup file
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Backup File Path</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="/backups/backup-2024-01-15.sql"
                    value={backupPath}
                    onChange={(e) => setBackupPath(e.target.value)}
                    className="flex-1"
                  />
                  <Button variant="outline" size="icon">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Button
                onClick={runRestore}
                disabled={isRunning || !backupPath.trim()}
                className="w-full"
                size="lg"
                variant="destructive"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Restoring database...
                  </>
                ) : (
                  <>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Restore Database
                  </>
                )}
              </Button>

              <div className="rounded-lg bg-zinc-900 p-4 font-mono text-sm text-green-400">
                <div className="flex items-center gap-2 text-zinc-500">
                  <Terminal className="h-4 w-4" />
                  <span>Command:</span>
                </div>
                <div className="mt-2">
                  $ nself db restore {backupPath || '<backup-file>'}
                </div>
              </div>
            </CardContent>
          </Card>

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
                    Run a restore to see output here
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Restore History</CardTitle>
            <CardDescription>
              History of restore operations from this session
            </CardDescription>
          </CardHeader>
          <CardContent>
            {restoreResults.length === 0 ? (
              <div className="py-8 text-center text-zinc-500">
                No restore operations performed yet
              </div>
            ) : (
              <div className="space-y-3">
                {restoreResults.map((result, index) => (
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
                          <FileArchive className="h-4 w-4" />
                          {result.backupFile || 'Unknown file'}
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
