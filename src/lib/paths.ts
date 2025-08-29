/**
 * Project path utilities for nself-admin
 */

/**
 * Get the project path from environment variable
 * Uses PROJECT_PATH from .env.local or environment
 */
export function getProjectPath(): string {
  const projectPath = process.env.PROJECT_PATH || '.backend'
  
  // If it's a relative path, resolve it relative to the app root
  if (!projectPath.startsWith('/')) {
    // In development, resolve relative to the nself-admin directory
    if (process.env.NODE_ENV === 'development') {
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