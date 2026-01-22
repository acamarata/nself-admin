'use client'

import { PageTemplate } from '@/components/PageTemplate'
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  ExternalLink,
  Globe,
  Key,
  Lock,
  RefreshCw,
  Shield,
  ShieldCheck,
  Terminal,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

interface SSLStatus {
  mode: 'none' | 'local' | 'letsencrypt'
  configured: boolean
  certificates: {
    exists: boolean
    domain?: string
    expiresAt?: string
    daysUntilExpiry?: number
    issuer?: string
    isValid?: boolean
  }
  mkcertInstalled: boolean
  trustInstalled: boolean
}

interface LetsEncryptStatus {
  configured: boolean
  domain: string | null
  email: string | null
  staging: boolean
  certificateExists: boolean
  autoRenewal: boolean
}

export default function SSLConfigPage() {
  const [sslStatus, setSslStatus] = useState<SSLStatus | null>(null)
  const [letsEncryptStatus, setLetsEncryptStatus] =
    useState<LetsEncryptStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [installingTrust, setInstallingTrust] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Let's Encrypt form state
  const [leEmail, setLeEmail] = useState('')
  const [leDomain, setLeDomain] = useState('')
  const [leStaging, setLeStaging] = useState(true)
  const [configuringLE, setConfiguringLE] = useState(false)

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const [sslRes, leRes] = await Promise.all([
        fetch('/api/config/ssl'),
        fetch('/api/config/ssl/letsencrypt'),
      ])

      if (sslRes.ok) {
        const sslData = await sslRes.json()
        setSslStatus(sslData.data)
      }

      if (leRes.ok) {
        const leData = await leRes.json()
        setLetsEncryptStatus(leData.data)
        if (leData.data.email) setLeEmail(leData.data.email)
        if (leData.data.domain) setLeDomain(leData.data.domain)
        setLeStaging(leData.data.staging)
      }
    } catch (err) {
      setError('Failed to load SSL status')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  const generateLocalCerts = async () => {
    try {
      setGenerating(true)
      setError(null)
      setSuccessMessage(null)

      const res = await fetch('/api/config/ssl/generate-local', {
        method: 'POST',
      })

      const data = await res.json()

      if (data.success) {
        setSuccessMessage('SSL certificates generated successfully!')
        await fetchStatus()
      } else {
        setError(data.error || 'Failed to generate certificates')
      }
    } catch (err) {
      setError('Failed to generate certificates')
      console.error(err)
    } finally {
      setGenerating(false)
    }
  }

  const installTrust = async () => {
    try {
      setInstallingTrust(true)
      setError(null)
      setSuccessMessage(null)

      const res = await fetch('/api/config/ssl/trust', {
        method: 'POST',
      })

      const data = await res.json()

      if (data.success) {
        setSuccessMessage(
          'Trust installed! You may need to restart your browser.',
        )
        await fetchStatus()
      } else {
        if (data.instructions) {
          setError(data.instructions.join('\n'))
        } else {
          setError(data.error || 'Failed to install trust')
        }
      }
    } catch (err) {
      setError('Failed to install trust')
      console.error(err)
    } finally {
      setInstallingTrust(false)
    }
  }

  const configureLetsEncrypt = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setConfiguringLE(true)
      setError(null)
      setSuccessMessage(null)

      const res = await fetch('/api/config/ssl/letsencrypt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: leDomain,
          email: leEmail,
          staging: leStaging,
        }),
      })

      const data = await res.json()

      if (data.success) {
        setSuccessMessage("Let's Encrypt configured! Run 'nself build' next.")
        await fetchStatus()
      } else {
        setError(data.error || "Failed to configure Let's Encrypt")
      }
    } catch (err) {
      setError("Failed to configure Let's Encrypt")
      console.error(err)
    } finally {
      setConfiguringLE(false)
    }
  }

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'letsencrypt':
        return 'text-green-600 dark:text-green-400'
      case 'local':
        return 'text-blue-600 dark:text-blue-400'
      default:
        return 'text-yellow-600 dark:text-yellow-400'
    }
  }

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'letsencrypt':
        return <ShieldCheck className="h-5 w-5" />
      case 'local':
        return <Shield className="h-5 w-5" />
      default:
        return <AlertCircle className="h-5 w-5" />
    }
  }

  return (
    <PageTemplate
      title="SSL Configuration"
      description="Manage SSL/TLS certificates for secure HTTPS connections"
    >
      <div className="space-y-6">
        {/* Status Messages */}
        {error && (
          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
            <div className="text-sm whitespace-pre-wrap text-red-800 dark:text-red-200">
              {error}
            </div>
          </div>
        )}

        {successMessage && (
          <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
            <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
            <div className="text-sm text-green-800 dark:text-green-200">
              {successMessage}
            </div>
          </div>
        )}

        {/* Current Status Card */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-white">
              <Lock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Current SSL Status
            </h2>
            <button
              onClick={fetchStatus}
              disabled={loading}
              className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
              />
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-600 dark:text-blue-400" />
            </div>
          ) : sslStatus ? (
            <div className="grid gap-4 md:grid-cols-3">
              {/* Mode */}
              <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
                <div className="mb-2 text-sm text-zinc-600 dark:text-zinc-400">
                  SSL Mode
                </div>
                <div
                  className={`flex items-center gap-2 font-semibold ${getModeColor(sslStatus.mode)}`}
                >
                  {getModeIcon(sslStatus.mode)}
                  {sslStatus.mode === 'none'
                    ? 'Not Configured'
                    : sslStatus.mode === 'local'
                      ? 'Local (mkcert)'
                      : "Let's Encrypt"}
                </div>
              </div>

              {/* Certificate Status */}
              <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
                <div className="mb-2 text-sm text-zinc-600 dark:text-zinc-400">
                  Certificate
                </div>
                <div
                  className={`flex items-center gap-2 font-semibold ${
                    sslStatus.certificates.exists &&
                    sslStatus.certificates.isValid
                      ? 'text-green-600 dark:text-green-400'
                      : sslStatus.certificates.exists
                        ? 'text-yellow-600 dark:text-yellow-400'
                        : 'text-zinc-500 dark:text-zinc-400'
                  }`}
                >
                  {sslStatus.certificates.exists ? (
                    sslStatus.certificates.isValid ? (
                      <>
                        <CheckCircle className="h-5 w-5" />
                        Valid
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-5 w-5" />
                        Expired
                      </>
                    )
                  ) : (
                    <>
                      <AlertCircle className="h-5 w-5" />
                      Not Found
                    </>
                  )}
                </div>
              </div>

              {/* Trust Status */}
              <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
                <div className="mb-2 text-sm text-zinc-600 dark:text-zinc-400">
                  System Trust
                </div>
                <div
                  className={`flex items-center gap-2 font-semibold ${
                    sslStatus.trustInstalled
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-zinc-500 dark:text-zinc-400'
                  }`}
                >
                  {sslStatus.trustInstalled ? (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      Installed
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-5 w-5" />
                      Not Installed
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-zinc-600 dark:text-zinc-400">
              Unable to load SSL status
            </p>
          )}

          {/* Certificate Details */}
          {sslStatus?.certificates.exists && (
            <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-white">
                <Key className="h-4 w-4" />
                Certificate Details
              </h3>
              <div className="grid gap-2 text-sm md:grid-cols-2">
                {sslStatus.certificates.domain && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-zinc-400" />
                    <span className="text-zinc-600 dark:text-zinc-400">
                      Domain:
                    </span>
                    <span className="font-medium text-zinc-900 dark:text-white">
                      {sslStatus.certificates.domain}
                    </span>
                  </div>
                )}
                {sslStatus.certificates.issuer && (
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-zinc-400" />
                    <span className="text-zinc-600 dark:text-zinc-400">
                      Issuer:
                    </span>
                    <span className="font-medium text-zinc-900 dark:text-white">
                      {sslStatus.certificates.issuer.includes('mkcert')
                        ? 'mkcert (local)'
                        : sslStatus.certificates.issuer}
                    </span>
                  </div>
                )}
                {sslStatus.certificates.expiresAt && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-zinc-400" />
                    <span className="text-zinc-600 dark:text-zinc-400">
                      Expires:
                    </span>
                    <span
                      className={`font-medium ${
                        (sslStatus.certificates.daysUntilExpiry ?? 0) < 30
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : 'text-zinc-900 dark:text-white'
                      }`}
                    >
                      {new Date(
                        sslStatus.certificates.expiresAt,
                      ).toLocaleDateString()}{' '}
                      ({sslStatus.certificates.daysUntilExpiry} days)
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Local SSL Section */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-white">
            <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Local Development SSL (mkcert)
          </h2>

          <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
            Generate locally-trusted SSL certificates for development. Requires{' '}
            <code className="rounded bg-zinc-100 px-1 py-0.5 dark:bg-zinc-700">
              mkcert
            </code>{' '}
            to be installed.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={generateLocalCerts}
              disabled={generating || !sslStatus?.mkcertInstalled}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {generating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Generate Certificates
                </>
              )}
            </button>

            <button
              onClick={installTrust}
              disabled={installingTrust || !sslStatus?.mkcertInstalled}
              className="flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
            >
              {installingTrust ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Installing...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  Install Trust
                </>
              )}
            </button>
          </div>

          {!sslStatus?.mkcertInstalled && (
            <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                <Terminal className="h-4 w-4" />
                mkcert not installed
              </h3>
              <p className="mb-2 text-sm text-yellow-700 dark:text-yellow-300">
                Install mkcert to generate local certificates:
              </p>
              <code className="block rounded bg-yellow-100 p-2 text-xs text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200">
                brew install mkcert && mkcert -install
              </code>
            </div>
          )}
        </div>

        {/* Let's Encrypt Section */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-white">
            <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
            Let&apos;s Encrypt (Production)
          </h2>

          <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
            Obtain free, trusted SSL certificates from Let&apos;s Encrypt.
            Requires a publicly accessible domain with DNS pointing to this
            server.
          </p>

          <form onSubmit={configureLetsEncrypt} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Domain
                </label>
                <input
                  type="text"
                  value={leDomain}
                  onChange={(e) => setLeDomain(e.target.value)}
                  placeholder="example.com"
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Email
                </label>
                <input
                  type="email"
                  value={leEmail}
                  onChange={(e) => setLeEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="staging"
                checked={leStaging}
                onChange={(e) => setLeStaging(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-300 text-green-600 focus:ring-green-500"
              />
              <label
                htmlFor="staging"
                className="text-sm text-zinc-700 dark:text-zinc-300"
              >
                Use staging environment (for testing, not browser-trusted)
              </label>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={configuringLE || !leDomain || !leEmail}
                className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {configuringLE ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Configuring...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    Configure Let&apos;s Encrypt
                  </>
                )}
              </button>

              <a
                href="https://letsencrypt.org/docs/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              >
                <ExternalLink className="h-4 w-4" />
                Documentation
              </a>
            </div>
          </form>

          {letsEncryptStatus?.configured && (
            <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
              <h3 className="mb-2 text-sm font-semibold text-green-800 dark:text-green-200">
                Let&apos;s Encrypt Configured
              </h3>
              <div className="space-y-1 text-sm text-green-700 dark:text-green-300">
                <p>Domain: {letsEncryptStatus.domain}</p>
                <p>Email: {letsEncryptStatus.email}</p>
                <p>
                  Mode: {letsEncryptStatus.staging ? 'Staging' : 'Production'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Next Steps */}
        <div className="rounded-xl border border-zinc-200 bg-gradient-to-br from-zinc-50 to-white p-6 shadow-sm dark:border-zinc-700 dark:from-zinc-800 dark:to-zinc-900">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
            Next Steps
          </h2>
          <ol className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <li className="flex items-start gap-2">
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                1
              </span>
              Generate or configure SSL certificates above
            </li>
            <li className="flex items-start gap-2">
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                2
              </span>
              Run{' '}
              <code className="rounded bg-zinc-100 px-1 py-0.5 dark:bg-zinc-700">
                nself build
              </code>{' '}
              to regenerate nginx configuration
            </li>
            <li className="flex items-start gap-2">
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                3
              </span>
              Run{' '}
              <code className="rounded bg-zinc-100 px-1 py-0.5 dark:bg-zinc-700">
                nself start
              </code>{' '}
              to restart services with SSL enabled
            </li>
            <li className="flex items-start gap-2">
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                4
              </span>
              Access your services via{' '}
              <code className="rounded bg-zinc-100 px-1 py-0.5 dark:bg-zinc-700">
                https://
              </code>
            </li>
          </ol>
        </div>
      </div>
    </PageTemplate>
  )
}
