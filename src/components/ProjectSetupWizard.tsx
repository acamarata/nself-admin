'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/Button'
import { motion, AnimatePresence } from 'framer-motion'
import { ServiceDetailModal } from '@/components/ServiceDetailModal'
import { 
  CheckCircle, 
  AlertCircle, 
  Package, 
  Terminal,
  Loader2,
  ChevronRight,
  ChevronLeft,
  Settings,
  Database,
  Shield,
  Server,
  Layers,
  Layout,
  Eye,
  EyeOff,
  HardDrive,
  Globe,
  Lock,
  Cloud,
  Wrench,
  Mail,
  Phone,
  Bell,
  BarChart,
  Smartphone,
  Search,
  Plus,
  ChevronDown,
  X
} from 'lucide-react'
import { useProjectStore } from '@/stores/projectStore'

type WizardStep = 'initial' | 'required-services' | 'optional-services' | 'user-services' | 'apps' | 'review'

interface ProjectConfig {
  // Initial Setup
  projectName: string
  environment: 'dev' | 'staging' | 'prod'
  domain: string
  adminEmail: string
  databaseName: string
  databasePassword: string
  hasuraAdminSecret: string
  jwtSecret: string
  backupEnabled: boolean
  backupSchedule: string
  
  // Required Services Configuration
  postgres: {
    version: string
    port: number
    maxConnections: number
    poolingEnabled: 'auto' | 'true' | 'false'
    [key: string]: any
  }
  hasura: {
    version: string
    consoleEnabled: boolean
    devMode: boolean
    cors: string
    [key: string]: any
  }
  nginx: {
    sslMode: 'local' | 'letsencrypt' | 'custom' | 'none'
    httpPort: number
    httpsPort: number
    [key: string]: any
  }
  auth: {
    jwtExpiresIn: number
    refreshExpiresIn: number
    smtpHost: string
    smtpPort: number
    smtpSender: string
    [key: string]: any
  }
  storage: {
    accessKey: string
    secretKey: string
    bucket: string
    region: string
    [key: string]: any
  }
  
  // Optional Services
  optionalServices: {
    redis: boolean
    mail: {
      enabled: boolean
      provider: 'auto' | 'mailpit' | 'sendgrid' | 'ses' | 'mailgun' | 'postmark' | 'gmail' | 'outlook' | 'brevo' | 'resend' | 'sparkpost' | 'mandrill' | 'elastic' | 'smtp2go' | 'mailersend' | 'postfix' | 'smtp'
    }
    monitoring: boolean
    search: {
      enabled: boolean
      provider: 'auto' | 'meilisearch' | 'elasticsearch' | 'typesense' | 'algolia' | 'opensearch' | 'sonic' | 'postgres'
    }
    mlflow: boolean
    adminUI: boolean
  }
  
  // Optional Services Configuration
  redisConfig?: {
    port: number
    version: string
    maxMemory: string
    [key: string]: any
  }
  mailConfig?: {
    smtpHost: string
    smtpPort: number
    smtpUser: string
    smtpPass: string
    smtpSecure: boolean
    fromEmail: string
    [key: string]: any
  }
  monitoringConfig?: {
    grafanaPort: number
    prometheusPort: number
    lokiPort: number
    jaegerPort: number
    [key: string]: any
  }
  searchConfig?: {
    port: number
    apiKey: string
    [key: string]: any
  }
  mlflowConfig?: {
    trackingPort: number
    artifactRoot: string
    [key: string]: any
  }
  nadminConfig?: {
    port: number
    sessionTimeout: number
    enableMetrics: boolean
    enableBackups: boolean
    [key: string]: any
  }
  
  // Custom Services
  customServices: Array<{
    name: string
    framework: string
    port: number
    route: string
  }>
  
  // Frontend Apps
  frontendApps: Array<{
    name: string
    displayName: string
    tablePrefix: string
    port: number
    subdomain: string
    framework: string
    deployment: 'local' | 'vercel' | 'netlify' | 'cloudflare' | 'other'
    enabled: boolean
  }>
}

// Service configuration fields for detail modals
const SERVICE_FIELDS = {
  postgres: [
    // Most important settings at top
    { key: 'version', label: 'PostgreSQL Version', type: 'select' as const, 
      options: [
        { value: '16-alpine', label: '16 Alpine (Latest)' },
        { value: '15-alpine', label: '15 Alpine' },
        { value: '14-alpine', label: '14 Alpine' }
      ]
    },
    { key: 'port', label: 'Port', type: 'number' as const, placeholder: '5432', help: 'Database connection port' },
    { key: 'maxConnections', label: 'Max Connections', type: 'number' as const, help: 'Maximum number of concurrent connections' },
    { key: 'poolingEnabled', label: 'Connection Pooling', type: 'select' as const,
      options: [
        { value: 'auto', label: 'Auto (Recommended)' },
        { value: 'true', label: 'Always Enabled' },
        { value: 'false', label: 'Disabled' }
      ]
    },
    // Advanced settings
    { key: 'shared_buffers', label: 'Shared Buffers', type: 'text' as const, placeholder: '256MB', advanced: true },
    { key: 'work_mem', label: 'Work Memory', type: 'text' as const, placeholder: '4MB', advanced: true },
    { key: 'maintenance_work_mem', label: 'Maintenance Work Memory', type: 'text' as const, placeholder: '64MB', advanced: true },
    { key: 'effective_cache_size', label: 'Effective Cache Size', type: 'text' as const, placeholder: '1GB', advanced: true },
    { key: 'checkpoint_timeout', label: 'Checkpoint Timeout', type: 'text' as const, placeholder: '5min', advanced: true },
    { key: 'max_wal_size', label: 'Max WAL Size', type: 'text' as const, placeholder: '1GB', advanced: true },
    { key: 'min_wal_size', label: 'Min WAL Size', type: 'text' as const, placeholder: '80MB', advanced: true },
    { key: 'wal_level', label: 'WAL Level', type: 'select' as const, advanced: true,
      options: [
        { value: 'replica', label: 'Replica (Default)' },
        { value: 'logical', label: 'Logical' },
        { value: 'minimal', label: 'Minimal' }
      ]
    },
    { key: 'archive_mode', label: 'Archive Mode', type: 'select' as const, advanced: true,
      options: [
        { value: 'off', label: 'Off (Default)' },
        { value: 'on', label: 'On' },
        { value: 'always', label: 'Always' }
      ]
    }
  ],
  hasura: [
    { key: 'version', label: 'Hasura Version', type: 'text' as const, placeholder: 'v2.44.0' },
    { key: 'consoleEnabled', label: 'Enable Console', type: 'boolean' as const },
    { key: 'devMode', label: 'Development Mode', type: 'boolean' as const },
    { key: 'cors', label: 'CORS Domain', type: 'text' as const, placeholder: '*' },
    { key: 'enable_telemetry', label: 'Enable Telemetry', type: 'boolean' as const, advanced: true },
    { key: 'unauthorized_role', label: 'Unauthorized Role', type: 'text' as const, placeholder: 'anonymous', advanced: true },
    { key: 'enable_allowlist', label: 'Enable Query Allowlist', type: 'boolean' as const, advanced: true }
  ],
  nginx: [
    // Most important settings at top
    { key: 'httpPort', label: 'HTTP Port', type: 'number' as const, placeholder: '80' },
    { key: 'httpsPort', label: 'HTTPS Port', type: 'number' as const, placeholder: '443' },
    { key: 'sslMode', label: 'SSL Mode', type: 'select' as const,
      options: [
        { value: 'auto', label: 'Auto (Let\'s Encrypt for production, self-signed for dev)' },
        { value: 'letsencrypt', label: "Let's Encrypt (Production)" },
        { value: 'self-signed', label: 'Self-signed (Development)' },
        { value: 'custom', label: 'Custom Certificate' },
        { value: 'none', label: 'No SSL (Not recommended)' }
      ],
      help: 'SSL configuration for your domain'
    },
    { key: 'forceSSL', label: 'Force HTTPS Redirect', type: 'boolean' as const, help: 'Redirect all HTTP traffic to HTTPS' },
    
    // SSL Certificate Settings (advanced)
    { key: 'sslCertPath', label: 'SSL Certificate Path', type: 'text' as const, placeholder: '/etc/nginx/ssl/cert.pem', advanced: true },
    { key: 'sslKeyPath', label: 'SSL Key Path', type: 'text' as const, placeholder: '/etc/nginx/ssl/key.pem', advanced: true },
    { key: 'sslProtocols', label: 'SSL Protocols', type: 'text' as const, placeholder: 'TLSv1.2 TLSv1.3', advanced: true },
    { key: 'sslCiphers', label: 'SSL Ciphers', type: 'text' as const, placeholder: 'HIGH:!aNULL:!MD5', advanced: true },
    
    // Performance settings (advanced)
    { key: 'client_max_body_size', label: 'Max Upload Size', type: 'text' as const, placeholder: '100M', advanced: true },
    { key: 'keepalive_timeout', label: 'Keepalive Timeout', type: 'number' as const, placeholder: '65', advanced: true },
    { key: 'gzip', label: 'Enable Gzip Compression', type: 'boolean' as const, advanced: true },
    { key: 'worker_processes', label: 'Worker Processes', type: 'text' as const, placeholder: 'auto', advanced: true },
    { key: 'worker_connections', label: 'Worker Connections', type: 'number' as const, placeholder: '1024', advanced: true }
  ],
  auth: [
    { key: 'jwtExpiresIn', label: 'JWT Expires In (seconds)', type: 'number' as const, placeholder: '900' },
    { key: 'refreshExpiresIn', label: 'Refresh Token Expires In (seconds)', type: 'number' as const, placeholder: '2592000' },
    { key: 'smtpHost', label: 'SMTP Host', type: 'text' as const, placeholder: 'mailpit' },
    { key: 'smtpPort', label: 'SMTP Port', type: 'number' as const, placeholder: '1025' },
    { key: 'smtpSender', label: 'SMTP Sender', type: 'text' as const, placeholder: 'noreply@localhost' },
    { key: 'webauthn_enabled', label: 'Enable WebAuthn', type: 'boolean' as const, advanced: true },
    { key: 'email_verification', label: 'Require Email Verification', type: 'boolean' as const, advanced: true }
  ],
  storage: [
    { key: 'accessKey', label: 'Access Key', type: 'text' as const },
    { key: 'secretKey', label: 'Secret Key', type: 'password' as const },
    { key: 'bucket', label: 'Default Bucket', type: 'text' as const, placeholder: 'nself' },
    { key: 'region', label: 'Region', type: 'text' as const, placeholder: 'us-east-1' },
    { key: 'public_url', label: 'Public URL', type: 'text' as const, placeholder: 'auto', advanced: true },
    { key: 'max_file_size', label: 'Max File Size', type: 'text' as const, placeholder: '50MB', advanced: true }
  ],
  redis: [
    { key: 'port', label: 'Port', type: 'number' as const, placeholder: '6379' },
    { key: 'version', label: 'Redis Version', type: 'select' as const,
      options: [
        { value: '7-alpine', label: '7 Alpine (Latest)' },
        { value: '6-alpine', label: '6 Alpine' },
        { value: '5-alpine', label: '5 Alpine' }
      ]
    },
    { key: 'maxMemory', label: 'Max Memory', type: 'text' as const, placeholder: '256mb', help: 'Maximum memory Redis can use' },
    { key: 'password', label: 'Password (Production)', type: 'password' as const, placeholder: 'Leave empty for dev', advanced: true },
    { key: 'persistence', label: 'Enable Persistence', type: 'boolean' as const, advanced: true },
    { key: 'save', label: 'Save Frequency', type: 'text' as const, placeholder: '60 1', help: 'Save after N seconds and M changes', advanced: true }
  ],
  mail: [
    { key: 'smtpHost', label: 'SMTP Host', type: 'text' as const, placeholder: 'smtp.example.com' },
    { key: 'smtpPort', label: 'SMTP Port', type: 'number' as const, placeholder: '587' },
    { key: 'smtpUser', label: 'SMTP Username', type: 'text' as const, placeholder: 'username' },
    { key: 'smtpPass', label: 'SMTP Password', type: 'password' as const },
    { key: 'smtpSecure', label: 'Use TLS/SSL', type: 'boolean' as const },
    { key: 'fromEmail', label: 'From Email', type: 'text' as const, placeholder: 'noreply@example.com' },
    { key: 'fromName', label: 'From Name', type: 'text' as const, placeholder: 'nself', advanced: true },
    { key: 'replyTo', label: 'Reply To', type: 'text' as const, placeholder: 'support@example.com', advanced: true },
    { key: 'apiKey', label: 'API Key (for API providers)', type: 'password' as const, advanced: true }
  ],
  monitoring: [
    { key: 'grafanaPort', label: 'Grafana Port', type: 'number' as const, placeholder: '3000' },
    { key: 'prometheusPort', label: 'Prometheus Port', type: 'number' as const, placeholder: '9090' },
    { key: 'lokiPort', label: 'Loki Port', type: 'number' as const, placeholder: '3100' },
    { key: 'jaegerPort', label: 'Jaeger Port', type: 'number' as const, placeholder: '16686' },
    { key: 'retentionDays', label: 'Data Retention (days)', type: 'number' as const, placeholder: '30', advanced: true },
    { key: 'scrapeInterval', label: 'Scrape Interval', type: 'text' as const, placeholder: '15s', advanced: true },
    { key: 'enableAlerts', label: 'Enable Alerting', type: 'boolean' as const, advanced: true }
  ],
  search: [
    { key: 'port', label: 'Port', type: 'number' as const, placeholder: '7700' },
    { key: 'apiKey', label: 'API Key', type: 'password' as const, placeholder: 'Master key for search' },
    { key: 'maxIndexSize', label: 'Max Index Size', type: 'text' as const, placeholder: '100GB', advanced: true },
    { key: 'maxDocumentSize', label: 'Max Document Size', type: 'text' as const, placeholder: '100MB', advanced: true },
    { key: 'enableTypoTolerance', label: 'Typo Tolerance', type: 'boolean' as const, advanced: true },
    { key: 'enableSynonyms', label: 'Enable Synonyms', type: 'boolean' as const, advanced: true },
    { key: 'rankingRules', label: 'Ranking Rules', type: 'text' as const, placeholder: 'words,typo,proximity', advanced: true }
  ],
  mlflow: [
    { key: 'trackingPort', label: 'Tracking Server Port', type: 'number' as const, placeholder: '5000' },
    { key: 'artifactRoot', label: 'Artifact Storage Path', type: 'text' as const, placeholder: '/mlflow/artifacts' },
    { key: 'backendStore', label: 'Backend Store URI', type: 'text' as const, placeholder: 'postgresql://...', advanced: true },
    { key: 'defaultArtifactRoot', label: 'Default Artifact Root', type: 'text' as const, placeholder: 's3://bucket/path', advanced: true },
    { key: 'serveArtifacts', label: 'Serve Artifacts', type: 'boolean' as const, advanced: true },
    { key: 'enablePrometheus', label: 'Enable Prometheus Metrics', type: 'boolean' as const, advanced: true }
  ],
  nadmin: [
    { key: 'port', label: 'Admin UI Port', type: 'number' as const, placeholder: '3021' },
    { key: 'sessionTimeout', label: 'Session Timeout (minutes)', type: 'number' as const, placeholder: '1440', help: '24 hours default' },
    { key: 'enableMetrics', label: 'Enable Metrics Dashboard', type: 'boolean' as const },
    { key: 'enableBackups', label: 'Enable Backup Management', type: 'boolean' as const },
    { key: 'enable2FA', label: 'Require 2FA', type: 'boolean' as const, advanced: true },
    { key: 'maxLoginAttempts', label: 'Max Login Attempts', type: 'number' as const, placeholder: '5', advanced: true },
    { key: 'lockoutDuration', label: 'Lockout Duration (minutes)', type: 'number' as const, placeholder: '30', advanced: true }
  ]
}

interface ProjectSetupWizardProps {
  mode?: 'new' | 'edit' | 'reset'
}

export function ProjectSetupWizard({ mode = 'new' }: ProjectSetupWizardProps) {
  const router = useRouter()
  const { 
    projectStatus, 
    checkProjectStatus,
    setProjectSetup
  } = useProjectStore()
  
  const [currentStep, setCurrentStep] = useState<WizardStep>('initial')
  const [isExecuting, setIsExecuting] = useState(false)
  const [commandOutput, setCommandOutput] = useState('')
  const [showCliInstructions, setShowCliInstructions] = useState(false)
  const [domainPreview, setDomainPreview] = useState('https://admin.localhost')
  const [showPassword, setShowPassword] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({})
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [showTemplateInfo, setShowTemplateInfo] = useState(false)
  const [showFrameworkExamples, setShowFrameworkExamples] = useState(false)
  const [showWhyRegister, setShowWhyRegister] = useState(false)
  
  // Refs for auto-focus
  const serviceNameRefs = useRef<{ [key: number]: HTMLInputElement | null }>({})
  const appNameRefs = useRef<{ [key: number]: HTMLInputElement | null }>({})
  
  const [config, setConfig] = useState<ProjectConfig>({
    // Initial Setup
    projectName: 'my_project',
    environment: 'dev',
    domain: 'localhost',
    adminEmail: '',
    databaseName: 'my_database',
    databasePassword: 'postgres_dev_password',
    hasuraAdminSecret: 'hasura-admin-secret-dev',
    jwtSecret: 'development-secret-key-minimum-32-characters-long',
    backupEnabled: false,
    backupSchedule: '0 2 * * *',
    
    // Required Services Configuration
    postgres: {
      version: '16-alpine',
      port: 5432,
      maxConnections: 100,
      poolingEnabled: 'auto'
    },
    hasura: {
      version: 'v2.44.0',
      consoleEnabled: true,
      devMode: true,
      cors: '*'
    },
    nginx: {
      sslMode: 'local',
      httpPort: 80,
      httpsPort: 443
    },
    auth: {
      jwtExpiresIn: 900,
      refreshExpiresIn: 2592000,
      smtpHost: 'mailpit',
      smtpPort: 1025,
      smtpSender: 'noreply@localhost'
    },
    storage: {
      accessKey: 'storage-access-key-dev',
      secretKey: 'storage-secret-key-dev',
      bucket: 'nself',
      region: 'us-east-1'
    },
    
    // Optional Services
    optionalServices: {
      redis: false,
      mail: {
        enabled: false,
        provider: 'auto'  // Auto selects best option based on environment
      },
      monitoring: false,
      search: {
        enabled: false,
        provider: 'auto'  // Auto selects best option based on environment
      },
      mlflow: false,
      adminUI: true  // Always enabled since we're using it
    },
    
    // User Services
    customServices: [],
    
    // Frontend Apps
    frontendApps: [],
    
    // Optional Services Configuration (initialized with defaults)
    redisConfig: {
      port: 6379,
      version: '7-alpine',
      maxMemory: '256mb'
    },
    mailConfig: {
      smtpHost: '',
      smtpPort: 587,
      smtpUser: '',
      smtpPass: '',
      smtpSecure: true,
      fromEmail: ''
    },
    monitoringConfig: {
      grafanaPort: 3000,
      prometheusPort: 9090,
      lokiPort: 3100,
      jaegerPort: 16686
    },
    searchConfig: {
      port: 7700,
      apiKey: ''
    },
    mlflowConfig: {
      trackingPort: 5000,
      artifactRoot: '/mlflow/artifacts'
    },
    nadminConfig: {
      port: 3021,
      sessionTimeout: 1440,
      enableMetrics: true,
      enableBackups: true
    }
  })

  const steps: WizardStep[] = ['initial', 'required-services', 'optional-services', 'user-services', 'apps', 'review']
  const currentStepIndex = steps.indexOf(currentStep)

  // Domain validation function
  const validateDomain = (domain: string, environment: string): string | null => {
    if (!domain) {
      return 'Domain is required'
    }

    const cleanDomain = domain.replace(/^https?:\/\//, '').toLowerCase()

    if (environment === 'dev') {
      const devPatterns = [
        /^localhost$/,
        /^127\.0\.0\.1$/,
        /^0\.0\.0\.0$/,
        /^192\.168\.\d{1,3}\.\d{1,3}$/,
        /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
        /^172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/,
        /\.local$/,
        /\.localhost$/,
        /^local\.nself\.org$/,
        /\.test$/,
        /\.dev$/
      ]
      
      const isValidDev = devPatterns.some(pattern => pattern.test(cleanDomain))
      if (!isValidDev) {
        return 'For development, use localhost, *.local, local.nself.org, or a local IP address'
      }
    } else {
      const domainPattern = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/
      
      if (!domainPattern.test(cleanDomain)) {
        return 'Must be a valid domain (e.g., example.com, app.example.com)'
      }

      const invalidTLDs = ['.local', '.localhost', '.test', '.dev', '.internal']
      if (invalidTLDs.some(tld => cleanDomain.endsWith(tld))) {
        return `${environment === 'staging' ? 'Staging' : 'Production'} requires a real domain with valid TLD (e.g., .com, .org, .io)`
      }

      if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(cleanDomain)) {
        return 'IP addresses are not recommended for production. Please use a domain name.'
      }
    }

    return null
  }

  // Validate all initial setup fields
  const validateInitialSetup = (): boolean => {
    const errors: { [key: string]: string } = {}

    if (!config.projectName) {
      errors.projectName = 'Project name is required'
    } else if (!/^[a-z0-9_-]+$/.test(config.projectName)) {
      errors.projectName = 'Only lowercase letters, numbers, hyphens, and underscores allowed'
    }

    const domainError = validateDomain(config.domain, config.environment)
    if (domainError) {
      errors.domain = domainError
    }

    if (!config.databaseName) {
      errors.databaseName = 'Database name is required'
    } else if (!/^[a-z0-9_]+$/.test(config.databaseName)) {
      errors.databaseName = 'Only lowercase letters, numbers, and underscores allowed'
    }

    if (config.environment === 'prod' && config.databasePassword.length < 12) {
      errors.databasePassword = 'Production requires a strong password (12+ characters)'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Save state to database
  const saveState = useCallback(async () => {
    try {
      const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('nself-csrf='))
        ?.split('=')[1]
      
      // Update .env.local file with current config
      await fetch('/api/wizard/update-env', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken || ''
        },
        body: JSON.stringify({ config, step: currentStep })
      })
    } catch (error) {
      console.error('Failed to save to .env.local:', error)
    }
  }, [config, currentStep])

  // Load config from .env.local file (or init if doesn't exist)
  useEffect(() => {
    const loadState = async () => {
      try {
        const csrfToken = document.cookie
          .split('; ')
          .find(row => row.startsWith('nself-csrf='))
          ?.split('=')[1]
        
        if (mode === 'reset') {
          // Reset mode - run nself reset first, then init fresh
          const resetResponse = await fetch('/api/nself/reset', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-csrf-token': csrfToken || ''
            },
            body: JSON.stringify({ mode: 'reset' })
          })
          
          if (resetResponse.ok) {
            // Now run init to create fresh .env.local
            const initResponse = await fetch('/api/wizard/init')
            const initData = await initResponse.json()
            
            if (initData.success && initData.config) {
              setConfig(initData.config)
              setDomainPreview(`https://admin.${initData.config.domain || 'localhost'}`)
              setCurrentStep('initial')
            }
          }
        } else if (mode === 'edit') {
          // Edit mode - run nself reset but preserve .env.local
          const resetResponse = await fetch('/api/nself/reset', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-csrf-token': csrfToken || ''
            },
            body: JSON.stringify({ mode: 'edit' })
          })
          
          if (resetResponse.ok) {
            const resetData = await resetResponse.json()
            if (resetData.config) {
              // Use config from preserved .env.local
              setConfig(resetData.config)
              setDomainPreview(`https://admin.${resetData.config.domain || 'localhost'}`)
              // Jump to review step since we're editing
              setCurrentStep('review')
            }
          }
        } else {
          // New mode - check if .env.local exists, if not run nself init
          const initResponse = await fetch('/api/wizard/init')
          const initData = await initResponse.json()
          
          if (initData.success && initData.config) {
            setConfig(initData.config)
            setDomainPreview(`https://admin.${initData.config.domain || 'localhost'}`)
            setCurrentStep('initial')
          }
        }
      } catch (error) {
        console.error('Failed to load state:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadState()
    checkProjectStatus()
  }, [checkProjectStatus, mode])

  // Save state whenever config or step changes
  useEffect(() => {
    if (!isLoading) {
      saveState()
    }
  }, [config, currentStep, isLoading, saveState])

  useEffect(() => {
    if (projectStatus === 'running') {
      setTimeout(() => {
        setProjectSetup(true)
      }, 2000)
    }
  }, [projectStatus, setProjectSetup])

  const handleNext = () => {
    if (currentStep === 'initial') {
      if (!validateInitialSetup()) {
        return
      }
    }
    
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1])
      setValidationErrors({})
    }
  }

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1])
    }
  }

  const clearWizardState = async () => {
    try {
      await fetch('/api/wizard/state', {
        method: 'DELETE'
      })
      window.location.reload()
    } catch (error) {
      console.error('Failed to clear wizard state:', error)
    }
  }

  const handleBuild = async () => {
    try {
      setIsExecuting(true)
      setCommandOutput('Initializing project...')

      // Get CSRF token from cookie
      const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('nself-csrf='))
        ?.split('=')[1]

      // Convert config to env format
      const envData: Record<string, any> = {
        PROJECT_NAME: config.projectName,
        ENV: config.environment,
        BASE_DOMAIN: config.domain,
        ADMIN_EMAIL: config.adminEmail,
        POSTGRES_DB: config.databaseName,
        POSTGRES_PASSWORD: config.databasePassword,
        HASURA_GRAPHQL_ADMIN_SECRET: config.hasuraAdminSecret,
        HASURA_JWT_KEY: config.jwtSecret,
        BACKUP_ENABLED: config.backupEnabled,
        BACKUP_SCHEDULE: config.backupSchedule,
        // Required services
        POSTGRES_VERSION: config.postgres.version,
        POSTGRES_PORT: config.postgres.port,
        DB_MAX_CONNECTIONS: config.postgres.maxConnections,
        DB_POOLER_ENABLED: config.postgres.poolingEnabled,
        HASURA_VERSION: config.hasura.version,
        HASURA_GRAPHQL_ENABLE_CONSOLE: config.hasura.consoleEnabled,
        HASURA_GRAPHQL_DEV_MODE: config.hasura.devMode,
        HASURA_GRAPHQL_CORS_DOMAIN: config.hasura.cors,
        SSL_MODE: config.nginx.sslMode,
        NGINX_HTTP_PORT: config.nginx.httpPort,
        NGINX_HTTPS_PORT: config.nginx.httpsPort,
        AUTH_JWT_ACCESS_TOKEN_EXPIRES_IN: config.auth.jwtExpiresIn,
        AUTH_JWT_REFRESH_TOKEN_EXPIRES_IN: config.auth.refreshExpiresIn,
        AUTH_SMTP_HOST: config.auth.smtpHost,
        AUTH_SMTP_PORT: config.auth.smtpPort,
        AUTH_SMTP_SENDER: config.auth.smtpSender,
        S3_ACCESS_KEY: config.storage.accessKey,
        S3_SECRET_KEY: config.storage.secretKey,
        S3_BUCKET: config.storage.bucket,
        S3_REGION: config.storage.region,
        // Optional services
        REDIS_ENABLED: config.optionalServices.redis,
        MAILPIT_ENABLED: config.optionalServices.mail.enabled && config.optionalServices.mail.provider === 'mailpit',
        MONITORING_ENABLED: config.optionalServices.monitoring,
        SEARCH_ENABLED: config.optionalServices.search.enabled,
        MLFLOW_ENABLED: config.optionalServices.mlflow,
        ADMIN_ENABLED: config.optionalServices.adminUI,
      }

      // Add user services
      config.customServices.forEach((service, index) => {
        envData[`CS_${index + 1}`] = `${service.name},${service.framework}`
        envData[`CS_${index + 1}_PORT`] = service.port
        envData[`CS_${index + 1}_ROUTE`] = service.route
      })

      // Add frontend apps
      if (config.frontendApps.length > 0) {
        envData['FRONTEND_APPS'] = config.frontendApps
          .filter(app => app.enabled)
          .map(app => `${app.name}:${app.displayName}:${app.tablePrefix}:${app.port}:${app.subdomain}`)
          .join(',')
        
        // Generate nginx routing config for dev environment
        if (config.environment === 'dev') {
          envData['NGINX_FRONTEND_ROUTES'] = config.frontendApps
            .filter(app => app.enabled && app.deployment === 'local')
            .map(app => `${app.subdomain}.${config.domain}:localhost:${app.port}`)
            .join(',')
        }
      }

      // Make sure .env.local is fully updated with final config
      await fetch('/api/wizard/update-env', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken || ''
        },
        body: JSON.stringify({ config, step: 'review' })
      })

      setCommandOutput('Building project with nself build...')

      // Call nself build which reads from .env.local
      const buildResponse = await fetch('/api/nself/build', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken || ''
        }
      })

      if (!buildResponse.ok) {
        throw new Error('Failed to build project')
      }

      setCommandOutput('Project built successfully!')
      
      // Clear wizard state after successful build
      await fetch('/api/wizard/state', {
        method: 'DELETE',
        headers: {
          'x-csrf-token': csrfToken || ''
        }
      })
      
      // Redirect to start page after build using Next.js router
      setTimeout(() => {
        router.push('/start')
      }, 2000)
    } catch (error) {
      console.error('Build failed:', error)
      setCommandOutput(`Build failed: ${error}`)
      setIsExecuting(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 'initial':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Initial Project Configuration</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Essential settings and backup configuration for your project.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  value={config.projectName}
                  onChange={(e) => {
                    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '')
                    setConfig({ ...config, projectName: value })
                    if (validationErrors.projectName) {
                      setValidationErrors({ ...validationErrors, projectName: '' })
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white transition-all ${
                    validationErrors.projectName 
                      ? 'border-red-500 dark:border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.1)] dark:shadow-[0_0_0_3px_rgba(239,68,68,0.2)] focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500' 
                      : 'border-zinc-300 dark:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
                  }`}
                  placeholder="my_project"
                />
                {validationErrors.projectName && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{validationErrors.projectName}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Environment
                </label>
                <select
                  value={config.environment}
                  onChange={(e) => {
                    const newEnv = e.target.value as ProjectConfig['environment']
                    setConfig({ ...config, environment: newEnv })
                    const error = validateDomain(config.domain, newEnv)
                    setValidationErrors({ ...validationErrors, domain: error || '' })
                  }}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="dev">Development</option>
                  <option value="staging">Staging</option>
                  <option value="prod">Production</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Domain
                  <span className="relative inline-block ml-1 group">
                    <span className="cursor-help">ⓘ</span>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 w-72 p-2 bg-zinc-900 text-white text-xs rounded-lg shadow-lg">
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-zinc-900 rotate-45"></div>
                      <strong>Local development:</strong> Use &quot;localhost&quot; or &quot;local.nself.org&quot;<br/><br/>
                      <strong>Staging/Production:</strong> Your primary domain. Please note you can still define multiple domains per app, remote schema, or API endpoint later.
                    </div>
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 ml-2">(i.e. {domainPreview})</span>
                </label>
                <input
                  type="text"
                  value={config.domain}
                  onChange={(e) => {
                    const value = e.target.value.toLowerCase().trim()
                    setConfig({ ...config, domain: value })
                    setDomainPreview(`https://admin.${value || 'localhost'}`)
                    const error = validateDomain(value, config.environment)
                    setValidationErrors({ ...validationErrors, domain: error || '' })
                  }}
                  className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white transition-all ${
                    validationErrors.domain 
                      ? 'border-red-500 dark:border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.1)] dark:shadow-[0_0_0_3px_rgba(239,68,68,0.2)] focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500' 
                      : 'border-zinc-300 dark:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
                  }`}
                  placeholder={config.environment === 'dev' ? 'localhost' : 'example.com'}
                />
                {validationErrors.domain && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{validationErrors.domain}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Admin Email (optional)
                </label>
                <input
                  type="email"
                  value={config.adminEmail}
                  onChange={(e) => setConfig({ ...config, adminEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="admin@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Database Name
                </label>
                <input
                  type="text"
                  value={config.databaseName}
                  onChange={(e) => {
                    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')
                    setConfig({ ...config, databaseName: value })
                    if (validationErrors.databaseName) {
                      setValidationErrors({ ...validationErrors, databaseName: '' })
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white transition-all ${
                    validationErrors.databaseName 
                      ? 'border-red-500 dark:border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.1)] dark:shadow-[0_0_0_3px_rgba(239,68,68,0.2)] focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500' 
                      : 'border-zinc-300 dark:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
                  }`}
                  placeholder="my_database"
                />
                {validationErrors.databaseName && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{validationErrors.databaseName}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Database Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={config.databasePassword}
                    onChange={(e) => {
                      setConfig({ ...config, databasePassword: e.target.value })
                      if (validationErrors.databasePassword) {
                        setValidationErrors({ ...validationErrors, databasePassword: '' })
                      }
                    }}
                    className={`w-full px-3 py-2 pr-10 border rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white transition-all ${
                      validationErrors.databasePassword 
                        ? 'border-red-500 dark:border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.1)] dark:shadow-[0_0_0_3px_rgba(239,68,68,0.2)] focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500' 
                        : 'border-zinc-300 dark:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
                    }`}
                    placeholder="••••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {validationErrors.databasePassword && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{validationErrors.databasePassword}</p>
                )}
              </div>
            </div>

            {/* Backup Configuration */}
            <div className="border-t border-zinc-200 dark:border-zinc-700 pt-6">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.backupEnabled}
                  onChange={(e) => setConfig({ ...config, backupEnabled: e.target.checked })}
                  className="text-blue-600"
                />
                <span className="text-zinc-700 dark:text-zinc-300">
                  Enable Automatic Backups (host cron job)
                  <span className="relative inline-block ml-1 group">
                    <span className="cursor-help text-xs">ⓘ</span>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 w-64 p-2 bg-zinc-900 text-white text-xs rounded-lg shadow-lg">
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-zinc-900 rotate-45"></div>
                      Schedules backups via host system cron. The nself CLI runs backup operations using temporary containers to export database and volumes. Default: Daily at 2 AM. Not a Docker service.
                    </div>
                  </span>
                </span>
              </label>
              {config.backupEnabled && (
                <div className="mt-2">
                  <input
                    type="text"
                    value={config.backupSchedule}
                    onChange={(e) => setConfig({ ...config, backupSchedule: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                    placeholder="0 2 * * * (daily at 2 AM)"
                  />
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Cron format: minute hour day month weekday
                  </p>
                </div>
              )}
            </div>
            
            {config.environment === 'prod' && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  <strong>Production Mode:</strong> Make sure to use strong passwords and secrets. Consider moving sensitive values to .env.secrets file.
                </p>
              </div>
            )}
            
            {/* Use CLI instead option */}
            <div className="border-t border-zinc-200 dark:border-zinc-700 pt-6">
              <button
                type="button"
                onClick={() => setShowCliInstructions(!showCliInstructions)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                Use CLI instead
              </button>
              {showCliInstructions && (
                <div className="mt-4 p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-2">Run these commands in your terminal:</p>
                  <code className="block p-2 bg-zinc-900 dark:bg-zinc-950 text-zinc-100 rounded text-xs whitespace-pre">
{`# Initialize your project with all environment files
nself init --full ${config.projectName}

# Edit .env.local file to configure your settings

# Build the project
nself build

# Start services
nself start`}
                  </code>
                </div>
              )}
            </div>
          </div>
        )

      case 'required-services':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Required Services Configuration</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Configure core services that power your nself stack.
            </p>
            
            <div className="space-y-4">
              {/* PostgreSQL */}
              <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <Database className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-zinc-900 dark:text-white">PostgreSQL</h4>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                        Primary database with advanced features
                      </p>
                      <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
                        Version: {config.postgres.version} | Port: {config.postgres.port} | Max Connections: {config.postgres.maxConnections}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedService('postgres')}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  >
                    <Wrench className="h-4 w-4 inline mr-1" />
                    Settings
                  </button>
                </div>
              </div>

              {/* Hasura */}
              <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <Server className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-zinc-900 dark:text-white">Hasura GraphQL</h4>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                        Instant GraphQL API on your database
                      </p>
                      <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
                        Version: {config.hasura.version} | Console: {config.hasura.consoleEnabled ? 'Enabled' : 'Disabled'} | Dev Mode: {config.hasura.devMode ? 'On' : 'Off'}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedService('hasura')}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  >
                    <Wrench className="h-4 w-4 inline mr-1" />
                    Settings
                  </button>
                </div>
              </div>

              {/* Nginx */}
              <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <Globe className="h-5 w-5 text-purple-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-zinc-900 dark:text-white">Nginx Proxy</h4>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                        Reverse proxy and SSL termination
                      </p>
                      <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
                        SSL: {config.nginx.sslMode} | HTTP: {config.nginx.httpPort} | HTTPS: {config.nginx.httpsPort}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedService('nginx')}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  >
                    <Wrench className="h-4 w-4 inline mr-1" />
                    Settings
                  </button>
                </div>
              </div>

              {/* Auth Service */}
              <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <Lock className="h-5 w-5 text-red-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-zinc-900 dark:text-white">Authentication Service</h4>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                        JWT-based authentication system
                      </p>
                      <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
                        JWT Expires: {config.auth.jwtExpiresIn}s | SMTP: {config.auth.smtpHost}:{config.auth.smtpPort}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedService('auth')}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  >
                    <Wrench className="h-4 w-4 inline mr-1" />
                    Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        )

      case 'optional-services':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Optional Services</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                  Click on any service card to enable it. Once enabled, you can configure its settings.
                </p>
              </div>
              <button
                onClick={() => {
                  setConfig({
                    ...config,
                    optionalServices: {
                      redis: true,
                      mail: { enabled: true, provider: config.optionalServices.mail.provider },
                      monitoring: true,
                      search: { enabled: true, provider: config.optionalServices.search.provider },
                      mlflow: true,
                      adminUI: true
                    }
                  })
                }}
                className="text-xs px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
              >
                Enable All
              </button>
            </div>
            
            <div className="grid gap-4">
              {/* nself-admin - Always Enabled */}
              <div className="border border-green-500 bg-green-50/50 dark:bg-green-900/10 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <Layout className="h-5 w-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-zinc-900 dark:text-white">nself Admin Dashboard</h4>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                        This admin panel you&apos;re currently using (required)
                      </p>
                      <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
                        Port: 3021 | Status: Active | Version: Latest
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded">
                      Required
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedService('nadmin')
                      }}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                    >
                      <Wrench className="h-4 w-4 inline mr-1" />
                      Settings
                    </button>
                  </div>
                </div>
              </div>
              {/* Redis Cache */}
              <div 
                onClick={() => {
                  if (!config.optionalServices.redis) {
                    setConfig({ 
                      ...config, 
                      optionalServices: { ...config.optionalServices, redis: true }
                    })
                  }
                }}
                className={`border rounded-lg p-4 transition-all ${
                  config.optionalServices.redis 
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10' 
                    : 'border-zinc-300 dark:border-zinc-600 bg-zinc-50/50 dark:bg-zinc-800/50 cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-500'
                }`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <Database className={`h-5 w-5 mt-0.5 transition-colors ${
                      config.optionalServices.redis ? 'text-red-500' : 'text-zinc-400 dark:text-zinc-600'
                    }`} />
                    <div className="flex-1">
                      <h4 className={`font-medium ${
                        config.optionalServices.redis 
                          ? 'text-zinc-900 dark:text-white' 
                          : 'text-zinc-500 dark:text-zinc-400'
                      }`}>Redis Cache</h4>
                      <p className={`text-sm mt-1 ${
                        config.optionalServices.redis 
                          ? 'text-zinc-600 dark:text-zinc-400' 
                          : 'text-zinc-400 dark:text-zinc-500'
                      }`}>
                        In-memory data store for caching, sessions, and pub/sub
                      </p>
                      {config.optionalServices.redis && (
                        <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
                          Port: 6379 | Persistence: Enabled | Max Memory: 256MB
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    {config.optionalServices.redis ? (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setConfig({ 
                              ...config, 
                              optionalServices: { ...config.optionalServices, redis: false }
                            })
                          }}
                          className="text-xs px-2 py-1 rounded cursor-pointer transition-colors bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50"
                        >
                          Enabled
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedService('redis')
                          }}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                        >
                          <Wrench className="h-4 w-4 inline mr-1" />
                          Settings
                        </button>
                      </>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400">
                        Disabled
                      </span>
                    )}
                  </div>
                </div>
              </div>


              {/* Mail Service */}
              <div 
                onClick={() => {
                  if (!config.optionalServices.mail.enabled) {
                    setConfig({ 
                      ...config, 
                      optionalServices: { 
                        ...config.optionalServices, 
                        mail: { ...config.optionalServices.mail, enabled: true }
                      }
                    })
                  }
                }}
                className={`border rounded-lg p-4 transition-all ${
                  config.optionalServices.mail.enabled 
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10' 
                    : 'border-zinc-300 dark:border-zinc-600 bg-zinc-50/50 dark:bg-zinc-800/50 cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-500'
                }`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <Mail className={`h-5 w-5 mt-0.5 transition-colors ${
                      config.optionalServices.mail.enabled ? 'text-purple-500' : 'text-zinc-400 dark:text-zinc-600'
                    }`} />
                    <div className="flex-1">
                      <h4 className={`font-medium ${
                        config.optionalServices.mail.enabled 
                          ? 'text-zinc-900 dark:text-white' 
                          : 'text-zinc-500 dark:text-zinc-400'
                      }`}>Mail Service</h4>
                      <p className={`text-sm mt-1 ${
                        config.optionalServices.mail.enabled 
                          ? 'text-zinc-600 dark:text-zinc-400' 
                          : 'text-zinc-400 dark:text-zinc-500'
                      }`}>
                        Email delivery and testing service
                      </p>
                      {config.optionalServices.mail.enabled && (
                        <>
                          <div className="mt-2">
                            <select
                              value={config.optionalServices.mail.provider}
                              onChange={(e) => {
                                e.stopPropagation()
                                setConfig({
                                  ...config,
                                  optionalServices: {
                                    ...config.optionalServices,
                                    mail: {
                                      ...config.optionalServices.mail,
                                      provider: e.target.value as any
                                    }
                                  }
                                })
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="text-xs px-2 py-1 border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                            >
                              <option value="auto">Auto ({config.environment === 'dev' ? 'Mailpit' : config.environment === 'staging' ? 'SendGrid' : 'SendGrid/SES'})</option>
                              <optgroup label="Development">
                                <option value="mailpit">Mailpit</option>
                              </optgroup>
                              <optgroup label="Popular Services">
                                <option value="sendgrid">SendGrid</option>
                                <option value="ses">AWS SES</option>
                                <option value="mailgun">Mailgun</option>
                                <option value="postmark">Postmark</option>
                                <option value="resend">Resend</option>
                                <option value="brevo">Brevo (SendinBlue)</option>
                              </optgroup>
                              <optgroup label="Email Providers">
                                <option value="gmail">Gmail</option>
                                <option value="outlook">Outlook/Office365</option>
                              </optgroup>
                              <optgroup label="Other Services">
                                <option value="sparkpost">SparkPost</option>
                                <option value="mandrill">Mandrill</option>
                                <option value="elastic">Elastic Email</option>
                                <option value="smtp2go">SMTP2GO</option>
                                <option value="mailersend">MailerSend</option>
                              </optgroup>
                              <optgroup label="Self-Hosted">
                                <option value="postfix">Postfix</option>
                                <option value="smtp">Custom SMTP</option>
                              </optgroup>
                            </select>
                          </div>
                          <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                            {config.optionalServices.mail.provider === 'auto' && (
                              config.environment === 'dev' ? 'Uses Mailpit - Local email capture with web UI' :
                              config.environment === 'staging' ? 'Uses SendGrid - 100 emails/day free tier' :
                              'Uses SendGrid or AWS SES based on region'
                            )}
                            {config.optionalServices.mail.provider === 'mailpit' && 'SMTP: 1025 | Web UI: 8025'}
                            {config.optionalServices.mail.provider === 'smtp' && 'Custom SMTP configuration'}
                            {config.optionalServices.mail.provider === 'sendgrid' && '100 emails/day free'}
                            {config.optionalServices.mail.provider === 'ses' && '$0.10 per 1000 emails'}
                            {config.optionalServices.mail.provider === 'mailgun' && 'First 1000 emails free'}
                            {config.optionalServices.mail.provider === 'postmark' && 'Transactional specialist'}
                            {config.optionalServices.mail.provider === 'gmail' && 'Personal/workspace account'}
                            {config.optionalServices.mail.provider === 'outlook' && 'Office 365 integration'}
                            {config.optionalServices.mail.provider === 'resend' && 'Developer-friendly API'}
                            {config.optionalServices.mail.provider === 'brevo' && 'Marketing & transactional'}
                            {config.optionalServices.mail.provider === 'sparkpost' && 'Enterprise-ready'}
                            {config.optionalServices.mail.provider === 'mandrill' && 'By Mailchimp'}
                            {config.optionalServices.mail.provider === 'elastic' && 'High volume sender'}
                            {config.optionalServices.mail.provider === 'smtp2go' && 'Reliable delivery'}
                            {config.optionalServices.mail.provider === 'mailersend' && 'Transactional emails'}
                            {config.optionalServices.mail.provider === 'postfix' && 'Self-hosted server'}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    {config.optionalServices.mail.enabled ? (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setConfig({ 
                              ...config, 
                              optionalServices: { 
                                ...config.optionalServices, 
                                mail: { ...config.optionalServices.mail, enabled: false }
                              }
                            })
                          }}
                          className="text-xs px-2 py-1 rounded cursor-pointer transition-colors bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50"
                        >
                          Enabled
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedService('mail')
                          }}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                        >
                          <Wrench className="h-4 w-4 inline mr-1" />
                          Settings
                        </button>
                      </>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400">
                        Disabled
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Monitoring Stack */}
              <div 
                onClick={() => {
                  if (!config.optionalServices.monitoring) {
                    setConfig({ 
                      ...config, 
                      optionalServices: { ...config.optionalServices, monitoring: true }
                    })
                  }
                }}
                className={`border rounded-lg p-4 transition-all ${
                  config.optionalServices.monitoring 
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10' 
                    : 'border-zinc-300 dark:border-zinc-600 bg-zinc-50/50 dark:bg-zinc-800/50 cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-500'
                }`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <BarChart className={`h-5 w-5 mt-0.5 transition-colors ${
                      config.optionalServices.monitoring ? 'text-orange-500' : 'text-zinc-400 dark:text-zinc-600'
                    }`} />
                    <div className="flex-1">
                      <h4 className={`font-medium ${
                        config.optionalServices.monitoring 
                          ? 'text-zinc-900 dark:text-white' 
                          : 'text-zinc-500 dark:text-zinc-400'
                      }`}>Monitoring Bundle <span className="text-xs font-normal">(5 services)</span></h4>
                      <p className={`text-sm mt-1 ${
                        config.optionalServices.monitoring 
                          ? 'text-zinc-600 dark:text-zinc-400' 
                          : 'text-zinc-400 dark:text-zinc-500'
                      }`}>
                        Complete observability: Prometheus, Grafana, Loki, Tempo, Alertmanager
                      </p>
                      {config.optionalServices.monitoring && (
                        <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
                          <div>• Prometheus (9090) - Metrics collection</div>
                          <div>• Grafana (3000) - Visualization dashboards</div>
                          <div>• Loki (3100) - Log aggregation</div>
                          <div>• Tempo (3200) - Distributed tracing</div>
                          <div>• Alertmanager (9093) - Alert routing</div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    {config.optionalServices.monitoring ? (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setConfig({ 
                              ...config, 
                              optionalServices: { ...config.optionalServices, monitoring: false }
                            })
                          }}
                          className="text-xs px-2 py-1 rounded cursor-pointer transition-colors bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50"
                        >
                          Enabled
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedService('monitoring')
                          }}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                        >
                          <Wrench className="h-4 w-4 inline mr-1" />
                          Settings
                        </button>
                      </>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400">
                        Disabled
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Search Service */}
              <div 
                onClick={() => {
                  if (!config.optionalServices.search.enabled) {
                    setConfig({ 
                      ...config, 
                      optionalServices: { 
                        ...config.optionalServices, 
                        search: { ...config.optionalServices.search, enabled: true }
                      }
                    })
                  }
                }}
                className={`border rounded-lg p-4 transition-all ${
                  config.optionalServices.search.enabled 
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10' 
                    : 'border-zinc-300 dark:border-zinc-600 bg-zinc-50/50 dark:bg-zinc-800/50 cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-500'
                }`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <Search className={`h-5 w-5 mt-0.5 transition-colors ${
                      config.optionalServices.search.enabled ? 'text-cyan-500' : 'text-zinc-400 dark:text-zinc-600'
                    }`} />
                    <div className="flex-1">
                      <h4 className={`font-medium ${
                        config.optionalServices.search.enabled 
                          ? 'text-zinc-900 dark:text-white' 
                          : 'text-zinc-500 dark:text-zinc-400'
                      }`}>Search Service</h4>
                      <p className={`text-sm mt-1 ${
                        config.optionalServices.search.enabled 
                          ? 'text-zinc-600 dark:text-zinc-400' 
                          : 'text-zinc-400 dark:text-zinc-500'
                      }`}>
                        Full-text search engine for your application
                      </p>
                      {config.optionalServices.search.enabled && (
                        <>
                          <div className="mt-2">
                            <select
                              value={config.optionalServices.search.provider}
                              onChange={(e) => {
                                e.stopPropagation()
                                setConfig({
                                  ...config,
                                  optionalServices: {
                                    ...config.optionalServices,
                                    search: {
                                      ...config.optionalServices.search,
                                      provider: e.target.value as any
                                    }
                                  }
                                })
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="text-xs px-2 py-1 border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                            >
                              <option value="auto">Auto ({config.environment === 'dev' ? 'MeiliSearch' : 'MeiliSearch/Elastic'})</option>
                              <optgroup label="Self-Hosted">
                                <option value="meilisearch">MeiliSearch</option>
                                <option value="elasticsearch">Elasticsearch</option>
                                <option value="opensearch">OpenSearch</option>
                                <option value="typesense">Typesense</option>
                                <option value="sonic">Sonic</option>
                              </optgroup>
                              <optgroup label="Database">
                                <option value="postgres">PostgreSQL FTS</option>
                              </optgroup>
                              <optgroup label="Cloud Services">
                                <option value="algolia">Algolia</option>
                              </optgroup>
                            </select>
                          </div>
                          <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                            {config.optionalServices.search.provider === 'auto' && (
                              config.environment === 'dev' ? 'Uses MeiliSearch - Fast, typo-tolerant, minimal resources' :
                              config.environment === 'staging' ? 'Uses MeiliSearch - Good for up to 100K documents' :
                              'Uses MeiliSearch or Elasticsearch based on scale'
                            )}
                            {config.optionalServices.search.provider === 'meilisearch' && 'Port: 7700 | Typo-tolerant | Fast'}
                            {config.optionalServices.search.provider === 'elasticsearch' && 'Port: 9200 | Most powerful'}
                            {config.optionalServices.search.provider === 'opensearch' && 'Port: 9200 | AWS fork of ES'}
                            {config.optionalServices.search.provider === 'typesense' && 'Port: 8108 | Real-time search'}
                            {config.optionalServices.search.provider === 'sonic' && 'Port: 1491 | Ultra-fast'}
                            {config.optionalServices.search.provider === 'postgres' && 'Built-in full-text search'}
                            {config.optionalServices.search.provider === 'algolia' && 'Cloud-based | Instant search'}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    {config.optionalServices.search.enabled ? (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setConfig({ 
                              ...config, 
                              optionalServices: { 
                                ...config.optionalServices, 
                                search: { ...config.optionalServices.search, enabled: false }
                              }
                            })
                          }}
                          className="text-xs px-2 py-1 rounded cursor-pointer transition-colors bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50"
                        >
                          Enabled
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedService('search')
                          }}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                        >
                          <Wrench className="h-4 w-4 inline mr-1" />
                          Settings
                        </button>
                      </>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400">
                        Disabled
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* MLFlow */}
              <div 
                onClick={() => {
                  if (!config.optionalServices.mlflow) {
                    setConfig({ 
                      ...config, 
                      optionalServices: { ...config.optionalServices, mlflow: true }
                    })
                  }
                }}
                className={`border rounded-lg p-4 transition-all ${
                  config.optionalServices.mlflow 
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10' 
                    : 'border-zinc-300 dark:border-zinc-600 bg-zinc-50/50 dark:bg-zinc-800/50 cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-500'
                }`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <BarChart className={`h-5 w-5 mt-0.5 transition-colors ${
                      config.optionalServices.mlflow ? 'text-indigo-500' : 'text-zinc-400 dark:text-zinc-600'
                    }`} />
                    <div className="flex-1">
                      <h4 className={`font-medium ${
                        config.optionalServices.mlflow 
                          ? 'text-zinc-900 dark:text-white' 
                          : 'text-zinc-500 dark:text-zinc-400'
                      }`}>MLFlow</h4>
                      <p className={`text-sm mt-1 ${
                        config.optionalServices.mlflow 
                          ? 'text-zinc-600 dark:text-zinc-400' 
                          : 'text-zinc-400 dark:text-zinc-500'
                      }`}>
                        ML lifecycle platform for experiments, models, and deployments
                      </p>
                      {config.optionalServices.mlflow && (
                        <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
                          Port: 5000 | Backend: PostgreSQL | Artifacts: MinIO
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    {config.optionalServices.mlflow ? (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setConfig({ 
                              ...config, 
                              optionalServices: { ...config.optionalServices, mlflow: false }
                            })
                          }}
                          className="text-xs px-2 py-1 rounded cursor-pointer transition-colors bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50"
                        >
                          Enabled
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedService('mlflow')
                          }}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                        >
                          <Wrench className="h-4 w-4 inline mr-1" />
                          Settings
                        </button>
                      </>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400">
                        Disabled
                      </span>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )

      case 'user-services':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Custom Backend Services</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                  Add your own backend services using templates or custom configuration.
                </p>
              </div>
              <button
                onClick={() => {
                  const newService = {
                    name: `service_${config.customServices.length + 1}`,
                    framework: 'nest',
                    port: 4000 + config.customServices.length,
                    route: ''
                  }
                  const newIndex = config.customServices.length
                  setConfig({
                    ...config,
                    customServices: [...config.customServices, newService]
                  })
                  // Auto-focus the new service name input
                  setTimeout(() => {
                    serviceNameRefs.current[newIndex]?.focus()
                    serviceNameRefs.current[newIndex]?.select()
                  }, 100)
                }}
                className="text-sm px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 rounded-lg transition-colors"
              >
                + Add Service
              </button>
            </div>
            
            {/* Service Templates Info */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Available Service Templates</p>
                </div>
                <button
                  onClick={() => setShowTemplateInfo(!showTemplateInfo)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                  {showTemplateInfo ? '▼ Hide Details' : '▶ Show Details'}
                </button>
              </div>
              
              {showTemplateInfo && (
                <div className="grid grid-cols-3 gap-4 text-xs mt-3 text-blue-700 dark:text-blue-300">
                  <div className="space-y-2">
                    <div>
                      <p className="font-semibold text-blue-800 dark:text-blue-200 mb-1">📦 JavaScript / TS</p>
                      <div className="space-y-0.5 ml-2">
                        <div title="Vanilla Node.js runtime">• <b>Node.js</b> (JS/TS) - Vanilla runtime</div>
                        <div title="Minimal web framework">• <b>Express</b> (JS/TS) - Minimal, flexible</div>
                        <div title="High-performance Node.js framework">• <b>Fastify</b> (JS/TS) - 2x faster than Express</div>
                        <div title="Enterprise Node.js framework">• <b>NestJS</b> (JS/TS) - Angular-style architecture</div>
                        <div title="Edge-first framework">• <b>Hono</b> (TS) - Cloudflare Workers ready</div>
                        <div title="Type-safe RPC">• <b>tRPC</b> (TS) - End-to-end type safety</div>
                        <div title="WebSocket library">• <b>Socket.io</b> (JS/TS) - Real-time events</div>
                        <div title="Job queue for Node.js">• <b>BullMQ</b> (JS/TS) - Redis-based queue</div>
                      </div>
                    </div>
                    
                    <div>
                      <p className="font-semibold text-blue-800 dark:text-blue-200 mb-1">🚀 Alternative Runtimes</p>
                      <div className="space-y-0.5 ml-2">
                        <div title="Secure TypeScript runtime">• <b>Deno</b> (TS) - Secure by default</div>
                        <div title="Fast all-in-one JavaScript runtime">• <b>Bun</b> (JS/TS) - Fastest JS runtime</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <p className="font-semibold text-blue-800 dark:text-blue-200 mb-1">🐍 Python</p>
                      <div className="space-y-0.5 ml-2">
                        <div title="Vanilla Python scripts">• <b>Python</b> - Vanilla scripts</div>
                        <div title="Minimal web framework">• <b>Flask</b> (Python) - Simple APIs</div>
                        <div title="Modern async framework">• <b>FastAPI</b> (Python) - Auto docs, async</div>
                        <div title="AI agent framework">• <b>LangChain</b> (Python) - LLM agents</div>
                        <div title="Distributed task queue">• <b>Celery</b> (Python) - Background tasks</div>
                      </div>
                    </div>
                    
                    <div>
                      <p className="font-semibold text-blue-800 dark:text-blue-200 mb-1">🏃 Go</p>
                      <div className="space-y-0.5 ml-2">
                        <div title="Vanilla Go">• <b>Go</b> - Vanilla Go</div>
                        <div title="Fast web framework">• <b>Gin</b> (Go) - Minimal overhead</div>
                        <div title="Express-like Go framework">• <b>Fiber</b> (Go) - Express-inspired</div>
                        <div title="Minimalist Go framework">• <b>Echo</b> (Go) - High performance</div>
                        <div title="RPC framework">• <b>gRPC</b> (Go) - Binary protocol RPC</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <p className="font-semibold text-blue-800 dark:text-blue-200 mb-1">💎 Ruby</p>
                      <div className="space-y-0.5 ml-2">
                        <div title="Vanilla Ruby scripts">• <b>Ruby</b> - Vanilla scripts</div>
                        <div title="Minimal web DSL">• <b>Sinatra</b> (Ruby) - Minimal DSL</div>
                        <div title="Background job processor">• <b>Sidekiq</b> (Ruby) - Background jobs</div>
                      </div>
                    </div>
                    
                    <div>
                      <p className="font-semibold text-blue-800 dark:text-blue-200 mb-1">🔧 System Languages</p>
                      <div className="space-y-0.5 ml-2">
                        <div title="Memory-safe systems language">• <b>Rust</b> - Zero-cost abstractions</div>
                        <div title="JVM language">• <b>Java</b> - Enterprise JVM</div>
                        <div title="Microsoft ecosystem">• <b>C#</b> (.NET) - Cross-platform</div>
                        <div title="Modern JVM language">• <b>Kotlin</b> - Android compatible</div>
                        <div title="Functional JVM language">• <b>Scala</b> - Spark ready</div>
                      </div>
                    </div>
                    
                    <div>
                      <p className="font-semibold text-blue-800 dark:text-blue-200 mb-1">🎯 Other</p>
                      <div className="space-y-0.5 ml-2">
                        <div title="Web scripting language">• <b>PHP</b> - Web scripts</div>
                        <div title="Fault-tolerant BEAM VM">• <b>Elixir</b> - Erlang VM</div>
                        <div title="Embedded scripting">• <b>Lua</b> - Nginx/Redis</div>
                        <div title="Workflow orchestration">• <b>Temporal</b> (Go/Java) - Workflows</div>
                        <div title="Custom Docker image">• <b>Custom</b> - Any Docker image</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {!showTemplateInfo && (
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  Choose from 30+ backend frameworks optimized for APIs, workers, and microservices
                </p>
              )}
            </div>
            
            <div className="space-y-4">
              {config.customServices.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-lg">
                  <Server className="h-12 w-12 text-zinc-400 mx-auto mb-3" />
                  <p className="text-zinc-600 dark:text-zinc-400">No custom services added yet</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-1">
                    Click &quot;Add Service&quot; to create your first backend service
                  </p>
                </div>
              ) : (
                config.customServices.map((service, index) => (
                  <div key={index} className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Terminal className="h-5 w-5 text-blue-500" />
                        <input
                          ref={(el) => { serviceNameRefs.current[index] = el }}
                          type="text"
                          value={service.name}
                          onChange={(e) => {
                            const updatedServices = [...config.customServices]
                            updatedServices[index].name = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '')
                            setConfig({ ...config, customServices: updatedServices })
                          }}
                          className="text-lg font-medium bg-transparent border-b border-transparent hover:border-zinc-300 dark:hover:border-zinc-600 focus:border-blue-500 dark:focus:border-blue-400 outline-none px-1 -ml-1"
                          placeholder="service_name"
                        />
                      </div>
                      <button
                        onClick={() => {
                          const updatedServices = config.customServices.filter((_, i) => i !== index)
                          setConfig({ ...config, customServices: updatedServices })
                        }}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                          Framework
                        </label>
                        <select
                          value={service.framework}
                          onChange={(e) => {
                            const updatedServices = [...config.customServices]
                            updatedServices[index].framework = e.target.value
                            setConfig({ ...config, customServices: updatedServices })
                          }}
                          className="w-full px-2 py-1 text-sm border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                        >
                          <optgroup label="JavaScript / TS">
                            <option value="nodejs">Node.js</option>
                            <option value="nodejs-ts">Node.js (TS)</option>
                            <option value="express">Express</option>
                            <option value="express-ts">Express (TS)</option>
                            <option value="fastify">Fastify</option>
                            <option value="fastify-ts">Fastify (TS)</option>
                            <option value="nest">NestJS</option>
                            <option value="nest-ts">NestJS (TS)</option>
                            <option value="hono">Hono</option>
                            <option value="trpc">tRPC</option>
                            <option value="socketio">Socket.io</option>
                            <option value="bullmq">BullMQ</option>
                            <option value="bullmq-ts">BullMQ (TS)</option>
                            <option value="deno">Deno</option>
                            <option value="bun">Bun</option>
                          </optgroup>
                          <optgroup label="Python">
                            <option value="python">Python</option>
                            <option value="flask">Flask</option>
                            <option value="fastapi">FastAPI</option>
                            <option value="langchain">LangChain</option>
                            <option value="celery">Celery</option>
                          </optgroup>
                          <optgroup label="Go">
                            <option value="go">Go</option>
                            <option value="gin">Gin</option>
                            <option value="fiber">Fiber</option>
                            <option value="echo">Echo</option>
                            <option value="grpc">gRPC</option>
                          </optgroup>
                          <optgroup label="Ruby">
                            <option value="ruby">Ruby</option>
                            <option value="sinatra">Sinatra</option>
                            <option value="sidekiq">Sidekiq</option>
                          </optgroup>
                          <optgroup label="Rust">
                            <option value="rust">Rust</option>
                          </optgroup>
                          <optgroup label="Java">
                            <option value="java">Java</option>
                            <option value="temporal">Temporal</option>
                          </optgroup>
                          <optgroup label="C# / .NET">
                            <option value="csharp">C# (.NET)</option>
                          </optgroup>
                          <optgroup label="Kotlin">
                            <option value="kotlin">Kotlin</option>
                          </optgroup>
                          <optgroup label="Scala">
                            <option value="scala">Scala</option>
                          </optgroup>
                          <optgroup label="PHP">
                            <option value="php">PHP</option>
                          </optgroup>
                          <optgroup label="Elixir">
                            <option value="elixir">Elixir</option>
                          </optgroup>
                          <optgroup label="Lua">
                            <option value="lua">Lua</option>
                          </optgroup>
                          <optgroup label="Other">
                            <option value="other">Custom Docker</option>
                          </optgroup>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                          Port
                        </label>
                        <input
                          type="number"
                          value={service.port}
                          onChange={(e) => {
                            const updatedServices = [...config.customServices]
                            updatedServices[index].port = parseInt(e.target.value) || 3000
                            setConfig({ ...config, customServices: updatedServices })
                          }}
                          className="w-full px-2 py-1 text-sm border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                          placeholder="4000"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                          Route (Optional)
                          <span className="relative inline-block ml-1 group">
                            <span className="cursor-help text-xs">ⓘ</span>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 w-64 p-2 bg-zinc-900 text-white text-xs rounded-lg shadow-lg">
                              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-zinc-900 rotate-45"></div>
                              Leave empty for no routing, or specify subdomain (e.g., &quot;api&quot; for api.{config.domain}) or full URL
                            </div>
                          </span>
                        </label>
                        <input
                          type="text"
                          value={service.route}
                          onChange={(e) => {
                            const updatedServices = [...config.customServices]
                            updatedServices[index].route = e.target.value
                            setConfig({ ...config, customServices: updatedServices })
                          }}
                          className="w-full px-2 py-1 text-sm border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                          placeholder={`api.${config.domain}`}
                        />
                      </div>
                    </div>
                    
                    {service.route && (
                      <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                        Will be accessible at: {service.route.includes('.') ? service.route : `${service.route}.${config.domain}`}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

          </div>
        )

      case 'apps':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Frontend Applications</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Register frontend apps that will connect to your backend services
                </p>
              </div>
              <button
                onClick={() => {
                  const newApp = {
                    name: `app_${config.frontendApps.length + 1}`,
                    displayName: `App ${config.frontendApps.length + 1}`,
                    tablePrefix: `app${config.frontendApps.length + 1}_`,
                    port: 3000 + config.frontendApps.length + 1,
                    subdomain: `app${config.frontendApps.length + 1}`,
                    framework: 'nextjs',
                    deployment: 'local' as const,
                    enabled: true
                  }
                  const newIndex = config.frontendApps.length
                  setConfig({ ...config, frontendApps: [...config.frontendApps, newApp] })
                  // Auto-focus the new app display name input
                  setTimeout(() => {
                    appNameRefs.current[newIndex]?.focus()
                    appNameRefs.current[newIndex]?.select()
                  }, 100)
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Frontend App</span>
              </button>
            </div>
            
            {/* Why Register Frontend Apps */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Frontend App Registration
                  </p>
                </div>
                <button
                  onClick={() => setShowWhyRegister(!showWhyRegister)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
                >
                  {showWhyRegister ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                  <span>{showWhyRegister ? 'Hide' : 'Show'} Details</span>
                </button>
              </div>
              
              {showWhyRegister && (
                <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                    Why Register Frontend Applications?
                  </p>
                  <div className="space-y-2 text-xs text-blue-700 dark:text-blue-300">
                    <div className="flex items-start space-x-2">
                      <span className="text-blue-500">•</span>
                      <div>
                        <strong>Database Table Isolation:</strong> Each app gets its own table prefix (e.g., app1_users, app2_posts) preventing data collisions in multi-tenant architectures
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-blue-500">•</span>
                      <div>
                        <strong>Development Routing:</strong> Automatic subdomain routing (app.localhost → localhost:3001) for local development without manual nginx config
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-blue-500">•</span>
                      <div>
                        <strong>Backend Service Awareness:</strong> Your backend knows which frontend apps exist, enabling app-specific configurations, permissions, and API responses
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-blue-500">•</span>
                      <div>
                        <strong>Universal Framework Support:</strong> Works with ANY frontend technology - React, Vue, Angular, Swift, Kotlin, Flutter, or even vanilla JavaScript. If it can call APIs or GraphQL, it works!
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setShowFrameworkExamples(!showFrameworkExamples)}
                    className="mt-3 text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
                  >
                    {showFrameworkExamples ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                    <span>{showFrameworkExamples ? 'Hide' : 'Show'} Framework Examples</span>
                  </button>
                  
                  {showFrameworkExamples && (
                    <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
                      <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-2">
                        Example Frontend Technologies (Not Limited To):
                      </p>
                      <div className="grid grid-cols-3 gap-3 text-xs text-blue-600 dark:text-blue-400">
                        <div>
                          <p className="font-semibold mb-1">Web Frameworks</p>
                          <div className="space-y-0.5 ml-2 text-blue-700 dark:text-blue-300">
                            <div>• React/Next.js/Remix</div>
                            <div>• Vue/Nuxt</div>
                            <div>• Angular</div>
                            <div>• Svelte/SvelteKit</div>
                            <div>• Solid.js</div>
                            <div>• Qwik</div>
                          </div>
                        </div>
                        <div>
                          <p className="font-semibold mb-1">Mobile Apps</p>
                          <div className="space-y-0.5 ml-2 text-blue-700 dark:text-blue-300">
                            <div>• React Native</div>
                            <div>• Flutter</div>
                            <div>• Swift/SwiftUI</div>
                            <div>• Kotlin</div>
                            <div>• Ionic</div>
                            <div>• NativeScript</div>
                          </div>
                        </div>
                        <div>
                          <p className="font-semibold mb-1">Desktop & Others</p>
                          <div className="space-y-0.5 ml-2 text-blue-700 dark:text-blue-300">
                            <div>• Electron</div>
                            <div>• Tauri</div>
                            <div>• Unity/Unreal</div>
                            <div>• WPF/.NET</div>
                            <div>• Qt/PyQt</div>
                            <div>• CLI Tools</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Frontend Apps List */}
            <div className="space-y-4">
              {config.frontendApps.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-lg">
                  <Globe className="h-12 w-12 text-zinc-400 mx-auto mb-3" />
                  <p className="text-zinc-600 dark:text-zinc-400">No frontend applications configured yet</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-1">
                    Click &quot;Add Frontend App&quot; to register your first application
                  </p>
                </div>
              ) : (
                config.frontendApps.map((app, index) => (
                  <div key={index} className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Globe className="h-5 w-5 text-blue-500" />
                        <input
                          ref={(el) => { appNameRefs.current[index] = el }}
                          type="text"
                          value={app.displayName}
                          onChange={(e) => {
                            const updatedApps = [...config.frontendApps]
                            updatedApps[index].displayName = e.target.value
                            setConfig({ ...config, frontendApps: updatedApps })
                          }}
                          className="text-lg font-medium bg-transparent border-b border-transparent hover:border-zinc-300 dark:hover:border-zinc-600 focus:border-blue-500 dark:focus:border-blue-400 outline-none px-1 -ml-1"
                          placeholder="App Display Name"
                        />
                      </div>
                      <button
                        onClick={() => {
                          const updatedApps = config.frontendApps.filter((_, i) => i !== index)
                          setConfig({ ...config, frontendApps: updatedApps })
                        }}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div>
                        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                          App Identifier
                        </label>
                        <input
                          type="text"
                          value={app.name}
                          onChange={(e) => {
                            const updatedApps = [...config.frontendApps]
                            updatedApps[index].name = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')
                            setConfig({ ...config, frontendApps: updatedApps })
                          }}
                          className="w-full px-2 py-1 text-sm border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                          placeholder="app_name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                          Table Prefix
                        </label>
                        <input
                          type="text"
                          value={app.tablePrefix}
                          onChange={(e) => {
                            const updatedApps = [...config.frontendApps]
                            updatedApps[index].tablePrefix = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')
                            setConfig({ ...config, frontendApps: updatedApps })
                          }}
                          className="w-full px-2 py-1 text-sm border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                          placeholder="app_"
                        />
                        <p className="text-xs text-zinc-500 mt-0.5">e.g., app_users, app_posts</p>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                          Framework
                        </label>
                        <select
                          value={app.framework}
                          onChange={(e) => {
                            const updatedApps = [...config.frontendApps]
                            updatedApps[index].framework = e.target.value
                            setConfig({ ...config, frontendApps: updatedApps })
                          }}
                          className="w-full px-2 py-1 text-sm border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                        >
                          <optgroup label="React">
                            <option value="nextjs">Next.js</option>
                            <option value="vite-react">Vite React</option>
                            <option value="cra">Create React App</option>
                            <option value="remix">Remix</option>
                          </optgroup>
                          <optgroup label="Vue">
                            <option value="nuxt">Nuxt</option>
                            <option value="vite-vue">Vite Vue</option>
                          </optgroup>
                          <optgroup label="Other">
                            <option value="sveltekit">SvelteKit</option>
                            <option value="solidstart">SolidStart</option>
                            <option value="astro">Astro</option>
                            <option value="angular">Angular</option>
                            <option value="flutter">Flutter Web</option>
                            <option value="other">Other</option>
                          </optgroup>
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                          Local Port
                        </label>
                        <input
                          type="number"
                          value={app.port}
                          onChange={(e) => {
                            const updatedApps = [...config.frontendApps]
                            updatedApps[index].port = parseInt(e.target.value) || 3000
                            setConfig({ ...config, frontendApps: updatedApps })
                          }}
                          className="w-full px-2 py-1 text-sm border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                          placeholder="3001"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                          Dev Subdomain
                        </label>
                        <div className="flex items-center">
                          <input
                            type="text"
                            value={app.subdomain}
                            onChange={(e) => {
                              const updatedApps = [...config.frontendApps]
                              updatedApps[index].subdomain = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
                              setConfig({ ...config, frontendApps: updatedApps })
                            }}
                            className="flex-1 px-2 py-1 text-sm border border-zinc-300 dark:border-zinc-600 rounded-l bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                            placeholder="app"
                          />
                          <span className="px-2 py-1 text-sm bg-zinc-100 dark:bg-zinc-700 border border-l-0 border-zinc-300 dark:border-zinc-600 rounded-r">
                            .{config.domain}
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                          Deployment
                        </label>
                        <select
                          value={app.deployment}
                          onChange={(e) => {
                            const updatedApps = [...config.frontendApps]
                            updatedApps[index].deployment = e.target.value as any
                            setConfig({ ...config, frontendApps: updatedApps })
                          }}
                          className="w-full px-2 py-1 text-sm border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                        >
                          <option value="local">Local/Docker</option>
                          <option value="vercel">Vercel</option>
                          <option value="netlify">Netlify</option>
                          <option value="cloudflare">Cloudflare Pages</option>
                          <option value="other">Other CDN</option>
                        </select>
                      </div>
                    </div>
                    
                    {config.environment === 'dev' && app.deployment === 'local' && (
                      <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs">
                        <p className="text-blue-700 dark:text-blue-300">
                          <b>Dev Routing:</b> {app.subdomain}.{config.domain} → localhost:{app.port}
                        </p>
                        <p className="text-blue-600 dark:text-blue-400 mt-1">
                          Nginx will proxy requests from the subdomain to your local dev server
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )

      case 'review':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Review Configuration & Build Process</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Review your configuration and understand what will be built when you click &quot;Build Project&quot;.
            </p>
            
            {/* Build Process Overview */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3 flex items-center">
                <Package className="h-4 w-4 mr-2" />
                Build Process
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-start">
                  <span className="text-blue-700 dark:text-blue-300 font-mono mr-2">1.</span>
                  <div>
                    <span className="text-blue-900 dark:text-blue-100 font-medium">Write Configuration</span>
                    <p className="text-blue-600 dark:text-blue-400 text-xs mt-0.5">Creates .env.local with all service configurations</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-blue-700 dark:text-blue-300 font-mono mr-2">2.</span>
                  <div>
                    <span className="text-blue-900 dark:text-blue-100 font-medium">Run nself build</span>
                    <p className="text-blue-600 dark:text-blue-400 text-xs mt-0.5">Executes the CLI to generate docker-compose.yml and service configs</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-blue-700 dark:text-blue-300 font-mono mr-2">3.</span>
                  <div>
                    <span className="text-blue-900 dark:text-blue-100 font-medium">Redirect to Start</span>
                    <p className="text-blue-600 dark:text-blue-400 text-xs mt-0.5">Opens the service startup page to launch your stack</p>
                  </div>
                </div>
              </div>
              <div className="mt-3 p-2 bg-blue-100 dark:bg-blue-900/40 rounded">
                <p className="text-xs text-blue-800 dark:text-blue-200">
                  <strong>Target Directory:</strong> {process.env.NSELF_PROJECT_PATH || '../nself-project'}
                </p>
              </div>
            </div>
            
            {/* Project Configuration */}
            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-4">
              <h4 className="font-medium text-zinc-900 dark:text-white mb-3">1. Project Configuration</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-zinc-600 dark:text-zinc-400">Project Name:</div>
                <div className="text-zinc-900 dark:text-white font-medium">{config.projectName}</div>
                <div className="text-zinc-600 dark:text-zinc-400">Environment:</div>
                <div className="text-zinc-900 dark:text-white font-medium">{config.environment}</div>
                <div className="text-zinc-600 dark:text-zinc-400">Domain:</div>
                <div className="text-zinc-900 dark:text-white font-medium">{config.domain}</div>
                <div className="text-zinc-600 dark:text-zinc-400">Database:</div>
                <div className="text-zinc-900 dark:text-white font-medium">{config.databaseName}</div>
              </div>
            </div>

            {/* Required Services */}
            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-4">
              <h4 className="font-medium text-zinc-900 dark:text-white mb-3">2. Required Services</h4>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-zinc-900 dark:text-white">PostgreSQL Database</span>
                  <span className="ml-auto text-xs text-zinc-500">Port {config.postgres?.port || 5432}</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-zinc-900 dark:text-white">Hasura GraphQL Engine</span>
                  <span className="ml-auto text-xs text-zinc-500">Port {config.hasura?.port || 8080}</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-zinc-900 dark:text-white">Nginx Reverse Proxy</span>
                  <span className="ml-auto text-xs text-zinc-500">
                    Port {config.nginx?.httpPort || 80}{config.nginx?.sslMode && config.nginx.sslMode !== 'none' ? `/${config.nginx?.httpsPort || 443}` : ''}
                    {config.nginx?.sslMode && config.nginx.sslMode !== 'none' && ` (${config.nginx.sslMode})`}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-zinc-900 dark:text-white">Authentication Service</span>
                  <span className="ml-auto text-xs text-zinc-500">JWT-based Auth</span>
                </div>
                {config.backupEnabled && (
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-zinc-900 dark:text-white">Automated Backups (host cron)</span>
                    <span className="ml-auto text-xs text-zinc-500">{config.backupSchedule || 'Daily at 2 AM'}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Optional Services */}
            {(config.optionalServices.redis || config.optionalServices.search.enabled || config.optionalServices.mail.enabled || config.optionalServices.adminUI) && (
              <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-4">
                <h4 className="font-medium text-zinc-900 dark:text-white mb-3">3. Optional Services</h4>
                <div className="space-y-2">
                  {config.optionalServices.redis && (
                    <div className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-zinc-900 dark:text-white">Redis Cache</span>
                      <span className="ml-auto text-xs text-zinc-500">Port {config.redisConfig?.port || 6379}</span>
                    </div>
                  )}
                  {config.optionalServices.search.enabled && config.optionalServices.search.provider === 'elasticsearch' && (
                    <div className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-zinc-900 dark:text-white">ElasticSearch</span>
                      <span className="ml-auto text-xs text-zinc-500">Port {config.searchConfig?.port || 9200}</span>
                    </div>
                  )}
                  {config.optionalServices.mail.enabled && (
                    <div className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-zinc-900 dark:text-white">Email Service</span>
                      <span className="ml-auto text-xs text-zinc-500">{config.mailConfig?.provider || 'SMTP'}</span>
                    </div>
                  )}
                  {config.optionalServices.adminUI && (
                    <div className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-zinc-900 dark:text-white">nAdmin Dashboard</span>
                      <span className="ml-auto text-xs text-zinc-500">Port {config.nadminConfig?.port || 3021}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* User Services Summary */}
            {config.customServices.length > 0 && (
              <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-4">
                <h4 className="font-medium text-zinc-900 dark:text-white mb-3">4. Custom Backend Services</h4>
                <div className="space-y-2">
                  {config.customServices.map(service => (
                    <div key={service.name} className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-zinc-900 dark:text-white">
                        {service.name}
                      </span>
                      <span className="ml-auto text-xs text-zinc-500">
                        {service.framework} | Port {service.port}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Frontend Apps Summary */}
            {config.frontendApps.length > 0 && (
              <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-4">
                <h4 className="font-medium text-zinc-900 dark:text-white mb-3">5. Frontend Applications</h4>
                <div className="space-y-2">
                  {config.frontendApps.filter(app => app.enabled).map(app => (
                    <div key={app.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-zinc-900 dark:text-white">
                          {app.displayName}
                        </span>
                      </div>
                      <div className="text-xs text-zinc-600 dark:text-zinc-400">
                        {app.framework} | Table: {app.tablePrefix}* | Port: {app.port}
                        {config.environment === 'dev' && app.deployment === 'local' && (
                          <span className="ml-2">| {app.subdomain}.{config.domain}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Summary Stats */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-zinc-900 dark:text-white">Ready to Build</h4>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                    {5 + 
                     (config.optionalServices.redis ? 1 : 0) +
                     (config.optionalServices.search.enabled ? 1 : 0) +
                     (config.optionalServices.mail.enabled ? 1 : 0) +
                     (config.optionalServices.adminUI ? 1 : 0) +
                     (config.optionalServices.monitoring ? 5 : 0) +
                     config.customServices.length} services will be configured
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {5 + 
                     (config.optionalServices.redis ? 1 : 0) +
                     (config.optionalServices.search.enabled ? 1 : 0) +
                     (config.optionalServices.mail.enabled ? 1 : 0) +
                     (config.optionalServices.adminUI ? 1 : 0) +
                     (config.optionalServices.monitoring ? 5 : 0) +
                     config.customServices.length}
                  </p>
                  <p className="text-xs text-zinc-500">Total Services</p>
                </div>
              </div>
            </div>

            {/* Build Output */}
            {commandOutput && (
              <div className="bg-zinc-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                <pre>{commandOutput}</pre>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  const getStepTitle = (step: WizardStep) => {
    switch (step) {
      case 'initial': return 'Initial Setup'
      case 'required-services': return 'Required Services'
      case 'optional-services': return 'Optional Services'
      case 'user-services': return 'User Services'
      case 'apps': return 'Frontend Apps'
      case 'review': return 'Review & Build'
    }
  }

  const getStepIcon = (step: WizardStep) => {
    switch (step) {
      case 'initial': return Settings
      case 'required-services': return Database
      case 'optional-services': return Shield
      case 'user-services': return Server
      case 'apps': return Layout
      case 'review': return Package
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-zinc-600 dark:text-zinc-400">Loading wizard state...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Project Setup Wizard</h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Configure your nself project step by step
            </p>
          </div>
          <button
            onClick={clearWizardState}
            className="text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            title="Clear all saved data and start over"
          >
            Start Fresh
          </button>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = getStepIcon(step)
              const isActive = index === currentStepIndex
              const isComplete = index < currentStepIndex
              
              return (
                <div key={step} className="flex-1 relative">
                  <div className="flex flex-col items-center">
                    <button
                      onClick={() => {
                        if (isComplete || index === 0) {
                          setCurrentStep(step)
                        }
                      }}
                      disabled={!isComplete && index > currentStepIndex}
                      className={`
                        relative z-10 w-12 h-12 rounded-full flex items-center justify-center
                        ${isComplete ? 'bg-green-500 hover:bg-green-600 cursor-pointer' : isActive ? 'bg-blue-500' : 'bg-zinc-200 dark:bg-zinc-700'}
                        ${isComplete && 'hover:scale-110'}
                        transition-all duration-300
                        ${(!isComplete && index > currentStepIndex) ? 'cursor-not-allowed' : ''}
                      `}>
                      {isComplete ? (
                        <CheckCircle className="w-6 h-6 text-white" />
                      ) : (
                        <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-zinc-500'}`} />
                      )}
                    </button>
                    {index < steps.length - 1 && (
                      <div className={`
                        absolute left-[50%] top-6 w-[100%] h-0.5
                        ${isComplete ? 'bg-green-500' : 'bg-zinc-200 dark:bg-zinc-700'}
                        transition-colors duration-300
                      `} />
                    )}
                    <p className={`text-xs mt-2 ${isActive ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-zinc-500'}`}>
                      {getStepTitle(step)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-6">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            onClick={handleBack}
            variant="outline"
            disabled={currentStepIndex === 0 || isExecuting}
            className="flex items-center"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>

          {currentStep === 'review' ? (
            <Button
              onClick={handleBuild}
              variant="primary"
              disabled={isExecuting}
              className="flex items-center"
            >
              {isExecuting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Building...
                </>
              ) : (
                <>
                  Build Project
                  <Package className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              variant="primary"
              className="flex items-center"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </div>

      {/* Service Detail Modals */}
      {selectedService && (
        <ServiceDetailModal
          isOpen={!!selectedService}
          onClose={() => setSelectedService(null)}
          serviceName={selectedService.charAt(0).toUpperCase() + selectedService.slice(1)}
          config={
            // Handle optional services config
            selectedService === 'redis' ? config.redisConfig :
            selectedService === 'mail' ? config.mailConfig :
            selectedService === 'monitoring' ? config.monitoringConfig :
            selectedService === 'search' ? config.searchConfig :
            selectedService === 'mlflow' ? config.mlflowConfig :
            selectedService === 'nadmin' ? config.nadminConfig :
            config[selectedService as keyof typeof config] as any
          }
          onSave={(newConfig) => {
            // Handle optional services config save
            if (selectedService === 'redis') {
              setConfig({ ...config, redisConfig: newConfig as any })
            } else if (selectedService === 'mail') {
              setConfig({ ...config, mailConfig: newConfig as any })
            } else if (selectedService === 'monitoring') {
              setConfig({ ...config, monitoringConfig: newConfig as any })
            } else if (selectedService === 'search') {
              setConfig({ ...config, searchConfig: newConfig as any })
            } else if (selectedService === 'mlflow') {
              setConfig({ ...config, mlflowConfig: newConfig as any })
            } else if (selectedService === 'nadmin') {
              setConfig({ ...config, nadminConfig: newConfig as any })
            } else {
              setConfig({
                ...config,
                [selectedService]: newConfig
              })
            }
            setSelectedService(null)
          }}
          fields={SERVICE_FIELDS[selectedService as keyof typeof SERVICE_FIELDS] || []}
        />
      )}
    </>
  )
}