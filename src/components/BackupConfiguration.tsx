'use client'

import { useState } from 'react'
import { Database, Image, FileText, Clock, Calendar, Shield, HardDrive, Wrench } from 'lucide-react'

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
  const [showModal, setShowModal] = useState(false)

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

  const toggleBackup = () => {
    updateConfig({ enabled: !value.enabled })
  }

  const enableBackup = () => {
    if (!value.enabled) {
      updateConfig({ enabled: true })
    }
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

  const getScheduleDescription = () => {
    const { frequency, time, dayOfWeek, dayOfMonth } = value.schedule
    const [hour, minute] = time.split(':')
    const timeStr = `${hour}:${minute}`
    
    switch (frequency) {
      case 'daily':
        return `Daily backups at ${timeStr}`
      case 'weekly':
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        return `Weekly backups on ${days[dayOfWeek || 0]}s at ${timeStr}`
      case 'monthly':
        const suffix = dayOfMonth === 1 ? 'st' : dayOfMonth === 2 ? 'nd' : dayOfMonth === 3 ? 'rd' : 'th'
        return `Monthly backups on the ${dayOfMonth}${suffix} at ${timeStr}`
      case 'custom':
        return `Custom schedule: ${getCronExpression()}`
      default:
        return `Daily backups at ${timeStr}`
    }
  }

  const getBackupTypesDescription = () => {
    const types = []
    if (value.types.database) types.push('database')
    if (value.types.images) types.push('images')
    if (value.types.configs) types.push('configuration files')
    
    if (types.length === 0) return 'No backup types selected'
    if (types.length === 1) return `Backing up ${types[0]}`
    if (types.length === 2) return `Backing up ${types.join(' and ')}`
    return `Backing up ${types.slice(0, -1).join(', ')} and ${types[types.length - 1]}`
  }

  const getOptionsDescription = () => {
    const options = []
    options.push(`${value.retention} day retention`)
    if (value.compression) options.push('compressed')
    if (value.encryption) options.push('encrypted')
    return options.join(', ')
  }

  return (
    <>
      <div className="space-y-4">
        {/* Card matching optional services style */}
        <div 
          className={`relative p-5 border-2 rounded-lg transition-all ${
            value.enabled 
              ? 'border-zinc-500/40 bg-zinc-50/40 dark:bg-zinc-900/10' 
              : 'border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/30 cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-600'
          }`}
          onClick={enableBackup}
        >
          <div className="flex items-start justify-between">
            <div 
              className="flex items-start space-x-4 flex-1"
              onClick={enableBackup}
            >
              <div className={`p-2 rounded-lg border ${
                value.enabled 
                  ? 'bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700' 
                  : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700'
              }`}>
                <Shield className={`h-6 w-6 ${
                  value.enabled 
                    ? 'text-zinc-600 dark:text-zinc-400' 
                    : 'text-zinc-400 dark:text-zinc-500'
                }`} />
              </div>
              <div className="flex-1">
                <h3 className={`font-medium mb-1 ${
                  value.enabled
                    ? 'text-zinc-900 dark:text-zinc-100'
                    : 'text-zinc-700 dark:text-zinc-300'
                }`}>
                  Automated Backups
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                  Schedule regular backups of your project data
                </p>
                {value.enabled && (
                  <div className="text-xs text-zinc-500 dark:text-zinc-500">
                    <p>{getBackupTypesDescription()}. {getScheduleDescription()}. {getOptionsDescription().charAt(0).toUpperCase() + getOptionsDescription().slice(1)}.</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-col items-end space-y-2 ml-4">
              {/* Checkbox */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={value.enabled}
                  onChange={toggleBackup}
                  onClick={(e) => e.stopPropagation()} // Prevent parent click when using checkbox
                  className={`w-5 h-5 rounded border-2 focus:ring-2 ${
                    value.enabled
                      ? 'text-zinc-600 focus:ring-zinc-400'
                      : 'border-zinc-300 dark:border-zinc-600 text-zinc-600 hover:border-zinc-400 dark:hover:border-zinc-500'
                  }`}
                  style={{
                    accentColor: value.enabled ? '#52525b' : undefined
                  }}
                />
              </label>
              
              {/* Configure link (only shown when enabled) */}
              {value.enabled && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation() // Prevent parent click when clicking configure
                    setShowModal(true)
                  }}
                  className="inline-flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                >
                  <Wrench className="h-3 w-3" />
                  <span>Configure</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Configuration Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-zinc-900 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
                Configure Backup Settings
              </h2>

              <div className="space-y-6">
                {/* Backup Types */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                    What to Backup
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <label className={`
                      relative flex items-center p-3 rounded-lg border cursor-pointer transition-all
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
                      <Database className={`h-4 w-4 mr-2 ${
                        value.types.database ? 'text-zinc-700 dark:text-zinc-300' : 'text-zinc-400 dark:text-zinc-500'
                      }`} />
                      <span className={`text-sm ${
                        value.types.database ? 'text-zinc-900 dark:text-white' : 'text-zinc-600 dark:text-zinc-400'
                      }`}>
                        Database
                      </span>
                    </label>

                    <label className={`
                      relative flex items-center p-3 rounded-lg border cursor-pointer transition-all
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
                      <Image className={`h-4 w-4 mr-2 ${
                        value.types.images ? 'text-zinc-700 dark:text-zinc-300' : 'text-zinc-400 dark:text-zinc-500'
                      }`} />
                      <span className={`text-sm ${
                        value.types.images ? 'text-zinc-900 dark:text-white' : 'text-zinc-600 dark:text-zinc-400'
                      }`}>
                        Images
                      </span>
                    </label>

                    <label className={`
                      relative flex items-center p-3 rounded-lg border cursor-pointer transition-all
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
                      <FileText className={`h-4 w-4 mr-2 ${
                        value.types.configs ? 'text-zinc-700 dark:text-zinc-300' : 'text-zinc-400 dark:text-zinc-500'
                      }`} />
                      <span className={`text-sm ${
                        value.types.configs ? 'text-zinc-900 dark:text-white' : 'text-zinc-600 dark:text-zinc-400'
                      }`}>
                        Config Files
                      </span>
                    </label>
                  </div>
                </div>

                {/* Schedule */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                    Backup Schedule
                  </label>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <select
                          value={value.schedule.frequency}
                          onChange={(e) => updateSchedule({ 
                            frequency: e.target.value as BackupConfig['schedule']['frequency'] 
                          })}
                          className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-opacity-20"
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                          <option value="custom">Custom (Cron)</option>
                        </select>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-zinc-400" />
                        <input
                          type="time"
                          value={value.schedule.time}
                          onChange={(e) => updateSchedule({ time: e.target.value })}
                          className="flex-1 px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-opacity-20"
                        />
                      </div>
                    </div>

                    {value.schedule.frequency === 'weekly' && (
                      <select
                        value={value.schedule.dayOfWeek || 0}
                        onChange={(e) => updateSchedule({ dayOfWeek: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-opacity-20"
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
                        className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-opacity-20"
                        placeholder="Day of month (1-28)"
                      />
                    )}

                    {value.schedule.frequency === 'custom' && (
                      <input
                        type="text"
                        value={value.schedule.customCron || ''}
                        onChange={(e) => updateSchedule({ customCron: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-opacity-20"
                        placeholder="0 2 * * * (Cron expression)"
                      />
                    )}

                    <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">
                        Cron Expression: <code className="ml-1 text-zinc-900 dark:text-white font-mono">{getCronExpression()}</code>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Advanced Options */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                    Advanced Options
                  </label>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                        Retention Period (days)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="365"
                        value={value.retention}
                        onChange={(e) => updateConfig({ retention: parseInt(e.target.value) || 7 })}
                        className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-opacity-20"
                      />
                    </div>

                    <div className="flex items-center space-x-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={value.compression}
                          onChange={(e) => updateConfig({ compression: e.target.checked })}
                          className="w-4 h-4 text-zinc-600 bg-gray-100 border-gray-300 rounded focus:ring-zinc-500 dark:focus:ring-zinc-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="text-sm text-zinc-700 dark:text-zinc-300">
                          <HardDrive className="inline h-3 w-3 mr-1" />
                          Enable Compression
                        </span>
                      </label>

                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={value.encryption}
                          onChange={(e) => updateConfig({ encryption: e.target.checked })}
                          className="w-4 h-4 text-zinc-600 bg-gray-100 border-gray-300 rounded focus:ring-zinc-500 dark:focus:ring-zinc-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="text-sm text-zinc-700 dark:text-zinc-300">
                          <Shield className="inline h-3 w-3 mr-1" />
                          Enable Encryption
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}