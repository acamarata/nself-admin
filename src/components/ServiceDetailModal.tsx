'use client'

import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { X, Info } from 'lucide-react'

interface ServiceConfig {
  [key: string]: string | number | boolean
}

interface ServiceDetailModalProps {
  isOpen: boolean
  onClose: () => void
  serviceName: string
  config: ServiceConfig
  onSave: (config: ServiceConfig) => void
  fields: Array<{
    key: string
    label: string
    type: 'text' | 'number' | 'select' | 'boolean' | 'password'
    placeholder?: string
    options?: Array<{ value: string; label: string }>
    help?: string
    advanced?: boolean
  }>
}

export function ServiceDetailModal({
  isOpen,
  onClose,
  serviceName,
  config,
  onSave,
  fields
}: ServiceDetailModalProps) {
  const [localConfig, setLocalConfig] = useState(config)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleSave = () => {
    onSave(localConfig)
    onClose()
  }

  const basicFields = fields.filter(f => !f.advanced)
  const advancedFields = fields.filter(f => f.advanced)

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-zinc-800 p-6 shadow-xl transition-all">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <Dialog.Title as="h3" className="text-lg font-semibold text-zinc-900 dark:text-white">
                      {serviceName} - Detailed Configuration
                    </Dialog.Title>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                      Configure advanced settings for {serviceName}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                  {/* Basic Fields */}
                  {basicFields.map((field) => (
                    <div key={field.key}>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                        {field.label}
                        {field.help && (
                          <span className="relative inline-block ml-1 group">
                            <Info className="h-3 w-3 text-zinc-400 inline" />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 w-64 p-2 bg-zinc-900 text-white text-xs rounded-lg shadow-lg">
                              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-zinc-900 rotate-45"></div>
                              {field.help}
                            </div>
                          </span>
                        )}
                      </label>
                      {field.type === 'boolean' ? (
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={localConfig[field.key] as boolean}
                            onChange={(e) => setLocalConfig({ ...localConfig, [field.key]: e.target.checked })}
                            className="text-blue-600"
                          />
                          <span className="text-sm text-zinc-700 dark:text-zinc-300">Enabled</span>
                        </label>
                      ) : field.type === 'select' ? (
                        <select
                          value={localConfig[field.key] as string}
                          onChange={(e) => setLocalConfig({ ...localConfig, [field.key]: e.target.value })}
                          className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                        >
                          {field.options?.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.type}
                          value={localConfig[field.key] as string}
                          onChange={(e) => setLocalConfig({ ...localConfig, [field.key]: e.target.value })}
                          placeholder={field.placeholder}
                          className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                        />
                      )}
                    </div>
                  ))}

                  {/* Advanced Fields Toggle */}
                  {advancedFields.length > 0 && (
                    <>
                      <div className="border-t border-zinc-200 dark:border-zinc-700 pt-4">
                        <button
                          onClick={() => setShowAdvanced(!showAdvanced)}
                          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                        >
                          {showAdvanced ? 'Hide' : 'Show'} Advanced Settings...
                        </button>
                      </div>

                      {showAdvanced && (
                        <div className="space-y-4">
                          {advancedFields.map((field) => (
                            <div key={field.key}>
                              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                {field.label}
                                {field.help && (
                                  <span className="relative inline-block ml-1 group">
                                    <Info className="h-3 w-3 text-zinc-400 inline" />
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 w-64 p-2 bg-zinc-900 text-white text-xs rounded-lg shadow-lg">
                                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-zinc-900 rotate-45"></div>
                                      {field.help}
                                    </div>
                                  </span>
                                )}
                              </label>
                              {field.type === 'boolean' ? (
                                <label className="flex items-center space-x-3 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={localConfig[field.key] as boolean}
                                    onChange={(e) => setLocalConfig({ ...localConfig, [field.key]: e.target.checked })}
                                    className="text-blue-600"
                                  />
                                  <span className="text-sm text-zinc-700 dark:text-zinc-300">Enabled</span>
                                </label>
                              ) : field.type === 'select' ? (
                                <select
                                  value={localConfig[field.key] as string}
                                  onChange={(e) => setLocalConfig({ ...localConfig, [field.key]: e.target.value })}
                                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                                >
                                  {field.options?.map((option) => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <input
                                  type={field.type}
                                  value={localConfig[field.key] as string}
                                  onChange={(e) => setLocalConfig({ ...localConfig, [field.key]: e.target.value })}
                                  placeholder={field.placeholder}
                                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                  >
                    Save Configuration
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}