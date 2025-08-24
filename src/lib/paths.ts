/**
 * Project path utilities for nself-admin
 */

/**
 * Get the project path from environment variable
 * Defaults to current directory for development
 */
export function getProjectPath(): string {
  return process.env.PROJECT_PATH || './'
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