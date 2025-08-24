import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import { promises as fs } from 'fs'
import path from 'path'
import { getProjectPath, getDockerSocketPath } from '@/lib/paths'

const execAsync = promisify(exec)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'overview'
    const bucketName = searchParams.get('bucket')
    const filePath = searchParams.get('path') || '/'

    switch (action) {
      case 'overview':
        return await getStorageOverview()
      case 'buckets':
        return await listBuckets()
      case 'files':
        if (!bucketName) {
          return NextResponse.json(
            { success: false, error: 'Bucket name is required for files action' },
            { status: 400 }
          )
        }
        return await listFiles(bucketName, filePath)
      case 'usage':
        return await getStorageUsage()
      case 'stats':
        return await getStorageStats()
      case 'download':
        if (!bucketName || !searchParams.get('file')) {
          return NextResponse.json(
            { success: false, error: 'Bucket name and file path are required' },
            { status: 400 }
          )
        }
        return await downloadFile(bucketName, searchParams.get('file')!)
      case 'file-info':
        if (!bucketName || !searchParams.get('file')) {
          return NextResponse.json(
            { success: false, error: 'Bucket name and file path are required' },
            { status: 400 }
          )
        }
        return await getFileInfo(bucketName, searchParams.get('file')!)
      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }

  } catch (error: any) {
    console.error('Storage API error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Storage operation failed',
        details: error.message
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, bucket, file, options = {} } = await request.json()

    if (!action) {
      return NextResponse.json(
        { success: false, error: 'Action is required' },
        { status: 400 }
      )
    }

    switch (action) {
      case 'create-bucket':
        if (!bucket) {
          return NextResponse.json(
            { success: false, error: 'Bucket name is required' },
            { status: 400 }
          )
        }
        return await createBucket(bucket, options)
      case 'delete-bucket':
        if (!bucket) {
          return NextResponse.json(
            { success: false, error: 'Bucket name is required' },
            { status: 400 }
          )
        }
        return await deleteBucket(bucket, options)
      case 'upload-file':
        if (!bucket || !file) {
          return NextResponse.json(
            { success: false, error: 'Bucket name and file are required' },
            { status: 400 }
          )
        }
        return await uploadFile(bucket, file, options)
      case 'delete-file':
        if (!bucket || !file) {
          return NextResponse.json(
            { success: false, error: 'Bucket name and file path are required' },
            { status: 400 }
          )
        }
        return await deleteFile(bucket, file)
      case 'copy-file':
        return await copyFile(options)
      case 'move-file':
        return await moveFile(options)
      case 'create-folder':
        if (!bucket || !options.folderName) {
          return NextResponse.json(
            { success: false, error: 'Bucket name and folder name are required' },
            { status: 400 }
          )
        }
        return await createFolder(bucket, options.folderName, options.path || '/')
      case 'set-permissions':
        return await setFilePermissions(bucket, file, options)
      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }

  } catch (error: any) {
    console.error('Storage POST error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Storage operation failed',
        details: error.message
      },
      { status: 500 }
    )
  }
}

async function getStorageOverview() {
  try {
    const backendPath = getProjectPath()

    // Check if MinIO is running
    const { stdout: minioStatus } = await execAsync(
      `cd ${backendPath} && docker-compose ps minio`
    ).catch(() => ({ stdout: 'MinIO not found' }))

    const isMinioRunning = minioStatus.includes('Up')

    let overview = {
      minio: {
        status: isMinioRunning ? 'running' : 'stopped',
        version: 'Unknown',
        endpoint: 'http://localhost:9000',
        console: 'http://localhost:9001'
      },
      buckets: [],
      usage: { total: 0, used: 0 },
      stats: { files: 0, folders: 0 }
    }

    if (isMinioRunning) {
      // Get MinIO version and info
      const { stdout: minioInfo } = await execAsync(
        `cd ${backendPath} && docker-compose exec minio mc --version || echo "mc command not available"`
      ).catch(() => ({ stdout: 'Version unavailable' }))

      // Get bucket list via mc command or API
      const buckets = await getMinIOBuckets()
      const usage = await getMinIOUsage()

      overview = {
        minio: {
          status: 'running',
          version: minioInfo.includes('mc version') ? minioInfo.split('\n')[0] : 'Latest',
          endpoint: 'http://localhost:9000',
          console: 'http://localhost:9001'
        },
        buckets,
        usage,
        stats: await getMinIOStats()
      }
    }

    // Also check project file storage
    const projectStorage = await getProjectFileStorage()

    return NextResponse.json({
      success: true,
      data: {
        overview,
        projectStorage,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Failed to get storage overview',
      details: error.message
    }, { status: 500 })
  }
}

async function listBuckets() {
  try {
    const backendPath = getProjectPath()

    // Try to list buckets using mc command
    const { stdout: bucketsOutput } = await execAsync(
      `cd ${backendPath} && docker-compose exec minio mc ls local || echo "No buckets found"`
    ).catch(() => ({ stdout: 'MinIO not accessible' }))

    const buckets = parseBucketsList(bucketsOutput)

    return NextResponse.json({
      success: true,
      data: {
        buckets,
        total: buckets.length,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Failed to list buckets',
      details: error.message
    }, { status: 500 })
  }
}

async function listFiles(bucketName: string, filePath: string) {
  try {
    const backendPath = getProjectPath()

    const { stdout: filesOutput } = await execAsync(
      `cd ${backendPath} && docker-compose exec minio mc ls local/${bucketName}${filePath} || echo "No files found"`
    ).catch(() => ({ stdout: 'Bucket not accessible' }))

    const files = parseFilesList(filesOutput)

    return NextResponse.json({
      success: true,
      data: {
        bucket: bucketName,
        path: filePath,
        files,
        total: files.length,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: `Failed to list files in bucket '${bucketName}'`,
      details: error.message
    }, { status: 500 })
  }
}

async function getStorageUsage() {
  try {
    const backendPath = getProjectPath()

    // Get MinIO disk usage
    const { stdout: minioUsage } = await execAsync(
      `cd ${backendPath} && docker-compose exec minio mc admin info local || echo "MinIO info unavailable"`
    ).catch(() => ({ stdout: 'MinIO not accessible' }))

    // Get Docker volume usage
    const { stdout: volumeUsage } = await execAsync(
      `docker system df -v | grep volume || echo "No volumes"`
    ).catch(() => ({ stdout: 'Docker volumes unavailable' }))

    // Get project directory usage
    const projectUsage = await getProjectDirectoryUsage()

    return NextResponse.json({
      success: true,
      data: {
        minio: parseMinIOUsage(minioUsage),
        volumes: parseVolumeUsage(volumeUsage),
        project: projectUsage,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Failed to get storage usage',
      details: error.message
    }, { status: 500 })
  }
}

async function getStorageStats() {
  try {
    const stats = {
      totalFiles: 0,
      totalFolders: 0,
      totalSize: 0,
      buckets: 0,
      largestFile: { name: '', size: 0 },
      fileTypes: {}
    }

    // Get stats from all buckets
    const buckets = await getMinIOBuckets()
    stats.buckets = buckets.length

    for (const bucket of buckets) {
      const bucketStats = await getBucketStats(bucket.name)
      stats.totalFiles += bucketStats.files
      stats.totalFolders += bucketStats.folders
      stats.totalSize += bucketStats.size

      if (bucketStats.largestFile.size > stats.largestFile.size) {
        stats.largestFile = bucketStats.largestFile
      }

      // Merge file types
      for (const [type, count] of Object.entries(bucketStats.fileTypes)) {
        stats.fileTypes[type] = (stats.fileTypes[type] || 0) + count
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        stats,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Failed to get storage stats',
      details: error.message
    }, { status: 500 })
  }
}

async function createBucket(bucketName: string, options: any) {
  try {
    const backendPath = getProjectPath()

    // Validate bucket name
    if (!/^[a-z0-9.-]+$/.test(bucketName)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid bucket name. Use lowercase letters, numbers, dots and hyphens only.'
      }, { status: 400 })
    }

    const { stdout, stderr } = await execAsync(
      `cd ${backendPath} && docker-compose exec minio mc mb local/${bucketName}`
    )

    // Set bucket policy if specified
    if (options.policy) {
      await execAsync(
        `cd ${backendPath} && docker-compose exec minio mc policy set ${options.policy} local/${bucketName}`
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        bucket: bucketName,
        policy: options.policy || 'private',
        output: stdout.trim(),
        timestamp: new Date().toISOString()
      }
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: `Failed to create bucket '${bucketName}'`,
      details: error.message
    }, { status: 500 })
  }
}

async function deleteBucket(bucketName: string, options: any) {
  try {
    const backendPath = getProjectPath()

    let command = `cd ${backendPath} && docker-compose exec minio mc rb local/${bucketName}`
    if (options.force) {
      command += ' --force'
    }

    const { stdout, stderr } = await execAsync(command)

    return NextResponse.json({
      success: true,
      data: {
        bucket: bucketName,
        output: stdout.trim(),
        timestamp: new Date().toISOString()
      }
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: `Failed to delete bucket '${bucketName}'`,
      details: error.message
    }, { status: 500 })
  }
}

async function uploadFile(bucket: string, file: any, options: any) {
  // This would handle file upload in a real implementation
  // For now, return a placeholder response
  return NextResponse.json({
    success: true,
    data: {
      bucket,
      file: file.name || 'uploaded-file',
      size: file.size || 0,
      timestamp: new Date().toISOString()
    }
  })
}

async function deleteFile(bucket: string, filePath: string) {
  try {
    const backendPath = getProjectPath()

    const { stdout, stderr } = await execAsync(
      `cd ${backendPath} && docker-compose exec minio mc rm local/${bucket}/${filePath}`
    )

    return NextResponse.json({
      success: true,
      data: {
        bucket,
        file: filePath,
        output: stdout.trim(),
        timestamp: new Date().toISOString()
      }
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: `Failed to delete file '${filePath}' from bucket '${bucket}'`,
      details: error.message
    }, { status: 500 })
  }
}

async function createFolder(bucket: string, folderName: string, parentPath: string) {
  try {
    const backendPath = getProjectPath()
    const fullPath = `${parentPath}${folderName}/`

    // Create empty object to represent folder
    const { stdout, stderr } = await execAsync(
      `cd ${backendPath} && echo '' | docker-compose exec -T minio mc pipe local/${bucket}/${fullPath}.keep`
    )

    return NextResponse.json({
      success: true,
      data: {
        bucket,
        folder: fullPath,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: `Failed to create folder '${folderName}' in bucket '${bucket}'`,
      details: error.message
    }, { status: 500 })
  }
}

// Helper functions
async function getMinIOBuckets() {
  try {
    const backendPath = getProjectPath()
    const { stdout } = await execAsync(
      `cd ${backendPath} && docker-compose exec minio mc ls local || echo "No buckets"`
    )
    
    return parseBucketsList(stdout)
  } catch (error) {
    return []
  }
}

async function getMinIOUsage() {
  return {
    total: 0,
    used: 0,
    available: 0,
    percentage: 0
  }
}

async function getMinIOStats() {
  return {
    files: 0,
    folders: 0,
    totalSize: 0
  }
}

async function getProjectFileStorage() {
  try {
    const backendPath = getProjectPath()
    
    // Get size of project directory
    const { stdout } = await execAsync(
      `du -sh ${backendPath} 2>/dev/null || echo "0B ${backendPath}"`
    )
    
    const size = stdout.split('\t')[0] || '0B'
    
    return {
      path: backendPath,
      size,
      type: 'project-files'
    }
  } catch (error) {
    return {
      path: getProjectPath(),
      size: 'Unknown',
      type: 'project-files'
    }
  }
}

async function getProjectDirectoryUsage() {
  try {
    const backendPath = getProjectPath()
    
    const { stdout } = await execAsync(
      `du -sh ${backendPath}/* 2>/dev/null | sort -hr | head -10`
    )
    
    const directories = stdout.split('\n')
      .filter(line => line.trim())
      .map(line => {
        const parts = line.split('\t')
        return {
          size: parts[0],
          path: parts[1]
        }
      })
    
    return {
      directories,
      total: directories.length
    }
  } catch (error) {
    return {
      directories: [],
      total: 0
    }
  }
}

function parseBucketsList(output: string) {
  const lines = output.split('\n').filter(line => line.trim())
  const buckets = []
  
  for (const line of lines) {
    if (line.includes('[') && line.includes(']')) {
      const parts = line.split(/\s+/)
      const name = parts[parts.length - 1]
      if (name && name !== 'local') {
        buckets.push({
          name,
          created: new Date().toISOString(),
          size: '0B'
        })
      }
    }
  }
  
  return buckets
}

function parseFilesList(output: string) {
  const lines = output.split('\n').filter(line => line.trim())
  const files = []
  
  for (const line of lines) {
    if (line.includes('[') || line.includes('No files')) continue
    
    const parts = line.split(/\s+/)
    if (parts.length >= 4) {
      files.push({
        name: parts[parts.length - 1],
        size: parts[parts.length - 2],
        modified: parts.slice(0, -2).join(' '),
        type: parts[parts.length - 1].includes('.') ? 'file' : 'folder'
      })
    }
  }
  
  return files
}

function parseMinIOUsage(output: string) {
  // Parse MinIO admin info output
  return {
    drives: 1,
    usage: '0B',
    available: 'Unknown'
  }
}

function parseVolumeUsage(output: string) {
  // Parse Docker volume usage
  return {
    total: 0,
    volumes: []
  }
}

async function getBucketStats(bucketName: string) {
  // Get detailed stats for a specific bucket
  return {
    files: 0,
    folders: 0,
    size: 0,
    largestFile: { name: '', size: 0 },
    fileTypes: {}
  }
}

async function getFileInfo(bucket: string, filePath: string) {
  try {
    const backendPath = getProjectPath()

    const { stdout } = await execAsync(
      `cd ${backendPath} && docker-compose exec minio mc stat local/${bucket}/${filePath}`
    )

    return NextResponse.json({
      success: true,
      data: {
        bucket,
        file: filePath,
        info: stdout.trim(),
        timestamp: new Date().toISOString()
      }
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: `Failed to get file info for '${filePath}'`,
      details: error.message
    }, { status: 500 })
  }
}

async function downloadFile(bucket: string, filePath: string) {
  // This would handle file download in a real implementation
  return NextResponse.json({
    success: true,
    data: {
      bucket,
      file: filePath,
      download_url: `/api/storage/download/${bucket}/${filePath}`,
      timestamp: new Date().toISOString()
    }
  })
}

// Placeholder functions for additional operations
async function copyFile(options: any) {
  return NextResponse.json({ success: true, message: 'File copied' })
}

async function moveFile(options: any) {
  return NextResponse.json({ success: true, message: 'File moved' })
}

async function setFilePermissions(bucket: string, file: string, options: any) {
  return NextResponse.json({ success: true, message: 'Permissions set' })
}