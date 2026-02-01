'use client'

import { PageTemplate } from '@/components/PageTemplate'
import { FormSkeleton } from '@/components/skeletons'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/lib/toast'
import {
  ArrowRight,
  Clock,
  Loader2,
  RefreshCw,
  Settings,
  Terminal,
} from 'lucide-react'
import { Suspense, useState } from 'react'

const ENVIRONMENTS = [
  { value: 'local', label: 'Local', description: 'Local development' },
  { value: 'dev', label: 'Dev', description: 'Shared development' },
  { value: 'stage', label: 'Stage', description: 'Staging environment' },
  { value: 'prod', label: 'Prod', description: 'Production environment' },
]

function ConfigSyncContent() {
  const [source, setSource] = useState('local')
  const [target, setTarget] = useState('dev')
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastOutput, setLastOutput] = useState('')
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null)
  const [_syncSuccess, setSyncSuccess] = useState<boolean | null>(null)

  const runSync = async () => {
    if (source === target) {
      setLastOutput('Error: Source and target environments must be different.')
      setSyncSuccess(false)
      return
    }

    setIsSyncing(true)
    setLastOutput('')
    setSyncSuccess(null)

    try {
      const response = await fetch('/api/config/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source, target }),
      })

      const data = await response.json()
      const output =
        data.data?.output || data.data?.stderr || data.error || data.details
      setLastOutput(output || JSON.stringify(data, null, 2))
      setSyncSuccess(data.success)

      if (data.success) {
        setLastSyncTime(new Date().toISOString())
        toast.success('Configuration synced successfully')
      } else {
        toast.error('Sync failed', { description: output })
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Sync request failed'
      setLastOutput(message)
      setSyncSuccess(false)
      toast.error(message)
    } finally {
      setIsSyncing(false)
    }
  }

  const checkStatus = async () => {
    setIsSyncing(true)
    setLastOutput('')
    setSyncSuccess(null)

    try {
      const response = await fetch('/api/config/sync')
      const data = await response.json()
      const output =
        data.data?.output || data.data?.stderr || data.error || data.details
      setLastOutput(output || JSON.stringify(data, null, 2))
      setSyncSuccess(data.success)
    } catch (error) {
      setLastOutput(
        error instanceof Error ? error.message : 'Status check failed',
      )
      setSyncSuccess(false)
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <PageTemplate
      title="Config Sync"
      description="Synchronize configuration between environments using nself CLI"
    >
      <div className="space-y-6">
        {/* Info Alert */}
        <Alert>
          <Settings className="h-4 w-4" />
          <AlertTitle>nself CLI Integration</AlertTitle>
          <AlertDescription>
            This page executes{' '}
            <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">
              nself config sync
            </code>{' '}
            to synchronize environment configuration files between environments.
          </AlertDescription>
        </Alert>

        {/* Last Sync Info */}
        {lastSyncTime && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800 dark:bg-emerald-950/30">
            <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm text-emerald-700 dark:text-emerald-300">
              Last sync: {new Date(lastSyncTime).toLocaleString()}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Sync Controls */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-blue-600" />
                <CardTitle>Sync Configuration</CardTitle>
              </div>
              <CardDescription>
                Select source and target environments to sync configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Environment Selectors */}
              <div className="flex items-center gap-4">
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Source
                  </label>
                  <Select value={source} onValueChange={setSource}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ENVIRONMENTS.map((env) => (
                        <SelectItem key={env.value} value={env.value}>
                          <div className="flex items-center gap-2">
                            <span>{env.label}</span>
                            <span className="text-xs text-zinc-500">
                              ({env.description})
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <ArrowRight className="mt-6 h-5 w-5 text-zinc-400" />

                <div className="flex-1 space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Target
                  </label>
                  <Select value={target} onValueChange={setTarget}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ENVIRONMENTS.map((env) => (
                        <SelectItem key={env.value} value={env.value}>
                          <div className="flex items-center gap-2">
                            <span>{env.label}</span>
                            <span className="text-xs text-zinc-500">
                              ({env.description})
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {source === target && (
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  Source and target must be different environments.
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={runSync}
                  disabled={isSyncing || source === target}
                  className="flex-1"
                  size="lg"
                >
                  {isSyncing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Sync Config
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={checkStatus}
                  disabled={isSyncing}
                >
                  Check Status
                </Button>
              </div>

              {/* Command Preview */}
              <div className="rounded-lg bg-zinc-900 p-4 font-mono text-sm text-green-400">
                <div className="flex items-center gap-2 text-zinc-500">
                  <Terminal className="h-4 w-4" />
                  <span>Command:</span>
                </div>
                <div className="mt-2">
                  $ nself config sync --from={source} --to={target}
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
                    Run a sync to see output here
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTemplate>
  )
}

export default function ConfigSyncPage() {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <ConfigSyncContent />
    </Suspense>
  )
}
