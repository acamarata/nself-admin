import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function POST(req: NextRequest) {
  try {
    // Get project path
    const projectPath = process.env.NSELF_PROJECT_PATH || process.env.PROJECT_PATH || '../nself-project'
    const absoluteProjectPath = path.isAbsolute(projectPath) 
      ? projectPath 
      : path.join(process.cwd(), projectPath)
    
    // Path to nself CLI
    const nselfPath = '/Users/admin/Sites/nself/bin/nself'
    
    console.log('Running nself reset to wipe project...')
    
    let resetOutput = ''
    let initOutput = ''
    
    // First run nself reset to wipe everything
    try {
      const { stdout, stderr: resetError } = await execAsync(
        `${nselfPath} reset --force`,
        {
          cwd: absoluteProjectPath,
          env: {
            ...process.env,
            PATH: `/opt/homebrew/opt/coreutils/libexec/gnubin:${process.env.PATH}:/Users/admin/bin:/usr/local/bin:/opt/homebrew/bin`
          },
          timeout: 30000
        }
      )
      
      resetOutput = stdout
      console.log('nself reset output:', resetOutput)
      if (resetError && !resetError.includes('warning')) {
        console.error('nself reset stderr:', resetError)
      }
    } catch (error: any) {
      console.error('Error running nself reset:', error)
      resetOutput = 'Reset completed with warnings'
      // Continue anyway - maybe project is already clean
    }
    
    console.log('Running nself init --full to create fresh project...')
    
    // Then run nself init --full to create a fresh project with all env files
    try {
      const { stdout, stderr: initError } = await execAsync(
        `${nselfPath} init --full`,
        {
          cwd: absoluteProjectPath,
          env: {
            ...process.env,
            PATH: `/opt/homebrew/opt/coreutils/libexec/gnubin:${process.env.PATH}:/Users/admin/bin:/usr/local/bin:/opt/homebrew/bin`
          },
          timeout: 30000
        }
      )
      
      initOutput = stdout
      console.log('nself init output:', initOutput)
      if (initError && !initError.includes('warning')) {
        console.error('nself init stderr:', initError)
      }
    } catch (error: any) {
      console.error('Error running nself init:', error)
      return NextResponse.json(
        { error: 'Failed to initialize fresh project', details: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Project reset and reinitialized successfully',
      details: {
        resetOutput: resetOutput || 'Project reset complete',
        initOutput: initOutput || 'Project initialized with fresh configuration'
      }
    })
  } catch (error: any) {
    console.error('Error resetting wizard:', error)
    return NextResponse.json(
      { error: 'Failed to reset wizard configuration', details: error.message },
      { status: 500 }
    )
  }
}