'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, ArrowLeft, Plus, Trash2, Globe, Info, Link, Database, ExternalLink } from 'lucide-react'
import { StepWrapper } from '../StepWrapper'
import { UrlInput } from '@/components/UrlInput'

interface FrontendApp {
  displayName: string           // Human readable name e.g. "To Do Tracker"  
  systemName: string            // System name without spaces e.g. "todo_tracker"
  tablePrefix: string           // Database table prefix e.g. "tbt"
  localPort: number             // Local dev port e.g. 3002 (REQUIRED for nginx routing)
  localSubdomain?: string       // Local subdomain e.g. "todo" -> todo.localhost
  productionUrl?: string        // Production URL e.g. "www.mytodos.com"
  productionUrlError?: string   // Validation error for production URL
  remoteSchemaName?: string     // Hasura remote schema name
  remoteSchemaUrl?: string      // Remote schema URL for this environment
  remoteSchemaUrlError?: string // Validation error for remote schema URL
}

export default function InitStep5() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(false)
  const [frontendApps, setFrontendApps] = useState<FrontendApp[]>([])
  const [environment, setEnvironment] = useState('development')
  const [baseDomain, setBaseDomain] = useState('localhost')
  const [autoSaving, setAutoSaving] = useState(false)
  const [editingTitle, setEditingTitle] = useState<number | null>(null)

  // Load configuration from .env.local on mount and when page gains focus
  useEffect(() => {
    checkAndLoadConfiguration()
    
    // Reload when the page gains focus (e.g., navigating back)
    const handleFocus = () => {
      checkAndLoadConfiguration()
    }
    
    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        checkAndLoadConfiguration()
      }
    })
    
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  const checkAndLoadConfiguration = async () => {
    // First check if env file exists
    try {
      const statusRes = await fetch('/api/project/status')
      if (statusRes.ok) {
        const statusData = await statusRes.json()
        if (!statusData.hasEnvFile) {
          // No env file - redirect to /init to create it
          router.push('/init')
          return
        }
      }
    } catch (error) {
      console.error('Error checking project status:', error)
    }
    
    // Load configuration if env file exists
    loadConfiguration()
  }

  const loadConfiguration = async () => {
    try {
      const response = await fetch('/api/wizard/init')
      if (response.ok) {
        const data = await response.json()
        if (data.config) {
          if (data.config.frontendApps) {
            setFrontendApps(data.config.frontendApps)
          }
          if (data.config.environment || data.config.ENV) {
            setEnvironment(data.config.environment || data.config.ENV)
          }
          if (data.config.domain || data.config.BASE_DOMAIN) {
            setBaseDomain(data.config.domain || data.config.BASE_DOMAIN)
          }
        }
      }
    } catch (error) {
      console.error('Failed to load configuration:', error)
    } finally {
      setDataLoaded(true)
    }
  }

  // Auto-save whenever frontendApps changes
  useEffect(() => {
    // Skip if data hasn't been loaded yet
    if (!dataLoaded) return
    
    // Skip initial empty state
    const isInitialLoad = frontendApps.length === 0
    if (isInitialLoad) return
    
    const saveApps = async () => {
      setAutoSaving(true)
      try {
        await fetch('/api/wizard/update-frontend-app', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ frontendApps, environment })
        })
      } catch (error) {
        console.error('Error auto-saving frontend apps:', error)
      } finally {
        setAutoSaving(false)
      }
    }
    
    // Debounce the save
    const timer = setTimeout(saveApps, 500)
    return () => clearTimeout(timer)
  }, [frontendApps, environment, dataLoaded])

  const addApp = () => {
    const nextPort = frontendApps.length > 0 
      ? Math.max(...frontendApps.map(a => a.localPort)) + 1 
      : 3001
    
    const appNum = frontendApps.length + 1
    const displayName = `App ${appNum}`
    const systemName = `app_${appNum}`
    const tablePrefix = `app${appNum}`
    const devUrl = `app${appNum}`
    const remoteSchemaUrl = `api.app${appNum}`
    
    setFrontendApps([
      ...frontendApps,
      {
        displayName,
        systemName,
        tablePrefix,
        localPort: nextPort,  // Always include port for routing
        productionUrl: devUrl,  // This will be the subdomain in dev, full domain in prod
        remoteSchemaName: `${tablePrefix}_schema`,
        remoteSchemaUrl
      }
    ])
    
    // Automatically focus on the new app's title to show it's editable
    setTimeout(() => {
      setEditingTitle(frontendApps.length)
    }, 50)
  }

  const removeApp = (index: number) => {
    setFrontendApps(frontendApps.filter((_, i) => i !== index))
  }

  const updateApp = (index: number, field: keyof FrontendApp, value: any) => {
    const updated = [...frontendApps]
    if (field === 'systemName' && typeof value === 'string') {
      // Sanitize system name - lowercase, alphanumeric and underscore only, no spaces
      value = value.toLowerCase().replace(/[^a-z0-9_]/g, '')
    }
    if (field === 'tablePrefix' && typeof value === 'string') {
      // Sanitize table prefix - lowercase, alphanumeric and underscore only
      value = value.toLowerCase().replace(/[^a-z0-9_]/g, '')
    }
    if (field === 'localSubdomain' && typeof value === 'string') {
      // Sanitize subdomain - lowercase, alphanumeric and dash only
      value = value.toLowerCase().replace(/[^a-z0-9-]/g, '')
    }
    updated[index] = { ...updated[index], [field]: value }
    setFrontendApps(updated)
  }

  const handleNext = async () => {
    setLoading(true)
    try {
      // Ensure final save before moving on
      await fetch('/api/wizard/update-frontend-app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frontendApps, environment })
      })
      
      // Don't set loading to false - let the page transition handle it
      router.push('/init/6')
    } catch (error) {
      console.error('Error saving configuration:', error)
      // Only set loading false on error
      setLoading(false)
    }
  }

  const handleBack = async () => {
    setLoading(true)
    try {
      // Ensure final save before moving back
      await fetch('/api/wizard/update-frontend-app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frontendApps, environment })
      })
      
      // Don't set loading to false - let the page transition handle it
      router.push('/init/4')
    } catch (error) {
      console.error('Error saving configuration:', error)
      // Only set loading false on error
      setLoading(false)
    }
  }

  // Show loading skeleton while initial data loads
  if (!dataLoaded) {
    return (
      <StepWrapper>
        <div className="space-y-4">
          {/* Info box skeleton */}
          <div className="p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg">
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 w-48 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse mb-2"></div>
                <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse"></div>
                <div className="h-3 w-3/4 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse mt-1"></div>
              </div>
            </div>
          </div>
          
          {/* App card skeletons */}
          {[...Array(2)].map((_, i) => (
            <div key={i} className="p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse"></div>
                  <div className="h-5 w-24 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse"></div>
                </div>
                <div className="w-8 h-8 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse"></div>
              </div>
              
              {/* Input row skeletons */}
              <div className="grid grid-cols-3 gap-3 mb-3">
                {[...Array(3)].map((_, j) => (
                  <div key={j}>
                    <div className="h-3 w-20 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse mb-1"></div>
                    <div className="h-10 bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse"></div>
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {[...Array(2)].map((_, j) => (
                  <div key={j}>
                    <div className="h-3 w-32 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse mb-1"></div>
                    <div className="h-10 bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          {/* Add button skeleton */}
          <div className="flex justify-start">
            <div className="h-8 w-24 bg-zinc-200 dark:bg-zinc-700 rounded-full animate-pulse"></div>
          </div>
        </div>
      </StepWrapper>
    )
  }

  return (
    <StepWrapper>
      {/* Info Box */}
      <div className="mb-6 p-4 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-900/20">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div className="text-sm text-blue-900 dark:text-blue-200 flex-1">
            <div className="flex items-center justify-between mb-1">
              <p className="font-medium">Frontend Apps Configuration</p>
              {autoSaving && (
                <span className="text-xs text-blue-600 dark:text-blue-400">
                  Auto-saving...
                </span>
              )}
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-400">
              Configure external frontend applications that will consume your nself backend. 
              Each app gets its own table namespace, nginx routing, and optional Hasura remote schema.
              Changes are saved automatically.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {frontendApps.map((app, index) => (
          <div
            key={index}
            className="p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-800/50"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Globe className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                {editingTitle === index ? (
                  <input
                    type="text"
                    value={app.displayName}
                    onChange={(e) => {
                      updateApp(index, 'displayName', e.target.value)
                      // Auto-generate system name from display name if it hasn't been manually edited
                      const autoSystemName = e.target.value.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
                      if (app.systemName === app.displayName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')) {
                        updateApp(index, 'systemName', autoSystemName)
                      }
                    }}
                    onBlur={() => setEditingTitle(null)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setEditingTitle(null)
                      }
                    }}
                    className="font-medium bg-transparent border-b border-zinc-400 dark:border-zinc-600 focus:outline-none focus:border-blue-500 text-zinc-900 dark:text-white"
                    autoFocus
                  />
                ) : (
                  <h3 
                    className="font-medium text-zinc-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                    onClick={() => setEditingTitle(index)}
                  >
                    {app.displayName}
                  </h3>
                )}
              </div>
              <button
                onClick={() => removeApp(index)}
                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            
            {/* Row 1: System Name, Table Prefix, Local Port */}
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  System Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={app.systemName || ''}
                  onChange={(e) => updateApp(index, 'systemName', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
                  placeholder="todo_tracker"
                />
                <p className="text-xs text-zinc-500 dark:text-zinc-600 mt-1">
                  No spaces, lowercase only
                </p>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Table Prefix <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={app.tablePrefix}
                  onChange={(e) => updateApp(index, 'tablePrefix', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
                  placeholder="app"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Local Port <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={app.localPort}
                  onChange={(e) => {
                    const port = parseInt(e.target.value)
                    if (!isNaN(port) && port >= 3000 && port <= 9999) {
                      updateApp(index, 'localPort', port)
                    }
                  }}
                  className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
                  placeholder="3001"
                  min="3000"
                  max="9999"
                  required
                />
              </div>
            </div>

            {/* Row 2: Dev URL and Remote Schema URL */}
            <div className="grid grid-cols-2 gap-3">
              {/* Dev/Production URL (for nginx routing) */}
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  <ExternalLink className="inline h-3 w-3 mr-1" />
                  {environment === 'development' || environment === 'dev' ? 'Dev' : 'Production'} URL
                </label>
                <UrlInput
                  value={app.productionUrl || ''}
                  onChange={(value) => updateApp(index, 'productionUrl', value)}
                  onError={(error) => updateApp(index, 'productionUrlError', error)}
                  environment={environment}
                  baseDomain={baseDomain}
                  placeholder={`app${index + 1}`}
                  required={false}
                />
                {app.localPort && app.productionUrl && (environment === 'development' || environment === 'dev') && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-600 mt-1">
                    Routes localhost:{app.localPort} → {app.productionUrl}.{baseDomain}
                  </p>
                )}
              </div>
              
              {/* Remote Schema URL (for Hasura) */}
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  <Database className="inline h-3 w-3 mr-1" />
                  Custom GraphQL Endpoint <span className="text-zinc-500 dark:text-zinc-600 font-normal">(Hasura Remote Schema)</span>
                </label>
                <UrlInput
                  value={app.remoteSchemaUrl || ''}
                  onChange={(value) => updateApp(index, 'remoteSchemaUrl', value)}
                  onError={(error) => updateApp(index, 'remoteSchemaUrlError', error)}
                  environment={environment}
                  baseDomain={baseDomain}
                  placeholder="api"
                  required={false}
                />
                {app.remoteSchemaUrl && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-600 mt-1">
                    Hasura remote schema: {app.tablePrefix || 'app'}_schema
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {frontendApps.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg">
            <Globe className="h-12 w-12 text-zinc-400 mx-auto mb-3" />
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              No frontend apps configured yet
            </p>
            <button
              onClick={addApp}
              className="inline-flex items-center gap-0.5 justify-center overflow-hidden text-sm font-medium transition rounded-full bg-blue-600 py-1 px-3 text-white hover:bg-blue-700 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-1 dark:ring-inset dark:ring-blue-400/20 dark:hover:bg-blue-400/10 dark:hover:text-blue-300 dark:hover:ring-blue-300"
            >
              <Plus className="h-4 w-4" />
              <span>Add Your First App</span>
            </button>
          </div>
        )}
      </div>

      {frontendApps.length > 0 && (
        <button
          onClick={addApp}
          className="inline-flex items-center gap-0.5 justify-center overflow-hidden text-sm font-medium transition rounded-full bg-zinc-900 py-1 px-3 text-white hover:bg-zinc-700 dark:bg-zinc-500/10 dark:text-zinc-400 dark:ring-1 dark:ring-inset dark:ring-zinc-400/20 dark:hover:bg-zinc-400/10 dark:hover:text-zinc-300 dark:hover:ring-zinc-300"
        >
          <Plus className="h-4 w-4" />
          <span>Add App</span>
        </button>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-0.5 justify-center overflow-hidden text-sm font-medium transition rounded-full bg-zinc-900 py-1 px-3 text-white hover:bg-zinc-700 dark:bg-zinc-500/10 dark:text-zinc-400 dark:ring-1 dark:ring-inset dark:ring-zinc-400/20 dark:hover:bg-zinc-400/10 dark:hover:text-zinc-300 dark:hover:ring-zinc-300"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>
        <button
          onClick={handleNext}
          disabled={loading}
          className="inline-flex items-center gap-0.5 justify-center overflow-hidden text-sm font-medium transition rounded-full bg-blue-600 py-1 px-3 text-white hover:bg-blue-700 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-1 dark:ring-inset dark:ring-blue-400/20 dark:hover:bg-blue-400/10 dark:hover:text-blue-300 dark:hover:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:cursor-pointer disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <span>Saving</span>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white dark:border-blue-400"></div>
            </>
          ) : (
            <>
              <span>Next</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </StepWrapper>
  )
}