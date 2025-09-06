import { NextRequest, NextResponse } from 'next/server'
import { updateEnvFile, wizardConfigToEnv } from '@/lib/env-handler'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { config, step, customServices, userServices, frontendApps, environment } = body
    
    // Convert wizard config to env variables based on the step
    let envUpdates: Record<string, string> = {}
    
    console.log('Wizard update-env called with step:', step, 'config:', config)
    
    switch (step) {
      case 'initial':
        // Update basic project settings
        envUpdates = {
          PROJECT_NAME: config.projectName || 'nproject',
          PROJECT_DESCRIPTION: config.projectDescription || '',
          ENV: config.environment || 'development',  // nself uses ENV not ENVIRONMENT
          BASE_DOMAIN: config.domain || 'local.nself.org',
          POSTGRES_DB: config.databaseName || 'nself',  // nself uses POSTGRES_DB
          POSTGRES_PASSWORD: config.databasePassword || 'nself-dev-password',
          POSTGRES_USER: 'postgres',  // nself always uses postgres user
          HASURA_GRAPHQL_ADMIN_SECRET: config.hasuraAdminSecret || 'hasura-admin-secret-dev',  // Full name per spec
          HASURA_JWT_KEY: config.jwtSecret || 'development-secret-key-minimum-32-characters-long',  // Per spec v1.0
          HASURA_JWT_TYPE: 'HS256',  // Per spec v1.0
          BACKUP_ENABLED: config.backupEnabled ? 'true' : 'false',
          BACKUP_SCHEDULE: config.backupSchedule || '0 2 * * *',
          ...(config.adminEmail && { ADMIN_EMAIL: config.adminEmail })
        }
        break
        
      case 'required':
        // Update required services settings - these are always enabled so no flags needed
        envUpdates = {
          DATABASE_TYPE: 'PostgreSQL'
        }
        break
        
      case 'optional':
      case 'optional-services':
        // Update optional services - handle both old and new format
        if (config.optionalServices) {
          envUpdates = {
            // Core services default to true per spec
            POSTGRES_ENABLED: 'true',
            HASURA_ENABLED: 'true',
            AUTH_ENABLED: 'true',
            STORAGE_ENABLED: config.optionalServices.minio !== false ? 'true' : 'false',  // Default true per spec
            // Optional services (in order: nself-admin, redis, minio, mlflow, mail, search, monitoring)
            NSELF_ADMIN_ENABLED: (config.optionalServices.nadmin || config.optionalServices.admin) ? 'true' : 'false',
            REDIS_ENABLED: config.optionalServices.redis ? 'true' : 'false',
            MLFLOW_ENABLED: config.optionalServices.mlflow ? 'true' : 'false',
            MAILPIT_ENABLED: (config.optionalServices.mail?.enabled || config.optionalServices.mailpit) ? 'true' : 'false',
            SEARCH_ENABLED: config.optionalServices.search ? 'true' : 'false'
          }
          // Monitoring bundle
          if (config.optionalServices.monitoring) {
            envUpdates.MONITORING_ENABLED = 'true'
            envUpdates.PROMETHEUS_ENABLED = 'true'
            envUpdates.GRAFANA_ENABLED = 'true'
            envUpdates.LOKI_ENABLED = 'true'
          }
        } else {
          // Handle new simple format from /init/3
          envUpdates = {
            // Core services always enabled
            POSTGRES_ENABLED: 'true',
            HASURA_ENABLED: 'true',
            AUTH_ENABLED: 'true',
            STORAGE_ENABLED: config.minioEnabled !== false ? 'true' : 'false',  // Default true
            // Optional services (in order: nself-admin, redis, minio, mlflow, mail, search, monitoring)
            NSELF_ADMIN_ENABLED: config.nadminEnabled ? 'true' : 'false',
            REDIS_ENABLED: config.redisEnabled ? 'true' : 'false',
            MLFLOW_ENABLED: config.mlflowEnabled ? 'true' : 'false',
            MAILPIT_ENABLED: config.mailpitEnabled ? 'true' : 'false',
            SEARCH_ENABLED: config.searchEnabled ? 'true' : 'false'
          }
          // Monitoring bundle
          if (config.monitoringEnabled) {
            envUpdates.MONITORING_ENABLED = 'true'
            envUpdates.PROMETHEUS_ENABLED = 'true'
            envUpdates.GRAFANA_ENABLED = 'true'
            envUpdates.LOKI_ENABLED = 'true'
          }
        }
        break
        
      case 'user-services':
        // Update custom services
        envUpdates = {}
        const services = customServices || userServices || config?.customServices || config?.userServices || []
        if (services.length > 0) {
          // Use nself CLI format: CS_N=name:framework:port:route
          envUpdates.SERVICES_ENABLED = 'true'
          services.forEach((service: any, index: number) => {
            const num = index + 1
            const parts = [
              service.name || `service_${num}`,
              service.framework || 'custom',
              String(service.port || (4000 + index)),
              service.route || ''  // Optional route
            ]
            envUpdates[`CS_${num}`] = parts.join(':')
          })
        } else {
          envUpdates.SERVICES_ENABLED = 'false'
        }
        break
        
      case 'apps':
        // Update frontend apps
        envUpdates = {}
        if (config.frontendApps && config.frontendApps.length > 0) {
          envUpdates.FRONTEND_APP_COUNT = String(config.frontendApps.length)
          config.frontendApps.forEach((app: any, index: number) => {
            const num = index + 1
            envUpdates[`FRONTEND_APP_${num}_NAME`] = app.name
            envUpdates[`FRONTEND_APP_${num}_FRAMEWORK`] = app.framework || 'nextjs'
            envUpdates[`FRONTEND_APP_${num}_PORT`] = String(app.port || (3000 + num))
          })
        } else {
          envUpdates.FRONTEND_APP_COUNT = '0'
        }
        break
        
      case 'frontend-apps':
        // Update frontend apps
        envUpdates = {}
        if (config.frontendApps && config.frontendApps.length > 0) {
          envUpdates.FRONTEND_APP_COUNT = String(config.frontendApps.length)
          config.frontendApps.forEach((app: any, index: number) => {
            const num = index + 1
            envUpdates[`FRONTEND_APP_${num}_NAME`] = app.name
            envUpdates[`FRONTEND_APP_${num}_FRAMEWORK`] = app.framework
            envUpdates[`FRONTEND_APP_${num}_PORT`] = String(app.port)
          })
        } else {
          envUpdates.FRONTEND_APP_COUNT = '0'
        }
        break
        
      case 'review':
        // Full update from review (in case user changed anything)
        envUpdates = wizardConfigToEnv(config)
        break
        
      default:
        // Auto-save mode - handle any combination of data
        if (customServices || userServices) {
          // Save custom services in nself format
          const services = customServices || userServices || []
          envUpdates.SERVICES_ENABLED = services.length > 0 ? 'true' : 'false'
          services.forEach((service: any, index: number) => {
            const num = index + 1
            const parts = [
              service.name || `service_${num}`,
              service.framework || 'custom',
              String(service.port || (4000 + index)),
              service.route || ''
            ]
            envUpdates[`CS_${num}`] = parts.join(':')
          })
        }
        
        if (frontendApps) {
          // Save frontend apps with new field names
          envUpdates.FRONTEND_APP_COUNT = String(frontendApps.length)
          frontendApps.forEach((app: any, index: number) => {
            const num = index + 1
            if (app.displayName) envUpdates[`FRONTEND_APP_${num}_DISPLAY_NAME`] = app.displayName
            if (app.systemName) envUpdates[`FRONTEND_APP_${num}_SYSTEM_NAME`] = app.systemName
            if (app.tablePrefix) envUpdates[`FRONTEND_APP_${num}_TABLE_PREFIX`] = app.tablePrefix
            if (app.localPort) envUpdates[`FRONTEND_APP_${num}_PORT`] = String(app.localPort)
            if (app.productionUrl) envUpdates[`FRONTEND_APP_${num}_ROUTE`] = app.productionUrl
            if (app.remoteSchemaUrl) {
              envUpdates[`FRONTEND_APP_${num}_REMOTE_SCHEMA_URL`] = app.remoteSchemaUrl
              // Auto-generate schema name if needed
              if (!app.remoteSchemaName && app.tablePrefix) {
                envUpdates[`FRONTEND_APP_${num}_REMOTE_SCHEMA_NAME`] = `${app.tablePrefix}_schema`
              } else if (app.remoteSchemaName) {
                envUpdates[`FRONTEND_APP_${num}_REMOTE_SCHEMA_NAME`] = app.remoteSchemaName
              }
            }
          })
        }
        
        if (config) {
          // Use the full converter for complete config
          envUpdates = { ...envUpdates, ...wizardConfigToEnv(config) }
        }
        
        // Ensure environment is set if provided separately
        if (environment) {
          envUpdates.ENV = environment
        }
        break
    }
    
    // Update the appropriate env file based on environment
    console.log('Updating env with:', envUpdates)
    await updateEnvFile(envUpdates)
    
    // Determine which file was updated based on environment
    const env = envUpdates.ENV || config.environment || 'development'
    let fileName = '.env.dev'
    switch(env) {
      case 'development':
      case 'dev':
        fileName = '.env.dev'
        break
      case 'staging':
        fileName = '.env.staging'
        break
      case 'production':
      case 'prod':
        fileName = '.env.prod'
        break
    }
    
    return NextResponse.json({
      success: true,
      message: `Updated ${fileName} for step: ${step}`,
      updates: envUpdates
    })
    
  } catch (error: any) {
    console.error('Error updating env file:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update .env.local',
        details: error.message
      },
      { status: 500 }
    )
  }
}