/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { POST as loginPOST, DELETE as logoutDELETE } from '../auth/login/route'
// Note: Using init route for setup functionality
import { GET as statusGET } from '../auth/check/route'
import { POST as setupPOST } from '../auth/init/route'

// Mock the auth module
jest.mock('@/lib/auth-db', () => ({
  checkPasswordExists: jest.fn(),
  setupAdminPassword: jest.fn(),
  verifyAdminLogin: jest.fn(),
  createLoginSession: jest.fn(),
  validateSessionToken: jest.fn(),
  logout: jest.fn(),
}))

// Mock rate limiter
jest.mock('@/lib/rateLimiter', () => ({
  isRateLimited: jest.fn(() => false),
  getRateLimitInfo: jest.fn(() => ({
    limit: 5,
    remaining: 5,
    resetTime: Date.now() + 60000,
  })),
  clearRateLimit: jest.fn(),
}))

// Mock validation
jest.mock('@/lib/validation', () => ({
  validateRequest: jest.fn(),
}))

describe('Auth API Routes', () => {
  const authFunctions = require('@/lib/auth-db')
  const { validateRequest } = require('@/lib/validation')

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/auth/setup', () => {
    it('should set up password for first time', async () => {
      authFunctions.checkPasswordExists.mockResolvedValue(false)
      authFunctions.setupAdminPassword.mockResolvedValue({ success: true })
      validateRequest.mockResolvedValue({
        success: true,
        data: { password: 'SecurePass123!' },
      })

      const request = new NextRequest('http://localhost:3021/api/auth/setup', {
        method: 'POST',
        body: JSON.stringify({ password: 'SecurePass123!' }),
      })

      const response = await setupPOST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(authFunctions.setupAdminPassword).toHaveBeenCalledWith(
        'SecurePass123!',
        expect.any(Boolean),
      )
    })

    it('should reject if password already exists', async () => {
      authFunctions.checkPasswordExists.mockResolvedValue(true)
      validateRequest.mockResolvedValue({
        success: true,
        data: { password: 'SecurePass123!' },
      })

      const request = new NextRequest('http://localhost:3021/api/auth/setup', {
        method: 'POST',
        body: JSON.stringify({ password: 'SecurePass123!' }),
      })

      const response = await setupPOST(request)

      expect(response.status).toBe(400)
    })

    it('should validate password requirements in production', async () => {
      // Mock environment for validation
      const originalEnv = process.env.NODE_ENV
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        writable: true,
        configurable: true,
      })

      authFunctions.checkPasswordExists.mockResolvedValue(false)
      authFunctions.setupAdminPassword.mockResolvedValue({
        success: false,
        error: 'Password must be at least 12 characters',
      })
      validateRequest.mockResolvedValue({
        success: true,
        data: { password: 'weak' },
      })

      const request = new NextRequest('http://localhost:3021/api/auth/setup', {
        method: 'POST',
        body: JSON.stringify({ password: 'weak' }),
      })

      const response = await setupPOST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Password must be')

      // Restore original env
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: originalEnv,
        writable: true,
        configurable: true,
      })
    })
  })

  describe('POST /api/auth/login', () => {
    it('should login with correct password', async () => {
      authFunctions.checkPasswordExists.mockResolvedValue(true)
      authFunctions.verifyAdminLogin.mockResolvedValue(true)
      authFunctions.createLoginSession.mockResolvedValue('session-token-123')
      validateRequest.mockResolvedValue({
        success: true,
        data: { password: 'CorrectPass123!' },
      })

      const request = new NextRequest('http://localhost:3021/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ password: 'CorrectPass123!' }),
        headers: {
          'x-forwarded-for': '192.168.1.1',
        },
      })

      const response = await loginPOST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(response.headers.get('Set-Cookie')).toContain(
        'nself-session=session-token-123',
      )
    })

    it('should reject incorrect password', async () => {
      authFunctions.checkPasswordExists.mockResolvedValue(true)
      authFunctions.verifyAdminLogin.mockResolvedValue(false)
      validateRequest.mockResolvedValue({
        success: true,
        data: { password: 'WrongPass123!' },
      })

      const request = new NextRequest('http://localhost:3021/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ password: 'WrongPass123!' }),
      })

      const response = await loginPOST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Invalid credentials')
    })
  })

  describe('DELETE /api/auth/logout', () => {
    it('should logout and delete session', async () => {
      authFunctions.logout.mockResolvedValue(true)

      const request = new NextRequest('http://localhost:3021/api/auth/logout', {
        method: 'DELETE',
        headers: {
          cookie: 'nself-session=valid-session-token',
        },
      })

      const response = await logoutDELETE(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(authFunctions.logout).toHaveBeenCalledWith('valid-session-token')
      expect(response.headers.get('Set-Cookie')).toContain('nself-session=; ')
    })
  })

  describe('GET /api/auth/status', () => {
    it('should return authenticated status with valid session', async () => {
      authFunctions.validateSessionToken.mockResolvedValue(true)
      authFunctions.checkPasswordExists.mockResolvedValue(true)

      const request = new NextRequest('http://localhost:3021/api/auth/status', {
        method: 'GET',
        headers: {
          cookie: 'nself-session=valid-token',
        },
      })

      const response = await statusGET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.authenticated).toBe(true)
    })

    it('should return unauthenticated status with invalid session', async () => {
      authFunctions.validateSessionToken.mockResolvedValue(false)
      authFunctions.checkPasswordExists.mockResolvedValue(true)

      const request = new NextRequest('http://localhost:3021/api/auth/status', {
        method: 'GET',
        headers: {
          cookie: 'nself-session=invalid-token',
        },
      })

      const response = await statusGET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.authenticated).toBe(false)
    })

    it('should include hasPassword status', async () => {
      authFunctions.validateSessionToken.mockResolvedValue(false)
      authFunctions.checkPasswordExists.mockResolvedValue(false)

      const request = new NextRequest('http://localhost:3021/api/auth/status', {
        method: 'GET',
      })

      const response = await statusGET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.hasPassword).toBe(false)
    })
  })
})
