'use client'

import type { K8sPod } from '@/types/k8s'
import {
  ArrowLeft,
  Box,
  Download,
  Pause,
  Play,
  Search,
  Terminal,
} from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useRef, useState } from 'react'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

// Mock pods
const mockPods: K8sPod[] = [
  {
    name: 'nself-api-7d9f8b6c5-abc12',
    namespace: 'default',
    status: 'Running',
    ready: '1/1',
    restarts: 0,
    age: '2d',
    containers: [
      {
        name: 'api',
        image: 'nself/api:v1.2.3',
        ready: true,
        restartCount: 0,
        state: 'running',
      },
    ],
  },
  {
    name: 'nself-api-7d9f8b6c5-def34',
    namespace: 'default',
    status: 'Running',
    ready: '1/1',
    restarts: 0,
    age: '2d',
    containers: [
      {
        name: 'api',
        image: 'nself/api:v1.2.3',
        ready: true,
        restartCount: 0,
        state: 'running',
      },
    ],
  },
  {
    name: 'nself-hasura-5c4d3b2a1-jkl78',
    namespace: 'default',
    status: 'Running',
    ready: '1/1',
    restarts: 0,
    age: '2d',
    containers: [
      {
        name: 'hasura',
        image: 'hasura/graphql-engine:v2.35.0',
        ready: true,
        restartCount: 0,
        state: 'running',
      },
    ],
  },
  {
    name: 'nself-auth-6e5f4g3h2-pqr12',
    namespace: 'default',
    status: 'Running',
    ready: '1/1',
    restarts: 0,
    age: '2d',
    containers: [
      {
        name: 'auth',
        image: 'nself/auth:v1.0.0',
        ready: true,
        restartCount: 0,
        state: 'running',
      },
    ],
  },
]

// Mock log lines
const generateMockLogs = (podName: string) => {
  const timestamps = Array.from({ length: 50 }, (_, i) => {
    const d = new Date()
    d.setSeconds(d.getSeconds() - (50 - i) * 10)
    return d.toISOString()
  })

  const levels = ['INFO', 'DEBUG', 'WARN', 'ERROR']
  const messages = [
    'Request received: GET /api/health',
    'Database connection established',
    'Cache hit for key: user:1234',
    'Processing webhook payload',
    'JWT token validated successfully',
    'GraphQL query executed in 45ms',
    'Starting background job: email-sender',
    'Memory usage: 256MB / 512MB',
    'HTTP request completed: 200 OK',
    'Websocket connection established',
  ]

  return timestamps.map((ts, _i) => ({
    timestamp: ts,
    level: levels[Math.floor(Math.random() * levels.length)],
    message: messages[Math.floor(Math.random() * messages.length)],
    pod: podName,
  }))
}

function K8sLogsPageContent() {
  const searchParams = useSearchParams()
  const initialPod = searchParams.get('pod') || ''

  const [selectedPod, setSelectedPod] = useState(initialPod)
  const [selectedContainer, setSelectedContainer] = useState('')
  const [streaming, setStreaming] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [logs, setLogs] = useState<any[]>([])
  const logsEndRef = useRef<HTMLDivElement>(null)

  const { data: podData } = useSWR<{ pods: K8sPod[] }>(
    '/api/k8s/pods',
    fetcher,
    { fallbackData: { pods: mockPods } },
  )

  const pods = podData?.pods || mockPods
  const selectedPodData = pods.find((p) => p.name === selectedPod)

  // Set initial container when pod changes
  useEffect(() => {
    if (selectedPodData?.containers.length) {
      setSelectedContainer(selectedPodData.containers[0].name)
    }
  }, [selectedPodData])

  // Generate initial logs
  useEffect(() => {
    if (selectedPod) {
      setLogs(generateMockLogs(selectedPod))
    }
  }, [selectedPod])

  // Simulate streaming logs
  useEffect(() => {
    if (!streaming || !selectedPod) return

    const interval = setInterval(() => {
      const levels = ['INFO', 'DEBUG', 'WARN']
      const messages = [
        'Request received: GET /api/health',
        'Processing request...',
        'Response sent: 200 OK',
      ]

      setLogs((prev) => [
        ...prev.slice(-99),
        {
          timestamp: new Date().toISOString(),
          level: levels[Math.floor(Math.random() * levels.length)],
          message: messages[Math.floor(Math.random() * messages.length)],
          pod: selectedPod,
        },
      ])
    }, 2000)

    return () => clearInterval(interval)
  }, [streaming, selectedPod])

  // Auto-scroll
  useEffect(() => {
    if (streaming) {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs, streaming])

  const filteredLogs = logs.filter(
    (log) =>
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.level.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const levelColors: Record<string, string> = {
    INFO: 'text-blue-400',
    DEBUG: 'text-zinc-400',
    WARN: 'text-amber-400',
    ERROR: 'text-red-400',
  }

  const handleDownload = () => {
    const content = filteredLogs
      .map((log) => `${log.timestamp} [${log.level}] ${log.message}`)
      .join('\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selectedPod}-logs.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/k8s"
            className="rounded-lg border border-zinc-700 bg-zinc-800 p-2 hover:bg-zinc-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-white">Pod Logs</h1>
            <p className="text-sm text-zinc-400">
              View and stream container logs
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setStreaming(!streaming)}
            className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm ${
              streaming
                ? 'border-emerald-800 bg-emerald-900/20 text-emerald-400'
                : 'border-zinc-700 bg-zinc-800 text-white'
            }`}
          >
            {streaming ? (
              <>
                <Pause className="h-4 w-4" />
                Streaming
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Paused
              </>
            )}
          </button>
          <button
            onClick={handleDownload}
            disabled={!selectedPod}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-white hover:bg-zinc-700 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Download
          </button>
        </div>
      </div>

      {/* Pod and Container Selection */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <label className="mb-1 block text-sm text-zinc-400">Pod</label>
          <select
            value={selectedPod}
            onChange={(e) => setSelectedPod(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="">Select a pod...</option>
            {pods.map((pod) => (
              <option key={pod.name} value={pod.name}>
                {pod.name}
              </option>
            ))}
          </select>
        </div>

        {selectedPodData && selectedPodData.containers.length > 1 && (
          <div className="w-64">
            <label className="mb-1 block text-sm text-zinc-400">
              Container
            </label>
            <select
              value={selectedContainer}
              onChange={(e) => setSelectedContainer(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
            >
              {selectedPodData.containers.map((container) => (
                <option key={container.name} value={container.name}>
                  {container.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="w-64">
          <label className="mb-1 block text-sm text-zinc-400">Search</label>
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Filter logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 py-2 pr-4 pl-10 text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Logs Terminal */}
      <div className="overflow-hidden rounded-lg border border-zinc-700/50 bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-700/50 bg-zinc-800/50 px-4 py-2">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-zinc-400" />
            <span className="font-mono text-sm text-zinc-400">
              {selectedPod || 'No pod selected'}
              {selectedContainer && ` / ${selectedContainer}`}
            </span>
          </div>
          {streaming && (
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              <span className="text-xs text-emerald-400">Live</span>
            </div>
          )}
        </div>

        <div className="h-[500px] overflow-y-auto p-4 font-mono text-sm">
          {selectedPod ? (
            filteredLogs.length > 0 ? (
              <>
                {filteredLogs.map((log, i) => (
                  <div
                    key={i}
                    className="flex gap-4 border-b border-zinc-800 py-1 hover:bg-zinc-800/50"
                  >
                    <span className="shrink-0 text-zinc-500">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span
                      className={`w-12 shrink-0 ${levelColors[log.level] || 'text-zinc-400'}`}
                    >
                      [{log.level}]
                    </span>
                    <span className="text-zinc-300">{log.message}</span>
                  </div>
                ))}
                <div ref={logsEndRef} />
              </>
            ) : (
              <div className="flex h-full items-center justify-center text-zinc-500">
                No logs matching filter
              </div>
            )
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-zinc-500">
              <Box className="mb-4 h-12 w-12" />
              <p>Select a pod to view logs</p>
            </div>
          )}
        </div>
      </div>

      {/* CLI Command */}
      {selectedPod && (
        <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/50 p-4">
          <h3 className="mb-2 text-sm font-medium text-zinc-400">Or use CLI</h3>
          <code className="block rounded bg-zinc-900 p-3 text-sm text-blue-400">
            kubectl logs -f {selectedPod}
            {selectedContainer && ` -c ${selectedContainer}`}{' '}
            --namespace=default
          </code>
        </div>
      )}
    </div>
  )
}

export default function K8sLogsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="h-10 w-48 animate-pulse rounded bg-zinc-800" />
          <div className="h-[500px] animate-pulse rounded-lg bg-zinc-800/50" />
        </div>
      }
    >
      <K8sLogsPageContent />
    </Suspense>
  )
}
