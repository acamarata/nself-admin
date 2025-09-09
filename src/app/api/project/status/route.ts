import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'
import { getProjectPath } from '@/lib/paths'

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
        break  // Stop at first file found
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
          NSELF_PROJECT_PATH: projectPath
        },
        timeout: 10000
      })
      
      const lines = stdout.split('\n').filter(line => line.trim())
      runningServices = lines.filter(line => 
        line.includes('running') || 
        line.includes('healthy') ||
        line.includes('up')
      ).map(line => {
        const parts = line.split(/\s+/)
        return {
          name: parts[0] || 'unknown',
          status: line.includes('healthy') ? 'healthy' : 'running',
          details: line.trim()
        }
      })
      
      servicesRunning = runningServices.length > 0
    } catch (error: any) {
      // nself status failed, check Docker containers directly
    }
    
    // Check Docker containers related to nself
    let dockerContainers: any[] = []
    
    try {
      // Get all containers
      const { stdout } = await execAsync('docker ps --format "{{.Names}}\t{{.Status}}\t{{.Ports}}"')
      const lines = stdout.split('\n').filter(line => line.trim())
      
      // Filter for nself containers (with both underscore and hyphen naming)
      const nselfContainers = lines.filter(line => 
        line.toLowerCase().startsWith('nself_') || 
        line.toLowerCase().startsWith('nself-')
      )
      
      dockerContainers = nselfContainers.map(line => {
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
            status: isHealthy ? 'healthy' : isUnhealthy ? 'unhealthy' : 'running',
            details: status
          })
        }
        
        return {
          name: name,
          status: status,
          ports: parts[2] || 'none'
        }
      })
      
      // If we have Docker containers running and didn't get services from nself status, mark as running
      if (dockerContainers.length > 0 && !servicesRunning) {
        servicesRunning = dockerContainers.some(c => c.status.toLowerCase().includes('up'))
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
    
    if (hasEnvFile && envContent) {
      // Parse basic config from .env.local
      const projectNameMatch = envContent.match(/PROJECT_NAME=(.+)/)
      const baseDomainMatch = envContent.match(/BASE_DOMAIN=(.+)/)
      
      projectName = projectNameMatch ? projectNameMatch[1].trim() : null
      baseDomain = baseDomainMatch ? baseDomainMatch[1].trim() : null
      
      if (servicesRunning) {
        projectState = 'running'
        needsSetup = false
      } else if (isBuilt) {
        projectState = 'configured'
        needsSetup = false
      } else if (envContent.includes('POSTGRES_') || envContent.includes('HASURA_')) {
        projectState = 'configured'
        needsSetup = false
      } else if (projectName && baseDomain) {
        // Has basic configuration but no docker-compose yet - still in setup wizard
        projectState = 'partial'
        needsSetup = true
      } else {
        projectState = 'partial'
        needsSetup = true
      }
    }
    
    // Check for admin password setup
    let hasAdminPassword = false
    if (envContent) {
      hasAdminPassword = envContent.includes('ADMIN_PASSWORD_HASH') && 
                        !envContent.includes('ADMIN_PASSWORD_HASH=')
    }
    
    return NextResponse.json({
      success: true,
      projectState,
      needsSetup,
      hasEnvFile,
      hasDockerCompose: isBuilt,  // Add explicit hasDockerCompose field
      isBuilt,
      hasAdminPassword,
      servicesRunning,
      runningServices,
      dockerContainers,
      containerCount: dockerContainers.length,  // Add container count for routing logic
      config: {
        projectName,
        baseDomain
      },
      projectPath,
      summary: {
        initialized: hasEnvFile,
        configured: hasEnvFile && (projectName || baseDomain),
        built: isBuilt,
        running: servicesRunning
      }
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to check project status',
        error: error?.message || 'Unknown error',
        projectState: 'unknown',
        needsSetup: true
      },
      { status: 500 }
    )
  }
}