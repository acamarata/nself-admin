import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs/promises'

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    const config = await request.json()
    
    // Get the nself project path from environment or use default
    const projectPath = process.env.NSELF_PROJECT_PATH || '/Users/admin/Sites/nself'
    const nselfPath = path.join(projectPath, 'bin', 'nself')
    
    // Check if nself CLI exists
    try {
      await fs.access(nselfPath)
    } catch {
      return NextResponse.json(
        { error: 'nself CLI not found' },
        { status: 500 }
      )
    }
    
    // Prepare environment variables based on config
    const envVars: Record<string, string> = {
      PROJECT_NAME: config.projectName || 'nself-project',
      PROJECT_DESCRIPTION: config.projectDescription || '',
      ENVIRONMENT: config.environment || 'development',
      DATABASE_TYPE: config.database || 'PostgreSQL',
    }
    
    // Add selected services to environment
    if (config.services) {
      if (config.services.optional?.length > 0) {
        envVars.OPTIONAL_SERVICES = config.services.optional.join(',')
      }
      if (config.services.user?.length > 0) {
        envVars.USER_SERVICES = config.services.user.join(',')
      }
    }
    
    // Run nself init with environment variables
    const { stdout, stderr } = await execAsync(`${nselfPath} init`, {
      cwd: projectPath,
      env: {
        ...process.env,
        ...envVars
      }
    })
    
    if (stderr && !stderr.includes('warning')) {
      console.error('nself init stderr:', stderr)
    }
    
    return NextResponse.json({
      success: true,
      message: 'Project initialized successfully',
      output: stdout
    })
    
  } catch (error) {
    console.error('Error initializing project:', error)
    return NextResponse.json(
      { 
        error: 'Failed to initialize project',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}