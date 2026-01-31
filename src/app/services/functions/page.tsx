'use client'

import { PageShell } from '@/components/PageShell'
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
import { Textarea } from '@/components/ui/textarea'
import {
  Code2,
  Loader2,
  Play,
  RefreshCw,
  Rocket,
  ScrollText,
  Terminal,
  Zap,
} from 'lucide-react'
import { useCallback, useState } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FunctionEntry {
  name: string
  runtime: string
  status: string
  lastDeployed?: string
}

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------

export default function FunctionsPage() {
  // List state
  const [functions, setFunctions] = useState<FunctionEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cliOutput, setCliOutput] = useState<string | null>(null)
  const [lastCommand, setLastCommand] = useState<string>(
    'nself service functions list',
  )

  // Deploy state
  const [deploying, setDeploying] = useState(false)

  // Init state
  const [initializing, setInitializing] = useState(false)

  // Logs state
  const [showLogs, setShowLogs] = useState(false)
  const [logsOutput, setLogsOutput] = useState<string | null>(null)
  const [loadingLogs, setLoadingLogs] = useState(false)

  // Invoke state
  const [showInvoke, setShowInvoke] = useState(false)
  const [invokeName, setInvokeName] = useState('')
  const [invokePayload, setInvokePayload] = useState('')
  const [invoking, setInvoking] = useState(false)
  const [invokeResult, setInvokeResult] = useState<string | null>(null)

  // ---------------------------------------------------------------------------
  // Fetch functions list
  // ---------------------------------------------------------------------------
  const fetchFunctions = useCallback(async () => {
    setLoading(true)
    setError(null)
    setLastCommand('nself service functions list')
    try {
      const res = await fetch('/api/services/functions/list')
      const json = await res.json()
      if (json.success) {
        setCliOutput(json.data.output)
        // Parse function list if structured output is available.
        // Falls back to empty list since CLI output format may vary.
        setFunctions([])
      } else {
        setError(json.error || 'Failed to list functions')
        setCliOutput(json.details || json.error)
      }
    } catch (_fetchError) {
      setError('Failed to connect to API')
      setCliOutput('Error: Failed to connect to API')
    } finally {
      setLoading(false)
    }
  }, [])

  // ---------------------------------------------------------------------------
  // Initialize functions service
  // ---------------------------------------------------------------------------
  const initFunctions = useCallback(async () => {
    setInitializing(true)
    setError(null)
    setLastCommand('nself service functions init')
    try {
      const res = await fetch('/api/services/functions/init', {
        method: 'POST',
      })
      const json = await res.json()
      if (json.success) {
        setCliOutput(json.data.output || 'Functions service initialized')
      } else {
        setError(json.error || 'Failed to initialize functions service')
        setCliOutput(json.details || json.error)
      }
    } catch (_fetchError) {
      setError('Failed to connect to API')
      setCliOutput('Error: Failed to connect to API')
    } finally {
      setInitializing(false)
    }
  }, [])

  // ---------------------------------------------------------------------------
  // Deploy functions
  // ---------------------------------------------------------------------------
  const deployFunctions = useCallback(async () => {
    setDeploying(true)
    setError(null)
    setLastCommand('nself service functions deploy')
    try {
      const res = await fetch('/api/services/functions/deploy', {
        method: 'POST',
      })
      const json = await res.json()
      if (json.success) {
        setCliOutput(json.data.output || 'Functions deployed successfully')
        // Refresh function list after deploy
        await fetchFunctions()
      } else {
        setError(json.error || 'Failed to deploy functions')
        setCliOutput(json.details || json.error)
      }
    } catch (_fetchError) {
      setError('Failed to connect to API')
      setCliOutput('Error: Failed to connect to API')
    } finally {
      setDeploying(false)
    }
  }, [fetchFunctions])

  // ---------------------------------------------------------------------------
  // Fetch logs
  // ---------------------------------------------------------------------------
  const fetchLogs = useCallback(async () => {
    setLoadingLogs(true)
    setShowLogs(true)
    setError(null)
    setLastCommand('nself service functions logs')
    try {
      const res = await fetch('/api/services/functions/logs')
      const json = await res.json()
      if (json.success) {
        setLogsOutput(json.data.output)
        setCliOutput(json.data.output)
      } else {
        setError(json.error || 'Failed to fetch function logs')
        setCliOutput(json.details || json.error)
      }
    } catch (_fetchError) {
      setError('Failed to connect to API')
      setCliOutput('Error: Failed to connect to API')
    } finally {
      setLoadingLogs(false)
    }
  }, [])

  // ---------------------------------------------------------------------------
  // Invoke function
  // ---------------------------------------------------------------------------
  const invokeFunction = useCallback(async () => {
    if (!invokeName) return

    setInvoking(true)
    setError(null)
    setInvokeResult(null)
    const payloadDisplay = invokePayload ? ' --payload=...' : ''
    setLastCommand(
      `nself service functions invoke --name=${invokeName}${payloadDisplay}`,
    )
    try {
      const res = await fetch('/api/services/functions/invoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: invokeName,
          ...(invokePayload ? { payload: invokePayload } : {}),
        }),
      })
      const json = await res.json()
      if (json.success) {
        setInvokeResult(json.data.output || 'Function invoked successfully')
        setCliOutput(json.data.output)
      } else {
        setError(json.error || 'Failed to invoke function')
        setCliOutput(json.details || json.error)
      }
    } catch (_fetchError) {
      setError('Failed to connect to API')
      setCliOutput('Error: Failed to connect to API')
    } finally {
      setInvoking(false)
    }
  }, [invokeName, invokePayload])

  return (
    <PageShell
      title="Functions"
      description="Manage, deploy, and test serverless functions"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchFunctions}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={fetchLogs}>
            <ScrollText className="mr-2 h-4 w-4" />
            Logs
          </Button>
          <Button variant="outline" size="sm" onClick={initFunctions}>
            {initializing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Zap className="mr-2 h-4 w-4" />
            )}
            Init
          </Button>
          <Button size="sm" onClick={deployFunctions}>
            {deploying ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Rocket className="mr-2 h-4 w-4" />
            )}
            Deploy
          </Button>
        </div>
      }
    >
      {/* Error Banner */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Function List */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-zinc-500" />
            <CardTitle className="text-base">Deployed Functions</CardTitle>
          </div>
          <CardDescription>
            All registered serverless functions and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {functions.length === 0 ? (
            <div className="py-8 text-center">
              <Code2 className="mx-auto mb-3 h-8 w-8 text-zinc-400" />
              <p className="text-sm text-zinc-500">
                No functions found. Click &ldquo;Refresh&rdquo; to load from the
                CLI, &ldquo;Init&rdquo; to initialize the service, or
                &ldquo;Deploy&rdquo; to deploy your functions.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {functions.map((fn) => (
                <div
                  key={fn.name}
                  className="flex items-center justify-between rounded-lg border border-zinc-200 p-4 dark:border-zinc-700"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {fn.name}
                      </code>
                      <Badge
                        variant={
                          fn.status === 'active' ? 'default' : 'secondary'
                        }
                      >
                        {fn.status}
                      </Badge>
                      {fn.runtime && (
                        <Badge variant="outline" className="text-xs">
                          {fn.runtime}
                        </Badge>
                      )}
                    </div>
                    {fn.lastDeployed && (
                      <p className="mt-1 text-xs text-zinc-500">
                        Last deployed: {fn.lastDeployed}
                      </p>
                    )}
                  </div>
                  <div className="ml-4 flex shrink-0 items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setInvokeName(fn.name)
                        setShowInvoke(true)
                      }}
                      title="Invoke function"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Invocation Form */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Play className="h-4 w-4 text-zinc-500" />
              <CardTitle className="text-base">Test Invocation</CardTitle>
            </div>
            {showInvoke && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowInvoke(false)
                  setInvokeName('')
                  setInvokePayload('')
                  setInvokeResult(null)
                }}
              >
                Clear
              </Button>
            )}
          </div>
          <CardDescription>
            Invoke a function with a test payload and view the response
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Function Name */}
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Function Name
              </label>
              <Input
                type="text"
                placeholder="my-function"
                value={invokeName}
                onChange={(e) => setInvokeName(e.target.value)}
                className="font-mono"
              />
            </div>

            {/* Payload Editor */}
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Payload (JSON)
              </label>
              <Textarea
                placeholder='{"key": "value"}'
                value={invokePayload}
                onChange={(e) => setInvokePayload(e.target.value)}
                className="min-h-[120px] font-mono text-sm"
              />
              <p className="mt-1 text-xs text-zinc-500">
                Optional JSON payload to pass to the function
              </p>
            </div>

            {/* Invoke Button */}
            <Button onClick={invokeFunction} disabled={invoking || !invokeName}>
              {invoking ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              Invoke Function
            </Button>

            {/* Invocation Result */}
            {invokeResult && (
              <div className="rounded-lg bg-zinc-950 p-4">
                <div className="mb-2 text-xs font-medium text-zinc-400">
                  Response
                </div>
                <ScrollArea className="max-h-48">
                  <pre className="font-mono text-xs text-zinc-300">
                    {invokeResult}
                  </pre>
                </ScrollArea>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Function Logs */}
      {showLogs && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ScrollText className="h-4 w-4 text-zinc-500" />
                <CardTitle className="text-base">Function Logs</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowLogs(false)
                  setLogsOutput(null)
                }}
              >
                Close
              </Button>
            </div>
            <CardDescription>
              Recent function execution logs and output
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingLogs ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
              </div>
            ) : logsOutput ? (
              <ScrollArea className="max-h-64">
                <pre className="text-xs text-zinc-700 dark:text-zinc-300">
                  {logsOutput}
                </pre>
              </ScrollArea>
            ) : (
              <p className="py-4 text-center text-sm text-zinc-500">
                No function logs available
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* CLI Command Preview */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-zinc-500" />
            <CardTitle className="text-base">CLI Command</CardTitle>
          </div>
          <CardDescription>
            Command executed against the nself CLI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-zinc-950 p-4">
            <div className="mb-2 font-mono text-sm text-emerald-400">
              $ {lastCommand}
            </div>
            {cliOutput && (
              <ScrollArea className="max-h-48">
                <pre className="font-mono text-xs text-zinc-300">
                  {cliOutput}
                </pre>
              </ScrollArea>
            )}
            {!cliOutput && (
              <p className="font-mono text-xs text-zinc-500">
                Run a command to see output here
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </PageShell>
  )
}
