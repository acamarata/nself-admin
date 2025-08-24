import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'
import { getProjectPath, getDockerSocketPath } from '@/lib/paths'

const execAsync = promisify(exec)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'list'
    const file = searchParams.get('file')

    switch (action) {
      case 'list':
        return await getConfigFiles()
      case 'read':
        if (!file) {
          return NextResponse.json(
            { success: false, error: 'File parameter is required for read action' },
            { status: 400 }
          )
        }
        return await readConfigFile(file)
      case 'validate':
        return await validateConfiguration()
      case 'backup':
        return await backupConfiguration()
      case 'env-template':
        return await getEnvTemplate()
      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }

  } catch (error: any) {
    console.error('Config API error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Configuration operation failed',
        details: error.message
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, file, content, options = {} } = await request.json()

    if (!action) {
      return NextResponse.json(
        { success: false, error: 'Action is required' },
        { status: 400 }
      )
    }

    switch (action) {
      case 'write':
        if (!file || content === undefined) {
          return NextResponse.json(
            { success: false, error: 'File and content are required for write action' },
            { status: 400 }
          )
        }
        return await writeConfigFile(file, content, options)
      case 'update':
        if (!file) {
          return NextResponse.json(
            { success: false, error: 'File is required for update action' },
            { status: 400 }
          )
        }
        return await updateConfigFile(file, options)
      case 'create-env':
        return await createEnvironmentFile(options)
      case 'apply':
        return await applyConfiguration(options)
      case 'restore':
        return await restoreConfiguration(options)
      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }

  } catch (error: any) {
    console.error('Config POST error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Configuration operation failed',
        details: error.message
      },
      { status: 500 }
    )
  }
}

async function getConfigFiles() {
  const backendPath = getProjectPath()
  
  try {
    const configFiles = []
    
    // Environment files
    const envFiles = ['.env.local', '.env.example', '.env.production', '.env.development']
    for (const envFile of envFiles) {
      try {
        const filePath = path.join(backendPath, envFile)
        const stats = await fs.stat(filePath)
        const content = await fs.readFile(filePath, 'utf-8')
        
        configFiles.push({
          name: envFile,
          type: 'environment',
          path: filePath,
          size: stats.size,
          modified: stats.mtime,
          exists: true,
          lines: content.split('\n').length,
          variables: content.split('\n').filter(line => 
            line.trim() && !line.trim().startsWith('#')
          ).length
        })
      } catch (error) {
        configFiles.push({
          name: envFile,
          type: 'environment',
          path: path.join(backendPath, envFile),
          exists: false,
          error: 'File not found'
        })
      }
    }

    // Docker Compose files
    const dockerFiles = ['docker-compose.yml', 'docker-compose.override.yml', 'docker-compose.prod.yml']
    for (const dockerFile of dockerFiles) {
      try {
        const filePath = path.join(backendPath, dockerFile)
        const stats = await fs.stat(filePath)
        const content = await fs.readFile(filePath, 'utf-8')
        
        configFiles.push({
          name: dockerFile,
          type: 'docker-compose',
          path: filePath,
          size: stats.size,
          modified: stats.mtime,
          exists: true,
          lines: content.split('\n').length,
          services: (content.match(/^\s{2}[a-zA-Z0-9_-]+:/gm) || []).length
        })
      } catch (error) {
        configFiles.push({
          name: dockerFile,
          type: 'docker-compose',
          path: path.join(backendPath, dockerFile),
          exists: false,
          error: 'File not found'
        })
      }
    }

    // Configuration directories
    const configDirs = ['nginx', 'hasura', 'grafana', '.nself']
    for (const dir of configDirs) {
      try {
        const dirPath = path.join(backendPath, dir)
        const stats = await fs.stat(dirPath)
        const files = await fs.readdir(dirPath, { withFileTypes: true })
        
        configFiles.push({
          name: dir,
          type: 'directory',
          path: dirPath,
          modified: stats.mtime,
          exists: true,
          fileCount: files.filter(f => f.isFile()).length,
          subdirCount: files.filter(f => f.isDirectory()).length
        })
      } catch (error) {
        // Directory doesn't exist, which is normal
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        files: configFiles,
        summary: {
          total: configFiles.filter(f => f.exists).length,
          environments: configFiles.filter(f => f.type === 'environment' && f.exists).length,
          dockerFiles: configFiles.filter(f => f.type === 'docker-compose' && f.exists).length,
          directories: configFiles.filter(f => f.type === 'directory' && f.exists).length
        },
        timestamp: new Date().toISOString()
      }
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Failed to get configuration files',
      details: error.message
    }, { status: 500 })
  }
}

async function readConfigFile(fileName: string) {
  const backendPath = getProjectPath()
  
  // Security: Only allow specific config files
  const allowedFiles = [
    '.env.local', '.env.example', '.env.production', '.env.development',
    'docker-compose.yml', 'docker-compose.override.yml', 'docker-compose.prod.yml'
  ]

  if (!allowedFiles.includes(fileName)) {
    return NextResponse.json({
      success: false,
      error: `File '${fileName}' is not allowed to be read`
    }, { status: 403 })
  }

  try {
    const filePath = path.join(backendPath, fileName)
    const content = await fs.readFile(filePath, 'utf-8')
    const stats = await fs.stat(filePath)

    // Parse environment variables if it's an env file
    let parsed = null
    if (fileName.startsWith('.env')) {
      parsed = parseEnvContent(content)
    }

    return NextResponse.json({
      success: true,
      data: {
        file: fileName,
        content,
        parsed,
        stats: {
          size: stats.size,
          modified: stats.mtime,
          lines: content.split('\n').length
        },
        timestamp: new Date().toISOString()
      }
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: `Failed to read file '${fileName}'`,
      details: error.message
    }, { status: 500 })
  }
}

async function writeConfigFile(fileName: string, content: string, options: any) {
  const backendPath = getProjectPath()
  
  // Security: Only allow specific config files
  const allowedFiles = [
    '.env.local', '.env.example', '.env.production', '.env.development',
    'docker-compose.yml', 'docker-compose.override.yml', 'docker-compose.prod.yml'
  ]

  if (!allowedFiles.includes(fileName)) {
    return NextResponse.json({
      success: false,
      error: `File '${fileName}' is not allowed to be written`
    }, { status: 403 })
  }

  try {
    const filePath = path.join(backendPath, fileName)
    
    // Create backup if file exists and backup option is enabled
    if (options.backup !== false) {
      try {
        const existingContent = await fs.readFile(filePath, 'utf-8')
        const backupPath = `${filePath}.backup.${Date.now()}`
        await fs.writeFile(backupPath, existingContent)
      } catch (error) {
        // File doesn't exist, no backup needed
      }
    }

    // Write new content
    await fs.writeFile(filePath, content, 'utf-8')
    const stats = await fs.stat(filePath)

    // Apply configuration if requested
    if (options.apply && fileName.startsWith('.env')) {
      await applyEnvironmentChanges()
    }

    return NextResponse.json({
      success: true,
      data: {
        file: fileName,
        size: stats.size,
        modified: stats.mtime,
        applied: options.apply || false,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: `Failed to write file '${fileName}'`,
      details: error.message
    }, { status: 500 })
  }
}

async function updateConfigFile(fileName: string, options: any) {
  const backendPath = getProjectPath()
  
  try {
    const filePath = path.join(backendPath, fileName)
    let content = await fs.readFile(filePath, 'utf-8')

    if (fileName.startsWith('.env')) {
      // Update environment variables
      if (options.variables) {
        for (const [key, value] of Object.entries(options.variables)) {
          const regex = new RegExp(`^${key}=.*$`, 'm')
          if (regex.test(content)) {
            content = content.replace(regex, `${key}=${value}`)
          } else {
            content += `\n${key}=${value}`
          }
        }
      }
    }

    // Write updated content
    await fs.writeFile(filePath, content, 'utf-8')
    const stats = await fs.stat(filePath)

    return NextResponse.json({
      success: true,
      data: {
        file: fileName,
        updated: Object.keys(options.variables || {}).length,
        size: stats.size,
        modified: stats.mtime,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: `Failed to update file '${fileName}'`,
      details: error.message
    }, { status: 500 })
  }
}

async function validateConfiguration() {
  const backendPath = getProjectPath()
  
  try {
    // Validate using nself doctor
    const { stdout: nselfValidation, stderr } = await execAsync(
      `cd ${backendPath} && nself doctor`
    )

    // Validate Docker Compose
    const { stdout: dockerValidation } = await execAsync(
      `cd ${backendPath} && docker-compose config --quiet`
    ).catch(error => ({ stdout: '', stderr: error.message }))

    // Check for required environment variables
    const envPath = path.join(backendPath, '.env.local')
    let envValidation = 'Environment file not found'
    try {
      const envContent = await fs.readFile(envPath, 'utf-8')
      const parsed = parseEnvContent(envContent)
      
      const requiredVars = ['PROJECT_ID', 'BASE_DOMAIN', 'POSTGRES_PASSWORD']
      const missing = requiredVars.filter(varName => !parsed[varName])
      
      envValidation = missing.length === 0 
        ? 'All required variables present'
        : `Missing required variables: ${missing.join(', ')}`
    } catch (error) {
      // Already handled above
    }

    return NextResponse.json({
      success: true,
      data: {
        nself: {
          status: stderr ? 'failed' : 'passed',
          output: nselfValidation.trim(),
          error: stderr
        },
        docker: {
          status: dockerValidation ? 'passed' : 'failed',
          output: dockerValidation || 'Docker Compose validation failed'
        },
        environment: {
          status: envValidation.includes('Missing') ? 'failed' : 'passed',
          output: envValidation
        },
        timestamp: new Date().toISOString()
      }
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Configuration validation failed',
      details: error.message
    }, { status: 500 })
  }
}

async function applyConfiguration(options: any) {
  const backendPath = getProjectPath()
  
  try {
    const results = []

    // Restart services if requested
    if (options.restart) {
      const { stdout, stderr } = await execAsync(
        `cd ${backendPath} && docker-compose restart`
      )
      results.push({ action: 'restart', stdout, stderr })
    }

    // Rebuild services if requested
    if (options.rebuild) {
      const { stdout, stderr } = await execAsync(
        `cd ${backendPath} && docker-compose build`
      )
      results.push({ action: 'rebuild', stdout, stderr })
    }

    // Apply nself configuration
    const { stdout: nselfOutput, stderr: nselfError } = await execAsync(
      `cd ${backendPath} && nself apply`
    ).catch(error => ({ stdout: '', stderr: error.message }))

    results.push({ action: 'nself-apply', stdout: nselfOutput, stderr: nselfError })

    return NextResponse.json({
      success: true,
      data: {
        results,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Failed to apply configuration',
      details: error.message
    }, { status: 500 })
  }
}

async function createEnvironmentFile(options: any) {
  const backendPath = getProjectPath()
  const fileName = options.environment || '.env.local'
  
  try {
    // Get template from .env.example
    const templatePath = path.join(backendPath, '.env.example')
    let template = ''
    
    try {
      template = await fs.readFile(templatePath, 'utf-8')
    } catch (error) {
      // Create basic template if .env.example doesn't exist
      template = `# nself Configuration
PROJECT_ID=my-project
BASE_DOMAIN=localhost
MODE=dev

# Database
POSTGRES_PASSWORD=changeme

# Authentication
JWT_SECRET=changeme
HASURA_ADMIN_SECRET=changeme

# Email
EMAIL_FROM=admin@localhost
`
    }

    // Apply custom values if provided
    if (options.variables) {
      for (const [key, value] of Object.entries(options.variables)) {
        const regex = new RegExp(`^${key}=.*$`, 'm')
        if (regex.test(template)) {
          template = template.replace(regex, `${key}=${value}`)
        } else {
          template += `\n${key}=${value}`
        }
      }
    }

    const filePath = path.join(backendPath, fileName)
    await fs.writeFile(filePath, template, 'utf-8')
    const stats = await fs.stat(filePath)

    return NextResponse.json({
      success: true,
      data: {
        file: fileName,
        size: stats.size,
        variables: template.split('\n').filter(line => 
          line.trim() && !line.trim().startsWith('#')
        ).length,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: `Failed to create environment file '${fileName}'`,
      details: error.message
    }, { status: 500 })
  }
}

async function backupConfiguration() {
  const backendPath = getProjectPath()
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupDir = path.join(backendPath, 'config-backups', timestamp)
  
  try {
    // Create backup directory
    await fs.mkdir(backupDir, { recursive: true })

    const configFiles = [
      '.env.local', '.env.production', '.env.development',
      'docker-compose.yml', 'docker-compose.override.yml'
    ]

    const backedUp = []
    for (const file of configFiles) {
      try {
        const sourcePath = path.join(backendPath, file)
        const destPath = path.join(backupDir, file)
        
        await fs.copyFile(sourcePath, destPath)
        backedUp.push(file)
      } catch (error) {
        // File doesn't exist, skip
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        backup_path: backupDir,
        files: backedUp,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Failed to backup configuration',
      details: error.message
    }, { status: 500 })
  }
}

async function getEnvTemplate() {
  const backendPath = getProjectPath()
  
  try {
    const templatePath = path.join(backendPath, '.env.example')
    const content = await fs.readFile(templatePath, 'utf-8')
    const parsed = parseEnvContent(content)

    return NextResponse.json({
      success: true,
      data: {
        template: content,
        variables: parsed,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Failed to get environment template',
      details: error.message
    }, { status: 500 })
  }
}

async function restoreConfiguration(options: any) {
  if (!options.backup_path) {
    return NextResponse.json({
      success: false,
      error: 'Backup path is required'
    }, { status: 400 })
  }

  const backendPath = getProjectPath()
  
  try {
    const restored = []
    const files = await fs.readdir(options.backup_path)
    
    for (const file of files) {
      const sourcePath = path.join(options.backup_path, file)
      const destPath = path.join(backendPath, file)
      
      await fs.copyFile(sourcePath, destPath)
      restored.push(file)
    }

    return NextResponse.json({
      success: true,
      data: {
        restored,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Failed to restore configuration',
      details: error.message
    }, { status: 500 })
  }
}

async function applyEnvironmentChanges() {
  const backendPath = getProjectPath()
  
  try {
    // Restart containers to pick up new environment variables
    const { stdout, stderr } = await execAsync(
      `cd ${backendPath} && docker-compose restart`
    )

    return { success: true, stdout, stderr }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

function parseEnvContent(content: string): Record<string, string> {
  const parsed: Record<string, string> = {}
  
  content.split('\n').forEach(line => {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...valueParts] = trimmed.split('=')
      parsed[key] = valueParts.join('=')
    }
  })

  return parsed
}