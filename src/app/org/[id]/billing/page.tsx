'use client'

import { DashboardSkeleton } from '@/components/skeletons'
import { useOrganization } from '@/hooks/useOrganization'
import {
  ArrowLeft,
  ArrowUpRight,
  Calendar,
  Check,
  CreditCard,
  Download,
  Receipt,
  TrendingUp,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'

interface Plan {
  id: string
  name: string
  price: number
  interval: 'month' | 'year'
  features: string[]
  current?: boolean
  popular?: boolean
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'month',
    features: [
      'Up to 5 team members',
      '1 team',
      'Basic permissions',
      'Community support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29,
    interval: 'month',
    features: [
      'Up to 25 team members',
      'Unlimited teams',
      'Advanced permissions',
      'Priority support',
      'Custom roles',
      'Audit logs',
    ],
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99,
    interval: 'month',
    features: [
      'Unlimited team members',
      'Unlimited teams',
      'Custom permissions',
      '24/7 dedicated support',
      'SSO/SAML',
      'Advanced security',
      'SLA guarantee',
      'Custom integrations',
    ],
  },
]

const invoices = [
  { id: 'INV-001', date: '2024-01-01', amount: 29, status: 'paid' },
  { id: 'INV-002', date: '2024-02-01', amount: 29, status: 'paid' },
  { id: 'INV-003', date: '2024-03-01', amount: 29, status: 'pending' },
]

export default function OrgBillingPage() {
  const params = useParams()
  const orgId = params.id as string
  const { org, isLoading, error } = useOrganization(orgId)
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>(
    'month',
  )
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  if (isLoading) return <DashboardSkeleton />

  if (error || !org) {
    return (
      <div className="rounded-lg border border-red-500/30 bg-red-900/20 p-4">
        <p className="text-red-400">{error || 'Organization not found'}</p>
      </div>
    )
  }

  // Mock current plan - in real app, this would come from the org data
  const currentPlan = 'pro'

  const getAdjustedPrice = (price: number) => {
    if (billingInterval === 'year') {
      return Math.round(price * 10) // 2 months free for annual
    }
    return price
  }

  return (
    <div className="space-y-8">
      <div>
        <Link
          href={`/org/${orgId}`}
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back to {org.name}
        </Link>
        <h1 className="mt-4 text-2xl font-semibold text-white">Billing</h1>
        <p className="text-sm text-zinc-400">
          Manage your subscription and billing information
        </p>
      </div>

      {/* Current Plan Overview */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20">
              <Zap className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-400">Current Plan</p>
              <p className="text-xl font-semibold text-white">Pro</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
              <Calendar className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-400">Next Billing Date</p>
              <p className="text-xl font-semibold text-white">Apr 1, 2024</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/20">
              <TrendingUp className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-400">Monthly Spend</p>
              <p className="text-xl font-semibold text-white">$29.00</p>
            </div>
          </div>
        </div>
      </div>

      {/* Plans */}
      <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-medium text-white">Available Plans</h2>
          <div className="flex rounded-lg border border-zinc-700 bg-zinc-900 p-1">
            <button
              onClick={() => setBillingInterval('month')}
              className={`rounded-md px-4 py-1.5 text-sm transition-colors ${
                billingInterval === 'month'
                  ? 'bg-zinc-700 text-white'
                  : 'text-zinc-400'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval('year')}
              className={`rounded-md px-4 py-1.5 text-sm transition-colors ${
                billingInterval === 'year'
                  ? 'bg-zinc-700 text-white'
                  : 'text-zinc-400'
              }`}
            >
              Yearly <span className="text-emerald-400">(Save 20%)</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {plans.map((plan) => {
            const isCurrent = plan.id === currentPlan
            const isSelected = selectedPlan === plan.id

            return (
              <div
                key={plan.id}
                className={`relative rounded-xl border p-6 transition-all ${
                  isCurrent
                    ? 'border-emerald-500/50 bg-emerald-500/5'
                    : isSelected
                      ? 'border-blue-500/50 bg-blue-500/5'
                      : 'border-zinc-700 hover:border-zinc-600'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-3 py-0.5 text-xs font-medium text-white">
                    Most Popular
                  </span>
                )}

                {isCurrent && (
                  <span className="absolute -top-3 right-4 rounded-full bg-zinc-700 px-3 py-0.5 text-xs font-medium text-zinc-300">
                    Current
                  </span>
                )}

                <h3 className="text-lg font-medium text-white">{plan.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white">
                    ${getAdjustedPrice(plan.price)}
                  </span>
                  <span className="text-zinc-500">
                    /{billingInterval === 'year' ? 'year' : 'month'}
                  </span>
                </div>

                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-400" />
                      <span className="text-sm text-zinc-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => setSelectedPlan(plan.id)}
                  disabled={isCurrent}
                  className={`mt-6 w-full rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    isCurrent
                      ? 'cursor-not-allowed bg-zinc-700 text-zinc-400'
                      : 'bg-emerald-600 text-white hover:bg-emerald-500'
                  }`}
                >
                  {isCurrent ? 'Current Plan' : 'Select Plan'}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Payment Method */}
      <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-medium text-white">Payment Method</h2>
          <button className="text-sm text-emerald-400 hover:text-emerald-300">
            Update
          </button>
        </div>

        <div className="flex items-center gap-4 rounded-lg border border-zinc-700 bg-zinc-900 p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-800">
            <CreditCard className="h-6 w-6 text-zinc-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">
              Visa ending in 4242
            </p>
            <p className="text-xs text-zinc-500">Expires 12/2025</p>
          </div>
        </div>
      </div>

      {/* Billing History */}
      <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-medium text-white">Billing History</h2>
          <button className="inline-flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300">
            <Download className="h-4 w-4" /> Download All
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-zinc-400 uppercase">
                  Invoice
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-zinc-400 uppercase">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-zinc-400 uppercase">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-zinc-400 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium tracking-wider text-zinc-400 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-700">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-zinc-800/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Receipt className="h-4 w-4 text-zinc-500" />
                      <span className="text-sm text-white">{invoice.id}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-400">
                    {new Date(invoice.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-white">
                    ${invoice.amount.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        invoice.status === 'paid'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}
                    >
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-white">
                      <ArrowUpRight className="h-4 w-4" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Usage Stats */}
      <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-6">
        <h2 className="mb-4 text-lg font-medium text-white">
          Usage This Month
        </h2>
        <div className="space-y-4">
          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm text-zinc-400">Team Members</span>
              <span className="text-sm text-white">12 / 25</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-zinc-700">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: '48%' }}
              />
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm text-zinc-400">Teams</span>
              <span className="text-sm text-white">4 / Unlimited</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-zinc-700">
              <div
                className="h-full rounded-full bg-blue-500"
                style={{ width: '10%' }}
              />
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm text-zinc-400">API Calls</span>
              <span className="text-sm text-white">8,234 / 50,000</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-zinc-700">
              <div
                className="h-full rounded-full bg-yellow-500"
                style={{ width: '16%' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
