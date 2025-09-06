import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs/promises'
import { getProjectPath } from '@/lib/paths'

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    const config = await request.json()
    const projectPath = getProjectPath()
    
    console.log('=== Starting nself init ===')
    console.log('Project path:', projectPath)
    console.log('Config:', config)
    
    // Path to nself CLI (use global or local)
    const nselfPath = '/Users/admin/Sites/nself/bin/nself'
    
    // First, run nself init --full to create all env files
    console.log('Running nself init --full...')
    const { stdout: initOut, stderr: initErr } = await execAsync(`${nselfPath} init --full`, {
      cwd: projectPath,
      env: process.env,
      timeout: 30000
    })
    
    console.log('Init output:', initOut)
    if (initErr && !initErr.includes('warning')) {
      console.error('Init stderr:', initErr)
    }
    
    // Now read the .env.local file and update it with user's config
    const envPath = path.join(projectPath, '.env.local')
    let envContent = ''
    
    try {
      envContent = await fs.readFile(envPath, 'utf-8')
    } catch (err) {
      console.error('Failed to read .env.local:', err)
      throw new Error('Failed to read .env.local file after init')
    }
    
    // Parse and update env variables
    const envLines = envContent.split('\n')
    const envMap = new Map<string, string>()
    
    // Parse existing env file
    for (const line of envLines) {
      if (line.trim() && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=')
        if (key) {
          envMap.set(key.trim(), valueParts.join('=').trim())
        }
      }
    }
    
    // Update with user's configuration
    envMap.set('PROJECT_NAME', config.projectName || 'my_project')
    envMap.set('PROJECT_DESCRIPTION', config.projectDescription || '')
    envMap.set('ENV', config.environment || 'dev')
    envMap.set('BASE_DOMAIN', config.domain || 'localhost')
    envMap.set('POSTGRES_DB', config.databaseName || 'my_database')
    
    // Handle optional services
    if (config.services?.optional) {
      const optionalServices = config.services.optional
      
      // Redis
      envMap.set('ENABLE_REDIS', optionalServices.includes('redis') ? 'true' : 'false')
      
      // MinIO Storage
      envMap.set('ENABLE_MINIO', optionalServices.includes('minio') ? 'true' : 'false')
      
      // Monitoring Stack (includes Grafana, Prometheus, Loki, Tempo, AlertManager)
      envMap.set('ENABLE_MONITORING', optionalServices.includes('monitoring') ? 'true' : 'false')
      
      // ML/AI Stack
      envMap.set('ENABLE_MLFLOW', optionalServices.includes('mlflow') ? 'true' : 'false')
      
      // Email/SMTP
      envMap.set('ENABLE_MAILPIT', optionalServices.includes('mailpit') ? 'true' : 'false')
      
      // Search
      envMap.set('ENABLE_ELASTICSEARCH', optionalServices.includes('elasticsearch') ? 'true' : 'false')
    }
    
    // Handle user services
    if (config.services?.user && config.services.user.length > 0) {
      // User services are passed as an array of objects with name and framework
      const userServices = config.services.user
      for (let i = 0; i < userServices.length; i++) {
        const service = userServices[i]
        const serviceNum = i + 1
        envMap.set(`USER_SERVICE_${serviceNum}_NAME`, service.name)
        envMap.set(`USER_SERVICE_${serviceNum}_FRAMEWORK`, service.framework)
        envMap.set(`USER_SERVICE_${serviceNum}_PORT`, String(4000 + i))
      }
      envMap.set('USER_SERVICE_COUNT', String(userServices.length))
    }
    
    // Handle frontend apps
    if (config.frontendApps && config.frontendApps.length > 0) {
      for (let i = 0; i < config.frontendApps.length; i++) {
        const app = config.frontendApps[i]
        const appNum = i + 1
        envMap.set(`FRONTEND_APP_${appNum}_NAME`, app.name)
        envMap.set(`FRONTEND_APP_${appNum}_FRAMEWORK`, app.framework || 'nextjs')
        envMap.set(`FRONTEND_APP_${appNum}_PORT`, String(3000 + appNum))
      }
      envMap.set('FRONTEND_APP_COUNT', String(config.frontendApps.length))
    }
    
    // Handle backup settings
    if (config.backup) {
      envMap.set('ENABLE_BACKUP', config.backup.enabled ? 'true' : 'false')
      if (config.backup.enabled) {
        envMap.set('BACKUP_SCHEDULE', config.backup.schedule || '0 2 * * *')
        envMap.set('BACKUP_RETENTION_DAYS', String(config.backup.retentionDays || 7))
        envMap.set('BACKUP_STORAGE', config.backup.storage || 'local')
      }
    }
    
    // Reconstruct the env file
    const newEnvContent = Array.from(envMap.entries())
      .map(([key, value]) => `${key}=${value}`)
      .join('\n')
    
    // Write the updated .env.local file
    await fs.writeFile(envPath, newEnvContent + '\n', 'utf-8')
    console.log('Updated .env.local file')
    
    return NextResponse.json({
      success: true,
      message: 'Project initialized and configured',
      output: initOut
    })
    
  } catch (error: any) {
    console.error('Error initializing project:', error)
    return NextResponse.json(
      { 
        error: 'Failed to initialize project',
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    )
  }
}