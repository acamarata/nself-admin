'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/Button'
import { 
  HeartPulse, CheckCircle, XCircle, AlertTriangle, 
  RefreshCw, Terminal, Server, Play, Pause, RotateCcw, Wrench
} from 'lucide-react'

interface ContainerStatus {
  name: string
  status: 'running' | 'stopped' | 'restarting' | 'error'
  health?: 'healthy' | 'unhealthy' | 'starting'
  restarts?: number
  logs?: string[]
}

interface DoctorResult {
  overall: 'healthy' | 'partial' | 'critical'
  containers: ContainerStatus[]
  systemChecks: Array<{
    name: string
    status: 'pass' | 'fail' | 'warning'
    message: string
  }>
  recommendations: string[]
}

export default function DoctorPage() {
  const [loading, setLoading] = useState(false)
  const [doctorResult, setDoctorResult] = useState<DoctorResult | null>(null)
  const [selectedContainer, setSelectedContainer] = useState<string | null>(null)
  const [fixingIssues, setFixingIssues] = useState(false)

  const runDiagnostics = async () => {
    setLoading(true)
    try {
      // Get CSRF token
      const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('nself-csrf='))
        ?.split('=')[1]

      const response = await fetch('/api/nself/doctor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken || ''
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setDoctorResult(data)
      }
    } catch (error) {
      console.error('Failed to run diagnostics:', error)
    } finally {
      setLoading(false)
    }
  }

  const fixIssues = async () => {
    setFixingIssues(true)
    try {
      const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('nself-csrf='))
        ?.split('=')[1]

      // First, try to fix with nself doctor --fix
      await fetch('/api/nself/doctor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken || ''
        },
        body: JSON.stringify({ fix: true })
      })

      // Then restart failed containers
      await fetch('/api/nself/restart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken || ''
        }
      })

      // Refresh diagnostics
      await runDiagnostics()
    } catch (error) {
      console.error('Failed to fix issues:', error)
    } finally {
      setFixingIssues(false)
    }
  }

  const restartContainer = async (containerName: string) => {
    try {
      const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('nself-csrf='))
        ?.split('=')[1]

      await fetch(`/api/docker/containers/${containerName}/restart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken || ''
        }
      })
      
      await runDiagnostics()
    } catch (error) {
      console.error('Failed to restart container:', error)
    }
  }

  useEffect(() => {
    runDiagnostics()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
      case 'healthy':
      case 'pass':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'stopped':
      case 'fail':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'restarting':
      case 'starting':
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />
    }
  }

  const getOverallStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'partial':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <HeartPulse className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
              System Doctor
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Diagnose and fix issues with your nself services
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={runDiagnostics}
            variant="secondary"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Run Diagnostics
          </Button>
          {doctorResult?.overall !== 'healthy' && (
            <Button
              onClick={fixIssues}
              variant="primary"
              disabled={fixingIssues}
            >
              {fixingIssues ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Fixing...
                </>
              ) : (
                <>
                  <Wrench className="h-4 w-4 mr-2" />
                  Auto Fix Issues
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Overall Status */}
      {doctorResult && (
        <div className={`rounded-xl border-2 p-6 ${getOverallStatusColor(doctorResult.overall)}`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                System Status: {doctorResult.overall === 'healthy' ? 'All Services Healthy' : 
                              doctorResult.overall === 'partial' ? 'Some Services Need Attention' :
                              'Critical Issues Detected'}
              </h2>
              <p className="text-sm mt-1 opacity-75">
                {doctorResult.containers.filter(c => c.status === 'running').length} of {doctorResult.containers.length} containers running
              </p>
            </div>
            <div className="text-3xl">
              {doctorResult.overall === 'healthy' ? '✅' : 
               doctorResult.overall === 'partial' ? '⚠️' : '❌'}
            </div>
          </div>
        </div>
      )}

      {/* Container Status Grid */}
      {doctorResult && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Server className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
              Container Status
            </h3>
            <div className="space-y-3">
              {doctorResult.containers.map((container) => (
                <div 
                  key={container.name}
                  className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
                  onClick={() => setSelectedContainer(container.name)}
                >
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(container.status)}
                    <div>
                      <p className="font-medium text-sm">{container.name.replace('my_project_', '')}</p>
                      <p className="text-xs text-zinc-500">
                        {container.health && `Health: ${container.health}`}
                        {container.restarts !== undefined && container.restarts > 0 && ` • ${container.restarts} restarts`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {container.status === 'running' ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          restartContainer(container.name)
                        }}
                        className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded"
                        title="Restart container"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          restartContainer(container.name)
                        }}
                        className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded"
                        title="Start container"
                      >
                        <Play className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Checks */}
          <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Terminal className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
              System Checks
            </h3>
            <div className="space-y-3">
              {doctorResult.systemChecks.map((check, index) => (
                <div 
                  key={index}
                  className="flex items-start space-x-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900"
                >
                  {getStatusIcon(check.status)}
                  <div className="flex-1">
                    <p className="font-medium text-sm">{check.name}</p>
                    <p className="text-xs text-zinc-500 mt-1">{check.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {doctorResult && doctorResult.recommendations.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-3 text-blue-900 dark:text-blue-100">
            Recommendations
          </h3>
          <ul className="space-y-2">
            {doctorResult.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-600 dark:text-blue-400 mr-2">•</span>
                <span className="text-sm text-blue-800 dark:text-blue-200">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Container Logs Modal */}
      {selectedContainer && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setSelectedContainer(null)}
        >
          <div 
            className="bg-white dark:bg-zinc-800 rounded-xl p-6 max-w-3xl w-full max-h-[80vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                Container Logs: {selectedContainer.replace('my_project_', '')}
              </h3>
              <button
                onClick={() => setSelectedContainer(null)}
                className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                ✕
              </button>
            </div>
            <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-lg text-xs font-mono overflow-x-auto">
              {doctorResult?.containers.find(c => c.name === selectedContainer)?.logs?.join('\n') || 'No logs available'}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}