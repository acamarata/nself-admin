import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export interface VersionInfo {
  current: string
  latest: string
  updateAvailable: boolean
  releaseNotes?: string
  publishedAt?: string
}

export interface UpdateStatus {
  updating: boolean
  progress: number
  message: string
  error?: string
}

class AutoUpdater {
  private static instance: AutoUpdater
  private updateInterval: NodeJS.Timeout | null = null
  private isUpdating = false
  
  private constructor() {}
  
  static getInstance(): AutoUpdater {
    if (!AutoUpdater.instance) {
      AutoUpdater.instance = new AutoUpdater()
    }
    return AutoUpdater.instance
  }
  
  async getCurrentVersion(): Promise<string> {
    try {
      // First try to get from package.json
      const packageJson = require('../../package.json')
      if (packageJson.version) {
        return packageJson.version
      }
    } catch (e) {
      console.error('Failed to read package.json:', e)
    }
    
    // Fallback to environment variable
    return process.env.ADMIN_VERSION || '0.0.1'
  }
  
  async getLatestVersion(): Promise<VersionInfo> {
    const current = await this.getCurrentVersion()
    
    try {
      // Check Docker Hub for latest version
      const response = await fetch('https://hub.docker.com/v2/repositories/nself/admin/tags?page_size=10')
      const data = await response.json()
      
      // Find the latest non-latest tag
      const versions = data.results
        ?.filter((tag: any) => tag.name !== 'latest' && /^\d+\.\d+\.\d+/.test(tag.name))
        ?.sort((a: any, b: any) => {
          return this.compareVersions(b.name, a.name)
        })
      
      const latest = versions?.[0]?.name || current
      
      return {
        current,
        latest,
        updateAvailable: this.compareVersions(latest, current) > 0,
        publishedAt: versions?.[0]?.last_updated
      }
    } catch (error) {
      console.error('Failed to check for updates:', error)
      return {
        current,
        latest: current,
        updateAvailable: false
      }
    }
  }
  
  async checkGitHubReleases(): Promise<VersionInfo> {
    const current = await this.getCurrentVersion()
    
    try {
      const response = await fetch('https://api.github.com/repos/acamarata/nself-admin/releases/latest')
      const data = await response.json()
      
      const latest = data.tag_name?.replace(/^v/, '') || current
      
      return {
        current,
        latest,
        updateAvailable: this.compareVersions(latest, current) > 0,
        releaseNotes: data.body,
        publishedAt: data.published_at
      }
    } catch (error) {
      console.error('Failed to check GitHub releases:', error)
      return {
        current,
        latest: current,
        updateAvailable: false
      }
    }
  }
  
  compareVersions(v1: string, v2: string): number {
    const parts1 = v1.replace(/-(beta|alpha|rc).*/, '').split('.').map(Number)
    const parts2 = v2.replace(/-(beta|alpha|rc).*/, '').split('.').map(Number)
    
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const part1 = parts1[i] || 0
      const part2 = parts2[i] || 0
      
      if (part1 > part2) return 1
      if (part1 < part2) return -1
    }
    
    // Check pre-release versions
    const pre1 = v1.match(/-(beta|alpha|rc)\.?(\d+)?/)
    const pre2 = v2.match(/-(beta|alpha|rc)\.?(\d+)?/)
    
    if (pre1 && !pre2) return -1
    if (!pre1 && pre2) return 1
    if (pre1 && pre2) {
      const order = ['alpha', 'beta', 'rc']
      const idx1 = order.indexOf(pre1[1])
      const idx2 = order.indexOf(pre2[1])
      
      if (idx1 !== idx2) return idx1 - idx2
      
      const num1 = parseInt(pre1[2] || '0')
      const num2 = parseInt(pre2[2] || '0')
      return num1 - num2
    }
    
    return 0
  }
  
  async performUpdate(version?: string): Promise<UpdateStatus> {
    if (this.isUpdating) {
      return {
        updating: false,
        progress: 0,
        message: 'Update already in progress'
      }
    }
    
    this.isUpdating = true
    const targetVersion = version || 'latest'
    
    try {
      // Pull the new image
      const pullCmd = `docker pull nself/admin:${targetVersion}`
      await execAsync(pullCmd)
      
      // Get current container ID
      const { stdout: containerId } = await execAsync('hostname')
      const containerName = containerId.trim()
      
      // Create update script
      const updateScript = `
        #!/bin/bash
        # Auto-update script for nself-admin
        
        # Stop current container
        docker stop ${containerName}
        
        # Remove old container
        docker rm ${containerName}
        
        # Start new container with same settings
        docker run -d \\
          --name nself-admin \\
          --restart unless-stopped \\
          -p 3001:3001 \\
          -v /var/run/docker.sock:/var/run/docker.sock \\
          -v /project:/project \\
          -e ADMIN_VERSION=${targetVersion} \\
          nself/admin:${targetVersion}
      `
      
      // Execute update
      await execAsync(`echo '${updateScript}' | bash`)
      
      this.isUpdating = false
      return {
        updating: false,
        progress: 100,
        message: `Successfully updated to version ${targetVersion}`
      }
    } catch (error: any) {
      this.isUpdating = false
      return {
        updating: false,
        progress: 0,
        message: 'Update failed',
        error: error.message
      }
    }
  }
  
  startAutoUpdateCheck(intervalHours = 6): void {
    this.stopAutoUpdateCheck()
    
    // Check immediately
    this.checkForUpdates()
    
    // Set up interval
    this.updateInterval = setInterval(() => {
      this.checkForUpdates()
    }, intervalHours * 60 * 60 * 1000)
  }
  
  stopAutoUpdateCheck(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }
  }
  
  private async checkForUpdates(): Promise<void> {
    const versionInfo = await this.getLatestVersion()
    
    if (versionInfo.updateAvailable) {
      // Emit update available event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('update-available', { detail: versionInfo }))
      }
      
      // Log to console
      console.log(`Update available: ${versionInfo.current} -> ${versionInfo.latest}`)
    }
  }
}

export const autoUpdater = AutoUpdater.getInstance()