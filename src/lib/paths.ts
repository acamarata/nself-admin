/**
 * Project path utilities for nself-admin
 */

/**
 * Get the project path from environment variable
 * Uses NSELF_PROJECT_PATH or PROJECT_PATH from environment
 */
export function getProjectPath(): string {
  // Check both NSELF_PROJECT_PATH and PROJECT_PATH for compatibility
  let projectPath = process.env.NSELF_PROJECT_PATH || process.env.PROJECT_PATH || '../nself-project'
  
  // Handle tilde expansion for home directory
  if (projectPath.startsWith('~')) {
    const os = require('os')
    projectPath = projectPath.replace(/^~/, os.homedir())
  }
  
  // If it's a relative path, resolve it relative to the app root
  if (!projectPath.startsWith('/')) {
    // In development, resolve relative to the nself-admin directory
    if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
      // Handle relative paths like ../nself-project
      if (projectPath.startsWith('../')) {
        // Get the absolute path by going up from nself-admin
        const path = require('path')
        return path.resolve(process.cwd(), projectPath)
      }
      return `/Users/admin/Sites/nself-admin/${projectPath}`
    }
    // In production, relative paths are relative to the container's working directory
    return `/app/${projectPath}`
  }
  
  // Absolute path - use as-is
  return projectPath
}

/**
 * Get the Docker socket path based on platform
 */
export function getDockerSocketPath(): string {
  // In container, Docker socket is always mounted at /var/run/docker.sock
  // For development, try common Docker Desktop paths
  if (process.env.NODE_ENV === 'production') {
    return '/var/run/docker.sock'
  }
  
  // Development fallback paths
  const paths = [
    '/var/run/docker.sock',
    process.env.HOME + '/.docker/run/docker.sock',
    '/Users/' + process.env.USER + '/.docker/run/docker.sock'
  ]
  
  return paths[0] // Default to standard path
}