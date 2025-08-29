import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs/promises'

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
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
    
    // Run nself build
    const { stdout, stderr } = await execAsync(`${nselfPath} build`, {
      cwd: projectPath,
      env: process.env
    })
    
    if (stderr && !stderr.includes('warning')) {
      console.error('nself build stderr:', stderr)
    }
    
    return NextResponse.json({
      success: true,
      message: 'Project built successfully',
      output: stdout
    })
    
  } catch (error) {
    console.error('Error building project:', error)
    return NextResponse.json(
      { 
        error: 'Failed to build project',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}