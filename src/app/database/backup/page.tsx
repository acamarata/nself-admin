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
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Archive,
  CheckCircle,
  Database,
  Download,
  Loader2,
  Save,
  Terminal,
  XCircle,
} from 'lucide-react'
import { useState } from 'react'

interface BackupResult {
  success: boolean
  output?: string
  error?: string
  timestamp: string
  filename?: string
}

export default function DatabaseBackupPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [backupResults, setBackupResults] = useState<BackupResult[]>([])
  const [lastOutput, setLastOutput] = useState<string>('')

  /**
   * Execute nself db backup via the CLI API
   * This delegates to the nself CLI rather than reimplementing backup logic
   */
  const runBackup = async () => {
    setIsRunning(true)
    setLastOutput('')

    try {
      const response = await fetch('/api/database/cli', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'backup' }),
      })

      const data = await response.json()

      // Parse output for filename
      let filename = ''
      if (data.data?.output) {
        const match = data.data.output.match(/Backup created: (.+\.sql)/i)
        if (match) filename = match[1]
      }

      const result: BackupResult = {
        success: data.success,
        output: data.data?.output || data.details,
        error: data.error,
        timestamp: new Date().toLocaleString(),
        filename,
      }

      setBackupResults((prev) => [result, ...prev.slice(0, 9)])
      setLastOutput(data.data?.output || data.details || '')
    } catch (error) {
      const result: BackupResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Backup failed',
        timestamp: new Date().toLocaleString(),
      }
      setBackupResults((prev) => [result, ...prev.slice(0, 9)])
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <PageTemplate description="Create and manage database backups using nself CLI">
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

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Backup Controls */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Archive className="h-5 w-5 text-blue-600" />
                <CardTitle>Database Backup</CardTitle>
              </div>
              <CardDescription>
                Create a backup of your PostgreSQL database
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Action Button */}
              <Button
                onClick={runBackup}
                disabled={isRunning}
                className="w-full"
                size="lg"
              >
                {isRunning ? (
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

              {/* Info */}
              <div className="rounded-lg border p-4 text-sm text-zinc-600 dark:text-zinc-400">
                <p className="font-medium text-zinc-900 dark:text-white">
                  What gets backed up:
                </p>
                <ul className="mt-2 list-inside list-disc space-y-1">
                  <li>All database schemas and tables</li>
                  <li>Hasura metadata and migrations</li>
                  <li>User data and configurations</li>
                </ul>
              </div>

              {/* CLI Command Preview */}
              <div className="rounded-lg bg-zinc-900 p-4 font-mono text-sm text-green-400">
                <div className="flex items-center gap-2 text-zinc-500">
                  <Terminal className="h-4 w-4" />
                  <span>Command:</span>
                </div>
                <div className="mt-2">$ nself db backup</div>
              </div>
            </CardContent>
          </Card>

          {/* Output Panel */}
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
                    Run a backup to see output here
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Backup History */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Backups</CardTitle>
            <CardDescription>
              History of backup operations from this session
            </CardDescription>
          </CardHeader>
          <CardContent>
            {backupResults.length === 0 ? (
              <div className="py-8 text-center text-zinc-500">
                No backups created yet
              </div>
            ) : (
              <div className="space-y-3">
                {backupResults.map((result, index) => (
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
                        <div className="font-medium">
                          {result.filename ||
                            (result.success
                              ? 'Backup Created'
                              : 'Backup Failed')}
                        </div>
                        <div className="text-sm text-zinc-500">
                          {result.timestamp}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={result.success ? 'default' : 'destructive'}
                      >
                        {result.success ? 'Completed' : 'Error'}
                      </Badge>
                      {result.success && result.filename && (
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
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
