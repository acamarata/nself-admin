import { updateEnvFile, wizardConfigToEnv } from '@/lib/env-handler'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      config,
      step,
      customServices,
      userServices,
      frontendApps,
      environment,
    } = body

    // Convert wizard config to env variables based on the step
    let envUpdates: Record<string, string> = {}

    console.log('Wizard update-env called with step:', step)
    if (step === 'initial') {
      console.log('Initial config received:', {
        projectName: config?.projectName,
        environment: config?.environment,
        databaseName: config?.databaseName,
        domain: config?.domain,
      })
    }

    switch (step) {
      case 'initial':
        // Update basic project settings
        envUpdates = {
          PROJECT_NAME: config.projectName || 'my-project',
          PROJECT_DESCRIPTION: config.projectDescription || '',
          ENV: config.environment || 'dev', // nself accepts both 'dev' and 'development'
          BASE_DOMAIN: config.domain || 'local.nself.org',
          POSTGRES_DB: config.databaseName || 'nself', // Respect user input, default to 'nself'
          POSTGRES_PASSWORD: config.databasePassword || 'nself-dev-password',
          POSTGRES_USER:
            config.postgresUser || config.databaseUser || 'postgres', // Respect user input, default to 'postgres'
          HASURA_GRAPHQL_ADMIN_SECRET:
            config.hasuraAdminSecret || 'hasura-admin-secret-dev', // Full name per spec
          HASURA_JWT_KEY:
            config.jwtSecret ||
            'development-secret-key-minimum-32-characters-long', // Per spec v1.0
          HASURA_JWT_TYPE: 'HS256', // Per spec v1.0
          BACKUP_ENABLED: config.backupEnabled ? 'true' : 'false',
          BACKUP_SCHEDULE: config.backupSchedule || '0 2 * * *',
          ...(config.adminEmail && { ADMIN_EMAIL: config.adminEmail }),
        }
        break

      case 'required':
        // Update required services settings and their configurations
        envUpdates = {
          DATABASE_TYPE: 'PostgreSQL',
        }

        // Extract PostgreSQL configuration if provided
        if (config.postgresqlConfig) {
          if (config.postgresqlConfig.POSTGRES_USER) {
            envUpdates.POSTGRES_USER = config.postgresqlConfig.POSTGRES_USER
          }
          if (config.postgresqlConfig.POSTGRES_HOST) {
            envUpdates.POSTGRES_HOST = config.postgresqlConfig.POSTGRES_HOST
          }
          if (config.postgresqlConfig.POSTGRES_PORT) {
            envUpdates.POSTGRES_PORT = config.postgresqlConfig.POSTGRES_PORT
          }
        }

        // Extract Hasura configuration if provided
        if (config.hasuraConfig) {
          // Save all Hasura configs
          Object.keys(config.hasuraConfig).forEach((key) => {
            if (key.startsWith('HASURA_')) {
              envUpdates[key] = String(config.hasuraConfig[key])
            }
          })
        }

        // Extract Auth configuration if provided
        if (config.authConfig) {
          // Save all Auth configs
          Object.keys(config.authConfig).forEach((key) => {
            if (key.startsWith('AUTH_')) {
              envUpdates[key] = String(config.authConfig[key])
            }
          })
        }

        // Extract Nginx configuration if provided
        if (config.nginxConfig) {
          // Save all Nginx configs
          Object.keys(config.nginxConfig).forEach((key) => {
            if (key.startsWith('NGINX_')) {
              envUpdates[key] = String(config.nginxConfig[key])
            }
          })
        }
        break

      case 'optional':
      case 'optional-services':
        // Update optional services - handle both old and new format
        // NOTE: This case should ONLY update optional service flags, not custom services (CS_*)
        if (config.optionalServices) {
          envUpdates = {
            // Core services default to true per spec
            POSTGRES_ENABLED: 'true',
            HASURA_ENABLED: 'true',
            AUTH_ENABLED: 'true',
            STORAGE_ENABLED:
              config.optionalServices.minio !== false ? 'true' : 'false', // Default true per spec
            // Optional services (in order: nself-admin, redis, minio, mlflow, mail, search, monitoring)
            NSELF_ADMIN_ENABLED:
              config.optionalServices.nadmin || config.optionalServices.admin
                ? 'true'
                : 'false',
            REDIS_ENABLED: config.optionalServices.redis ? 'true' : 'false',
            MLFLOW_ENABLED: config.optionalServices.mlflow ? 'true' : 'false',
            MAILPIT_ENABLED:
              config.optionalServices.mail?.enabled ||
              config.optionalServices.mailpit
                ? 'true'
                : 'false',
            SEARCH_ENABLED: config.optionalServices.search ? 'true' : 'false',
            FUNCTIONS_ENABLED: config.optionalServices.functions
              ? 'true'
              : 'false',
          }

          // Add service credentials when services are enabled
          if (config.optionalServices.minio !== false) {
            envUpdates.MINIO_ROOT_USER = config.minioRootUser || 'minioadmin'
            envUpdates.MINIO_ROOT_PASSWORD =
              config.minioRootPassword || 'minioadmin-password'
          }
          if (config.optionalServices.search) {
            envUpdates.MEILI_MASTER_KEY =
              config.meiliMasterKey || 'meilisearch-master-key-32-chars'
          }
          // Monitoring bundle - includes all monitoring services
          if (config.optionalServices.monitoring) {
            envUpdates.MONITORING_ENABLED = 'true'
            envUpdates.PROMETHEUS_ENABLED = 'true'
            envUpdates.GRAFANA_ENABLED = 'true'
            envUpdates.LOKI_ENABLED = 'true'
            envUpdates.TEMPO_ENABLED = 'true'
            envUpdates.ALERTMANAGER_ENABLED = 'true'
            envUpdates.GRAFANA_ADMIN_PASSWORD =
              config.grafanaAdminPassword || 'grafana-admin-password'
          }
        } else {
          // Handle new simple format from /init/3
          envUpdates = {
            // Core services always enabled
            POSTGRES_ENABLED: 'true',
            HASURA_ENABLED: 'true',
            AUTH_ENABLED: 'true',
            STORAGE_ENABLED: config.minioEnabled !== false ? 'true' : 'false', // Default true
            // Optional services (in order: nself-admin, redis, minio, mlflow, mail, search, monitoring)
            NSELF_ADMIN_ENABLED: config.nadminEnabled ? 'true' : 'false',
            REDIS_ENABLED: config.redisEnabled ? 'true' : 'false',
            MLFLOW_ENABLED: config.mlflowEnabled ? 'true' : 'false',
            MAILPIT_ENABLED: config.mailpitEnabled ? 'true' : 'false',
            SEARCH_ENABLED: config.searchEnabled ? 'true' : 'false',
            FUNCTIONS_ENABLED: config.functionsEnabled ? 'true' : 'false',
          }
          // Monitoring bundle - includes all monitoring services
          if (config.monitoringEnabled) {
            envUpdates.MONITORING_ENABLED = 'true'
            envUpdates.PROMETHEUS_ENABLED = 'true'
            envUpdates.GRAFANA_ENABLED = 'true'
            envUpdates.LOKI_ENABLED = 'true'
            envUpdates.TEMPO_ENABLED = 'true'
            envUpdates.ALERTMANAGER_ENABLED = 'true'
          }
        }
        // DO NOT touch CS_ variables or SERVICES_ENABLED here - that's step 4's job
        break

      case 'user-services':
        // Update custom services
        envUpdates = {}
        const services =
          customServices ||
          userServices ||
          config?.customServices ||
          config?.userServices ||
          []
        // Always set SERVICES_ENABLED based on whether we have services
        envUpdates.SERVICES_ENABLED = services.length > 0 ? 'true' : 'false'

        // Use nself CLI format: CS_N=name:framework:port:route
        services.forEach((service: any, index: number) => {
          const num = index + 1
          const parts = [
            service.name || `service_${num}`,
            service.framework || 'custom',
            String(service.port || 4000 + index),
            service.route || '', // Optional route
          ]
          envUpdates[`CS_${num}`] = parts.join(':')
        })

        // Clear remaining CS_ entries that might exist from before
        // Only clear from services.length+1 onwards to handle deletions
        for (let i = services.length + 1; i <= services.length + 10; i++) {
          envUpdates[`CS_${i}`] = ''
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
            envUpdates[`FRONTEND_APP_${num}_FRAMEWORK`] =
              app.framework || 'nextjs'
            envUpdates[`FRONTEND_APP_${num}_PORT`] = String(
              app.port || 3000 + num,
            )
          })
        } else {
          envUpdates.FRONTEND_APP_COUNT = '0'
        }
        break

      case 'frontend-apps':
        // Update frontend apps - save all fields
        envUpdates = {}
        if (config.frontendApps && config.frontendApps.length > 0) {
          envUpdates.FRONTEND_APP_COUNT = String(config.frontendApps.length)
          config.frontendApps.forEach((app: any, index: number) => {
            const num = index + 1
            // Save all frontend app fields
            if (app.displayName)
              envUpdates[`FRONTEND_APP_${num}_DISPLAY_NAME`] = app.displayName
            if (app.systemName)
              envUpdates[`FRONTEND_APP_${num}_SYSTEM_NAME`] = app.systemName
            if (app.tablePrefix)
              envUpdates[`FRONTEND_APP_${num}_TABLE_PREFIX`] = app.tablePrefix
            if (app.port)
              envUpdates[`FRONTEND_APP_${num}_PORT`] = String(app.port)
            if (app.route) envUpdates[`FRONTEND_APP_${num}_ROUTE`] = app.route
            // Legacy fields for backward compatibility
            if (app.name) envUpdates[`FRONTEND_APP_${num}_NAME`] = app.name
            if (app.framework)
              envUpdates[`FRONTEND_APP_${num}_FRAMEWORK`] = app.framework
          })
        } else {
          envUpdates.FRONTEND_APP_COUNT = '0'
        }
        break

      case 'review':
        // Full update from review (in case user changed anything)
        envUpdates = wizardConfigToEnv(config)
        break

      case 'custom-services':
        // Handle custom services with explicit step
        if (customServices !== undefined) {
          const services = customServices || []
          envUpdates.SERVICES_ENABLED = services.length > 0 ? 'true' : 'false'

          // Clear existing CS_ entries first
          for (let i = 1; i <= 20; i++) {
            envUpdates[`CS_${i}`] = ''
          }

          // Add new services
          services.forEach((service: any, index: number) => {
            const num = index + 1
            const parts = [
              service.name || `service_${num}`,
              service.framework || 'custom',
              String(service.port || 4000 + index),
              service.route || '',
            ]
            envUpdates[`CS_${num}`] = parts.join(':')
          })
        }

        // Ensure environment is set
        if (environment) {
          envUpdates.ENV = environment
        }
        break

      default:
        // Auto-save mode - handle any combination of data
        if (customServices !== undefined || userServices !== undefined) {
          // Save custom services in nself format
          const services = customServices || userServices || []
          envUpdates.SERVICES_ENABLED = services.length > 0 ? 'true' : 'false'

          services.forEach((service: any, index: number) => {
            const num = index + 1
            const parts = [
              service.name || `service_${num}`,
              service.framework || 'custom',
              String(service.port || 4000 + index),
              service.route || '',
            ]
            envUpdates[`CS_${num}`] = parts.join(':')
          })

          // Clear entries after the last service to handle deletion
          // Only clear up to 10 entries after the last service to prevent excessive writes
          for (
            let i = services.length + 1;
            i <= Math.min(services.length + 10, 20);
            i++
          ) {
            envUpdates[`CS_${i}`] = ''
          }
        }

        if (frontendApps) {
          // Save frontend apps with new field names
          envUpdates.FRONTEND_APP_COUNT = String(frontendApps.length)
          frontendApps.forEach((app: any, index: number) => {
            const num = index + 1
            if (app.displayName)
              envUpdates[`FRONTEND_APP_${num}_DISPLAY_NAME`] = app.displayName
            if (app.systemName)
              envUpdates[`FRONTEND_APP_${num}_SYSTEM_NAME`] = app.systemName
            if (app.tablePrefix)
              envUpdates[`FRONTEND_APP_${num}_TABLE_PREFIX`] = app.tablePrefix
            if (app.localPort)
              envUpdates[`FRONTEND_APP_${num}_PORT`] = String(app.localPort)
            if (app.productionUrl)
              envUpdates[`FRONTEND_APP_${num}_ROUTE`] = app.productionUrl
            if (app.remoteSchemaUrl) {
              envUpdates[`FRONTEND_APP_${num}_REMOTE_SCHEMA_URL`] =
                app.remoteSchemaUrl
              // Auto-generate schema name if needed
              if (!app.remoteSchemaName && app.tablePrefix) {
                envUpdates[`FRONTEND_APP_${num}_REMOTE_SCHEMA_NAME`] =
                  `${app.tablePrefix}_schema`
              } else if (app.remoteSchemaName) {
                envUpdates[`FRONTEND_APP_${num}_REMOTE_SCHEMA_NAME`] =
                  app.remoteSchemaName
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

      case 'auto-fix':
        // When auto-fixing issues from the review page, just pass through the config
        // The config object contains the fixes that need to be applied
        if (config) {
          envUpdates = { ...config }
        }
        console.log('Auto-fix updates:', envUpdates)
        break
    }

    // Update the appropriate env file based on environment
    console.log('Updating env with:', envUpdates)
    await updateEnvFile(envUpdates)

    // Determine which file was updated based on environment
    const env = envUpdates.ENV || config.environment || 'dev'
    let fileName = '.env.dev'
    switch (env) {
      case 'dev':
      case 'development':
        fileName = '.env.dev'
        break
      case 'staging':
        fileName = '.env.staging'
        break
      case 'prod':
      case 'production':
        fileName = '.env.prod'
        break
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${fileName} for step: ${step}`,
      updates: envUpdates,
    })
  } catch (error) {
    console.error('Error updating env file:', error)
    return NextResponse.json(
      {
        success: false,
        error: `Failed to update environment file`,
        details: error.message,
      },
      { status: 500 },
    )
  }
}
