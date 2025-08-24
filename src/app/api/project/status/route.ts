import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function GET() {
  try {
    const projectPath = process.env.PROJECT_PATH || '/project'
    
    // Check if .env.local exists
    const envPath = path.join(projectPath, '.env.local')
    let hasEnvFile = false
    let envContent = null
    
    try {
      const content = await fs.readFile(envPath, 'utf8')
      hasEnvFile = true
      envContent = content
    } catch (error) {
      hasEnvFile = false
    }
    
    // Check if services are running
    let servicesRunning = false
    let runningServices = []
    
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
    } catch (error) {
      // nself status failed, check Docker containers directly
      console.log('nself status failed, checking Docker containers directly')
    }
    
    // Check Docker containers related to nself
    let dockerContainers = []
    
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
      
      console.log('Docker status:', {
        containersFound: dockerContainers.length,
        servicesRunning,
        hasEnvFile
      })
    } catch (error) {
      // Docker command failed or no containers
      console.log('Docker check failed:', error.message)
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
      } else if (envContent.includes('POSTGRES_') || envContent.includes('HASURA_')) {
        projectState = 'configured'
        needsSetup = false
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
      hasAdminPassword,
      servicesRunning,
      runningServices,
      dockerContainers,
      config: {
        projectName,
        baseDomain
      },
      projectPath,
      summary: {
        initialized: hasEnvFile,
        configured: hasEnvFile && (projectName || baseDomain),
        built: servicesRunning || dockerContainers.length > 0,
        running: servicesRunning
      }
    })
  } catch (error) {
    console.error('Error checking project status:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to check project status',
        error: error.message,
        projectState: 'unknown',
        needsSetup: true
      },
      { status: 500 }
    )
  }
}