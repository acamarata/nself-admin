import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'
import { getCachedProjectInfo, setCachedProjectInfo } from './database'

const execAsync = promisify(exec)

// Get the project path based on environment
export function getProjectPath(): string {
  // In development, use sibling directory
  if (process.env.NODE_ENV === 'development') {
    return process.env.NSELF_PROJECT_PATH || path.join(process.cwd(), '..', 'nself-project')
  }
  
  // In production (container), use mounted volume
  return process.env.NSELF_PROJECT_PATH || '/workspace'
}

// Check if project exists and is valid
export async function checkProjectStatus(): Promise<{
  status: 'not_initialized' | 'initialized' | 'built' | 'running'
  path: string
  error?: string
}> {
  const projectPath = getProjectPath()
  
  // Check if path exists
  if (!fs.existsSync(projectPath)) {
    return {
      status: 'not_initialized',
      path: projectPath,
      error: 'Project directory does not exist'
    }
  }
  
  // Check if it's empty
  const files = fs.readdirSync(projectPath)
  if (files.length === 0) {
    return {
      status: 'not_initialized',
      path: projectPath
    }
  }
  
  // Check for docker-compose.yml
  const dockerComposePath = path.join(projectPath, 'docker-compose.yml')
  if (!fs.existsSync(dockerComposePath)) {
    return {
      status: 'initialized',
      path: projectPath
    }
  }
  
  // Check if containers are running
  try {
    const { stdout } = await execAsync('docker ps --format "{{.Names}}"')
    const runningContainers = stdout.split('\n').filter(name => name.trim())
    
    // Check if any project containers are running
    // This is a simplified check - in production you'd want to be more specific
    const projectContainers = runningContainers.filter(name => 
      name.includes('nself') || name.includes('postgres') || name.includes('hasura')
    )
    
    if (projectContainers.length > 0) {
      return {
        status: 'running',
        path: projectPath
      }
    }
  } catch (error) {
    console.error('Error checking Docker status:', error)
  }
  
  return {
    status: 'built',
    path: projectPath
  }
}

// Get project services from docker-compose
export async function getProjectServices(): Promise<{
  services: string[]
  error?: string
}> {
  // Check cache first
  const cached = await getCachedProjectInfo('services')
  if (cached) {
    return { services: cached }
  }
  
  const projectPath = getProjectPath()
  const dockerComposePath = path.join(projectPath, 'docker-compose.yml')
  
  if (!fs.existsSync(dockerComposePath)) {
    return { 
      services: [],
      error: 'docker-compose.yml not found'
    }
  }
  
  try {
    const { stdout } = await execAsync(
      `docker-compose -f ${dockerComposePath} config --services`
    )
    const services = stdout.split('\n').filter(s => s.trim())
    
    // Cache the result
    await setCachedProjectInfo('services', services)
    
    return { services }
  } catch (error) {
    console.error('Error reading services:', error)
    return {
      services: [],
      error: 'Failed to read services from docker-compose'
    }
  }
}

// Count running containers
export async function getRunningContainers(): Promise<number> {
  // Check cache first
  const cached = await getCachedProjectInfo('running_containers')
  if (cached !== null) {
    return cached
  }
  
  try {
    const { stdout } = await execAsync(
      'docker ps --format "{{.Names}}" | wc -l'
    )
    const count = parseInt(stdout.trim()) || 0
    
    // Cache for 10 seconds
    await setCachedProjectInfo('running_containers', count)
    
    return count
  } catch (error) {
    console.error('Error counting containers:', error)
    return 0
  }
}

// Initialize project with nself init --full
export async function initializeProject(config: any): Promise<{
  success: boolean
  error?: string
}> {
  const projectPath = getProjectPath()
  const nselfPath = path.join(projectPath, 'bin', 'nself')
  
  // Check if nself CLI exists
  if (!fs.existsSync(nselfPath)) {
    return {
      success: false,
      error: 'nself CLI not found'
    }
  }
  
  try {
    // Run nself init --full with config
    const envVars = Object.entries(config)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ')
    
    await execAsync(`${envVars} ${nselfPath} init --full`, {
      cwd: projectPath
    })
    
    return { success: true }
  } catch (error) {
    console.error('Error initializing project:', error)
    return {
      success: false,
      error: 'Failed to initialize project'
    }
  }
}

// Build project (placeholder for nself build)
export async function buildProject(): Promise<{
  success: boolean
  error?: string
}> {
  const projectPath = getProjectPath()
  const nselfPath = path.join(projectPath, 'bin', 'nself')
  
  if (!fs.existsSync(nselfPath)) {
    return {
      success: false,
      error: 'nself CLI not found'
    }
  }
  
  try {
    await execAsync(`${nselfPath} build`, {
      cwd: projectPath
    })
    
    return { success: true }
  } catch (error) {
    console.error('Error building project:', error)
    return {
      success: false,
      error: 'Failed to build project'
    }
  }
}