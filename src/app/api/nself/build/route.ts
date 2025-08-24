import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    const { force = false } = await request.json()
    
    // Get project path from environment
    const projectPath = process.env.PROJECT_PATH || '/project'
    
    // Build the nself build command
    const buildCommand = force ? 'nself build --force' : 'nself build'
    
    console.log(`Executing: ${buildCommand} in ${projectPath}`)
    
    // Execute nself build in the project directory
    const { stdout, stderr } = await execAsync(buildCommand, {
      cwd: projectPath,
      env: {
        ...process.env,
        PATH: process.env.PATH + ':/usr/local/bin',
        NSELF_PROJECT_PATH: projectPath
      },
      timeout: 300000 // 5 minute timeout
    })
    
    // Parse the output to extract useful information
    const lines = stdout.split('\n').filter(line => line.trim())
    const progress = {
      steps: [],
      completed: true,
      errors: stderr ? stderr.split('\n').filter(line => line.trim()) : []
    }
    
    // Extract build steps from output
    lines.forEach(line => {
      if (line.includes('✓') || line.includes('✗') || line.includes('→')) {
        progress.steps.push(line.trim())
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Infrastructure built successfully',
      output: {
        stdout: lines,
        stderr: progress.errors
      },
      progress
    })
  } catch (error) {
    console.error('nself build error:', error)
    
    // Parse error output for user-friendly messages
    const errorMessage = error.message || 'Build failed'
    const isTimeout = errorMessage.includes('timeout')
    const isMissingDependency = errorMessage.includes('command not found') || errorMessage.includes('nself')
    
    let userMessage = 'Build failed due to unknown error'
    if (isTimeout) {
      userMessage = 'Build timed out - this may be due to slow network or large downloads'
    } else if (isMissingDependency) {
      userMessage = 'nself CLI not found - please ensure nself is installed'
    } else if (error.stdout || error.stderr) {
      // Try to extract meaningful error from output
      const errorOutput = error.stderr || error.stdout || ''
      const lines = errorOutput.split('\n').filter(line => line.trim())
      const errorLines = lines.filter(line => 
        line.includes('error') || 
        line.includes('Error') || 
        line.includes('failed') || 
        line.includes('Failed')
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
        }
      },
      { status: 500 }
    )
  }
}