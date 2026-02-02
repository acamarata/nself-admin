'use client'

import { Button } from '@/components/Button'
import { Check, ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface ServiceSelectorProps {
  services: string[]
  selectedServices: string[]
  onChange: (services: string[]) => void
  recentServices?: string[]
}

export function ServiceSelector({
  services,
  selectedServices,
  onChange,
  recentServices = [],
}: ServiceSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const toggleService = (service: string) => {
    if (selectedServices.includes(service)) {
      onChange(selectedServices.filter((s) => s !== service))
    } else {
      onChange([...selectedServices, service])
    }
  }

  const selectAll = () => {
    onChange(services)
  }

  const clearAll = () => {
    onChange([])
  }

  const displayText =
    selectedServices.length === 0
      ? 'All Services'
      : selectedServices.length === services.length
        ? 'All Services'
        : selectedServices.length === 1
          ? selectedServices[0]
          : `${selectedServices.length} services`

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
      >
        <span className="font-medium text-zinc-900 dark:text-white">
          {displayText}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-zinc-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-2 w-64 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-200 px-3 py-2 dark:border-zinc-700">
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Select Services
            </span>
            <div className="flex gap-1">
              <Button
                onClick={selectAll}
                variant="text"
                className="h-auto px-2 py-1 text-xs"
              >
                All
              </Button>
              <Button
                onClick={clearAll}
                variant="text"
                className="h-auto px-2 py-1 text-xs"
              >
                Clear
              </Button>
            </div>
          </div>

          {/* Recent Services */}
          {recentServices.length > 0 && (
            <div className="border-b border-zinc-200 dark:border-zinc-700">
              <div className="px-3 py-1.5 text-[10px] font-semibold text-zinc-500 uppercase">
                Recent
              </div>
              {recentServices.slice(0, 3).map((service) => (
                <button
                  key={`recent-${service}`}
                  onClick={() => toggleService(service)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
                >
                  <div className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border border-zinc-300 dark:border-zinc-600">
                    {selectedServices.includes(service) && (
                      <Check className="h-3 w-3 text-blue-500" />
                    )}
                  </div>
                  <span className="flex-1 text-left text-zinc-900 dark:text-white">
                    {service}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* All Services */}
          <div className="max-h-64 overflow-y-auto">
            {services.map((service) => (
              <button
                key={service}
                onClick={() => toggleService(service)}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                <div className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border border-zinc-300 dark:border-zinc-600">
                  {selectedServices.includes(service) && (
                    <Check className="h-3 w-3 text-blue-500" />
                  )}
                </div>
                <span className="flex-1 text-left text-zinc-900 dark:text-white">
                  {service}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
