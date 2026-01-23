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
import { Switch } from '@/components/ui/switch'
import {
  CheckCircle,
  Database,
  Loader2,
  Play,
  RefreshCw,
  Sprout,
  Terminal,
  XCircle,
} from 'lucide-react'
import { useState } from 'react'

interface SeedResult {
  success: boolean
  output?: string
  error?: string
  timestamp: string
}

export default function DatabaseSeedPage() {
  const [isSeeding, setIsSeeding] = useState(false)
  const [forceMode, setForceMode] = useState(false)
  const [seedResults, setSeedResults] = useState<SeedResult[]>([])
  const [lastOutput, setLastOutput] = useState<string>('')

  /**
   * Execute nself db seed via the CLI API
   * This delegates to the nself CLI rather than reimplementing seed logic
   */
  const runSeed = async () => {
    setIsSeeding(true)
    setLastOutput('')

    try {
      const response = await fetch('/api/database/cli', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'seed',
          options: { force: forceMode },
        }),
      })

      const data = await response.json()

      const result: SeedResult = {
        success: data.success,
        output: data.data?.output || data.details,
        error: data.error,
        timestamp: new Date().toLocaleString(),
      }

      setSeedResults((prev) => [result, ...prev.slice(0, 9)])
      setLastOutput(data.data?.output || data.details || '')
    } catch (error) {
      const result: SeedResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Seed failed',
        timestamp: new Date().toLocaleString(),
      }
      setSeedResults((prev) => [result, ...prev.slice(0, 9)])
    } finally {
      setIsSeeding(false)
    }
  }

  /**
   * Execute nself db sync to sync Hasura metadata
   */
  const runSync = async () => {
    setIsSeeding(true)
    setLastOutput('')

    try {
      const response = await fetch('/api/database/cli', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync' }),
      })

      const data = await response.json()

      const result: SeedResult = {
        success: data.success,
        output: data.data?.output || data.details,
        error: data.error,
        timestamp: new Date().toLocaleString(),
      }

      setSeedResults((prev) => [result, ...prev.slice(0, 9)])
      setLastOutput(data.data?.output || data.details || '')
    } catch (error) {
      const result: SeedResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Sync failed',
        timestamp: new Date().toLocaleString(),
      }
      setSeedResults((prev) => [result, ...prev.slice(0, 9)])
    } finally {
      setIsSeeding(false)
    }
  }

  return (
    <PageTemplate description="Seed database with initial data using nself CLI">
      <div className="space-y-6">
        {/* Info Alert */}
        <Alert>
          <Database className="h-4 w-4" />
          <AlertTitle>nself CLI Integration</AlertTitle>
          <AlertDescription>
            This page executes{' '}
            <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">
              nself db seed
            </code>{' '}
            to populate your database. Seed files are managed in your
            project&apos;s seed directory.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Seed Controls */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sprout className="h-5 w-5 text-green-600" />
                <CardTitle>Database Seeding</CardTitle>
              </div>
              <CardDescription>
                Populate your database with seed data defined in your project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Force Mode Toggle */}
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <div className="font-medium">Force Mode</div>
                  <div className="text-sm text-zinc-500">
                    Clear existing data before seeding (--force flag)
                  </div>
                </div>
                <Switch checked={forceMode} onCheckedChange={setForceMode} />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <Button
                  onClick={runSeed}
                  disabled={isSeeding}
                  className="w-full"
                  size="lg"
                >
                  {isSeeding ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Running nself db seed...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Run Seed {forceMode && '(Force)'}
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={runSync}
                  disabled={isSeeding}
                  className="w-full"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sync Hasura Metadata
                </Button>
              </div>

              {/* CLI Command Preview */}
              <div className="rounded-lg bg-zinc-900 p-4 font-mono text-sm text-green-400">
                <div className="flex items-center gap-2 text-zinc-500">
                  <Terminal className="h-4 w-4" />
                  <span>Command:</span>
                </div>
                <div className="mt-2">
                  $ nself db seed{forceMode ? ' --force' : ''}
                </div>
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
                    Run a command to see output here
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* History */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Operations</CardTitle>
            <CardDescription>
              History of seed operations from this session
            </CardDescription>
          </CardHeader>
          <CardContent>
            {seedResults.length === 0 ? (
              <div className="py-8 text-center text-zinc-500">
                No operations run yet
              </div>
            ) : (
              <div className="space-y-3">
                {seedResults.map((result, index) => (
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
                          {result.success ? 'Success' : 'Failed'}
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
