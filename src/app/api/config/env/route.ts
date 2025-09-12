import { getProjectPath } from '@/lib/paths'
import fs from 'fs/promises'
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'

// Smart defaults following nself template order
const SMART_DEFAULTS = {
  // Admin Authentication
  ADMIN_PASSWORD: '',

  // API Configuration
  NEXT_PUBLIC_API_URL: 'http://admin.local.nself.org',

  // Project Path
  PROJECT_PATH: getProjectPath(),

  // Core Project Settings
  ENV: 'development',
  PROJECT_NAME: 'nself',
  BASE_DOMAIN: 'local.nself.org',
  DB_ENV_SEEDS: 'true',
  ALWAYS_AUTOFIX: 'false',

  // PostgreSQL Database
  POSTGRES_VERSION: '15',
  POSTGRES_HOST: 'postgres',
  POSTGRES_PORT: '5432',
  POSTGRES_DB: 'nself',
  POSTGRES_USER: 'postgres',
  POSTGRES_PASSWORD: 'postgres',
  POSTGRES_EXTENSIONS: 'uuid-ossp,pg_trgm,pgcrypto',
  DATABASE_URL: 'postgresql://postgres:postgres@postgres:5432/nself',

  // Hasura GraphQL Engine
  HASURA_VERSION: 'latest',
  HASURA_GRAPHQL_ADMIN_SECRET: 'hasura-admin-secret',
  HASURA_JWT_KEY: 'your-256-bit-secret-key-here',
  HASURA_JWT_TYPE: 'HS256',
  HASURA_GRAPHQL_ENABLE_CONSOLE: 'true',
  HASURA_GRAPHQL_DEV_MODE: 'true',
  HASURA_GRAPHQL_ENABLE_TELEMETRY: 'false',
  HASURA_GRAPHQL_CORS_DOMAIN: '*',
  HASURA_ROUTE: '/hasura',
  HASURA_GRAPHQL_DATABASE_URL:
    'postgresql://postgres:postgres@postgres:5432/nself',

  // Hasura Auth Service
  AUTH_VERSION: 'latest',
  AUTH_HOST: 'auth',
  AUTH_PORT: '4000',
  AUTH_CLIENT_URL: 'http://localhost:3000',
  AUTH_JWT_REFRESH_TOKEN_EXPIRES_IN: '43200',
  AUTH_JWT_ACCESS_TOKEN_EXPIRES_IN: '900',
  AUTH_WEBAUTHN_ENABLED: 'false',
  AUTH_ROUTE: '/auth',
  AUTH_SMTP_HOST: 'mailpit',
  AUTH_SMTP_PORT: '1025',
  AUTH_SMTP_SECURE: 'false',
  AUTH_SMTP_USER: '',
  AUTH_SMTP_PASS: '',
  AUTH_SMTP_SENDER: 'noreply@nself.local',

  // File Storage (MinIO)
  STORAGE_VERSION: 'latest',
  STORAGE_ROUTE: '/storage',
  STORAGE_CONSOLE_ROUTE: '/storage-console',
  MINIO_ROOT_USER: 'minioadmin',
  MINIO_ROOT_PASSWORD: 'minioadmin',
  MINIO_ENDPOINT: 'minio',
  MINIO_PORT: '9000',
  MINIO_USE_SSL: 'false',
  S3_BUCKET: 'nself',
  S3_ENDPOINT: 'http://minio:9000',
  S3_ACCESS_KEY: 'minioadmin',
  S3_SECRET_KEY: 'minioadmin',
  S3_REGION: 'us-east-1',

  // Nginx
  NGINX_VERSION: 'alpine',
  NGINX_PORT: '80',
  NGINX_SSL_PORT: '443',

  // SSL Configuration
  SSL_ENABLED: 'false',
  SSL_CERT_PATH: '/etc/nginx/certs/cert.pem',
  SSL_KEY_PATH: '/etc/nginx/certs/key.pem',

  // Redis Cache
  REDIS_VERSION: '7-alpine',
  REDIS_HOST: 'redis',
  REDIS_PORT: '6379',
  REDIS_URL: 'redis://redis:6379',

  // Mailpit
  MAILPIT_VERSION: 'latest',
  MAILPIT_UI_PORT: '8025',
  MAILPIT_SMTP_PORT: '1025',

  // Monitoring
  LOG_LEVEL: 'info',
  LOG_FORMAT: 'json',
  ENABLE_MONITORING: 'false',
  ENABLE_ANALYTICS: 'false',

  // API Settings
  API_PORT: '3001',
  API_RATE_LIMIT_ENABLED: 'true',
  API_RATE_LIMIT_REQUESTS: '100',
  API_RATE_LIMIT_WINDOW: '60',

  // Frontend
  FRONTEND_PORT: '3000',
  FRONTEND_URL: 'http://localhost:3000',
}

// Categorize variables based on nself template structure
function getCategory(key: string): string {
  const k = key.toUpperCase()

  // Admin settings (for .env.local)
  if (['ADMIN_PASSWORD', 'PROJECT_PATH'].includes(k)) {
    return '0. Admin Settings'
  }

  // Core Project Settings
  if (
    [
      'ENV',
      'PROJECT_NAME',
      'BASE_DOMAIN',
      'DB_ENV_SEEDS',
      'ALWAYS_AUTOFIX',
    ].includes(k)
  ) {
    return '1. Core Project'
  }

  // PostgreSQL
  if (k.includes('POSTGRES') || k === 'DATABASE_URL') {
    return '2. PostgreSQL'
  }

  // Hasura (but not Auth)
  if (k.includes('HASURA') && !k.includes('AUTH')) {
    return '3. Hasura GraphQL'
  }

  // Auth
  if (k.includes('AUTH') || k.includes('JWT')) {
    return '4. Authentication'
  }

  // Storage
  if (k.includes('STORAGE') || k.includes('MINIO') || k.includes('S3')) {
    return '5. File Storage'
  }

  // Nginx & SSL
  if (k.includes('NGINX') || k.includes('SSL')) {
    return '6. Nginx & SSL'
  }

  // Redis
  if (k.includes('REDIS')) {
    return '7. Redis Cache'
  }

  // Mail
  if (k.includes('MAIL') || k.includes('SMTP')) {
    return '8. Email'
  }

  // Monitoring
  if (k.includes('LOG') || k.includes('MONITOR') || k.includes('ANALYTICS')) {
    return '9. Monitoring'
  }

  // API & Frontend
  if (
    k.includes('API') ||
    k.includes('FRONTEND') ||
    k.includes('NEXT_PUBLIC')
  ) {
    return '10. API & Frontend'
  }

  return '11. Other'
}

// Check if variable is secret
function isSecret(key: string): boolean {
  const lower = key.toLowerCase()
  return (
    lower.includes('password') ||
    lower.includes('secret') ||
    lower.includes('key') ||
    lower.includes('token') ||
    lower === 'hasura_graphql_admin_secret'
  )
}

// Parse .env file content
function parseEnvFile(content: string): Record<string, string> {
  const vars: Record<string, string> = {}
  const lines = content.split('\n')

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const match = trimmed.match(/^([^=]+)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      const value = match[2].trim().replace(/^["']|["']$/g, '') // Remove quotes
      vars[key] = value
    }
  }

  return vars
}

// Format env file content with proper sections
function formatEnvFile(
  vars: Record<string, { value: string; category?: string }>,
): string {
  const categories: Record<string, Array<{ key: string; value: string }>> = {}

  // Group by category
  for (const [key, data] of Object.entries(vars)) {
    const category = data.category || getCategory(key)
    if (!categories[category]) categories[category] = []
    categories[category].push({ key, value: data.value })
  }

  // Build file content with proper section headers
  let content = ''
  const sortedCategories = Object.keys(categories).sort()

  const sectionHeaders: Record<string, string> = {
    '0. Admin Settings':
      '# ==================== ADMIN SETTINGS ====================',
    '1. Core Project':
      '\n# ==================== CORE PROJECT SETTINGS ====================',
    '2. PostgreSQL':
      '\n# ==================== PostgreSQL Database ====================',
    '3. Hasura GraphQL':
      '\n# ==================== Hasura GraphQL Engine ====================',
    '4. Authentication':
      '\n# ==================== Authentication Service ====================',
    '5. File Storage':
      '\n# ==================== File Storage (MinIO) ====================',
    '6. Nginx & SSL':
      '\n# ==================== Nginx & SSL ====================',
    '7. Redis Cache':
      '\n# ==================== Redis Cache ====================',
    '8. Email':
      '\n# ==================== Email Configuration ====================',
    '9. Monitoring':
      '\n# ==================== Monitoring & Logging ====================',
    '10. API & Frontend':
      '\n# ==================== API & Frontend ====================',
    '11. Other': '\n# ==================== Other Settings ====================',
  }

  for (const category of sortedCategories) {
    const header = sectionHeaders[category]
    if (header) content += header + '\n'

    // Sort variables within category for consistency
    const sortedVars = categories[category].sort((a, b) => {
      // Keep certain vars at top of their sections
      const priority: Record<string, number> = {
        ENV: 1,
        PROJECT_NAME: 2,
        BASE_DOMAIN: 3,
        POSTGRES_VERSION: 1,
        POSTGRES_HOST: 2,
        POSTGRES_PORT: 3,
        POSTGRES_DB: 4,
        POSTGRES_USER: 5,
        POSTGRES_PASSWORD: 6,
      }
      const aPriority = priority[a.key] || 999
      const bPriority = priority[b.key] || 999
      if (aPriority !== bPriority) return aPriority - bPriority
      return a.key.localeCompare(b.key)
    })

    for (const { key, value } of sortedVars) {
      // Add quotes if value contains spaces or special characters
      const quotedValue =
        value.includes(' ') || value.includes('#') ? `"${value}"` : value
      content += `${key}=${quotedValue}\n`
    }
  }

  return content
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const environment = searchParams.get('env') || 'local'
    const includeDefaults = searchParams.get('defaults') !== 'false'

    // Get paths for both admin project and backend project
    const adminPath = process.cwd() // Current admin project root
    const backendPath = getProjectPath()

    // Use backend path for all environment files
    const envFiles = {
      local: path.join(backendPath, '.env.local'), // Backend project's .env.local
      dev: path.join(backendPath, '.env.dev'),
      stage: path.join(backendPath, '.env.stage'),
      prod: path.join(backendPath, '.env.prod'),
      secrets: path.join(backendPath, '.env.secrets'),
    }

    const variables: any[] = []
    const loadedVars: Record<string, string> = {}

    // Load environment-specific file
    const envFile = envFiles[environment as keyof typeof envFiles]
    if (envFile) {
      try {
        const content = await fs.readFile(envFile, 'utf-8')
        const parsed = parseEnvFile(content)
        Object.assign(loadedVars, parsed)

        for (const [key, value] of Object.entries(parsed)) {
          variables.push({
            key,
            value,
            defaultValue: SMART_DEFAULTS[key as keyof typeof SMART_DEFAULTS],
            isSecret: isSecret(key),
            source: 'env',
            category: getCategory(key),
          })
        }
      } catch (error: any) {
        // File doesn't exist, that's okay
      }
    }

    // Add defaults for missing variables
    if (includeDefaults) {
      for (const [key, defaultValue] of Object.entries(SMART_DEFAULTS)) {
        if (!loadedVars[key]) {
          variables.push({
            key,
            value: '',
            defaultValue,
            isSecret: isSecret(key),
            source: 'default',
            category: getCategory(key),
          })
        }
      }
    }

    // Sort by category number and then by key priority
    variables.sort((a, b) => {
      if (a.category !== b.category) {
        return (a.category || '').localeCompare(b.category || '')
      }
      return a.key.localeCompare(b.key)
    })

    return NextResponse.json({
      success: true,
      data: {
        environment,
        variables,
        availableEnvironments: ['local', 'dev', 'stage', 'prod', 'secrets'],
        hasChanges: false,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to read environment variables' },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { environment, variables, action } = body

    if (action === 'save') {
      // Get paths for both admin project and backend project
      const adminPath = process.cwd() // Current admin project root
      const backendPath = getProjectPath()

      // Ensure the backend directory exists
      try {
        await fs.mkdir(backendPath, { recursive: true })
      } catch (mkdirError) {
        console.error('Failed to create backend directory:', mkdirError)
      }

      // Use backend path for all environment files
      const envFiles = {
        local: path.join(backendPath, '.env.local'), // Backend project's .env.local
        dev: path.join(backendPath, '.env.dev'),
        stage: path.join(backendPath, '.env.stage'),
        prod: path.join(backendPath, '.env.prod'),
        secrets: path.join(backendPath, '.env.secrets'),
      }

      const envFile = envFiles[environment as keyof typeof envFiles]
      if (!envFile) {
        return NextResponse.json(
          { success: false, error: 'Invalid environment' },
          { status: 400 },
        )
      }

      // Prepare variables for saving
      const varsToSave: Record<string, { value: string; category?: string }> =
        {}
      for (const variable of variables) {
        if (variable.value || variable.source === 'env') {
          varsToSave[variable.key] = {
            value: variable.value || '',
            category: variable.category,
          }
        }
      }

      // Format and write file
      const content = formatEnvFile(varsToSave)

      try {
        await fs.writeFile(envFile, content, 'utf-8')
        console.log(
          `Successfully wrote ${Object.keys(varsToSave).length} variables to ${envFile}`,
        )
      } catch (writeError: any) {
        console.error('Failed to write environment file:', writeError)
        return NextResponse.json(
          {
            success: false,
            error: `Failed to write environment file: ${writeError.message}`,
          },
          { status: 500 },
        )
      }

      return NextResponse.json({
        success: true,
        message: `Environment file saved: ${environment}`,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error in POST /api/config/env:', error)
    return NextResponse.json(
      {
        success: false,
        error: `Failed to save environment variables: ${error.message}`,
      },
      { status: 500 },
    )
  }
}
