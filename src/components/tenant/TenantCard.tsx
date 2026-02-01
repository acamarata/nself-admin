'use client'

import type { Tenant } from '@/types/tenant'
import { Activity, Building2, HardDrive, Users } from 'lucide-react'
import Link from 'next/link'
import { TenantStatusBadge } from './TenantStatusBadge'

interface TenantCardProps {
  tenant: Tenant
  onClick?: () => void
}

export function TenantCard({ tenant, onClick }: TenantCardProps) {
  return (
    <Link
      href={`/tenant/${tenant.id}`}
      className="group rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-5 transition-all hover:border-emerald-500/50 hover:bg-zinc-800"
      onClick={onClick}
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-700/50">
            <Building2 className="h-5 w-5 text-zinc-300" />
          </div>
          <div>
            <h3 className="font-medium text-white">{tenant.name}</h3>
            <p className="text-xs text-zinc-500">{tenant.slug}</p>
          </div>
        </div>
        <TenantStatusBadge status={tenant.status} />
      </div>

      <div className="grid grid-cols-3 gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-zinc-400">
          <Users className="h-3.5 w-3.5" />
          <span>
            {tenant.quota.members.used}/{tenant.quota.members.limit}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-zinc-400">
          <HardDrive className="h-3.5 w-3.5" />
          <span>{formatBytes(tenant.quota.storage.used)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-zinc-400">
          <Activity className="h-3.5 w-3.5" />
          <span>{tenant.plan}</span>
        </div>
      </div>
    </Link>
  )
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}
