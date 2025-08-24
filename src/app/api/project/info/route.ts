import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs'

const execAsync = promisify(exec)

export async function GET(request: NextRequest) {
  try {
    const projectPath = process.env.PROJECT_PATH || path.join(process.cwd(), '.backend')
    
    // Check if nself.json exists
    const nselfConfigPath = path.join(projectPath, 'nself.json')
    let projectInfo: any = {
      projectName: 'nself-project',
      database: 'PostgreSQL',
      services: [],
      status: 'built'
    }

    try {
      if (fs.existsSync(nselfConfigPath)) {
        const configContent = fs.readFileSync(nselfConfigPath, 'utf8')
        const config = JSON.parse(configContent)
        projectInfo = {
          projectName: config.project_name || config.name || 'nself-project',
          database: config.database || 'PostgreSQL',
          services: config.services || [],
          status: 'built'
        }
      }
    } catch (error) {
      console.error('Error reading nself.json:', error)
    }

    // Try to get more info from nself status
    try {
      const { stdout } = await execAsync('nself status', { 
        cwd: projectPath,
        timeout: 5000 
      })
      
      // Parse nself status output for additional info
      if (stdout.includes('built') || stdout.includes('running')) {
        projectInfo.status = 'built'
      }
    } catch (error) {
      console.error('nself status failed:', error)
    }

    return NextResponse.json({
      success: true,
      data: projectInfo
    })

  } catch (error) {
    console.error('Project info error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to get project info'
    }, { status: 500 })
  }
}