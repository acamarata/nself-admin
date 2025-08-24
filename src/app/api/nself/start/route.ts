import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    const projectPath = process.env.PROJECT_PATH || '/project'
    
    console.log(`Executing: nself start in ${projectPath}`)
    
    // Execute nself start in the project directory
    const { stdout, stderr } = await execAsync('nself start', {
      cwd: projectPath,
      env: {
        ...process.env,
        PATH: process.env.PATH + ':/usr/local/bin',
        NSELF_PROJECT_PATH: projectPath
      },
      timeout: 300000 // 5 minute timeout
    })
    
    // Parse the output to extract service information
    const lines = stdout.split('\n').filter(line => line.trim())
    const services = []
    const urls = []
    
    lines.forEach(line => {
      // Look for service status lines
      if (line.includes('✓') && (line.includes('started') || line.includes('running'))) {
        const serviceName = line.match(/✓\s+(\w+)/)?.[1]
        if (serviceName) {
          services.push({
            name: serviceName,
            status: 'running',
            message: line.trim()
          })
        }
      }
      
      // Look for URL lines
      if (line.includes('http') && (line.includes('://') || line.includes('local.nself.org'))) {
        const urlMatch = line.match(/(https?:\/\/[^\s]+)/)
        if (urlMatch) {
          urls.push(urlMatch[1])
        }
      }
    })
    
    // Additional service status check
    try {
      const { stdout: statusOutput } = await execAsync('nself status', {
        cwd: projectPath,
        env: {
          ...process.env,
          PATH: process.env.PATH + ':/usr/local/bin',
          NSELF_PROJECT_PATH: projectPath
        },
        timeout: 30000
      })
      
      // Parse status output for more detailed service info
      const statusLines = statusOutput.split('\n').filter(line => line.trim())
      statusLines.forEach(line => {
        if (line.includes('running') || line.includes('healthy')) {
          const parts = line.split(/\s+/)
          if (parts.length > 1) {
            const serviceName = parts[0]
            const status = line.includes('healthy') ? 'healthy' : 'running'
            
            // Update existing service or add new one
            const existingService = services.find(s => s.name === serviceName)
            if (existingService) {
              existingService.status = status
            } else {
              services.push({
                name: serviceName,
                status: status,
                message: line.trim()
              })
            }
          }
        }
      })
    } catch (statusError) {
      console.warn('Could not get detailed status:', statusError.message)
    }
    
    return NextResponse.json({
      success: true,
      message: 'All services started successfully',
      services,
      urls,
      output: {
        stdout: lines,
        stderr: stderr ? stderr.split('\n').filter(line => line.trim()) : []
      }
    })
  } catch (error) {
    console.error('nself start error:', error)
    
    // Parse error output for user-friendly messages
    const errorMessage = error.message || 'Start failed'
    const isTimeout = errorMessage.includes('timeout')
    const isPortConflict = errorMessage.includes('port') && errorMessage.includes('already')
    const isMissingDependency = errorMessage.includes('command not found') || errorMessage.includes('nself')
    
    let userMessage = 'Failed to start services due to unknown error'
    if (isTimeout) {
      userMessage = 'Start timed out - services may be taking longer than expected to initialize'
    } else if (isPortConflict) {
      userMessage = 'Port conflict detected - some required ports may already be in use'
    } else if (isMissingDependency) {
      userMessage = 'nself CLI not found - please ensure nself is installed'
    } else if (error.stdout || error.stderr) {
      const errorOutput = error.stderr || error.stdout || ''
      const lines = errorOutput.split('\n').filter(line => line.trim())
      const errorLines = lines.filter(line => 
        line.includes('error') || 
        line.includes('Error') || 
        line.includes('failed') || 
        line.includes('Failed') ||
        line.includes('cannot') ||
        line.includes('Cannot')
      )
      if (errorLines.length > 0) {
        userMessage = errorLines[0]
      }
    }
    
    return NextResponse.json(
      {
        success: false,
        message: userMessage,
        error: errorMessage,
        output: {
          stdout: error.stdout ? error.stdout.split('\n') : [],
          stderr: error.stderr ? error.stderr.split('\n') : []
        },
        suggestions: [
          'Check if Docker is running',
          'Ensure no other services are using required ports',
          'Run nself doctor to diagnose issues',
          'Check project configuration in .env.local'
        ]
      },
      { status: 500 }
    )
  }
}