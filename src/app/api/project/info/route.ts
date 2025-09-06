import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs'

const execAsync = promisify(exec)

export async function GET(request: NextRequest) {
  try {
    // Use the same project path as the build API
    const projectPath = process.env.NSELF_PROJECT_PATH || path.join(process.cwd(), '..', 'nself-project')
    
    let projectInfo: any = {
      projectName: 'nself-project',
      environment: 'development',
      database: 'PostgreSQL',
      services: [],
      servicesByCategory: {
        required: [],
        optional: [],
        user: []
      },
      status: 'built',
      totalServices: 0
    }

    // Read .env.local for project configuration
    try {
      const envPath = path.join(projectPath, '.env.local')
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8')
        
        // Parse important values from .env.local
        const projectNameMatch = envContent.match(/PROJECT_NAME=(.+)/)
        const envMatch = envContent.match(/ENV=(.+)/)
        const domainMatch = envContent.match(/BASE_DOMAIN=(.+)/)
        const dbNameMatch = envContent.match(/POSTGRES_DB=(.+)/)
        const backupEnabledMatch = envContent.match(/BACKUP_ENABLED=(.+)/)
        const backupScheduleMatch = envContent.match(/BACKUP_SCHEDULE=(.+)/)
        const monitoringEnabledMatch = envContent.match(/MONITORING_ENABLED=(.+)/)
        const frontendAppsMatch = envContent.match(/FRONTEND_APPS="(.+)"/)
        
        if (projectNameMatch) projectInfo.projectName = projectNameMatch[1].trim()
        if (envMatch) projectInfo.environment = envMatch[1].trim()
        if (domainMatch) projectInfo.domain = domainMatch[1].trim()
        if (dbNameMatch) projectInfo.databaseName = dbNameMatch[1].trim()
        if (backupEnabledMatch) projectInfo.backupEnabled = backupEnabledMatch[1].trim() === 'true'
        if (backupScheduleMatch) projectInfo.backupSchedule = backupScheduleMatch[1].trim()
        if (monitoringEnabledMatch) projectInfo.monitoringEnabled = monitoringEnabledMatch[1].trim() === 'true'
        
        // Parse frontend apps
        if (frontendAppsMatch) {
          const appsStr = frontendAppsMatch[1]
          projectInfo.frontendApps = appsStr.split(',').map(app => {
            const [name, label, prefix, port, path] = app.split(':')
            return { name, label, port }
          })
        }
      }
    } catch (error: any) {
      console.error('Error reading .env.local:', error)
    }

    // Read docker-compose.yml to get actual services
    const allServices: string[] = []
    
    // Parse main docker-compose.yml
    try {
      const dockerComposePath = path.join(projectPath, 'docker-compose.yml')
      if (fs.existsSync(dockerComposePath)) {
        const dockerComposeContent = fs.readFileSync(dockerComposePath, 'utf8')
        
        // Parse services from docker-compose.yml
        const servicesMatch = dockerComposeContent.match(/^services:$/m)
        if (servicesMatch) {
          // Extract service names (they start with 2 spaces after 'services:')
          const serviceLines = dockerComposeContent.split('\n')
          let inServices = false
          
          for (const line of serviceLines) {
            if (line.trim() === 'services:') {
              inServices = true
              continue
            }
            // Stop when we hit another top-level key (not indented)
            if (inServices && line.match(/^[a-zA-Z]/)) {
              break
            }
            if (inServices && line.match(/^  \w+:/) && !line.match(/^    /)) {
              const serviceName = line.trim().replace(':', '')
              allServices.push(serviceName)
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Error reading docker-compose.yml:', error)
    }
    
    // Parse custom services from docker-compose.custom.yml
    try {
      const customComposePath = path.join(projectPath, 'docker-compose.custom.yml')
      if (fs.existsSync(customComposePath)) {
        const customComposeContent = fs.readFileSync(customComposePath, 'utf8')
        
        // Parse services from docker-compose.custom.yml
        const servicesMatch = customComposeContent.match(/^services:$/m)
        if (servicesMatch) {
          const serviceLines = customComposeContent.split('\n')
          let inServices = false
          
          for (const line of serviceLines) {
            if (line.trim() === 'services:') {
              inServices = true
              continue
            }
            // Stop when we hit another top-level key (not indented)
            if (inServices && line.match(/^[a-zA-Z]/)) {
              break
            }
            if (inServices && line.match(/^  \w+:/) && !line.match(/^    /)) {
              const serviceName = line.trim().replace(':', '')
              allServices.push(serviceName)
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Error reading docker-compose.custom.yml:', error)
    }
    
    // Set services and categorize them
    projectInfo.services = allServices
    projectInfo.totalServices = allServices.length
    
    // Categorize services
    allServices.forEach(service => {
      const lowerName = service.toLowerCase()
      if (['postgres', 'hasura', 'auth', 'nginx'].some(s => lowerName.includes(s))) {
        projectInfo.servicesByCategory.required.push(service)
      } else if (['redis', 'minio', 'storage', 'mailpit', 'grafana', 'prometheus', 'loki', 'jaeger', 'alertmanager'].some(s => lowerName.includes(s))) {
        projectInfo.servicesByCategory.optional.push(service)
      } else {
        projectInfo.servicesByCategory.user.push(service)
      }
    })

    // Try docker-compose command as backup
    if (projectInfo.services.length === 0) {
      try {
        const { stdout: servicesOutput } = await execAsync('docker-compose config --services 2>/dev/null', {
          cwd: projectPath,
          timeout: 5000
        })
        
        const servicesList = servicesOutput.split('\n').filter(s => s.trim())
        if (servicesList.length > 0) {
          projectInfo.services = servicesList
          projectInfo.totalServices = servicesList.length
          
          // Categorize services
          servicesList.forEach(service => {
            const lowerName = service.toLowerCase()
            if (['postgres', 'hasura', 'auth', 'nginx'].some(s => lowerName.includes(s))) {
              projectInfo.servicesByCategory.required.push(service)
            } else if (['redis', 'minio', 'storage', 'mailpit', 'grafana', 'prometheus', 'loki', 'jaeger', 'alertmanager'].some(s => lowerName.includes(s))) {
              projectInfo.servicesByCategory.optional.push(service)
            } else {
              projectInfo.servicesByCategory.user.push(service)
            }
          })
        }
      } catch (error: any) {
        console.log('docker-compose command failed, using file parsing')
      }
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