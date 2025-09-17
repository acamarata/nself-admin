import { getProjectPath } from '@/lib/paths'
import { exec } from 'child_process'
import fs from 'fs/promises'
import { NextResponse } from 'next/server'
import path from 'path'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function GET() {
  try {
    // Use the same project path as the build API uses
    const projectPath = getProjectPath()

    // Check if any env file exists - nself prefers .env, falls back to .env.dev
    let hasEnvFile = false
    let envContent = null

    // Check in nself's priority order
    const envFiles = ['.env', '.env.dev', '.env.staging', '.env.prod']
    for (const envFile of envFiles) {
      const envPath = path.join(projectPath, envFile)
      try {
        const content = await fs.readFile(envPath, 'utf8')
        hasEnvFile = true
        envContent = content
        break // Stop at first file found
      } catch {
        // File doesn't exist, try next
      }
    }

    // Check if docker-compose.yml exists (project is built)
    const dockerComposePath = path.join(projectPath, 'docker-compose.yml')
    let isBuilt = false
    try {
      await fs.access(dockerComposePath)
      isBuilt = true
    } catch {
      isBuilt = false
    }

    // Check if services are running
    let servicesRunning = false
    let runningServices: any[] = []

    // First try nself status command
    try {
      const { stdout } = await execAsync('nself status', {
        cwd: projectPath,
        env: {
          ...process.env,
          PATH: process.env.PATH + ':/usr/local/bin',
          NSELF_PROJECT_PATH: projectPath,
        },
        timeout: 10000,
      })

      const lines = stdout.split('\n').filter((line) => line.trim())
      runningServices = lines
        .filter(
          (line) =>
            line.includes('running') ||
            line.includes('healthy') ||
            line.includes('up'),
        )
        .map((line) => {
          const parts = line.split(/\s+/)
          return {
            name: parts[0] || 'unknown',
            status: line.includes('healthy') ? 'healthy' : 'running',
            details: line.trim(),
          }
        })

      servicesRunning = runningServices.length > 0
    } catch (error: any) {
      // nself status failed, check Docker containers directly
    }

    // Check Docker containers related to this nself project
    let dockerContainers: any[] = []
    let projectPrefix = 'nchat' // For nchat project

    try {
      // Try to get the project name from env file first (more reliable)
      if (hasEnvFile && envContent) {
        const projectNameMatch = envContent.match(/PROJECT_NAME=(.+)/)
        if (projectNameMatch) {
          projectPrefix = projectNameMatch[1].trim().replace(/["']/g, '')
        }
      }

      // Then try docker-compose.yml as fallback
      if (isBuilt && projectPrefix === 'nchat') {
        try {
          const dockerComposeContent = await fs.readFile(
            dockerComposePath,
            'utf8',
          )
          const projectMatch = dockerComposeContent.match(
            /# Project: ([^\s\n]+)/,
          )
          if (projectMatch) {
            projectPrefix = projectMatch[1].trim()
          }
        } catch {
          // docker-compose read failed, keep default
        }
      }

      // Get all containers with timeout to prevent hanging
      const { stdout } = await execAsync(
        'docker ps --format "{{.Names}}\t{{.Status}}\t{{.Ports}}"',
        {
          timeout: 5000,
        },
      )
      const lines = stdout.split('\n').filter((line) => line.trim())

      // Filter for containers from this project (more flexible matching)
      const projectContainers = lines.filter((line) => {
        const containerName = line.split('\t')[0].toLowerCase()
        const prefixLower = projectPrefix.toLowerCase()
        return (
          containerName.startsWith(prefixLower + '_') ||
          containerName.startsWith(prefixLower + '-') ||
          containerName.startsWith('nself_') ||
          containerName.startsWith('nself-') ||
          // For nchat project specifically
          (projectPrefix === 'nchat' &&
            (containerName.includes('nchat') ||
              containerName.includes('postgres') ||
              containerName.includes('hasura') ||
              containerName.includes('auth') ||
              containerName.includes('storage') ||
              containerName.includes('redis')))
        )
      })

      dockerContainers = projectContainers.map((line) => {
        const parts = line.split('\t')
        const name = parts[0] || 'unknown'
        const status = parts[1] || 'unknown'

        // Parse container status to determine if it's running
        const isRunning = status.toLowerCase().includes('up')
        const isHealthy = status.toLowerCase().includes('healthy')
        const isUnhealthy = status.toLowerCase().includes('unhealthy')

        // Add to running services if we didn't get them from nself status
        if (isRunning && runningServices.length === 0) {
          runningServices.push({
            name: name,
            status: isHealthy
              ? 'healthy'
              : isUnhealthy
                ? 'unhealthy'
                : 'running',
            details: status,
          })
        }

        return {
          name: name,
          status: status,
          ports: parts[2] || 'none',
        }
      })

      // If we have Docker containers running and didn't get services from nself status, mark as running
      if (dockerContainers.length > 0 && !servicesRunning) {
        servicesRunning = dockerContainers.some((c) =>
          c.status.toLowerCase().includes('up'),
        )
      }
    } catch (error: any) {
      // Docker command failed or no containers
      dockerContainers = []
    }

    // Determine project state
    let projectState = 'empty'
    let needsSetup = true
    let projectName = null
    let baseDomain = null
    let isMinimalSetup = false

    if (hasEnvFile && envContent) {
      // Parse basic config from .env.local
      const projectNameMatch = envContent.match(/PROJECT_NAME=(.+)/)
      const baseDomainMatch = envContent.match(/BASE_DOMAIN=(.+)/)

      projectName = projectNameMatch ? projectNameMatch[1].trim() : null
      baseDomain = baseDomainMatch ? baseDomainMatch[1].trim() : null

      // Check if this is a minimal setup (only basic env vars, no service configuration)
      // A minimal setup has PROJECT_NAME and BASE_DOMAIN but lacks service-specific configuration
      const hasServiceConfig =
        envContent.includes('POSTGRES_DB') ||
        envContent.includes('POSTGRES_USER') ||
        envContent.includes('HASURA_GRAPHQL_ADMIN_SECRET') ||
        envContent.includes('AUTH_HOST') ||
        envContent.includes('SERVICES_ENABLED') ||
        envContent.includes('FRONTEND_APP_')

      // Check if this looks like a minimal/template env file
      isMinimalSetup = !!projectName && !!baseDomain && !hasServiceConfig

      if (servicesRunning) {
        projectState = 'running'
        needsSetup = false
      } else if (isBuilt) {
        projectState = 'configured'
        needsSetup = false
      } else if (isMinimalSetup) {
        // This is a minimal setup - needs wizard
        projectState = 'empty'
        needsSetup = true
      } else if (hasServiceConfig) {
        // Has service configuration but not built yet
        projectState = 'configured'
        needsSetup = false
      } else {
        // Has env file but incomplete
        projectState = 'partial'
        needsSetup = true
      }
    }

    // Check for admin password setup
    let hasAdminPassword = false
    if (envContent) {
      hasAdminPassword =
        envContent.includes('ADMIN_PASSWORD_HASH') &&
        !envContent.includes('ADMIN_PASSWORD_HASH=')
    }

    return NextResponse.json({
      success: true,
      projectState,
      needsSetup,
      hasEnvFile,
      hasDockerCompose: isBuilt, // Add explicit hasDockerCompose field
      isBuilt,
      hasAdminPassword,
      servicesRunning,
      runningServices,
      dockerContainers,
      containerCount: dockerContainers.length, // Add container count for routing logic
      config: {
        projectName,
        baseDomain,
      },
      projectPath,
      summary: {
        initialized: hasEnvFile,
        configured: hasEnvFile && (projectName || baseDomain),
        built: isBuilt,
        running: servicesRunning,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to check project status',
        error: error?.message || 'Unknown error',
        projectState: 'unknown',
        needsSetup: true,
      },
      { status: 500 },
    )
  }
}
