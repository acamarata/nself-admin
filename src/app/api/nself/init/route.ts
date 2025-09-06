import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import { getProjectPath } from '@/lib/paths'

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    const { projectName = 'my_project' } = await request.json()
    const projectPath = getProjectPath()
    
    console.log('=== nself init API ===')
    console.log('Project path:', projectPath)
    console.log('Project name:', projectName)
    
    // Path to nself CLI
    const nselfPath = '/Users/admin/Sites/nself/bin/nself'
    
    // Run nself init --full with project name
    console.log(`Running nself init --full ${projectName}...`)
    
    try {
      const { stdout, stderr } = await execAsync(`${nselfPath} init --full ${projectName}`, {
        cwd: projectPath,
        env: {
          ...process.env,
          PATH: `/opt/homebrew/opt/coreutils/libexec/gnubin:${process.env.PATH}:/Users/admin/bin:/usr/local/bin:/opt/homebrew/bin`
        },
        timeout: 10000 // 10 seconds
      })
      
      console.log('Init output:', stdout)
      if (stderr && !stderr.includes('warning')) {
        console.error('Init stderr:', stderr)
      }
      
      return NextResponse.json({
        success: true,
        message: 'Project initialized successfully',
        output: stdout
      })
    } catch (execError: any) {
      // nself init might already have files, which is ok
      console.log('Init command output:', execError.message)
      
      // Check if it's just because files already exist
      if (execError.message.includes('already exists') || execError.message.includes('.env')) {
        return NextResponse.json({
          success: true,
          message: 'Project already initialized',
          output: execError.stdout || ''
        })
      }
      
      throw execError
    }
    
  } catch (error: any) {
    console.error('Error initializing project:', error)
    return NextResponse.json(
      { 
        error: 'Failed to initialize project',
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    )
  }
}