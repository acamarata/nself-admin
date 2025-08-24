'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/Button'
import { HeroPattern } from '@/components/HeroPattern'
import { 
  Send, Plus, Save, Trash2, Copy, Download, Upload,
  ChevronDown, ChevronRight, Eye, EyeOff, Code, FileText,
  Clock, Bookmark, Settings, Search, Filter, Edit,
  Globe, Lock, Key, Database, Zap, RefreshCw,
  AlertCircle, CheckCircle, Info, X, Play, Folder,
  FolderOpen, MoreVertical, Star, Share, History,
  Terminal, Bug, TestTube, Layers, ArrowRight
} from 'lucide-react'

interface ApiRequest {
  id: string
  name: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS'
  url: string
  headers: Record<string, string>
  body?: string
  bodyType: 'json' | 'form' | 'raw' | 'none'
  auth?: {
    type: 'none' | 'bearer' | 'basic' | 'api-key'
    token?: string
    username?: string
    password?: string
    apiKey?: string
    apiKeyHeader?: string
  }
  environment?: string
  timestamp: string
  collection?: string
}

interface ApiResponse {
  status: number
  statusText: string
  headers: Record<string, string>
  body: string
  size: number
  time: number
  timestamp: string
}

interface Collection {
  id: string
  name: string
  description?: string
  requests: string[]
  variables: Record<string, string>
  auth?: ApiRequest['auth']
  baseUrl?: string
}

interface Environment {
  id: string
  name: string
  variables: Record<string, string>
  baseUrl?: string
}

interface ApiDocumentation {
  title: string
  version: string
  description: string
  baseUrl: string
  endpoints: ApiEndpoint[]
}

interface ApiEndpoint {
  path: string
  method: string
  summary: string
  description?: string
  parameters?: Parameter[]
  requestBody?: {
    required: boolean
    content: Record<string, any>
  }
  responses: Record<string, any>
  tags?: string[]
}

interface Parameter {
  name: string
  in: 'query' | 'header' | 'path' | 'cookie'
  required: boolean
  schema: any
  description?: string
}

function RequestBuilder({ 
  request, 
  onRequestChange, 
  onSendRequest,
  environments 
}: {
  request: ApiRequest
  onRequestChange: (request: ApiRequest) => void
  onSendRequest: (request: ApiRequest) => void
  environments: Environment[]
}) {
  const [showAuth, setShowAuth] = useState(false)
  const [showHeaders, setShowHeaders] = useState(false)
  const [showBody, setShowBody] = useState(request.method !== 'GET')
  
  const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']
  
  const addHeader = () => {
    onRequestChange({
      ...request,
      headers: { ...request.headers, '': '' }
    })
  }
  
  const updateHeader = (oldKey: string, newKey: string, value: string) => {
    const newHeaders = { ...request.headers }
    if (oldKey !== newKey) {
      delete newHeaders[oldKey]
    }
    if (newKey) {
      newHeaders[newKey] = value
    }
    onRequestChange({
      ...request,
      headers: newHeaders
    })
  }
  
  const removeHeader = (key: string) => {
    const newHeaders = { ...request.headers }
    delete newHeaders[key]
    onRequestChange({
      ...request,
      headers: newHeaders
    })
  }
  
  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-500'
      case 'POST': return 'bg-blue-500'
      case 'PUT': return 'bg-yellow-500'
      case 'DELETE': return 'bg-red-500'
      case 'PATCH': return 'bg-purple-500'
      default: return 'bg-gray-500'
    }
  }
  
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Request Builder</h2>
          {environments.length > 0 && (
            <select
              value={request.environment || ''}
              onChange={(e) => onRequestChange({ ...request, environment: e.target.value })}
              className="px-3 py-1 text-sm rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
            >
              <option value="">No Environment</option>
              {environments.map(env => (
                <option key={env.id} value={env.id}>{env.name}</option>
              ))}
            </select>
          )}
        </div>
        
        <div className="flex gap-2 mb-4">
          <select
            value={request.method}
            onChange={(e) => onRequestChange({ ...request, method: e.target.value as ApiRequest['method'] })}
            className="px-3 py-2 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-medium"
          >
            {methods.map(method => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>
          
          <input
            type="text"
            placeholder="https://api.example.com/endpoint"
            value={request.url}
            onChange={(e) => onRequestChange({ ...request, url: e.target.value })}
            className="flex-1 px-3 py-2 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
          />
          
          <Button
            onClick={() => onSendRequest(request)}
            disabled={!request.url}
            className="flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Send
          </Button>
        </div>
        
        <div className="flex items-center gap-4 text-sm">
          <button
            onClick={() => setShowAuth(!showAuth)}
            className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
          >
            <Lock className="w-4 h-4" />
            Authorization
            {showAuth ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>
          
          <button
            onClick={() => setShowHeaders(!showHeaders)}
            className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
          >
            <FileText className="w-4 h-4" />
            Headers ({Object.keys(request.headers).length})
            {showHeaders ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>
          
          {request.method !== 'GET' && request.method !== 'HEAD' && (
            <button
              onClick={() => setShowBody(!showBody)}
              className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            >
              <Code className="w-4 h-4" />
              Body
              {showBody ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>
          )}
        </div>
      </div>
      
      {showAuth && (
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50">
          <h3 className="font-medium text-zinc-900 dark:text-white mb-3">Authorization</h3>
          <div className="space-y-4">
            <select
              value={request.auth?.type || 'none'}
              onChange={(e) => onRequestChange({
                ...request,
                auth: { ...request.auth, type: e.target.value as any }
              })}
              className="w-full px-3 py-2 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
            >
              <option value="none">No Auth</option>
              <option value="bearer">Bearer Token</option>
              <option value="basic">Basic Auth</option>
              <option value="api-key">API Key</option>
            </select>
            
            {request.auth?.type === 'bearer' && (
              <input
                type="password"
                placeholder="Token"
                value={request.auth.token || ''}
                onChange={(e) => onRequestChange({
                  ...request,
                  auth: { ...request.auth, token: e.target.value }
                })}
                className="w-full px-3 py-2 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
              />
            )}
            
            {request.auth?.type === 'basic' && (
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Username"
                  value={request.auth.username || ''}
                  onChange={(e) => onRequestChange({
                    ...request,
                    auth: { ...request.auth, username: e.target.value }
                  })}
                  className="px-3 py-2 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={request.auth.password || ''}
                  onChange={(e) => onRequestChange({
                    ...request,
                    auth: { ...request.auth, password: e.target.value }
                  })}
                  className="px-3 py-2 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
              </div>
            )}
            
            {request.auth?.type === 'api-key' && (
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Header Name (e.g., X-API-Key)"
                  value={request.auth.apiKeyHeader || ''}
                  onChange={(e) => onRequestChange({
                    ...request,
                    auth: { ...request.auth, apiKeyHeader: e.target.value }
                  })}
                  className="px-3 py-2 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
                <input
                  type="password"
                  placeholder="API Key"
                  value={request.auth.apiKey || ''}
                  onChange={(e) => onRequestChange({
                    ...request,
                    auth: { ...request.auth, apiKey: e.target.value }
                  })}
                  className="px-3 py-2 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
              </div>
            )}
          </div>
        </div>
      )}
      
      {showHeaders && (
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-zinc-900 dark:text-white">Headers</h3>
            <Button onClick={addHeader} variant="outline" className="text-xs">
              <Plus className="w-3 h-3 mr-1" />
              Add Header
            </Button>
          </div>
          
          <div className="space-y-2">
            {Object.entries(request.headers).map(([key, value], index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Header name"
                  value={key}
                  onChange={(e) => updateHeader(key, e.target.value, value)}
                  className="flex-1 px-3 py-2 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm"
                />
                <input
                  type="text"
                  placeholder="Header value"
                  value={value}
                  onChange={(e) => updateHeader(key, key, e.target.value)}
                  className="flex-1 px-3 py-2 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm"
                />
                <button
                  onClick={() => removeHeader(key)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            
            {Object.keys(request.headers).length === 0 && (
              <div className="text-center py-4 text-zinc-500">
                No headers added
              </div>
            )}
          </div>
        </div>
      )}
      
      {showBody && request.method !== 'GET' && request.method !== 'HEAD' && (
        <div className="p-6 bg-zinc-50 dark:bg-zinc-900/50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-zinc-900 dark:text-white">Request Body</h3>
            <select
              value={request.bodyType}
              onChange={(e) => onRequestChange({ ...request, bodyType: e.target.value as any })}
              className="px-3 py-1 text-sm rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
            >
              <option value="none">None</option>
              <option value="json">JSON</option>
              <option value="form">Form Data</option>
              <option value="raw">Raw</option>
            </select>
          </div>
          
          {request.bodyType !== 'none' && (
            <textarea
              placeholder={
                request.bodyType === 'json' ? '{\n  "key": "value"\n}' :
                request.bodyType === 'form' ? 'key1=value1&key2=value2' :
                'Raw request body'
              }
              value={request.body || ''}
              onChange={(e) => onRequestChange({ ...request, body: e.target.value })}
              className="w-full h-48 px-3 py-2 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono text-sm resize-vertical"
            />
          )}
        </div>
      )}
    </div>
  )
}

function ResponseViewer({ response }: { response: ApiResponse | null }) {
  const [activeTab, setActiveTab] = useState<'body' | 'headers' | 'cookies'>('body')
  const [bodyFormat, setBodyFormat] = useState<'pretty' | 'raw'>('pretty')
  
  if (!response) {
    return (
      <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 h-96 flex items-center justify-center">
        <div className="text-center text-zinc-500">
          <Terminal className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Send a request to see the response</p>
        </div>
      </div>
    )
  }
  
  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-600 dark:text-green-400'
    if (status >= 300 && status < 400) return 'text-yellow-600 dark:text-yellow-400'
    if (status >= 400 && status < 500) return 'text-orange-600 dark:text-orange-400'
    if (status >= 500) return 'text-red-600 dark:text-red-400'
    return 'text-zinc-600 dark:text-zinc-400'
  }
  
  const formatJson = (jsonString: string) => {
    try {
      return JSON.stringify(JSON.parse(jsonString), null, 2)
    } catch {
      return jsonString
    }
  }
  
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }
  
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Response</h2>
          <div className="flex items-center gap-4 text-sm">
            <span className={`font-medium ${getStatusColor(response.status)}`}>
              {response.status} {response.statusText}
            </span>
            <span className="text-zinc-500">
              {response.time}ms • {formatSize(response.size)}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-700 rounded-lg p-1 w-fit">
          <button
            onClick={() => setActiveTab('body')}
            className={`px-3 py-1 rounded text-sm font-medium transition-all ${
              activeTab === 'body'
                ? 'bg-white dark:bg-zinc-600 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400'
            }`}
          >
            Body
          </button>
          <button
            onClick={() => setActiveTab('headers')}
            className={`px-3 py-1 rounded text-sm font-medium transition-all ${
              activeTab === 'headers'
                ? 'bg-white dark:bg-zinc-600 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400'
            }`}
          >
            Headers ({Object.keys(response.headers).length})
          </button>
          <button
            onClick={() => setActiveTab('cookies')}
            className={`px-3 py-1 rounded text-sm font-medium transition-all ${
              activeTab === 'cookies'
                ? 'bg-white dark:bg-zinc-600 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400'
            }`}
          >
            Cookies
          </button>
        </div>
      </div>
      
      {activeTab === 'body' && (
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              Content-Type: {response.headers['content-type'] || 'Unknown'}
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => navigator.clipboard.writeText(response.body)}
                variant="outline"
                className="text-xs"
              >
                <Copy className="w-3 h-3 mr-1" />
                Copy
              </Button>
              <select
                value={bodyFormat}
                onChange={(e) => setBodyFormat(e.target.value as 'pretty' | 'raw')}
                className="px-2 py-1 text-xs rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
              >
                <option value="pretty">Pretty</option>
                <option value="raw">Raw</option>
              </select>
            </div>
          </div>
          
          <div className="bg-zinc-900 text-green-400 rounded-lg p-4 overflow-auto max-h-96">
            <pre className="text-sm font-mono whitespace-pre-wrap">
              {bodyFormat === 'pretty' && response.headers['content-type']?.includes('json')
                ? formatJson(response.body)
                : response.body}
            </pre>
          </div>
        </div>
      )}
      
      {activeTab === 'headers' && (
        <div className="p-6">
          <div className="space-y-2">
            {Object.entries(response.headers).map(([key, value]) => (
              <div key={key} className="flex items-start gap-4 py-2 border-b border-zinc-100 dark:border-zinc-700 last:border-0">
                <span className="font-medium text-zinc-900 dark:text-white min-w-0 flex-shrink-0 w-32">
                  {key}:
                </span>
                <span className="text-zinc-600 dark:text-zinc-400 font-mono text-sm break-all">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {activeTab === 'cookies' && (
        <div className="p-6">
          <div className="text-center py-8 text-zinc-500">
            <Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No cookies in response</p>
          </div>
        </div>
      )}
    </div>
  )
}

function CollectionManager({ 
  collections, 
  onCollectionSelect, 
  onRequestSelect,
  requests 
}: {
  collections: Collection[]
  onCollectionSelect: (collection: Collection) => void
  onRequestSelect: (request: ApiRequest) => void
  requests: ApiRequest[]
}) {
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(new Set())
  
  const toggleCollection = (collectionId: string) => {
    const newExpanded = new Set(expandedCollections)
    if (newExpanded.has(collectionId)) {
      newExpanded.delete(collectionId)
    } else {
      newExpanded.add(collectionId)
    }
    setExpandedCollections(newExpanded)
  }
  
  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'text-green-600 dark:text-green-400'
      case 'POST': return 'text-blue-600 dark:text-blue-400'
      case 'PUT': return 'text-yellow-600 dark:text-yellow-400'
      case 'DELETE': return 'text-red-600 dark:text-red-400'
      case 'PATCH': return 'text-purple-600 dark:text-purple-400'
      default: return 'text-zinc-600 dark:text-zinc-400'
    }
  }
  
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-zinc-900 dark:text-white">Collections</h3>
          <Button variant="outline" className="text-xs">
            <Plus className="w-3 h-3 mr-1" />
            New Collection
          </Button>
        </div>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {collections.map(collection => {
          const isExpanded = expandedCollections.has(collection.id)
          const collectionRequests = requests.filter(r => collection.requests.includes(r.id))
          
          return (
            <div key={collection.id} className="border-b border-zinc-200 dark:border-zinc-700 last:border-0">
              <button
                onClick={() => toggleCollection(collection.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-700/50 text-left"
              >
                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <FolderOpen className="w-4 h-4 text-blue-500" />
                  ) : (
                    <Folder className="w-4 h-4 text-zinc-500" />
                  )}
                  <span className="font-medium text-zinc-900 dark:text-white">
                    {collection.name}
                  </span>
                  <span className="text-xs text-zinc-500">
                    ({collection.requests.length})
                  </span>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-zinc-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-zinc-500" />
                )}
              </button>
              
              {isExpanded && (
                <div className="pb-2">
                  {collectionRequests.map(request => (
                    <button
                      key={request.id}
                      onClick={() => onRequestSelect(request)}
                      className="w-full p-3 pl-12 flex items-center gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 text-left"
                    >
                      <span className={`text-xs font-medium ${getMethodColor(request.method)}`}>
                        {request.method}
                      </span>
                      <span className="text-sm text-zinc-900 dark:text-white">
                        {request.name}
                      </span>
                    </button>
                  ))}
                  
                  {collectionRequests.length === 0 && (
                    <div className="p-3 pl-12 text-sm text-zinc-500">
                      No requests in this collection
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
        
        {collections.length === 0 && (
          <div className="p-8 text-center text-zinc-500">
            <Folder className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No collections created</p>
          </div>
        )}
      </div>
    </div>
  )
}

function RequestHistory({ 
  history, 
  onRequestSelect 
}: {
  history: ApiRequest[]
  onRequestSelect: (request: ApiRequest) => void
}) {
  const [searchQuery, setSearchQuery] = useState('')
  
  const filteredHistory = history.filter(request =>
    request.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.method.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'POST': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'PUT': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'DELETE': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      case 'PATCH': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }
  
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-zinc-900 dark:text-white">Request History</h3>
          <Button variant="outline" className="text-xs">
            <Trash2 className="w-3 h-3 mr-1" />
            Clear
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm"
          />
        </div>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {filteredHistory.map(request => (
          <button
            key={request.id}
            onClick={() => onRequestSelect(request)}
            className="w-full p-4 flex items-center gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 text-left border-b border-zinc-200 dark:border-zinc-700 last:border-0"
          >
            <span className={`px-2 py-1 rounded text-xs font-medium ${getMethodColor(request.method)}`}>
              {request.method}
            </span>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-zinc-900 dark:text-white truncate">
                {request.name}
              </div>
              <div className="text-sm text-zinc-500 truncate">
                {request.url}
              </div>
            </div>
            <div className="text-xs text-zinc-500">
              {new Date(request.timestamp).toLocaleTimeString()}
            </div>
          </button>
        ))}
        
        {filteredHistory.length === 0 && (
          <div className="p-8 text-center text-zinc-500">
            <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>{searchQuery ? 'No matching requests' : 'No request history'}</p>
          </div>
        )}
      </div>
    </div>
  )
}

function EnvironmentManager({ 
  environments, 
  onEnvironmentUpdate 
}: {
  environments: Environment[]
  onEnvironmentUpdate: (environments: Environment[]) => void
}) {
  const [selectedEnv, setSelectedEnv] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-zinc-900 dark:text-white">Environments</h3>
          <Button onClick={() => setIsCreating(true)} variant="outline" className="text-xs">
            <Plus className="w-3 h-3 mr-1" />
            New Environment
          </Button>
        </div>
      </div>
      
      <div className="p-4">
        {environments.map(env => (
          <div key={env.id} className="mb-4 p-3 border border-zinc-200 dark:border-zinc-700 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-zinc-900 dark:text-white">{env.name}</h4>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="text-xs">
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </Button>
                <Button variant="outline" className="text-xs">
                  <Trash2 className="w-3 h-3 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
            
            {env.baseUrl && (
              <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                Base URL: {env.baseUrl}
              </div>
            )}
            
            <div className="text-xs text-zinc-500">
              {Object.keys(env.variables).length} variables
            </div>
          </div>
        ))}
        
        {environments.length === 0 && (
          <div className="text-center py-8 text-zinc-500">
            <Globe className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No environments configured</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ApiExplorerPage() {
  const [currentRequest, setCurrentRequest] = useState<ApiRequest>({
    id: '',
    name: 'Untitled Request',
    method: 'GET',
    url: '',
    headers: {
      'Content-Type': 'application/json'
    },
    bodyType: 'json',
    timestamp: new Date().toISOString()
  })
  
  const [currentResponse, setCurrentResponse] = useState<ApiResponse | null>(null)
  const [collections, setCollections] = useState<Collection[]>([])
  const [requestHistory, setRequestHistory] = useState<ApiRequest[]>([])
  const [environments, setEnvironments] = useState<Environment[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'collections' | 'history' | 'environments' | 'docs'>('collections')
  
  useEffect(() => {
    // Load mock data
    const mockCollections: Collection[] = [
      {
        id: '1',
        name: 'User API',
        description: 'User management endpoints',
        requests: ['req1', 'req2'],
        variables: { baseUrl: 'https://api.example.com' },
        baseUrl: 'https://api.example.com'
      },
      {
        id: '2',
        name: 'Auth API',
        description: 'Authentication endpoints',
        requests: ['req3'],
        variables: { baseUrl: 'https://auth.example.com' },
        baseUrl: 'https://auth.example.com'
      }
    ]
    
    const mockHistory: ApiRequest[] = [
      {
        id: 'req1',
        name: 'Get Users',
        method: 'GET',
        url: 'https://api.example.com/users',
        headers: { 'Authorization': 'Bearer token123' },
        bodyType: 'none',
        timestamp: '2024-01-15T10:30:00Z'
      },
      {
        id: 'req2',
        name: 'Create User',
        method: 'POST',
        url: 'https://api.example.com/users',
        headers: { 'Content-Type': 'application/json' },
        body: '{"name": "John Doe", "email": "john@example.com"}',
        bodyType: 'json',
        timestamp: '2024-01-15T10:25:00Z'
      },
      {
        id: 'req3',
        name: 'Login',
        method: 'POST',
        url: 'https://auth.example.com/login',
        headers: { 'Content-Type': 'application/json' },
        body: '{"username": "admin", "password": "password"}',
        bodyType: 'json',
        timestamp: '2024-01-15T10:20:00Z'
      }
    ]
    
    const mockEnvironments: Environment[] = [
      {
        id: '1',
        name: 'Development',
        variables: {
          baseUrl: 'http://localhost:3000',
          apiKey: 'dev-key-123'
        },
        baseUrl: 'http://localhost:3000'
      },
      {
        id: '2',
        name: 'Production',
        variables: {
          baseUrl: 'https://api.example.com',
          apiKey: 'prod-key-456'
        },
        baseUrl: 'https://api.example.com'
      }
    ]
    
    setCollections(mockCollections)
    setRequestHistory(mockHistory)
    setEnvironments(mockEnvironments)
  }, [])
  
  const handleSendRequest = async (request: ApiRequest) => {
    setLoading(true)
    
    // Simulate API request
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock response
    const mockResponse: ApiResponse = {
      status: 200,
      statusText: 'OK',
      headers: {
        'content-type': 'application/json',
        'content-length': '156',
        'server': 'nginx/1.18.0',
        'date': new Date().toISOString()
      },
      body: JSON.stringify({
        success: true,
        data: {
          users: [
            { id: 1, name: 'John Doe', email: 'john@example.com' },
            { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
          ]
        },
        meta: {
          total: 2,
          page: 1,
          limit: 10
        }
      }, null, 2),
      size: 156,
      time: 245,
      timestamp: new Date().toISOString()
    }
    
    setCurrentResponse(mockResponse)
    
    // Add to history
    const requestWithId = { ...request, id: Date.now().toString(), timestamp: new Date().toISOString() }
    setRequestHistory(prev => [requestWithId, ...prev.slice(0, 19)]) // Keep last 20
    
    setLoading(false)
  }
  
  const handleRequestSelect = (request: ApiRequest) => {
    setCurrentRequest({ ...request, id: Date.now().toString() })
  }
  
  const handleSaveRequest = () => {
    // Save request logic would go here
    console.log('Saving request:', currentRequest)
  }
  
  return (
    <>
      <HeroPattern />
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">API Explorer</h1>
              <p className="text-zinc-600 dark:text-zinc-400 mt-1">
                Test and explore REST APIs with an intuitive interface
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleSaveRequest} variant="outline">
                <Save className="w-4 h-4 mr-2" />
                Save Request
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Collection
              </Button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-12 lg:col-span-3">
            <div className="space-y-4 sticky top-6">
              <div className="flex items-center gap-1 bg-white dark:bg-zinc-800 rounded-lg p-1 border border-zinc-200 dark:border-zinc-700">
                <button
                  onClick={() => setActiveTab('collections')}
                  className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-all ${
                    activeTab === 'collections'
                      ? 'bg-blue-500 text-white'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                  }`}
                >
                  <Folder className="w-4 h-4 mx-auto" />
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-all ${
                    activeTab === 'history'
                      ? 'bg-blue-500 text-white'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                  }`}
                >
                  <History className="w-4 h-4 mx-auto" />
                </button>
                <button
                  onClick={() => setActiveTab('environments')}
                  className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-all ${
                    activeTab === 'environments'
                      ? 'bg-blue-500 text-white'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                  }`}
                >
                  <Globe className="w-4 h-4 mx-auto" />
                </button>
                <button
                  onClick={() => setActiveTab('docs')}
                  className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-all ${
                    activeTab === 'docs'
                      ? 'bg-blue-500 text-white'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                  }`}
                >
                  <FileText className="w-4 h-4 mx-auto" />
                </button>
              </div>
              
              {activeTab === 'collections' && (
                <CollectionManager
                  collections={collections}
                  onCollectionSelect={(collection) => console.log('Selected collection:', collection)}
                  onRequestSelect={handleRequestSelect}
                  requests={requestHistory}
                />
              )}
              
              {activeTab === 'history' && (
                <RequestHistory
                  history={requestHistory}
                  onRequestSelect={handleRequestSelect}
                />
              )}
              
              {activeTab === 'environments' && (
                <EnvironmentManager
                  environments={environments}
                  onEnvironmentUpdate={setEnvironments}
                />
              )}
              
              {activeTab === 'docs' && (
                <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-6">
                  <h3 className="font-semibold text-zinc-900 dark:text-white mb-4">API Documentation</h3>
                  <div className="text-center py-8 text-zinc-500">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Import OpenAPI spec to view documentation</p>
                    <Button variant="outline" className="mt-3 text-xs">
                      <Upload className="w-3 h-3 mr-1" />
                      Import Spec
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Main Content */}
          <div className="col-span-12 lg:col-span-9">
            <div className="space-y-6">
              <RequestBuilder
                request={currentRequest}
                onRequestChange={setCurrentRequest}
                onSendRequest={handleSendRequest}
                environments={environments}
              />
              
              {loading && (
                <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-6">
                  <div className="flex items-center justify-center">
                    <RefreshCw className="w-6 h-6 text-blue-500 animate-spin mr-3" />
                    <span className="text-zinc-600 dark:text-zinc-400">Sending request...</span>
                  </div>
                </div>
              )}
              
              <ResponseViewer response={currentResponse} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}