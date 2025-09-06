'use client'

import { useState } from 'react'
import { Database, Image, FileText, Clock, Calendar, Shield, HardDrive } from 'lucide-react'

interface BackupConfig {
  enabled: boolean
  types: {
    database: boolean
    images: boolean
    configs: boolean
  }
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'custom'
    time: string
    dayOfWeek?: number
    dayOfMonth?: number
    customCron?: string
  }
  retention: number
  compression: boolean
  encryption: boolean
}

interface BackupConfigurationProps {
  value: BackupConfig
  onChange: (config: BackupConfig) => void
}

export function BackupConfiguration({ value, onChange }: BackupConfigurationProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const updateConfig = (updates: Partial<BackupConfig>) => {
    onChange({ ...value, ...updates })
  }

  const updateSchedule = (scheduleUpdates: Partial<BackupConfig['schedule']>) => {
    onChange({
      ...value,
      schedule: { ...value.schedule, ...scheduleUpdates }
    })
  }

  const updateTypes = (typeUpdates: Partial<BackupConfig['types']>) => {
    onChange({
      ...value,
      types: { ...value.types, ...typeUpdates }
    })
  }

  // Generate cron expression from schedule
  const getCronExpression = () => {
    const { frequency, time, dayOfWeek, dayOfMonth, customCron } = value.schedule
    
    if (frequency === 'custom' && customCron) {
      return customCron
    }

    const [hour, minute] = time.split(':')
    
    switch (frequency) {
      case 'daily':
        return `${minute} ${hour} * * *`
      case 'weekly':
        return `${minute} ${hour} * * ${dayOfWeek || 0}`
      case 'monthly':
        return `${minute} ${hour} ${dayOfMonth || 1} * *`
      default:
        return '0 2 * * *'
    }
  }

  return (
    <div className="space-y-4">
      {/* Main Enable/Disable Card - Clickable like Optional Services */}
      <div className={`
        relative block overflow-hidden rounded-lg border-2 transition-all duration-300
        ${value.enabled 
          ? 'border-zinc-500 dark:border-zinc-600 bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800 shadow-lg' 
          : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900/20 hover:border-zinc-300 dark:hover:border-zinc-600'
        }
      `}>
        <label className="block p-3 cursor-pointer">
          <input
            type="checkbox"
            checked={value.enabled}
            onChange={(e) => updateConfig({ enabled: e.target.checked })}
            className="sr-only"
          />
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className={`
                mt-0.5 p-1.5 rounded-lg transition-all duration-300
                ${value.enabled 
                  ? 'bg-gradient-to-br from-zinc-600 to-zinc-700 dark:from-zinc-700 dark:to-zinc-800 shadow-md' 
                  : 'bg-zinc-100 dark:bg-zinc-800'
                }
              `}>
                <Shield className={`h-4 w-4 transition-colors ${
                  value.enabled ? 'text-white' : 'text-zinc-400 dark:text-zinc-500'
                }`} />
              </div>
              <div>
                <h3 className="text-sm font-medium text-zinc-900 dark:text-white">
                  Automated Backups
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                  Protect your data with scheduled backups
                </p>
              </div>
            </div>
            <div className={`
              w-5 h-5 rounded-full flex items-center justify-center transition-all
              ${value.enabled 
                ? 'bg-zinc-600 dark:bg-zinc-700' 
                : 'border-2 border-zinc-300 dark:border-zinc-600'
              }
            `}>
              {value.enabled && (
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </div>
        </label>

        {/* Expanded Configuration */}
        {value.enabled && (
          <div className="border-t border-zinc-200 dark:border-zinc-700 p-3 space-y-3">
            {/* Backup Types */}
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                What to Backup
              </label>
              <div className="grid grid-cols-3 gap-2">
                <label className={`
                  relative flex items-center p-2 rounded-lg border cursor-pointer transition-all
                  ${value.types.database 
                    ? 'border-zinc-400 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-800' 
                    : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                  }
                `}>
                  <input
                    type="checkbox"
                    checked={value.types.database}
                    onChange={(e) => updateTypes({ database: e.target.checked })}
                    className="sr-only"
                  />
                  <Database className={`h-3 w-3 mr-1.5 ${
                    value.types.database ? 'text-zinc-700 dark:text-zinc-300' : 'text-zinc-400 dark:text-zinc-500'
                  }`} />
                  <span className={`text-xs ${
                    value.types.database ? 'text-zinc-900 dark:text-white' : 'text-zinc-600 dark:text-zinc-400'
                  }`}>
                    Database
                  </span>
                </label>

                <label className={`
                  relative flex items-center p-2 rounded-lg border cursor-pointer transition-all
                  ${value.types.images 
                    ? 'border-zinc-400 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-800' 
                    : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                  }
                `}>
                  <input
                    type="checkbox"
                    checked={value.types.images}
                    onChange={(e) => updateTypes({ images: e.target.checked })}
                    className="sr-only"
                  />
                  <Image className={`h-3 w-3 mr-1.5 ${
                    value.types.images ? 'text-zinc-700 dark:text-zinc-300' : 'text-zinc-400 dark:text-zinc-500'
                  }`} />
                  <span className={`text-xs ${
                    value.types.images ? 'text-zinc-900 dark:text-white' : 'text-zinc-600 dark:text-zinc-400'
                  }`}>
                    Images
                  </span>
                </label>

                <label className={`
                  relative flex items-center p-2 rounded-lg border cursor-pointer transition-all
                  ${value.types.configs 
                    ? 'border-zinc-400 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-800' 
                    : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                  }
                `}>
                  <input
                    type="checkbox"
                    checked={value.types.configs}
                    onChange={(e) => updateTypes({ configs: e.target.checked })}
                    className="sr-only"
                  />
                  <FileText className={`h-3 w-3 mr-1.5 ${
                    value.types.configs ? 'text-zinc-700 dark:text-zinc-300' : 'text-zinc-400 dark:text-zinc-500'
                  }`} />
                  <span className={`text-xs ${
                    value.types.configs ? 'text-zinc-900 dark:text-white' : 'text-zinc-600 dark:text-zinc-400'
                  }`}>
                    Config Files
                  </span>
                </label>
              </div>
            </div>

            {/* Schedule */}
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Backup Schedule
              </label>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <select
                      value={value.schedule.frequency}
                      onChange={(e) => updateSchedule({ 
                        frequency: e.target.value as BackupConfig['schedule']['frequency'] 
                      })}
                      className="w-full px-2 py-1.5 text-xs border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-opacity-20"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="custom">Custom (Cron)</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3 text-zinc-400" />
                    <input
                      type="time"
                      value={value.schedule.time}
                      onChange={(e) => updateSchedule({ time: e.target.value })}
                      className="flex-1 px-2 py-1.5 text-xs border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-opacity-20"
                    />
                  </div>
                </div>

                {value.schedule.frequency === 'weekly' && (
                  <select
                    value={value.schedule.dayOfWeek || 0}
                    onChange={(e) => updateSchedule({ dayOfWeek: parseInt(e.target.value) })}
                    className="w-full px-2 py-1.5 text-xs border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-opacity-20"
                  >
                    <option value="0">Sunday</option>
                    <option value="1">Monday</option>
                    <option value="2">Tuesday</option>
                    <option value="3">Wednesday</option>
                    <option value="4">Thursday</option>
                    <option value="5">Friday</option>
                    <option value="6">Saturday</option>
                  </select>
                )}

                {value.schedule.frequency === 'monthly' && (
                  <input
                    type="number"
                    min="1"
                    max="28"
                    value={value.schedule.dayOfMonth || 1}
                    onChange={(e) => updateSchedule({ dayOfMonth: parseInt(e.target.value) })}
                    className="w-full px-2 py-1.5 text-xs border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-opacity-20"
                    placeholder="Day of month (1-28)"
                  />
                )}

                {value.schedule.frequency === 'custom' && (
                  <input
                    type="text"
                    value={value.schedule.customCron || ''}
                    onChange={(e) => updateSchedule({ customCron: e.target.value })}
                    className="w-full px-2 py-1.5 text-xs border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-opacity-20"
                    placeholder="0 2 * * * (Cron expression)"
                  />
                )}

                <div className="p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    Cron: <code className="ml-1 text-zinc-900 dark:text-white font-mono text-xs">{getCronExpression()}</code>
                  </p>
                </div>
              </div>
            </div>

            {/* Advanced Options */}
            <div>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setShowAdvanced(!showAdvanced)
                }}
                className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              >
                {showAdvanced ? '− Hide' : '+ Show'} Advanced Options
              </button>
              
              {showAdvanced && (
                <div className="mt-2 space-y-2">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Retention (days)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="365"
                      value={value.retention}
                      onChange={(e) => updateConfig({ retention: parseInt(e.target.value) || 7 })}
                      className="w-full px-2 py-1.5 text-xs border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-opacity-20"
                    />
                  </div>

                  <div className="flex items-center space-x-3">
                    <label className="flex items-center space-x-1.5">
                      <input
                        type="checkbox"
                        checked={value.compression}
                        onChange={(e) => updateConfig({ compression: e.target.checked })}
                        className="w-3.5 h-3.5 text-zinc-600 bg-gray-100 border-gray-300 rounded focus:ring-zinc-500 dark:focus:ring-zinc-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <span className="text-xs text-zinc-700 dark:text-zinc-300">
                        <HardDrive className="inline h-3 w-3 mr-0.5" />
                        Compression
                      </span>
                    </label>

                    <label className="flex items-center space-x-1.5">
                      <input
                        type="checkbox"
                        checked={value.encryption}
                        onChange={(e) => updateConfig({ encryption: e.target.checked })}
                        className="w-3.5 h-3.5 text-zinc-600 bg-gray-100 border-gray-300 rounded focus:ring-zinc-500 dark:focus:ring-zinc-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <span className="text-xs text-zinc-700 dark:text-zinc-300">
                        <Shield className="inline h-3 w-3 mr-0.5" />
                        Encryption
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}