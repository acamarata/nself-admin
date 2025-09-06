import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import { getProjectPath } from '@/lib/paths'

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    const projectPath = getProjectPath()
    const body = await request.json().catch(() => ({}))
    const shouldFix = body.fix === true
    
    // Path to nself CLI
    const nselfPath = '/Users/admin/Sites/nself/bin/nself'
    
    // Run nself doctor command
    const command = shouldFix ? `${nselfPath} doctor --fix` : `${nselfPath} doctor`
    
    const { stdout, stderr } = await execAsync(command, {
      cwd: projectPath,
      env: process.env,
      timeout: 30000 // 30 second timeout
    })
    
    // Also get container status
    const { stdout: psOutput } = await execAsync('docker ps -a --format "{{.Names}}|{{.Status}}|{{.RestartCount}}"', {
      cwd: projectPath
    })
    
    const containerLines = psOutput.split('\n').filter(line => line.trim())
    
    const containers = await Promise.all(
      containerLines.map(async line => {
        const [name, statusRaw, restarts] = line.split('|')
        let status: 'running' | 'stopped' | 'restarting' | 'error' = 'stopped'
        let health: 'healthy' | 'unhealthy' | 'starting' | undefined
        
        if (statusRaw.includes('Up')) {
          status = 'running'
          if (statusRaw.includes('healthy')) health = 'healthy'
          else if (statusRaw.includes('unhealthy')) health = 'unhealthy'
          else if (statusRaw.includes('starting')) health = 'starting'
        } else if (statusRaw.includes('Restarting')) {
          status = 'restarting'
        } else if (statusRaw.includes('Exited')) {
          status = 'stopped'
        }
        
        // Get last few log lines for stopped/restarting containers
        let logs: string[] = []
        if (status !== 'running' || health === 'unhealthy') {
          try {
            const { stdout: logOutput } = await execAsync(
              `docker logs ${name} --tail 10 2>&1`,
              { timeout: 5000 }
            )
            logs = logOutput.split('\n').filter(l => l.trim())
          } catch (e) {
            // Ignore log fetch errors
          }
        }
        
        return {
          name,
          status,
          health,
          restarts: parseInt(restarts) || 0,
          logs
        }
      })
    )
    
    const filteredContainers = containers.filter(c => c.name.includes('my_project'))
    
    // Parse nself doctor output for system checks
    const systemChecks = []
    const recommendations = []
    
    // Extract checks from stdout
    const lines = stdout.split('\n')
    for (const line of lines) {
      if (line.includes('✓')) {
        const message = line.replace(/\[.*?\]/g, '').replace('✓', '').trim()
        if (message) {
          systemChecks.push({
            name: message.split(':')[0] || message,
            status: 'pass' as const,
            message: message.split(':')[1]?.trim() || 'OK'
          })
        }
      } else if (line.includes('✗') || line.includes('Error')) {
        const message = line.replace(/\[.*?\]/g, '').replace('✗', '').trim()
        if (message) {
          systemChecks.push({
            name: message.split(':')[0] || message,
            status: 'fail' as const,
            message: message.split(':')[1]?.trim() || 'Failed'
          })
        }
      } else if (line.includes('⚠') || line.includes('Warning')) {
        const message = line.replace(/\[.*?\]/g, '').replace('⚠', '').trim()
        if (message) {
          systemChecks.push({
            name: message.split(':')[0] || message,
            status: 'warning' as const,
            message: message.split(':')[1]?.trim() || 'Warning'
          })
        }
      }
    }
    
    // Determine overall status
    const runningCount = filteredContainers.filter(c => c.status === 'running').length
    const totalCount = filteredContainers.length
    let overall: 'healthy' | 'partial' | 'critical' = 'healthy'
    
    if (runningCount === 0) {
      overall = 'critical'
      recommendations.push('No services are running. Click "Auto Fix Issues" or run "nself start" to start all services.')
    } else if (runningCount < totalCount) {
      overall = 'partial'
      const stoppedServices = filteredContainers
        .filter(c => c.status !== 'running')
        .map(c => c.name.replace('my_project_', ''))
      recommendations.push(`The following services are not running: ${stoppedServices.join(', ')}`)
      
      // Check for specific issues
      const nginxIssue = filteredContainers.find(c => c.name.includes('nginx') && c.status === 'restarting')
      if (nginxIssue) {
        recommendations.push('Nginx is restarting. Check nginx configuration files for syntax errors.')
      }
    }
    
    // Add recommendations based on system checks
    if (systemChecks.some(c => c.status === 'fail')) {
      recommendations.push('Some system checks failed. Review the system checks panel for details.')
    }
    
    return NextResponse.json({
      overall,
      containers: filteredContainers,
      systemChecks,
      recommendations
    })
    
  } catch (error: any) {
    console.error('nself doctor error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to run diagnostics',
        message: error?.message 
      },
      { status: 500 }
    )
  }
}