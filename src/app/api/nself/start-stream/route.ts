import { NextRequest } from 'next/server'
import { spawn } from 'child_process'
import { getProjectPath } from '@/lib/paths'
import path from 'path'
import fs from 'fs'

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder()
  const projectPath = getProjectPath()
  
  console.log('Start-stream API called')
  console.log('Project path:', projectPath)
  console.log('Current working directory:', process.cwd())
  
  // Check if docker-compose.yml exists
  const dockerComposePath = path.join(projectPath, 'docker-compose.yml')
  console.log('Checking for docker-compose.yml at:', dockerComposePath)
  
  if (!fs.existsSync(dockerComposePath)) {
    console.error('docker-compose.yml not found!')
    return new Response(
      encoder.encode(JSON.stringify({
        type: 'error',
        message: 'No docker-compose.yml found in project directory',
        error: `Project not initialized at ${projectPath}. Run nself init and nself build first.`
      }) + '\n'),
      { status: 400 }
    )
  }

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Find nself CLI - check PATH first (for normal users), then dev location
        let nselfPath = 'nself' // Default to using from PATH
        
        // Check if nself is available in PATH
        try {
          const { execSync } = require('child_process')
          execSync('which nself', { stdio: 'ignore' })
          console.log('Using nself from PATH')
        } catch {
          // Not in PATH, check known development location
          const devPath = '/Users/admin/Sites/nself/bin/nself'
          if (require('fs').existsSync(devPath)) {
            nselfPath = devPath
            console.log('Using nself from development location:', devPath)
          } else {
            // Try common installation locations
            const commonPaths = [
              '/usr/local/bin/nself',
              '/opt/homebrew/bin/nself',
              process.env.HOME + '/bin/nself',
              process.env.HOME + '/.local/bin/nself'
            ]
            
            for (const path of commonPaths) {
              if (require('fs').existsSync(path)) {
                nselfPath = path
                console.log('Found nself at:', path)
                break
              }
            }
          }
        }
        
        console.log('Using nself command:', nselfPath)
        
        // First, check which images need to be pulled
        const checkProcess = spawn('docker-compose', ['config', '--images'], {
          cwd: projectPath,
          env: {
            ...process.env,
            PATH: process.env.PATH + ':/usr/local/bin:/opt/homebrew/bin'
          }
        })

        let allImages: string[] = []
        let imageData = ''
        
        checkProcess.stdout.on('data', (data) => {
          imageData += data.toString()
        })

        await new Promise((resolve) => {
          checkProcess.on('close', () => {
            allImages = imageData.split('\n').filter(img => img.trim())
            resolve(undefined)
          })
        })

        controller.enqueue(encoder.encode(JSON.stringify({
          type: 'status',
          message: `Checking ${allImages.length} Docker images...`,
          totalImages: allImages.length
        }) + '\n'))

        // Check which images are already downloaded
        const localImages = await checkLocalImages()
        const imagesToPull = allImages.filter(img => !localImages.includes(img))
        
        if (imagesToPull.length > 0) {
          controller.enqueue(encoder.encode(JSON.stringify({
            type: 'progress',
            message: `Downloading ${imagesToPull.length} of ${allImages.length} images...`,
            imagesToPull: imagesToPull.length,
            totalImages: allImages.length,
            percentage: Math.round(((allImages.length - imagesToPull.length) / allImages.length) * 100)
          }) + '\n'))
        }

        // Start services using nself start
        controller.enqueue(encoder.encode(JSON.stringify({
          type: 'status',
          message: 'Starting services with nself CLI...'
        }) + '\n'))
        
        const composeProcess = spawn(nselfPath, ['start'], {
          cwd: projectPath,
          env: {
            ...process.env,
            PATH: process.env.PATH + ':/usr/local/bin:/opt/homebrew/bin',
            COMPOSE_PARALLEL_LIMIT: '4'
          }
        })

        let pulledImages = 0
        let startedContainers = 0
        let lastProgress = ''

        // Track both stdout and stderr for nself output
        const handleOutput = (data: Buffer) => {
          // Remove ANSI color codes
          const output = data.toString().replace(/\x1b\[[0-9;]*m/g, '')
          const lines = output.split('\n')
          
          for (const line of lines) {
            // Track image pulling
            if (line.includes('Pulling') && !line.includes('Pulling fs layer')) {
              const match = line.match(/(\w+)\s+Pulling/)
              if (match) {
                controller.enqueue(encoder.encode(JSON.stringify({
                  type: 'progress',
                  message: `Pulling image for ${match[1]}...`,
                  service: match[1]
                }) + '\n'))
              }
            }
            
            // Track download progress
            if (line.includes('Downloading')) {
              const match = line.match(/\[([=>]+)\s*\]\s*([\d.]+)MB\/([\d.]+)MB/)
              if (match) {
                const current = parseFloat(match[2])
                const total = parseFloat(match[3])
                const percentage = Math.round((current / total) * 100)
                const progressMsg = `Downloading: ${percentage}% (${current.toFixed(1)}MB/${total.toFixed(1)}MB)`
                
                if (progressMsg !== lastProgress) {
                  lastProgress = progressMsg
                  controller.enqueue(encoder.encode(JSON.stringify({
                    type: 'download',
                    message: progressMsg,
                    percentage
                  }) + '\n'))
                }
              }
            }
            
            // Track pull completion
            if (line.includes('Pull complete')) {
              pulledImages++
              controller.enqueue(encoder.encode(JSON.stringify({
                type: 'progress',
                message: `Downloaded ${pulledImages} images...`,
                pulledImages
              }) + '\n'))
            }
            
            // Track container creation
            if (line.includes('Creating') || line.includes('Starting')) {
              const match = line.match(/(Creating|Starting)\s+(.+?)(?:\s+\.\.\.|$)/)
              if (match) {
                startedContainers++
                controller.enqueue(encoder.encode(JSON.stringify({
                  type: 'container',
                  message: `${match[1]} ${match[2]}...`,
                  action: match[1].toLowerCase(),
                  container: match[2],
                  startedContainers
                }) + '\n'))
              }
            }

            // Handle errors
            if (line.toLowerCase().includes('error')) {
              controller.enqueue(encoder.encode(JSON.stringify({
                type: 'error',
                message: line.trim()
              }) + '\n'))
            }
            
            // Track nself specific output
            if (line.includes('✓') || line.includes('Starting') || line.includes('Restarting')) {
              controller.enqueue(encoder.encode(JSON.stringify({
                type: 'progress',
                message: line.trim()
              }) + '\n'))
            }
          }
        }
        
        // Use the same handler for both stdout and stderr
        composeProcess.stderr.on('data', handleOutput)
        composeProcess.stdout.on('data', handleOutput)

        // Wait for process to complete
        await new Promise<void>((resolve, reject) => {
          let hasErrors = false
          
          composeProcess.on('error', (error) => {
            hasErrors = true
            controller.enqueue(encoder.encode(JSON.stringify({
              type: 'error',
              message: `Process error: ${error.message}`
            }) + '\n'))
          })
          
          composeProcess.on('close', (code) => {
            // nself CLI sometimes returns 1 even when successful
            // Check if we saw actual errors before treating as failure
            if (code === 0 || (code === 1 && !hasErrors)) {
              controller.enqueue(encoder.encode(JSON.stringify({
                type: 'complete',
                message: 'Services start process completed!',
                startedContainers,
                exitCode: code
              }) + '\n'))
              resolve()
            } else {
              controller.enqueue(encoder.encode(JSON.stringify({
                type: 'error',
                message: `Process exited with code ${code}`,
                exitCode: code
              }) + '\n'))
              // Still resolve to allow partial success
              resolve()
            }
          })
        })

        controller.close()
      } catch (error: any) {
        controller.enqueue(encoder.encode(JSON.stringify({
          type: 'error',
          message: error.message || 'Unknown error occurred'
        }) + '\n'))
        controller.close()
      }
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  })
}

async function checkLocalImages(): Promise<string[]> {
  return new Promise((resolve) => {
    const checkProcess = spawn('docker', ['images', '--format', '{{.Repository}}:{{.Tag}}'])
    let imageData = ''
    
    checkProcess.stdout.on('data', (data) => {
      imageData += data.toString()
    })
    
    checkProcess.on('close', () => {
      const images = imageData.split('\n').filter(img => img.trim() && img !== '<none>:<none>')
      resolve(images)
    })
    
    checkProcess.on('error', () => {
      resolve([]) // Return empty array if docker command fails
    })
  })
}