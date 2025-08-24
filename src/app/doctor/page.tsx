'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/Button'
import { HeroPattern } from '@/components/HeroPattern'
import { 
  HeartPulse, CheckCircle, XCircle, AlertTriangle, Clock,
  RefreshCw, Download, Terminal, Shield, Database, Server,
  HardDrive, Network, Settings, FileText, Activity, AlertCircle, 
  Info, Play, Copy, ExternalLink, Zap, Eye, Search, Filter, 
  Stethoscope, Plus, Tool
} from 'lucide-react'

interface DiagnosticCheck {
  id: string
  name: string
  category: 'System' | 'Services' | 'Configuration' | 'Network' | 'Security'
  status: 'pass' | 'fail' | 'warning' | 'running'
  message: string
  details?: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  fixCommand?: string
  fixDescription?: string
  lastRun: string
  duration?: number
}

interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'critical'
  score: number
  checks: DiagnosticCheck[]
  timestamp: string
  totalChecks: number
  passedChecks: number
  warningChecks: number
  failedChecks: number
}

export default function DoctorPage() {
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null)
  const [running, setRunning] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'checks' | 'fixes' | 'history'>('overview')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCheck, setSelectedCheck] = useState<DiagnosticCheck | null>(null)
  const [diagnosticLogs, setDiagnosticLogs] = useState<string[]>([])

  useEffect(() => {
    runDiagnostics()
  }, [])

  const runDiagnostics = async () => {
    setRunning(true)
    setDiagnosticLogs(['Starting system diagnostics...'])
    
    try {
      // Mock diagnostic checks with realistic nself scenarios
      const checks: DiagnosticCheck[] = [
        // System Checks
        {
          id: '1',
          name: 'Docker Engine',
          category: 'System',
          status: 'pass',
          message: 'Docker daemon is running and healthy',
          details: 'Docker version 24.0.5, build ced0996. API version 1.43.',
          severity: 'critical',
          lastRun: new Date().toISOString(),
          duration: 250
        },
        {
          id: '2', 
          name: 'Available Memory',
          category: 'System',
          status: 'warning',
          message: 'Memory usage is approaching limits',
          details: '6.2GB used of 8GB total (78% utilization)',
          severity: 'high',
          fixCommand: 'docker system prune -f',
          fixDescription: 'Clean up unused Docker resources to free memory',
          lastRun: new Date().toISOString(),
          duration: 180
        },
        {
          id: '3',
          name: 'Disk Space',
          category: 'System', 
          status: 'pass',
          message: 'Sufficient disk space available',
          details: '45GB free of 120GB total (62% available)',
          severity: 'high',
          lastRun: new Date().toISOString(),
          duration: 120
        },
        
        // Service Checks
        {
          id: '4',
          name: 'PostgreSQL Database',
          category: 'Services',
          status: 'pass',
          message: 'Database is healthy and accepting connections',
          details: 'PostgreSQL 16 running on port 5432. 15 active connections.',
          severity: 'critical',
          lastRun: new Date().toISOString(),
          duration: 340
        },
        {
          id: '5',
          name: 'Hasura GraphQL Engine',
          category: 'Services',
          status: 'pass', 
          message: 'GraphQL API is operational',
          details: 'Hasura v2.44.0 responding on api.local.nself.org',
          severity: 'critical',
          lastRun: new Date().toISOString(),
          duration: 290
        },
        {
          id: '6',
          name: 'Redis Cache',
          category: 'Services',
          status: 'pass',
          message: 'Cache service is running normally',
          details: 'Redis 7.2.0 on port 6379. 248MB memory usage.',
          severity: 'medium',
          lastRun: new Date().toISOString(),
          duration: 150
        },
        {
          id: '7',
          name: 'Auth Service',
          category: 'Services',
          status: 'warning',
          message: 'Authentication service has elevated response times',
          details: 'Average response time: 2.3s (threshold: 1s)',
          severity: 'medium',
          fixCommand: 'docker restart nself-auth',
          fixDescription: 'Restart the auth service to clear any temporary issues',
          lastRun: new Date().toISOString(),
          duration: 420
        },
        {
          id: '8',
          name: 'MinIO Storage',
          category: 'Services',
          status: 'pass',
          message: 'Object storage is accessible',
          details: 'MinIO server responding on storage.local.nself.org',
          severity: 'medium',
          lastRun: new Date().toISOString(),
          duration: 200
        },
        
        // Configuration Checks
        {
          id: '9',
          name: 'Environment Variables',
          category: 'Configuration',
          status: 'pass',
          message: 'All required environment variables are configured',
          details: '42 environment variables validated successfully',
          severity: 'critical',
          lastRun: new Date().toISOString(),
          duration: 100
        },
        {
          id: '10',
          name: 'SSL Certificates',
          category: 'Configuration', 
          status: 'pass',
          message: 'SSL certificates are valid and properly configured',
          details: 'Certificates expire on 2024-12-31. Auto-renewal enabled.',
          severity: 'high',
          lastRun: new Date().toISOString(),
          duration: 160
        },
        {
          id: '11',
          name: 'Database Migrations',
          category: 'Configuration',
          status: 'pass',
          message: 'All database migrations have been applied',
          details: '28 migrations applied successfully. Latest: 2024_01_15_add_user_profiles',
          severity: 'high',
          lastRun: new Date().toISOString(),
          duration: 310
        },
        
        // Network Checks
        {
          id: '12',
          name: 'Port Availability',
          category: 'Network',
          status: 'pass',
          message: 'All required ports are accessible',
          details: 'Ports 80, 443, 3000, 5432, 6379 are open and responding',
          severity: 'critical',
          lastRun: new Date().toISOString(),
          duration: 190
        },
        {
          id: '13',
          name: 'DNS Resolution',
          category: 'Network',
          status: 'pass',
          message: 'Domain name resolution is working correctly',
          details: 'All service domains resolve to correct IP addresses',
          severity: 'high',
          lastRun: new Date().toISOString(),
          duration: 220
        },
        
        // Security Checks
        {
          id: '14',
          name: 'Default Credentials',
          category: 'Security',
          status: 'fail',
          message: 'Default passwords detected in configuration',
          details: 'PostgreSQL and admin panel are using default passwords',
          severity: 'critical',
          fixCommand: 'nself secrets generate',
          fixDescription: 'Generate secure random passwords for all services',
          lastRun: new Date().toISOString(),
          duration: 180
        },
        {
          id: '15',
          name: 'Container Security',
          category: 'Security',
          status: 'warning',
          message: 'Some containers are running as root',
          details: '3 of 8 containers are running with root privileges',
          severity: 'medium',
          fixCommand: 'nself security harden',
          fixDescription: 'Apply security hardening to container configurations',
          lastRun: new Date().toISOString(),
          duration: 380
        }
      ]

      // Simulate progress
      for (const check of checks) {
        setDiagnosticLogs(prev => [...prev, `✓ ${check.name}: ${check.message}`])
        await new Promise(resolve => setTimeout(resolve, 150))
      }

      // Calculate health metrics
      const passedChecks = checks.filter(c => c.status === 'pass').length
      const warningChecks = checks.filter(c => c.status === 'warning').length
      const failedChecks = checks.filter(c => c.status === 'fail').length
      const score = Math.round((passedChecks / checks.length) * 100)
      
      const overall = 
        failedChecks > 0 && checks.some(c => c.status === 'fail' && c.severity === 'critical') ? 'critical' :
        warningChecks > 0 || failedChecks > 0 ? 'degraded' : 'healthy'

      setSystemHealth({
        overall,
        score,
        checks,
        timestamp: new Date().toISOString(),
        totalChecks: checks.length,
        passedChecks,
        warningChecks,
        failedChecks
      })

      setDiagnosticLogs(prev => [...prev, '', `Diagnostics completed. Health score: ${score}%`])

    } catch (error) {
      console.error('Diagnostics failed:', error)
      setDiagnosticLogs(prev => [...prev, `❌ Diagnostics failed: ${error}`])
    } finally {
      setRunning(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return CheckCircle
      case 'fail': return XCircle
      case 'warning': return AlertTriangle
      case 'running': return Clock
      default: return AlertCircle
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'text-green-600 dark:text-green-400'
      case 'fail': return 'text-red-600 dark:text-red-400'
      case 'warning': return 'text-yellow-600 dark:text-yellow-400'
      case 'running': return 'text-blue-600 dark:text-blue-400'
      default: return 'text-zinc-500 dark:text-zinc-400'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'System': return Server
      case 'Services': return Database
      case 'Configuration': return Settings
      case 'Network': return Network
      case 'Security': return Shield
      default: return Activity
    }
  }

  const filteredChecks = systemHealth?.checks.filter(check => {
    if (selectedCategory !== 'all' && check.category !== selectedCategory) return false
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return check.name.toLowerCase().includes(query) || 
             check.message.toLowerCase().includes(query)
    }
    return true
  }) || []

  return (
    <>
      <HeroPattern />
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
                <Stethoscope className="w-8 h-8" />
                System Doctor
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400 mt-1">
                Comprehensive system diagnostics and health monitoring
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Report
              </Button>
              <Button
                onClick={runDiagnostics}
                variant="filled"
                disabled={running}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${running ? 'animate-spin' : ''}`} />
                {running ? 'Running Diagnostics...' : 'Run Diagnostics'}
              </Button>
            </div>
          </div>

          {/* Health Overview */}
          {systemHealth && (
            <div className={`rounded-lg border-2 p-6 mb-6 ${
              systemHealth.overall === 'critical' 
                ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10'
                : systemHealth.overall === 'degraded'
                ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/10'
                : 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/10'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
                  System Health Score
                </h2>
                <span className={`px-3 py-1 rounded-full text-lg font-bold ${
                  systemHealth.overall === 'critical'
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                    : systemHealth.overall === 'degraded'
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                    : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                }`}>
                  {systemHealth.score}%
                </span>
              </div>

              <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-3 mb-4">
                <div 
                  className={`h-3 rounded-full transition-all ${
                    systemHealth.overall === 'critical' ? 'bg-red-500' :
                    systemHealth.overall === 'degraded' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${systemHealth.score}%` }}
                />
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{systemHealth.totalChecks}</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Total Checks</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{systemHealth.passedChecks}</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Passed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">{systemHealth.warningChecks}</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Warnings</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{systemHealth.failedChecks}</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Failed</p>
                </div>
              </div>
            </div>
          )}

          {/* Critical Issues Alert */}
          {systemHealth && systemHealth.failedChecks > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-red-900 dark:text-red-100 mb-2">
                    Critical Issues Detected
                  </h3>
                  <div className="space-y-1">
                    {systemHealth.checks.filter(c => c.status === 'fail').map(check => (
                      <p key={check.id} className="text-sm text-red-700 dark:text-red-200">
                        • {check.name}: {check.message}
                      </p>
                    ))}
                  </div>
                </div>
                <Button
                  onClick={() => setActiveTab('fixes')}
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300"
                >
                  View Fixes
                </Button>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="border-b border-zinc-200 dark:border-zinc-700 mb-6">
            <nav className="flex space-x-8">
              {[
                { key: 'overview', label: 'Overview', icon: Eye },
                { key: 'checks', label: 'All Checks', icon: Activity },
                { key: 'fixes', label: 'Quick Fixes', icon: Tool },
                { key: 'history', label: 'History', icon: Clock }
              ].map(({ key, label, icon: TabIcon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as any)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === key
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                  }`}
                >
                  <TabIcon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && systemHealth && (
          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {['System', 'Services', 'Configuration', 'Network', 'Security'].map(category => {
              const categoryChecks = systemHealth.checks.filter(c => c.category === category)
              const CategoryIcon = getCategoryIcon(category)
              const passCount = categoryChecks.filter(c => c.status === 'pass').length
              const warnCount = categoryChecks.filter(c => c.status === 'warning').length
              const failCount = categoryChecks.filter(c => c.status === 'fail').length
              
              return (
                <div key={category} className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <CategoryIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900 dark:text-white">{category}</h3>
                      <p className="text-sm text-zinc-500">{categoryChecks.length} checks</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {passCount > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">Passed</span>
                        <span className="text-sm font-medium text-green-600">{passCount}</span>
                      </div>
                    )}
                    {warnCount > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">Warnings</span>
                        <span className="text-sm font-medium text-yellow-600">{warnCount}</span>
                      </div>
                    )}
                    {failCount > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">Failed</span>
                        <span className="text-sm font-medium text-red-600">{failCount}</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
            
            {/* Recent Logs */}
            <div className="lg:col-span-2 xl:col-span-3 bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-4">Diagnostic Logs</h3>
              <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-4 font-mono text-xs max-h-48 overflow-y-auto">
                {diagnosticLogs.map((log, i) => (
                  <div key={i} className="text-zinc-700 dark:text-zinc-300">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'checks' && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search checks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
              >
                <option value="all">All Categories</option>
                <option value="System">System</option>
                <option value="Services">Services</option>
                <option value="Configuration">Configuration</option>
                <option value="Network">Network</option>
                <option value="Security">Security</option>
              </select>
            </div>

            {/* Checks List */}
            <div className="space-y-3">
              {filteredChecks.map(check => {
                const StatusIcon = getStatusIcon(check.status)
                return (
                  <div
                    key={check.id}
                    className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedCheck(check)}
                  >
                    <div className="flex items-center gap-3">
                      <StatusIcon className={`w-5 h-5 ${getStatusColor(check.status)}`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-zinc-900 dark:text-white">{check.name}</h4>
                          <span className="px-2 py-1 rounded-full text-xs bg-zinc-100 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300">
                            {check.category}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            check.severity === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                            check.severity === 'high' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' :
                            check.severity === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                            'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                          }`}>
                            {check.severity}
                          </span>
                        </div>
                        <p className="text-zinc-600 dark:text-zinc-400 text-sm">{check.message}</p>
                        {check.duration && (
                          <p className="text-xs text-zinc-500 mt-1">
                            Completed in {check.duration}ms
                          </p>
                        )}
                      </div>
                      {check.status !== 'pass' && check.fixCommand && (
                        <Button variant="outline" size="sm">
                          Quick Fix
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === 'fixes' && systemHealth && (
          <div className="space-y-6">
            <div className="space-y-4">
              {systemHealth.checks
                .filter(check => check.fixCommand)
                .map(check => (
                  <div
                    key={check.id}
                    className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${
                        check.status === 'fail' 
                          ? 'bg-red-50 dark:bg-red-900/20' 
                          : 'bg-yellow-50 dark:bg-yellow-900/20'
                      }`}>
                        <Tool className={`w-5 h-5 ${
                          check.status === 'fail' 
                            ? 'text-red-600 dark:text-red-400' 
                            : 'text-yellow-600 dark:text-yellow-400'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-zinc-900 dark:text-white mb-1">
                          {check.name}
                        </h3>
                        <p className="text-zinc-600 dark:text-zinc-400 mb-3">{check.message}</p>
                        
                        {check.fixDescription && (
                          <p className="text-sm text-zinc-500 mb-3">{check.fixDescription}</p>
                        )}
                        
                        <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <code className="text-sm font-mono text-zinc-700 dark:text-zinc-300">
                              {check.fixCommand}
                            </code>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigator.clipboard.writeText(check.fixCommand!)}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Play className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
            
            {systemHealth.checks.filter(c => c.fixCommand).length === 0 && (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-2">
                  No Issues Found
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400">
                  All diagnostic checks passed successfully!
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
              Diagnostic History
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              Diagnostic history and trends will be available in a future update.
            </p>
          </div>
        )}

        {/* Check Details Modal */}
        {selectedCheck && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-zinc-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                    {(() => {
                      const Icon = getStatusIcon(selectedCheck.status)
                      return <Icon className={`w-5 h-5 ${getStatusColor(selectedCheck.status)}`} />
                    })()}
                    {selectedCheck.name}
                  </h2>
                  <button
                    onClick={() => setSelectedCheck(null)}
                    className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-zinc-900 dark:text-white mb-2">Status</h3>
                    <p className="text-zinc-600 dark:text-zinc-400">{selectedCheck.message}</p>
                  </div>
                  
                  {selectedCheck.details && (
                    <div>
                      <h3 className="font-medium text-zinc-900 dark:text-white mb-2">Details</h3>
                      <p className="text-zinc-600 dark:text-zinc-400 text-sm">{selectedCheck.details}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-zinc-900 dark:text-white mb-1">Category</h4>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">{selectedCheck.category}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-zinc-900 dark:text-white mb-1">Severity</h4>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">{selectedCheck.severity}</p>
                    </div>
                  </div>
                  
                  {selectedCheck.fixCommand && (
                    <div>
                      <h3 className="font-medium text-zinc-900 dark:text-white mb-2">Recommended Fix</h3>
                      {selectedCheck.fixDescription && (
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                          {selectedCheck.fixDescription}
                        </p>
                      )}
                      <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-3">
                        <code className="text-sm font-mono text-zinc-700 dark:text-zinc-300">
                          {selectedCheck.fixCommand}
                        </code>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="outline" onClick={() => setSelectedCheck(null)}>
                    Close
                  </Button>
                  {selectedCheck.fixCommand && (
                    <Button variant="filled">
                      Apply Fix
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}