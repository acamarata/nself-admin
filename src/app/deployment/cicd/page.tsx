'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/Button'
import { HeroPattern } from '@/components/HeroPattern'
import { 
  Play, GitBranch, Clock, CheckCircle, XCircle, AlertTriangle,
  RefreshCw, Settings, Terminal, Download, Webhook, Eye,
  ChevronDown, ChevronRight, GitCommit, Calendar, User,
  Loader2, Activity, Zap, Database, Code, Server,
  ArrowRight, ArrowLeft, FileText, MoreVertical, RotateCw,
  Filter, Search, Plus, Edit, Trash2, Copy, ExternalLink,
  MonitorPlay, Gauge, TrendingUp, AlertCircle, Info
} from 'lucide-react'

interface Pipeline {
  id: string
  name: string
  repository: string
  branch: string
  status: 'running' | 'success' | 'failed' | 'pending' | 'cancelled'
  lastRun: string
  duration: number
  environment: string
  stages: PipelineStage[]
  triggers: string[]
  buildNumber: number
  commit?: {
    hash: string
    message: string
    author: string
    timestamp: string
  }
}

interface PipelineStage {
  id: string
  name: string
  status: 'running' | 'success' | 'failed' | 'pending' | 'skipped'
  duration?: number
  logs?: string[]
  icon: string
}

interface Deployment {
  id: string
  pipeline: string
  environment: string
  version: string
  status: 'deploying' | 'deployed' | 'failed' | 'rolled-back'
  timestamp: string
  duration: number
  commit: {
    hash: string
    message: string
    author: string
  }
  rollbackAvailable: boolean
}

interface WebhookConfig {
  id: string
  name: string
  url: string
  events: string[]
  secret?: string
  active: boolean
  lastTriggered?: string
  deliveries: number
}

const stageIcons = {
  build: Code,
  test: CheckCircle,
  deploy: Server,
  validate: AlertTriangle,
  notify: Webhook,
  cleanup: Trash2
}

function PipelineVisualizer({ pipeline }: { pipeline: Pipeline }) {
  const [selectedStage, setSelectedStage] = useState<string | null>(null)
  
  const getStageColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-500'
      case 'failed': return 'bg-red-500'
      case 'running': return 'bg-blue-500 animate-pulse'
      case 'pending': return 'bg-gray-300'
      case 'skipped': return 'bg-yellow-500'
      default: return 'bg-gray-300'
    }
  }
  
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Pipeline Stages</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-500">Build #{pipeline.buildNumber}</span>
          <Button variant="outline" className="text-xs">
            <Terminal className="w-3 h-3 mr-1" />
            View Logs
          </Button>
        </div>
      </div>
      
      <div className="flex items-center gap-1 mb-6">
        {pipeline.stages.map((stage, index) => {
          const Icon = stageIcons[stage.icon as keyof typeof stageIcons] || Code
          const isLast = index === pipeline.stages.length - 1
          
          return (
            <div key={stage.id} className="flex items-center">
              <button
                onClick={() => setSelectedStage(stage.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                  selectedStage === stage.id 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700/50'
                }`}
              >
                <div className={`w-3 h-3 rounded-full ${getStageColor(stage.status)}`} />
                <Icon className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                <span className="text-sm font-medium">{stage.name}</span>
                {stage.duration && (
                  <span className="text-xs text-zinc-500">{stage.duration}s</span>
                )}
              </button>
              {!isLast && (
                <ArrowRight className="w-4 h-4 text-zinc-400 mx-2" />
              )}
            </div>
          )
        })}
      </div>
      
      {selectedStage && (
        <div className="border-t border-zinc-200 dark:border-zinc-700 pt-4">
          {(() => {
            const stage = pipeline.stages.find(s => s.id === selectedStage)
            if (!stage) return null
            
            return (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-zinc-900 dark:text-white">{stage.name} Stage</h4>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      stage.status === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                      stage.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                      stage.status === 'running' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                    }`}>
                      {stage.status.charAt(0).toUpperCase() + stage.status.slice(1)}
                    </span>
                    {stage.duration && (
                      <span className="text-sm text-zinc-500">Duration: {stage.duration}s</span>
                    )}
                  </div>
                </div>
                
                {stage.logs && stage.logs.length > 0 && (
                  <div className="bg-zinc-900 text-green-400 rounded-lg p-4 font-mono text-sm max-h-48 overflow-y-auto">
                    {stage.logs.map((log, i) => (
                      <div key={i} className="mb-1">{log}</div>
                    ))}
                  </div>
                )}
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}

function BuildStatusDashboard({ pipelines }: { pipelines: Pipeline[] }) {
  const stats = {
    total: pipelines.length,
    success: pipelines.filter(p => p.status === 'success').length,
    failed: pipelines.filter(p => p.status === 'failed').length,
    running: pipelines.filter(p => p.status === 'running').length,
    successRate: pipelines.length > 0 ? (pipelines.filter(p => p.status === 'success').length / pipelines.length * 100) : 0
  }
  
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Total Builds</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <MonitorPlay className="w-8 h-8 text-blue-500" />
        </div>
      </div>
      
      <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Success</p>
            <p className="text-2xl font-bold text-green-600">{stats.success}</p>
          </div>
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
      </div>
      
      <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Failed</p>
            <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
          </div>
          <XCircle className="w-8 h-8 text-red-500" />
        </div>
      </div>
      
      <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Running</p>
            <p className="text-2xl font-bold text-blue-600">{stats.running}</p>
          </div>
          <Activity className="w-8 h-8 text-blue-500" />
        </div>
      </div>
      
      <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Success Rate</p>
            <p className="text-2xl font-bold">{stats.successRate.toFixed(1)}%</p>
          </div>
          <TrendingUp className="w-8 h-8 text-green-500" />
        </div>
      </div>
    </div>
  )
}

function DeploymentHistory({ deployments }: { deployments: Deployment[] }) {
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>('all')
  
  const environments = ['all', ...Array.from(new Set(deployments.map(d => d.environment)))]
  
  const filteredDeployments = selectedEnvironment === 'all' 
    ? deployments 
    : deployments.filter(d => d.environment === selectedEnvironment)
  
  const handleRollback = async (deploymentId: string) => {
    // Rollback logic would go here
    console.log('Rolling back deployment:', deploymentId)
  }
  
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Deployment History</h3>
          <select
            value={selectedEnvironment}
            onChange={(e) => setSelectedEnvironment(e.target.value)}
            className="px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm"
          >
            {environments.map(env => (
              <option key={env} value={env}>
                {env === 'all' ? 'All Environments' : env.charAt(0).toUpperCase() + env.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
        {filteredDeployments.map(deployment => (
          <div key={deployment.id} className="p-6 hover:bg-zinc-50 dark:hover:bg-zinc-700/50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    deployment.status === 'deployed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                    deployment.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                    deployment.status === 'deploying' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                  }`}>
                    {deployment.status.charAt(0).toUpperCase() + deployment.status.slice(1)}
                  </span>
                  <span className="text-sm font-medium text-zinc-900 dark:text-white">
                    {deployment.pipeline} → {deployment.environment}
                  </span>
                  <span className="text-sm text-zinc-500">v{deployment.version}</span>
                </div>
                
                <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                  {deployment.commit.message}
                </div>
                
                <div className="flex items-center gap-4 text-xs text-zinc-500">
                  <span className="flex items-center gap-1">
                    <GitCommit className="w-3 h-3" />
                    {deployment.commit.hash.substring(0, 8)}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {deployment.commit.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(deployment.timestamp).toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {deployment.duration}s
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                {deployment.rollbackAvailable && deployment.status === 'deployed' && (
                  <Button
                    onClick={() => handleRollback(deployment.id)}
                    variant="outline"
                    className="text-xs"
                  >
                    <RotateCw className="w-3 h-3 mr-1" />
                    Rollback
                  </Button>
                )}
                <Button variant="outline" className="text-xs">
                  <Eye className="w-3 h-3 mr-1" />
                  Details
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function WebhookManagement({ webhooks, onWebhookUpdate }: { 
  webhooks: WebhookConfig[]
  onWebhookUpdate: (webhook: WebhookConfig) => void 
}) {
  const [isCreating, setIsCreating] = useState(false)
  const [editingWebhook, setEditingWebhook] = useState<WebhookConfig | null>(null)
  
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Webhook Configuration</h3>
          <Button onClick={() => setIsCreating(true)} className="text-sm">
            <Plus className="w-4 h-4 mr-1" />
            Add Webhook
          </Button>
        </div>
      </div>
      
      <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
        {webhooks.map(webhook => (
          <div key={webhook.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-medium text-zinc-900 dark:text-white">{webhook.name}</h4>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    webhook.active 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                  }`}>
                    {webhook.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-2 font-mono">
                  {webhook.url}
                </div>
                
                <div className="flex items-center gap-4 text-xs text-zinc-500">
                  <span>{webhook.events.join(', ')}</span>
                  <span>{webhook.deliveries} deliveries</span>
                  {webhook.lastTriggered && (
                    <span>Last: {new Date(webhook.lastTriggered).toLocaleString()}</span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                <Button 
                  onClick={() => setEditingWebhook(webhook)}
                  variant="outline" 
                  className="text-xs"
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </Button>
                <Button variant="outline" className="text-xs">
                  <FileText className="w-3 h-3 mr-1" />
                  Test
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function DeploymentCICDPage() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([])
  const [deployments, setDeployments] = useState<Deployment[]>([])
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTab, setSelectedTab] = useState<'pipelines' | 'deployments' | 'webhooks'>('pipelines')
  const [selectedPipeline, setSelectedPipeline] = useState<string | null>(null)
  
  const fetchData = useCallback(async () => {
    try {
      // Mock data for demonstration
      const mockPipelines: Pipeline[] = [
        {
          id: '1',
          name: 'main-deployment',
          repository: 'nself-admin',
          branch: 'main',
          status: 'success',
          lastRun: '2024-01-15T10:30:00Z',
          duration: 420,
          environment: 'production',
          buildNumber: 245,
          stages: [
            { id: '1', name: 'Build', status: 'success', duration: 120, icon: 'build' },
            { id: '2', name: 'Test', status: 'success', duration: 180, icon: 'test' },
            { id: '3', name: 'Deploy', status: 'success', duration: 90, icon: 'deploy' },
            { id: '4', name: 'Validate', status: 'success', duration: 30, icon: 'validate' }
          ],
          triggers: ['push', 'manual'],
          commit: {
            hash: 'a1b2c3d4e5f6',
            message: 'Add new deployment features',
            author: 'John Doe',
            timestamp: '2024-01-15T10:00:00Z'
          }
        },
        {
          id: '2',
          name: 'staging-deployment',
          repository: 'nself-admin',
          branch: 'develop',
          status: 'running',
          lastRun: '2024-01-15T11:00:00Z',
          duration: 0,
          environment: 'staging',
          buildNumber: 89,
          stages: [
            { id: '1', name: 'Build', status: 'success', duration: 115, icon: 'build' },
            { id: '2', name: 'Test', status: 'running', icon: 'test' },
            { id: '3', name: 'Deploy', status: 'pending', icon: 'deploy' },
            { id: '4', name: 'Validate', status: 'pending', icon: 'validate' }
          ],
          triggers: ['push', 'schedule'],
          commit: {
            hash: 'f6e5d4c3b2a1',
            message: 'Fix authentication bug',
            author: 'Jane Smith',
            timestamp: '2024-01-15T10:45:00Z'
          }
        }
      ]
      
      const mockDeployments: Deployment[] = [
        {
          id: '1',
          pipeline: 'main-deployment',
          environment: 'production',
          version: '1.2.5',
          status: 'deployed',
          timestamp: '2024-01-15T10:30:00Z',
          duration: 420,
          commit: {
            hash: 'a1b2c3d4e5f6',
            message: 'Add new deployment features',
            author: 'John Doe'
          },
          rollbackAvailable: true
        },
        {
          id: '2',
          pipeline: 'staging-deployment',
          environment: 'staging',
          version: '1.2.6-rc1',
          status: 'deploying',
          timestamp: '2024-01-15T11:00:00Z',
          duration: 0,
          commit: {
            hash: 'f6e5d4c3b2a1',
            message: 'Fix authentication bug',
            author: 'Jane Smith'
          },
          rollbackAvailable: false
        }
      ]
      
      const mockWebhooks: WebhookConfig[] = [
        {
          id: '1',
          name: 'Slack Notifications',
          url: 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX',
          events: ['deployment.success', 'deployment.failed'],
          active: true,
          lastTriggered: '2024-01-15T10:30:00Z',
          deliveries: 142
        },
        {
          id: '2',
          name: 'Discord Alerts',
          url: 'https://discord.com/api/webhooks/123456789/abcdefghijklmnopqrstuvwxyz',
          events: ['build.failed', 'deployment.failed'],
          active: true,
          lastTriggered: '2024-01-14T15:20:00Z',
          deliveries: 37
        }
      ]
      
      setPipelines(mockPipelines)
      setDeployments(mockDeployments)
      setWebhooks(mockWebhooks)
      setLoading(false)
    } catch (err) {
      setError('Failed to fetch deployment data')
      setLoading(false)
    }
  }, [])
  
  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [fetchData])
  
  const handlePipelineAction = async (action: string, pipelineId: string) => {
    // Pipeline action logic would go here
    console.log(`${action} pipeline ${pipelineId}`)
  }
  
  const handleWebhookUpdate = (webhook: WebhookConfig) => {
    setWebhooks(prev => prev.map(w => w.id === webhook.id ? webhook : w))
  }
  
  if (loading) {
    return (
      <>
        <HeroPattern />
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <span className="ml-2 text-zinc-600 dark:text-zinc-400">Loading deployment data...</span>
          </div>
        </div>
      </>
    )
  }
  
  return (
    <>
      <HeroPattern />
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">CI/CD Deployment</h1>
              <p className="text-zinc-600 dark:text-zinc-400 mt-1">
                Manage continuous integration and deployment pipelines
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={fetchData}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Pipeline
              </Button>
            </div>
          </div>
          
          <BuildStatusDashboard pipelines={pipelines} />
          
          <div className="flex items-center gap-1 mb-6 bg-white dark:bg-zinc-800 rounded-lg p-1 border border-zinc-200 dark:border-zinc-700 w-fit">
            <button
              onClick={() => setSelectedTab('pipelines')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedTab === 'pipelines'
                  ? 'bg-blue-500 text-white'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700'
              }`}
            >
              Pipelines
            </button>
            <button
              onClick={() => setSelectedTab('deployments')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedTab === 'deployments'
                  ? 'bg-blue-500 text-white'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700'
              }`}
            >
              Deployment History
            </button>
            <button
              onClick={() => setSelectedTab('webhooks')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedTab === 'webhooks'
                  ? 'bg-blue-500 text-white'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700'
              }`}
            >
              Webhooks
            </button>
          </div>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-700 dark:text-red-400">{error}</p>
            </div>
          </div>
        )}
        
        {selectedTab === 'pipelines' && (
          <div className="space-y-6">
            <div className="grid gap-6">
              {pipelines.map(pipeline => (
                <div key={pipeline.id} className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
                  <div className="p-6 border-b border-zinc-200 dark:border-zinc-700">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">{pipeline.name}</h3>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            pipeline.status === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                            pipeline.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                            pipeline.status === 'running' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                          }`}>
                            {pipeline.status.charAt(0).toUpperCase() + pipeline.status.slice(1)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                          <span className="flex items-center gap-1">
                            <GitBranch className="w-4 h-4" />
                            {pipeline.repository}:{pipeline.branch}
                          </span>
                          <span className="flex items-center gap-1">
                            <Server className="w-4 h-4" />
                            {pipeline.environment}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {pipeline.duration > 0 ? `${pipeline.duration}s` : 'Running...'}
                          </span>
                        </div>
                        
                        {pipeline.commit && (
                          <div className="text-sm text-zinc-600 dark:text-zinc-400">
                            <span className="font-mono">{pipeline.commit.hash.substring(0, 8)}</span>
                            {' • '}
                            {pipeline.commit.message}
                            {' by '}
                            {pipeline.commit.author}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          onClick={() => handlePipelineAction('run', pipeline.id)}
                          variant="outline"
                          className="text-sm"
                          disabled={pipeline.status === 'running'}
                        >
                          <Play className="w-4 h-4 mr-1" />
                          {pipeline.status === 'running' ? 'Running' : 'Run'}
                        </Button>
                        <Button variant="outline" className="text-sm">
                          <Settings className="w-4 h-4 mr-1" />
                          Configure
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <PipelineVisualizer pipeline={pipeline} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {selectedTab === 'deployments' && (
          <DeploymentHistory deployments={deployments} />
        )}
        
        {selectedTab === 'webhooks' && (
          <WebhookManagement webhooks={webhooks} onWebhookUpdate={handleWebhookUpdate} />
        )}
      </div>
    </>
  )
}