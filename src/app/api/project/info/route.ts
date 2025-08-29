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
    } catch (error: any) {
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
    } catch (error: any) {
    }

    // Get actual service count from docker-compose
    try {
      const { stdout: servicesOutput } = await execAsync('docker-compose config --services', {
        cwd: projectPath,
        timeout: 5000
      })
      
      const servicesList = servicesOutput.split('\n').filter(s => s.trim())
      if (servicesList.length > 0) {
        projectInfo.services = servicesList
        projectInfo.totalServices = servicesList.length
      }
    } catch (error: any) {
      // Fallback: count services another way
    }

    return NextResponse.json({
      success: true,
      data: projectInfo
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Failed to get project info'
    }, { status: 500 })
  }
}