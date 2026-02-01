'use client'

import { CardGridSkeleton } from '@/components/skeletons'
import { TenantList } from '@/components/tenant'
import { useTenantList } from '@/hooks/useTenant'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'

function TenantsContent() {
  const { tenants, total, isLoading, error } = useTenantList()

  if (error) {
    return (
      <div className="rounded-lg border border-red-500/30 bg-red-900/20 p-4">
        <p className="text-red-400">Failed to load tenants: {error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Tenants</h1>
          <p className="text-sm text-zinc-400">
            Manage your multi-tenant organizations ({total} total)
          </p>
        </div>
        <Link
          href="/tenant/create"
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
        >
          <Plus className="h-4 w-4" /> Create Tenant
        </Link>
      </div>

      <TenantList tenants={tenants} isLoading={isLoading} />
    </div>
  )
}

export default function TenantsPage() {
  return (
    <Suspense fallback={<CardGridSkeleton />}>
      <TenantsContent />
    </Suspense>
  )
}
