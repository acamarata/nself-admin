'use client'

import React, { useState, useCallback, createContext, useContext } from 'react'
import { AlertTriangle } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

interface ConfirmOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  confirmButtonClass?: string
  icon?: React.ComponentType<{ className?: string }>
  dangerous?: boolean
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined)

export function useConfirm() {
  const context = useContext(ConfirmContext)
  if (!context) {
    throw new Error('useConfirm must be used within ConfirmProvider')
  }
  return context
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [dialog, setDialog] = useState<(ConfirmOptions & { resolve: (value: boolean) => void }) | null>(null)

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setDialog({ ...options, resolve })
    })
  }, [])

  const handleConfirm = useCallback(() => {
    if (dialog) {
      dialog.resolve(true)
      setDialog(null)
    }
  }, [dialog])

  const handleCancel = useCallback(() => {
    if (dialog) {
      dialog.resolve(false)
      setDialog(null)
    }
  }, [dialog])

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <AnimatePresence>
        {dialog && (
          <ConfirmDialog
            {...dialog}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
          />
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  )
}

function ConfirmDialog({
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmButtonClass,
  icon: Icon = AlertTriangle,
  dangerous = false,
  onConfirm,
  onCancel
}: ConfirmOptions & {
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start">
          <div className={`p-2 rounded-lg ${
            dangerous ? 'bg-red-100 dark:bg-red-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30'
          }`}>
            <Icon className={`w-6 h-6 ${
              dangerous ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'
            }`} />
          </div>
          <div className="ml-4 flex-1">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
              {title}
            </h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              {message}
            </p>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={confirmButtonClass || `px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
              dangerous 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Convenience function for quick confirms
export async function confirmAction(
  title: string,
  message: string,
  options: Partial<ConfirmOptions> = {}
): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('confirm-dialog', {
        detail: { title, message, ...options, resolve }
      })
      window.dispatchEvent(event)
    } else {
      resolve(false)
    }
  })
}