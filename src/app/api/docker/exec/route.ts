import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import { getProjectPath, getDockerSocketPath } from '@/lib/paths'

const execAsync = promisify(exec)

export async function POST(request: Request) {
  try {
    const { command, service } = await request.json()
    
    // Validate command to prevent injection
    const allowedCommands = ['start', 'stop', 'restart', 'logs']
    if (!allowedCommands.includes(command)) {
      return NextResponse.json(
        { success: false, error: 'Invalid command' },
        { status: 400 }
      )
    }
    
    // Build the Docker command
    let dockerCmd = ''
    const backendPath = getProjectPath()
    switch (command) {
      case 'start':
        dockerCmd = service 
          ? `docker start ${service}`
          : `cd ${backendPath} && docker-compose up -d`
        break
      case 'stop':
        dockerCmd = service
          ? `docker stop ${service}`
          : `cd ${backendPath} && docker-compose down`
        break
      case 'restart':
        dockerCmd = service
          ? `docker restart ${service}`
          : `cd ${backendPath} && docker-compose restart`
        break
      case 'logs':
        dockerCmd = service
          ? `docker logs --tail 50 ${service}`
          : `cd ${backendPath} && docker-compose logs --tail 50`
        break
    }
    
    // Execute the command
    const { stdout, stderr } = await execAsync(dockerCmd)
    
    return NextResponse.json({
      success: true,
      data: {
        command: dockerCmd,
        output: stdout,
        error: stderr
      }
    })
  } catch (error) {
    console.error('Docker exec error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to execute Docker command',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}