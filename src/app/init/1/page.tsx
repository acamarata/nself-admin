'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, AlertCircle, Eye, EyeOff, ChevronDown } from 'lucide-react'
import { StepWrapper } from '../StepWrapper'
import { useAutoSave } from '@/hooks/useAutoSave'
import { BackupConfiguration } from '@/components/BackupConfiguration'

export default function InitStep1() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [config, setConfig] = useState<any>({
    projectName: 'nproject',
    environment: 'development',  // nself uses 'development' not 'dev'
    domain: 'local.nself.org',  // nself default domain
    databaseName: 'nself',  // nself default db name  
    databasePassword: 'nself-dev-password',
    adminEmail: '',
    backup: {
      enabled: false,
      types: {
        database: true,
        images: false,
        configs: false
      },
      schedule: {
        frequency: 'daily' as 'daily' | 'weekly' | 'monthly' | 'custom',
        time: '02:00',
        dayOfWeek: undefined,
        dayOfMonth: undefined,
        customCron: undefined
      },
      retention: 7,
      compression: true,
      encryption: false
    }
  })
  const [errors, setErrors] = useState<any>({})
  const [touched, setTouched] = useState<any>({})
  const [hasLoaded, setHasLoaded] = useState(false)

  // Auto-save configuration
  const saveConfig = useCallback(async () => {
    try {
      // Convert backup structure to flat env vars for API
      const configToSave = {
        ...config,
        backupEnabled: config.backup?.enabled || false,
        backupSchedule: config.backup?.schedule?.customCron || 
          (config.backup?.schedule?.frequency === 'daily' ? `0 ${config.backup.schedule.time.split(':')[1]} ${config.backup.schedule.time.split(':')[0]} * * *` :
          config.backup?.schedule?.frequency === 'weekly' ? `0 ${config.backup.schedule.time.split(':')[1]} ${config.backup.schedule.time.split(':')[0]} * * ${config.backup.schedule.dayOfWeek || 0}` :
          config.backup?.schedule?.frequency === 'monthly' ? `0 ${config.backup.schedule.time.split(':')[1]} ${config.backup.schedule.time.split(':')[0]} ${config.backup.schedule.dayOfMonth || 1} * *` :
          '0 2 * * *')
      }
      
      const response = await fetch('/api/wizard/update-env', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: configToSave, step: 'initial' })
      })
      
      if (!response.ok) {
        throw new Error(`Save failed: ${response.status} ${response.statusText}`)
      }
      
      console.log('Auto-saved configuration successfully')
    } catch (error) {
      console.error('Failed to auto-save configuration:', error)
    }
  }, [config])

  // Use auto-save hook (only after initial load)
  const { saveNow } = useAutoSave(config, {
    onSave: saveConfig,
    enabled: hasLoaded,
    delay: 1000  // Save after 1 second of inactivity
  })

  // Load configuration from .env.local on mount
  useEffect(() => {
    checkAndLoadConfiguration()
  }, [])

  const checkAndLoadConfiguration = async () => {
    // First check if env file exists
    try {
      const statusRes = await fetch('/api/project/status')
      if (statusRes.ok) {
        const statusData = await statusRes.json()
        if (!statusData.hasEnvFile) {
          // No env file - try to initialize first
          console.log('No env file found, attempting to initialize...')
          const initRes = await fetch('/api/nself/init', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectName: 'nproject' })
          })
          
          if (!initRes.ok) {
            console.error('Failed to initialize project')
          }
        }
      }
    } catch (error) {
      console.error('Error checking project status:', error)
    }
    
    // Load configuration regardless (will use defaults if no env file)
    loadConfiguration()
  }

  const loadConfiguration = async () => {
    try {
      const response = await fetch('/api/wizard/init')
      if (response.ok) {
        const data = await response.json()
        if (data.config) {
          setConfig({
            projectName: data.config.projectName || 'nproject',
            environment: data.config.environment || 'dev',
            domain: data.config.domain || 'localhost',
            databaseName: data.config.databaseName || 'my_database',
            databasePassword: data.config.databasePassword || 'postgres_dev_password',
            adminEmail: data.config.adminEmail || '',
            backup: data.config.backup || {
              enabled: data.config.backupEnabled || data.config.BACKUP_ENABLED === 'true' || data.config.DB_BACKUP_ENABLED === 'true' || false,
              types: {
                database: true,
                images: false,
                configs: false
              },
              schedule: {
                frequency: 'daily',
                time: '02:00',
                dayOfWeek: undefined,
                dayOfMonth: undefined,
                customCron: data.config.backupSchedule || data.config.BACKUP_SCHEDULE || data.config.DB_BACKUP_SCHEDULE || '0 2 * * *'
              },
              retention: parseInt(data.config.BACKUP_RETENTION_DAYS || data.config.DB_BACKUP_RETENTION_DAYS || '7'),
              compression: true,
              encryption: false
            }
          })
          setHasLoaded(true)  // Enable auto-save after loading
        }
      }
    } catch (error) {
      console.error('Failed to load configuration:', error)
      setHasLoaded(true)  // Enable auto-save even on error
    }
  }

  const validateField = (field: string, value: any, currentEnv?: string) => {
    let error = ''
    const env = currentEnv || config.environment
    
    switch(field) {
      case 'projectName':
        if (!value || value.length < 3) {
          error = 'Must be at least 3 characters'
        }
        break
      case 'databaseName':
        if (!value || value.length < 3) {
          error = 'Must be at least 3 characters'
        } else if (!/^[a-z][a-z0-9_]*$/.test(value)) {
          error = 'Must start with letter, use only lowercase, numbers, underscore'
        }
        break
      case 'databasePassword':
        if (!value || value.length < 8) {
          error = 'Must be at least 8 characters'
        }
        break
      case 'domain':
        if (!value) {
          error = 'Base domain is required'
        } else if (env === 'development' || env === 'dev') {  // Support both for compatibility
          if (!value.includes('localhost') && !value.includes('local.nself.org')) {
            error = 'Development requires localhost or local.nself.org'
          }
        }
        break
      case 'adminEmail':
        // Only validate if there's enough content to be meaningful
        if (value && value.length >= 3 && !value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
          error = 'Invalid email format'
        }
        break
    }
    
    return error
  }

  const validateStep = () => {
    const newErrors: any = {}
    const allTouched: any = {}
    
    // Validate all required fields
    const fieldsToValidate = ['projectName', 'databaseName', 'databasePassword', 'domain']
    fieldsToValidate.forEach(field => {
      const error = validateField(field, (config as any)[field])
      if (error) {
        newErrors[field] = error
      }
      allTouched[field] = true
    })

    // Validate optional email if provided
    if (config.adminEmail) {
      const emailError = validateField('adminEmail', config.adminEmail)
      if (emailError) {
        newErrors.adminEmail = emailError
      }
    }
    
    setErrors(newErrors)
    setTouched(allTouched)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = async () => {
    if (!validateStep()) return
    
    setLoading(true)
    try {
      // Save immediately before navigating
      await saveNow()
      router.push('/init/2')
    } catch (error) {
      console.error('Error saving configuration:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <StepWrapper>
      <div className="grid grid-cols-2 gap-6">
        <div className="relative">
          <input
            type="text"
            id="projectName"
            value={config.projectName}
            onChange={(e) => {
              const value = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '')
              setConfig({ ...config, projectName: value })
              setTouched({ ...touched, projectName: true })
              const error = validateField('projectName', value)
              setErrors({ ...errors, projectName: error })
            }}
            onBlur={() => setTouched({ ...touched, projectName: true })}
            className={`peer w-full px-3 pt-5 pb-2 text-sm border rounded-lg bg-transparent text-zinc-900 dark:text-white transition-all ${
              touched.projectName && errors.projectName 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-zinc-300 dark:border-zinc-600 focus:ring-blue-500'
            } focus:outline-none focus:ring-2 focus:ring-opacity-20`}
            placeholder=" "
          />
          <label 
            htmlFor="projectName"
            className={`absolute left-2 -top-3 px-1 text-xs font-medium bg-white/90 dark:bg-zinc-900/90 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-zinc-400 peer-focus:-top-3 peer-focus:text-xs ${
              touched.projectName && errors.projectName
                ? 'text-red-600 dark:text-red-400 peer-focus:text-red-600 dark:peer-focus:text-red-400'
                : 'text-zinc-600 dark:text-zinc-400 peer-focus:text-blue-600 dark:peer-focus:text-blue-400'
            }`}
          >
            Project Name
          </label>
          <div className="h-5">
            {touched.projectName && errors.projectName && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.projectName}</p>
            )}
          </div>
        </div>

        <div className="relative">
          <select
            id="environment"
            value={config.environment}
            onChange={(e) => {
              const newEnv = e.target.value
              let newDomain = config.domain
              
              // Update domain when switching environments
              if (newEnv === 'development') {
                // Switching to development - use local.nself.org if current domain isn't valid for dev
                if (config.domain !== 'localhost' && config.domain !== 'local.nself.org') {
                  newDomain = 'local.nself.org'  // Use nself default domain
                }
              } else if (config.environment === 'development') {
                // Switching from development to staging/prod - set a placeholder domain
                newDomain = ''
              }
              
              setConfig({ ...config, environment: newEnv, domain: newDomain })
              
              // Revalidate domain when environment changes
              if (touched.domain) {
                const domainError = validateField('domain', newDomain, newEnv)
                setErrors({ ...errors, domain: domainError })
              }
            }}
            className="peer w-full px-3 pt-5 pb-2 pr-10 text-sm border border-zinc-300 dark:border-zinc-600 rounded-lg bg-transparent text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 focus:border-blue-500 appearance-none transition-all"
          >
            <option value="development">Development</option>
            <option value="staging">Staging</option>
            <option value="production">Production</option>
          </select>
          <ChevronDown className="absolute right-3 top-[50%] -translate-y-[50%] h-4 w-4 text-zinc-400 pointer-events-none" />
          <label 
            htmlFor="environment"
            className="absolute left-2 -top-3 px-1 text-xs font-medium text-zinc-600 dark:text-zinc-400 bg-white/90 dark:bg-zinc-900/90 peer-focus:text-blue-600 dark:peer-focus:text-blue-400 transition-all"
          >
            Environment
          </label>
        </div>

        <div className="relative">
          <input
            type="text"
            id="databaseName"
            value={config.databaseName}
            onChange={(e) => {
              const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')
              setConfig({ ...config, databaseName: value })
              setTouched({ ...touched, databaseName: true })
              const error = validateField('databaseName', value)
              setErrors({ ...errors, databaseName: error })
            }}
            onBlur={() => setTouched({ ...touched, databaseName: true })}
            className={`peer w-full px-3 pt-5 pb-2 text-sm border rounded-lg bg-transparent text-zinc-900 dark:text-white transition-all ${
              touched.databaseName && errors.databaseName 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-zinc-300 dark:border-zinc-600 focus:ring-blue-500'
            } focus:outline-none focus:ring-2 focus:ring-opacity-20`}
            placeholder=" "
          />
          <label 
            htmlFor="databaseName"
            className={`absolute left-2 -top-3 px-1 text-xs font-medium bg-white/90 dark:bg-zinc-900/90 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-zinc-400 peer-focus:-top-3 peer-focus:text-xs ${
              touched.databaseName && errors.databaseName
                ? 'text-red-600 dark:text-red-400 peer-focus:text-red-600 dark:peer-focus:text-red-400'
                : 'text-zinc-600 dark:text-zinc-400 peer-focus:text-blue-600 dark:peer-focus:text-blue-400'
            }`}
          >
            Database Name
          </label>
          <div className="h-5">
            {touched.databaseName && errors.databaseName && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.databaseName}</p>
            )}
          </div>
        </div>

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            id="databasePassword"
            value={config.databasePassword}
            onChange={(e) => {
              setConfig({ ...config, databasePassword: e.target.value })
              setTouched({ ...touched, databasePassword: true })
              const error = validateField('databasePassword', e.target.value)
              setErrors({ ...errors, databasePassword: error })
            }}
            onBlur={() => setTouched({ ...touched, databasePassword: true })}
            className={`peer w-full px-3 pt-5 pb-2 pr-10 text-sm border rounded-lg bg-transparent text-zinc-900 dark:text-white transition-all ${
              touched.databasePassword && errors.databasePassword 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-zinc-300 dark:border-zinc-600 focus:ring-blue-500'
            } focus:outline-none focus:ring-2 focus:ring-opacity-20`}
            placeholder=" "
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[50%] -translate-y-[50%] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
          <label 
            htmlFor="databasePassword"
            className={`absolute left-2 -top-3 px-1 text-xs font-medium bg-white/90 dark:bg-zinc-900/90 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-zinc-400 peer-focus:-top-3 peer-focus:text-xs ${
              touched.databasePassword && errors.databasePassword
                ? 'text-red-600 dark:text-red-400 peer-focus:text-red-600 dark:peer-focus:text-red-400'
                : 'text-zinc-600 dark:text-zinc-400 peer-focus:text-blue-600 dark:peer-focus:text-blue-400'
            }`}
          >
            Database Password
          </label>
          <div className="h-5">
            {touched.databasePassword && errors.databasePassword && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.databasePassword}</p>
            )}
          </div>
        </div>

        <div className="relative">
          {(config.environment === 'development' || config.environment === 'dev') ? (
            <>
              <select
                id="domain"
                value={config.domain}
                onChange={(e) => {
                  const value = e.target.value
                  setConfig({ ...config, domain: value })
                  setTouched({ ...touched, domain: true })
                  const error = validateField('domain', value)
                  setErrors({ ...errors, domain: error })
                }}
                onBlur={() => setTouched({ ...touched, domain: true })}
                className={`peer w-full px-3 pt-5 pb-2 pr-10 text-sm border rounded-lg bg-transparent text-zinc-900 dark:text-white transition-all ${
                  touched.domain && errors.domain 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-zinc-300 dark:border-zinc-600 focus:ring-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-opacity-20 appearance-none`}
              >
                <option value="localhost">localhost</option>
                <option value="local.nself.org">local.nself.org</option>
              </select>
              <ChevronDown className="absolute right-3 top-[50%] -translate-y-[50%] h-4 w-4 text-zinc-400 pointer-events-none" />
            </>
          ) : (
            <input
              type="text"
              id="domain"
              value={config.domain}
              onChange={(e) => {
                const value = e.target.value.toLowerCase()
                setConfig({ ...config, domain: value })
                setTouched({ ...touched, domain: true })
                const error = validateField('domain', value)
                setErrors({ ...errors, domain: error })
              }}
              onBlur={() => setTouched({ ...touched, domain: true })}
              className={`peer w-full px-3 pt-5 pb-2 pr-32 text-sm border rounded-lg bg-transparent text-zinc-900 dark:text-white transition-all ${
                touched.domain && errors.domain 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-zinc-300 dark:border-zinc-600 focus:ring-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-opacity-20`}
              placeholder="mydomain.com"
            />
          )}
          <label 
            htmlFor="domain"
            className={`absolute left-2 -top-3 px-1 text-xs font-medium bg-white/90 dark:bg-zinc-900/90 transition-all ${(config.environment !== 'development' && config.environment !== 'dev') ? 'peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-zinc-400 peer-focus:-top-3 peer-focus:text-xs' : ''} ${
              touched.domain && errors.domain
                ? 'text-red-600 dark:text-red-400 peer-focus:text-red-600 dark:peer-focus:text-red-400'
                : 'text-zinc-600 dark:text-zinc-400 peer-focus:text-blue-600 dark:peer-focus:text-blue-400'
            }`}
          >
            Base Domain
          </label>
          {config.domain && !errors.domain && (
            <span className={`absolute top-[50%] -translate-y-[50%] text-xs text-zinc-500 dark:text-zinc-600 pointer-events-none ${
              (config.environment === 'development' || config.environment === 'dev') ? 'right-14' : 'right-2'
            }`}>
              (i.e., admin.{config.domain})
            </span>
          )}
          <div className="h-5">
            {touched.domain && errors.domain && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.domain}</p>
            )}
          </div>
        </div>

        <div className="relative">
          <input
            type="email"
            id="adminEmail"
            value={config.adminEmail}
            onChange={(e) => {
              setConfig({ ...config, adminEmail: e.target.value })
              // Only validate on blur or if already touched and has enough characters
              if (touched.adminEmail && e.target.value.length >= 3) {
                const error = validateField('adminEmail', e.target.value)
                setErrors({ ...errors, adminEmail: error })
              } else if (!e.target.value) {
                // Clear error if field is empty (optional field)
                setErrors({ ...errors, adminEmail: '' })
              }
            }}
            onBlur={() => {
              if (config.adminEmail) {
                setTouched({ ...touched, adminEmail: true })
                const error = validateField('adminEmail', config.adminEmail)
                setErrors({ ...errors, adminEmail: error })
              }
            }}
            className={`peer w-full px-3 pt-5 pb-2 pr-20 text-sm border rounded-lg bg-transparent text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-600 transition-all ${
              touched.adminEmail && errors.adminEmail 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-zinc-300 dark:border-zinc-600 focus:ring-blue-500'
            } focus:outline-none focus:ring-2 focus:ring-opacity-20`}
            placeholder="admin@nself.org"
          />
          <label 
            htmlFor="adminEmail"
            className={`absolute left-2 -top-3 px-1 text-xs font-medium bg-white/90 dark:bg-zinc-900/90 transition-all ${
              touched.adminEmail && errors.adminEmail
                ? 'text-red-600 dark:text-red-400 peer-focus:text-red-600 dark:peer-focus:text-red-400'
                : 'text-zinc-600 dark:text-zinc-400 peer-focus:text-blue-600 dark:peer-focus:text-blue-400'
            }`}
          >
            Admin Email
          </label>
          <span className="absolute right-3 top-[50%] -translate-y-[50%] text-xs text-zinc-500 dark:text-zinc-600 pointer-events-none">
            Optional
          </span>
          <div className="h-5">
            {touched.adminEmail && errors.adminEmail && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.adminEmail}</p>
            )}
          </div>
        </div>
      </div>

      {/* Backup Configuration */}
      <div className="pt-2">
        <BackupConfiguration
          value={config.backup}
          onChange={(backup) => setConfig({ ...config, backup })}
        />
      </div>

      {/* Navigation */}
      <div className="flex justify-end pt-4">
        <button
          onClick={handleNext}
          disabled={loading}
          className="inline-flex items-center gap-0.5 justify-center overflow-hidden text-sm font-medium transition rounded-full bg-blue-600 py-1 px-3 text-white hover:bg-blue-700 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-1 dark:ring-inset dark:ring-blue-400/20 dark:hover:bg-blue-400/10 dark:hover:text-blue-300 dark:hover:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>{loading ? 'Saving...' : 'Next'}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </StepWrapper>
  )
}