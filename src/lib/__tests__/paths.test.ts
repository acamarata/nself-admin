import os from 'os'
import path from 'path'
import { getDockerSocketPath, getProjectPath } from '../paths'

describe('paths utilities', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('getProjectPath', () => {
    it('uses NSELF_PROJECT_PATH if set', () => {
      const env = { ...process.env, NSELF_PROJECT_PATH: '/custom/path' }
      Object.assign(process.env, env)
      const result = getProjectPath()
      expect(result).toBe('/custom/path')
    })

    it('uses PROJECT_PATH if NSELF_PROJECT_PATH not set', () => {
      const env = { ...process.env }
      delete env.NSELF_PROJECT_PATH
      env.PROJECT_PATH = '/fallback/path'
      Object.assign(process.env, env)
      const result = getProjectPath()
      expect(result).toBe('/fallback/path')
    })

    it('uses default path in development', () => {
      const result = getProjectPath()
      expect(result).toBeTruthy()
    })

    it('expands tilde to home directory', () => {
      const env = { ...process.env, NSELF_PROJECT_PATH: '~/my-project' }
      Object.assign(process.env, env)
      const result = getProjectPath()
      expect(result).toBe(path.join(os.homedir(), 'my-project'))
    })

    it('returns absolute paths as-is', () => {
      const env = { ...process.env, NSELF_PROJECT_PATH: '/absolute/path' }
      Object.assign(process.env, env)
      const result = getProjectPath()
      expect(result).toBe('/absolute/path')
    })
  })

  describe('getDockerSocketPath', () => {
    it('returns docker socket path', () => {
      const result = getDockerSocketPath()
      expect(result).toBe('/var/run/docker.sock')
    })
  })
})
