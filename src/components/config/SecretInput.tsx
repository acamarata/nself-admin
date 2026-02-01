'use client'

import * as Icons from '@/lib/icons'
import { useState } from 'react'

interface SecretInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function SecretInput({
  value,
  onChange,
  placeholder = 'Enter value...',
  className = '',
}: SecretInputProps) {
  const [revealed, setRevealed] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(value).catch(() => {
      // Clipboard API may fail if page is not focused
    })
  }

  return (
    <div className="relative flex items-center gap-1">
      <input
        type={revealed ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`flex-1 rounded border border-zinc-300 bg-white px-2 py-1.5 pr-16 font-mono text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-900 ${className}`}
      />
      <div className="absolute right-1 flex items-center gap-0.5">
        <button
          type="button"
          onClick={() => setRevealed(!revealed)}
          className="rounded p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          title={revealed ? 'Hide' : 'Reveal'}
        >
          {revealed ? (
            <Icons.EyeOff className="h-3 w-3 text-zinc-500" />
          ) : (
            <Icons.Eye className="h-3 w-3 text-zinc-500" />
          )}
        </button>
        {value && (
          <button
            type="button"
            onClick={handleCopy}
            className="rounded p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            title="Copy"
          >
            <Icons.Copy className="h-3 w-3 text-zinc-500" />
          </button>
        )}
      </div>
    </div>
  )
}
