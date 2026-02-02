/**
 * Tenant Context Management
 *
 * Provides tenant isolation by tracking the current tenant context
 * and ensuring all database operations are scoped to the correct tenant.
 */

import type { Tenant } from '@/types/tenant'
import { cookies } from 'next/headers'

const TENANT_COOKIE_NAME = 'nself_current_tenant'

/**
 * Get the current tenant ID from the request context
 */
export async function getCurrentTenantId(): Promise<string | null> {
  const cookieStore = await cookies()
  const tenantId = cookieStore.get(TENANT_COOKIE_NAME)?.value
  return tenantId || null
}

/**
 * Set the current tenant ID in the response cookies
 */
export async function setCurrentTenantId(tenantId: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(TENANT_COOKIE_NAME, tenantId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  })
}

/**
 * Clear the current tenant ID from cookies
 */
export async function clearCurrentTenantId(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(TENANT_COOKIE_NAME)
}

/**
 * Tenant context for database operations
 */
export interface TenantContext {
  tenantId: string
  tenant?: Tenant
}

/**
 * Create a tenant context from the current request
 */
export async function getTenantContext(): Promise<TenantContext | null> {
  const tenantId = await getCurrentTenantId()
  if (!tenantId) return null

  return {
    tenantId,
    // tenant will be loaded lazily if needed
  }
}

/**
 * Ensure a tenant context exists, throw error if not
 */
export async function requireTenantContext(): Promise<TenantContext> {
  const context = await getTenantContext()
  if (!context) {
    throw new Error('Tenant context required but not found')
  }
  return context
}

/**
 * Switch to a different tenant context
 */
export async function switchTenant(tenantId: string): Promise<void> {
  await setCurrentTenantId(tenantId)
}
