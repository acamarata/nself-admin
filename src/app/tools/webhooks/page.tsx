'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/Button'
import { HeroPattern } from '@/components/HeroPattern'
import { 
  Webhook, Plus, Edit3, Trash2, Play, Pause, Copy, Eye, EyeOff,
  CheckCircle, XCircle, AlertCircle, Clock, Globe, Key, Filter,
  Search, RotateCw, Settings, Download, Upload, Code, Send,
  Activity, Loader2, RefreshCw, ExternalLink, Shield, Zap,
  Calendar, User, Database, Mail, Bell, Monitor, Server
} from 'lucide-react'

interface WebhookEndpoint {
  id: string
  name: string
  url: string
  method: 'POST' | 'PUT' | 'PATCH'
  enabled: boolean
  events: string[]
  headers: Record<string, string>
  secret?: string
  timeout: number
  retryPolicy: {
    maxRetries: number
    backoffMultiplier: number
    maxDelay: number
  }
  created: string
  lastTriggered?: string
  successRate: number
  totalDeliveries: number
  failedDeliveries: number
}

interface WebhookDelivery {
  id: string
  webhookId: string
  event: string
  status: 'pending' | 'success' | 'failed' | 'retrying'
  statusCode?: number
  requestBody: string
  responseBody?: string
  responseHeaders?: Record<string, string>
  attempt: number
  maxAttempts: number
  timestamp: string
  duration?: number
  error?: string
}

interface PayloadTemplate {
  id: string
  name: string
  event: string
  template: string
  description: string
}

const EVENT_TYPES = [
  { id: 'user.created', label: 'User Created', description: 'When a new user registers' },
  { id: 'user.updated', label: 'User Updated', description: 'When user profile is modified' },
  { id: 'user.deleted', label: 'User Deleted', description: 'When a user account is deleted' },
  { id: 'deployment.started', label: 'Deployment Started', description: 'When a deployment begins' },
  { id: 'deployment.completed', label: 'Deployment Completed', description: 'When a deployment finishes successfully' },
  { id: 'deployment.failed', label: 'Deployment Failed', description: 'When a deployment fails' },
  { id: 'service.started', label: 'Service Started', description: 'When a service comes online' },
  { id: 'service.stopped', label: 'Service Stopped', description: 'When a service goes offline' },
  { id: 'service.health.degraded', label: 'Service Health Degraded', description: 'When service health deteriorates' },
  { id: 'alert.created', label: 'Alert Created', description: 'When a new alert is triggered' },
  { id: 'alert.resolved', label: 'Alert Resolved', description: 'When an alert is resolved' },
  { id: 'backup.completed', label: 'Backup Completed', description: 'When a backup finishes' },
  { id: 'backup.failed', label: 'Backup Failed', description: 'When a backup fails' }
]

const EVENT_ICONS: Record<string, any> = {
  'user': User,
  'deployment': Zap,
  'service': Server,
  'alert': Bell,
  'backup': Database,
  'default': Activity
}

function WebhookForm({ 
  webhook, 
  onSave, 
  onCancel 
}: { 
  webhook?: WebhookEndpoint
  onSave: (webhook: Partial<WebhookEndpoint>) => void
  onCancel: () => void 
}) {
  const [formData, setFormData] = useState<Partial<WebhookEndpoint>>({
    name: webhook?.name || '',
    url: webhook?.url || '',
    method: webhook?.method || 'POST',
    enabled: webhook?.enabled ?? true,
    events: webhook?.events || [],
    headers: webhook?.headers || { 'Content-Type': 'application/json' },
    secret: webhook?.secret || '',
    timeout: webhook?.timeout || 30,
    retryPolicy: webhook?.retryPolicy || {
      maxRetries: 3,
      backoffMultiplier: 2,
      maxDelay: 300
    }
  })
  const [showSecret, setShowSecret] = useState(false)

  const addHeader = () => {
    setFormData({
      ...formData,
      headers: { ...formData.headers, '': '' }
    })
  }

  const updateHeader = (oldKey: string, newKey: string, value: string) => {
    const newHeaders = { ...formData.headers }
    if (oldKey !== newKey) {
      delete newHeaders[oldKey]
    }
    newHeaders[newKey] = value
    setFormData({ ...formData, headers: newHeaders })
  }

  const removeHeader = (key: string) => {
    const newHeaders = { ...formData.headers }
    delete newHeaders[key]
    setFormData({ ...formData, headers: newHeaders })
  }

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-6">
      <h3 className="text-lg font-semibold mb-6">
        {webhook ? 'Edit Webhook' : 'Create New Webhook'}
      </h3>

      <div className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="My Webhook"
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Method
            </label>
            <select
              value={formData.method}
              onChange={(e) => setFormData({ ...formData, method: e.target.value as any })}
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
            >
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            URL
          </label>
          <input
            type="url"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            placeholder="https://example.com/webhook"
            className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
          />
        </div>

        {/* Events */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
            Events
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
            {EVENT_TYPES.map(event => {
              const category = event.id.split('.')[0]
              const Icon = EVENT_ICONS[category] || EVENT_ICONS.default
              const isSelected = formData.events?.includes(event.id)
              
              return (
                <label key={event.id} className="flex items-start gap-3 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      const events = e.target.checked
                        ? [...(formData.events || []), event.id]
                        : (formData.events || []).filter(id => id !== event.id)
                      setFormData({ ...formData, events })
                    }}
                    className="mt-1 h-4 w-4 text-blue-600 rounded"
                  />
                  <Icon className="w-4 h-4 text-zinc-500 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{event.label}</div>
                    <div className="text-xs text-zinc-500">{event.description}</div>
                  </div>
                </label>
              )
            })}
          </div>
        </div>

        {/* Headers */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Headers
            </label>
            <Button onClick={addHeader} variant="outline">
              <Plus className="w-4 h-4 mr-1" />
              Add Header
            </Button>
          </div>
          <div className="space-y-2">
            {Object.entries(formData.headers || {}).map(([key, value]) => (
              <div key={key} className="flex gap-2">
                <input
                  type="text"
                  value={key}
                  onChange={(e) => updateHeader(key, e.target.value, value)}
                  placeholder="Header name"
                  className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                />
                <input
                  type="text"
                  value={value}
                  onChange={(e) => updateHeader(key, key, e.target.value)}
                  placeholder="Header value"
                  className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                />
                <Button onClick={() => removeHeader(key)} variant="outline">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Secret */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Secret (Optional)
          </label>
          <div className="relative">
            <input
              type={showSecret ? 'text' : 'password'}
              value={formData.secret}
              onChange={(e) => setFormData({ ...formData, secret: e.target.value })}
              placeholder="Webhook secret for signature verification"
              className="w-full px-3 py-2 pr-10 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
            />
            <button
              type="button"
              onClick={() => setShowSecret(!showSecret)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Timeout (seconds)
            </label>
            <input
              type="number"
              min="1"
              max="300"
              value={formData.timeout}
              onChange={(e) => setFormData({ ...formData, timeout: parseInt(e.target.value) })}
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Max Retries
            </label>
            <input
              type="number"
              min="0"
              max="10"
              value={formData.retryPolicy?.maxRetries}
              onChange={(e) => setFormData({
                ...formData,
                retryPolicy: { ...formData.retryPolicy!, maxRetries: parseInt(e.target.value) }
              })}
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="enabled"
            checked={formData.enabled}
            onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
            className="h-4 w-4 text-blue-600 rounded"
          />
          <label htmlFor="enabled" className="text-sm font-medium">
            Enable webhook
          </label>
        </div>

        <div className="flex gap-3">
          <Button onClick={() => onSave(formData)}>
            {webhook ? 'Update' : 'Create'} Webhook
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}

function WebhookCard({ webhook, onEdit, onDelete, onToggle, onTest }: {
  webhook: WebhookEndpoint
  onEdit: () => void
  onDelete: () => void
  onToggle: () => void
  onTest: () => void
}) {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700">
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${webhook.enabled ? 'bg-green-500' : 'bg-gray-400'}`} />
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-white">{webhook.name}</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 break-all">{webhook.url}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button onClick={onTest} variant="outline">
              <Send className="w-4 h-4" />
            </Button>
            <Button onClick={onEdit} variant="outline">
              <Edit3 className="w-4 h-4" />
            </Button>
            <Button onClick={onDelete} variant="outline">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-3">
          <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-zinc-500">Success Rate</span>
              <CheckCircle className="w-3 h-3 text-green-500" />
            </div>
            <div className="text-lg font-semibold text-green-600">
              {webhook.successRate.toFixed(1)}%
            </div>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-zinc-500">Total Deliveries</span>
              <Activity className="w-3 h-3 text-blue-500" />
            </div>
            <div className="text-lg font-semibold">
              {webhook.totalDeliveries.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex flex-wrap gap-1">
            {webhook.events.slice(0, 3).map(event => (
              <span key={event} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs rounded">
                {event}
              </span>
            ))}
            {webhook.events.length > 3 && (
              <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs rounded">
                +{webhook.events.length - 3} more
              </span>
            )}
          </div>
          
          <span className="text-xs text-zinc-500">
            {webhook.method}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-xs text-zinc-500">
            {webhook.lastTriggered ? `Last: ${new Date(webhook.lastTriggered).toLocaleString()}` : 'Never triggered'}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              {showDetails ? 'Hide' : 'Show'} Details
            </button>
            
            <Button
              onClick={onToggle}
              variant="outline"
             
              className={webhook.enabled ? 'text-red-600' : 'text-green-600'}
            >
              {webhook.enabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {showDetails && (
          <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700 space-y-3">
            <div>
              <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">Headers</p>
              <div className="space-y-1">
                {Object.entries(webhook.headers).map(([key, value]) => (
                  <p key={key} className="text-xs font-mono text-zinc-600 dark:text-zinc-400">
                    {key}: {value}
                  </p>
                ))}
              </div>
            </div>
            
            <div>
              <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">Retry Policy</p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Max retries: {webhook.retryPolicy.maxRetries}, Timeout: {webhook.timeout}s
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">Events ({webhook.events.length})</p>
              <div className="flex flex-wrap gap-1">
                {webhook.events.map(event => (
                  <span key={event} className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs rounded">
                    {event}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function DeliveryLogCard({ delivery }: { delivery: WebhookDelivery }) {
  const [showDetails, setShowDetails] = useState(false)

  const statusConfig = {
    pending: { color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/20', icon: Clock },
    success: { color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/20', icon: CheckCircle },
    failed: { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/20', icon: XCircle },
    retrying: { color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/20', icon: RotateCw }
  }

  const config = statusConfig[delivery.status]
  const Icon = config.icon

  return (
    <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Icon className={`w-4 h-4 ${config.color}`} />
          <div>
            <div className="font-medium text-sm">{delivery.event}</div>
            <div className="text-xs text-zinc-500">{new Date(delivery.timestamp).toLocaleString()}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
            {delivery.status.toUpperCase()}
          </span>
          {delivery.statusCode && (
            <span className="text-xs text-zinc-500">
              {delivery.statusCode}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span>Attempt {delivery.attempt}/{delivery.maxAttempts}</span>
        {delivery.duration && <span>{delivery.duration}ms</span>}
      </div>

      {delivery.error && (
        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs text-red-700 dark:text-red-400">
          {delivery.error}
        </div>
      )}

      <button
        onClick={() => setShowDetails(!showDetails)}
        className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline"
      >
        {showDetails ? 'Hide' : 'Show'} Details
      </button>

      {showDetails && (
        <div className="mt-3 space-y-3">
          <div>
            <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">Request Body</p>
            <pre className="text-xs bg-zinc-50 dark:bg-zinc-900/50 p-2 rounded overflow-x-auto">
              {JSON.stringify(JSON.parse(delivery.requestBody), null, 2)}
            </pre>
          </div>
          
          {delivery.responseBody && (
            <div>
              <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">Response Body</p>
              <pre className="text-xs bg-zinc-50 dark:bg-zinc-900/50 p-2 rounded overflow-x-auto">
                {delivery.responseBody}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function PayloadTemplatesSection() {
  const [templates, setTemplates] = useState<PayloadTemplate[]>([
    {
      id: '1',
      name: 'User Registration',
      event: 'user.created',
      description: 'Template for new user registration events',
      template: JSON.stringify({
        event: '{{event}}',
        timestamp: '{{timestamp}}',
        user: {
          id: '{{user.id}}',
          email: '{{user.email}}',
          name: '{{user.name}}'
        }
      }, null, 2)
    }
  ])
  const [showTemplateForm, setShowTemplateForm] = useState(false)

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Code className="w-5 h-5" />
          Payload Templates
        </h3>
        <Button onClick={() => setShowTemplateForm(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Template
        </Button>
      </div>

      <div className="space-y-3">
        {templates.map(template => (
          <div key={template.id} className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="font-medium">{template.name}</h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{template.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs rounded">
                  {template.event}
                </span>
                <Button variant="outline">
                  <Edit3 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <pre className="text-xs bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded overflow-x-auto">
              {template.template}
            </pre>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([
    {
      id: '1',
      name: 'Production Alerts',
      url: 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX',
      method: 'POST',
      enabled: true,
      events: ['deployment.failed', 'service.stopped', 'alert.created'],
      headers: { 'Content-Type': 'application/json' },
      secret: 'webhook_secret_123',
      timeout: 30,
      retryPolicy: { maxRetries: 3, backoffMultiplier: 2, maxDelay: 300 },
      created: '2024-01-15T10:00:00Z',
      lastTriggered: '2024-01-20T14:30:00Z',
      successRate: 98.5,
      totalDeliveries: 247,
      failedDeliveries: 4
    },
    {
      id: '2',
      name: 'Development Notifications',
      url: 'https://discord.com/api/webhooks/1234567890/abcdefghijklmnopqrstuvwxyz',
      method: 'POST',
      enabled: false,
      events: ['deployment.completed', 'user.created'],
      headers: { 'Content-Type': 'application/json' },
      timeout: 15,
      retryPolicy: { maxRetries: 1, backoffMultiplier: 1, maxDelay: 60 },
      created: '2024-01-10T09:00:00Z',
      successRate: 100,
      totalDeliveries: 52,
      failedDeliveries: 0
    }
  ])

  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([
    {
      id: '1',
      webhookId: '1',
      event: 'deployment.failed',
      status: 'success',
      statusCode: 200,
      requestBody: JSON.stringify({ event: 'deployment.failed', data: { id: 'deploy-123' } }),
      responseBody: 'ok',
      attempt: 1,
      maxAttempts: 3,
      timestamp: '2024-01-20T14:30:00Z',
      duration: 245
    },
    {
      id: '2',
      webhookId: '1',
      event: 'service.stopped',
      status: 'failed',
      statusCode: 500,
      requestBody: JSON.stringify({ event: 'service.stopped', data: { service: 'api' } }),
      responseBody: 'Internal Server Error',
      attempt: 3,
      maxAttempts: 3,
      timestamp: '2024-01-20T13:15:00Z',
      duration: 5000,
      error: 'Connection timeout after 5000ms'
    }
  ])

  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingWebhook, setEditingWebhook] = useState<WebhookEndpoint | undefined>()
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'webhooks' | 'deliveries' | 'templates'>('webhooks')

  const filteredWebhooks = webhooks.filter(webhook => {
    if (filter === 'enabled' && !webhook.enabled) return false
    if (filter === 'disabled' && webhook.enabled) return false
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        webhook.name.toLowerCase().includes(query) ||
        webhook.url.toLowerCase().includes(query) ||
        webhook.events.some(event => event.toLowerCase().includes(query))
      )
    }
    
    return true
  })

  const handleSaveWebhook = async (webhookData: Partial<WebhookEndpoint>) => {
    try {
      setLoading(true)
      
      if (editingWebhook) {
        // Update existing webhook
        const response = await fetch(`/api/webhooks/${editingWebhook.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(webhookData)
        })
        
        if (response.ok) {
          setWebhooks(webhooks.map(w => w.id === editingWebhook.id ? { ...w, ...webhookData } : w))
        }
      } else {
        // Create new webhook
        const response = await fetch('/api/webhooks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(webhookData)
        })
        
        if (response.ok) {
          const newWebhook = await response.json()
          setWebhooks([...webhooks, newWebhook])
        }
      }
      
      setShowForm(false)
      setEditingWebhook(undefined)
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteWebhook = async (id: string) => {
    if (!confirm('Are you sure you want to delete this webhook?')) return
    
    try {
      await fetch(`/api/webhooks/${id}`, { method: 'DELETE' })
      setWebhooks(webhooks.filter(w => w.id !== id))
    } catch (error) {
    }
  }

  const handleToggleWebhook = async (id: string) => {
    try {
      const webhook = webhooks.find(w => w.id === id)
      if (!webhook) return
      
      const response = await fetch(`/api/webhooks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !webhook.enabled })
      })
      
      if (response.ok) {
        setWebhooks(webhooks.map(w => w.id === id ? { ...w, enabled: !w.enabled } : w))
      }
    } catch (error) {
    }
  }

  const handleTestWebhook = async (id: string) => {
    try {
      const response = await fetch(`/api/webhooks/${id}/test`, { method: 'POST' })
      const result = await response.json()
      
      if (result.success) {
        alert('Test webhook sent successfully!')
      } else {
        alert(`Test failed: ${result.error}`)
      }
    } catch (error) {
      alert('Test failed: Network error')
    }
  }

  return (
    <>
      <HeroPattern />
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
                <Webhook className="w-8 h-8 text-blue-500" />
                Webhooks
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400 mt-1">
                Manage webhook endpoints and monitor delivery status
              </p>
            </div>

            <Button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Webhook
            </Button>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2 bg-white dark:bg-zinc-800 rounded-lg p-1 border border-zinc-200 dark:border-zinc-700">
              {[
                { id: 'webhooks', label: 'Webhooks', icon: Webhook },
                { id: 'deliveries', label: 'Deliveries', icon: Activity },
                { id: 'templates', label: 'Templates', icon: Code }
              ].map(tab => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-500 text-white'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                )
              })}
            </div>

            {activeTab === 'webhooks' && (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Search webhooks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                  />
                </div>

                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                >
                  <option value="all">All Webhooks</option>
                  <option value="enabled">Enabled Only</option>
                  <option value="disabled">Disabled Only</option>
                </select>
              </>
            )}
          </div>
        </div>

        {showForm && (
          <div className="mb-8">
            <WebhookForm
              webhook={editingWebhook}
              onSave={handleSaveWebhook}
              onCancel={() => {
                setShowForm(false)
                setEditingWebhook(undefined)
              }}
            />
          </div>
        )}

        {activeTab === 'webhooks' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWebhooks.map(webhook => (
              <WebhookCard
                key={webhook.id}
                webhook={webhook}
                onEdit={() => {
                  setEditingWebhook(webhook)
                  setShowForm(true)
                }}
                onDelete={() => handleDeleteWebhook(webhook.id)}
                onToggle={() => handleToggleWebhook(webhook.id)}
                onTest={() => handleTestWebhook(webhook.id)}
              />
            ))}

            {filteredWebhooks.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Webhook className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
                <p className="text-zinc-600 dark:text-zinc-400">
                  {searchQuery || filter !== 'all' ? 'No webhooks match your filters' : 'No webhooks configured yet'}
                </p>
                <Button 
                  onClick={() => setShowForm(true)}
                  className="mt-4"
                >
                  Create Your First Webhook
                </Button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'deliveries' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Recent Deliveries</h3>
              <Button variant="outline" className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            </div>
            
            {deliveries.map(delivery => (
              <DeliveryLogCard key={delivery.id} delivery={delivery} />
            ))}

            {deliveries.length === 0 && (
              <div className="text-center py-12">
                <Activity className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
                <p className="text-zinc-600 dark:text-zinc-400">No deliveries yet</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'templates' && <PayloadTemplatesSection />}
      </div>
    </>
  )
}