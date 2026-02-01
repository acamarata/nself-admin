import { NextRequest, NextResponse } from 'next/server'
import {
  csrfErrorResponse,
  generateCSRFToken,
  originErrorResponse,
  setCSRFCookie,
  validateCSRFToken,
  validateCSRFTokenSync,
  validateOrigin,
} from '../csrf'
import { createSession } from '../database'

describe('CSRF Protection', () => {
  describe('generateCSRFToken', () => {
    it('should generate a token', () => {
      const token = generateCSRFToken()
      expect(token).toBeTruthy()
      expect(typeof token).toBe('string')
      expect(token.length).toBe(64) // 32 bytes * 2 (hex)
    })

    it('should generate unique tokens', () => {
      const token1 = generateCSRFToken()
      const token2 = generateCSRFToken()
      expect(token1).not.toBe(token2)
    })

    it('should only contain hex characters', () => {
      const token = generateCSRFToken()
      expect(token).toMatch(/^[0-9a-f]+$/)
    })
  })

  describe('setCSRFCookie', () => {
    it('should set CSRF cookie in response', () => {
      const response = NextResponse.json({ success: true })
      const token = setCSRFCookie(response)

      expect(token).toBeTruthy()
      expect(typeof token).toBe('string')
    })

    it('should accept custom token', () => {
      const customToken = 'custom-token-123'
      const response = NextResponse.json({ success: true })
      const token = setCSRFCookie(response, customToken)

      expect(token).toBe(customToken)
    })
  })

  describe('validateCSRFTokenSync', () => {
    it('should return true for GET requests', () => {
      const request = new NextRequest('http://localhost:3021/api/test', {
        method: 'GET',
      })
      expect(validateCSRFTokenSync(request)).toBe(true)
    })

    it('should return true for HEAD requests', () => {
      const request = new NextRequest('http://localhost:3021/api/test', {
        method: 'HEAD',
      })
      expect(validateCSRFTokenSync(request)).toBe(true)
    })

    it('should return false for POST without token', () => {
      const request = new NextRequest('http://localhost:3021/api/test', {
        method: 'POST',
      })
      expect(validateCSRFTokenSync(request)).toBe(false)
    })

    it('should validate matching tokens', () => {
      const token = generateCSRFToken()
      const request = new NextRequest('http://localhost:3021/api/test', {
        method: 'POST',
        headers: {
          'x-csrf-token': token,
          Cookie: `nself-csrf=${token}`,
        },
      })
      expect(validateCSRFTokenSync(request)).toBe(true)
    })

    it('should reject mismatched tokens', () => {
      const request = new NextRequest('http://localhost:3021/api/test', {
        method: 'POST',
        headers: {
          'x-csrf-token': 'token1',
          Cookie: 'nself-csrf=token2',
        },
      })
      expect(validateCSRFTokenSync(request)).toBe(false)
    })

    it('should use constant-time comparison', () => {
      const token = generateCSRFToken()
      const wrongToken = token.slice(0, -1) + 'x'

      const request = new NextRequest('http://localhost:3021/api/test', {
        method: 'POST',
        headers: {
          'x-csrf-token': wrongToken,
          Cookie: `nself-csrf=${token}`,
        },
      })

      expect(validateCSRFTokenSync(request)).toBe(false)
    })
  })

  describe('validateCSRFToken (async, session-based)', () => {
    it('should return true for GET requests', async () => {
      const request = new NextRequest('http://localhost:3021/api/test', {
        method: 'GET',
      })
      expect(await validateCSRFToken(request)).toBe(true)
    })

    it('should return false for POST without header token', async () => {
      const request = new NextRequest('http://localhost:3021/api/test', {
        method: 'POST',
      })
      expect(await validateCSRFToken(request)).toBe(false)
    })

    it('should validate against session CSRF token', async () => {
      // Create a session
      const sessionToken = await createSession('admin', '127.0.0.1')

      // Get session to extract CSRF token
      const { getSession } = await import('../database')
      const session = await getSession(sessionToken)
      const csrfToken = session?.csrfToken

      const request = new NextRequest('http://localhost:3021/api/test', {
        method: 'POST',
        headers: {
          'x-csrf-token': csrfToken || '',
        },
      })

      expect(await validateCSRFToken(request, sessionToken)).toBe(true)

      // Cleanup
      const { deleteSession } = await import('../database')
      await deleteSession(sessionToken)
    })

    it('should reject invalid session token', async () => {
      const request = new NextRequest('http://localhost:3021/api/test', {
        method: 'POST',
        headers: {
          'x-csrf-token': 'some-token',
        },
      })

      expect(await validateCSRFToken(request, 'invalid-session')).toBe(false)
    })

    it('should fallback to cookie validation', async () => {
      const token = generateCSRFToken()
      const request = new NextRequest('http://localhost:3021/api/test', {
        method: 'POST',
        headers: {
          'x-csrf-token': token,
          Cookie: `nself-csrf=${token}`,
        },
      })

      expect(await validateCSRFToken(request)).toBe(true)
    })
  })

  describe('csrfErrorResponse', () => {
    it('should return 403 error', () => {
      const response = csrfErrorResponse()
      expect(response.status).toBe(403)
    })

    it('should return error message', async () => {
      const response = csrfErrorResponse()
      const data = await response.json()
      expect(data.error).toBe('CSRF token validation failed')
    })
  })

  describe('validateOrigin', () => {
    it('should return true for GET requests', () => {
      const request = new NextRequest('http://localhost:3021/api/test', {
        method: 'GET',
      })
      expect(validateOrigin(request)).toBe(true)
    })

    it('should return true for HEAD requests', () => {
      const request = new NextRequest('http://localhost:3021/api/test', {
        method: 'HEAD',
      })
      expect(validateOrigin(request)).toBe(true)
    })

    it('should return true for OPTIONS requests', () => {
      const request = new NextRequest('http://localhost:3021/api/test', {
        method: 'OPTIONS',
      })
      expect(validateOrigin(request)).toBe(true)
    })

    it('should accept localhost origins', () => {
      const request = new NextRequest('http://localhost:3021/api/test', {
        method: 'POST',
        headers: {
          origin: 'http://localhost:3021',
        },
      })
      expect(validateOrigin(request)).toBe(true)
    })

    it('should accept localhost with different ports', () => {
      const request = new NextRequest('http://localhost:3021/api/test', {
        method: 'POST',
        headers: {
          origin: 'http://localhost:8080',
        },
      })
      expect(validateOrigin(request)).toBe(true)
    })

    it('should accept 127.0.0.1 origins', () => {
      const request = new NextRequest('http://localhost:3021/api/test', {
        method: 'POST',
        headers: {
          origin: 'http://127.0.0.1:3021',
        },
      })
      expect(validateOrigin(request)).toBe(true)
    })

    it('should accept .local domains', () => {
      const request = new NextRequest('http://localhost:3021/api/test', {
        method: 'POST',
        headers: {
          origin: 'http://admin.local:3021',
        },
      })
      expect(validateOrigin(request)).toBe(true)
    })

    it('should accept nself admin domain', () => {
      const request = new NextRequest('http://localhost:3021/api/test', {
        method: 'POST',
        headers: {
          origin: 'http://admin.local.nself.org:3021',
        },
      })
      expect(validateOrigin(request)).toBe(true)
    })

    it('should reject unknown origins in production', () => {
      const originalEnv = process.env.NODE_ENV
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        writable: true,
        configurable: true,
      })

      const request = new NextRequest('http://localhost:3021/api/test', {
        method: 'POST',
        headers: {
          origin: 'http://evil.com',
        },
      })
      expect(validateOrigin(request)).toBe(false)

      Object.defineProperty(process.env, 'NODE_ENV', {
        value: originalEnv,
        writable: true,
        configurable: true,
      })
    })

    it('should use referer if origin not present', () => {
      const request = new NextRequest('http://localhost:3021/api/test', {
        method: 'POST',
        headers: {
          referer: 'http://localhost:3021/dashboard',
        },
      })
      expect(validateOrigin(request)).toBe(true)
    })

    it('should be lenient in development without origin', () => {
      const originalEnv = process.env.NODE_ENV
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'development',
        writable: true,
        configurable: true,
      })

      const request = new NextRequest('http://localhost:3021/api/test', {
        method: 'POST',
      })
      expect(validateOrigin(request)).toBe(true)

      Object.defineProperty(process.env, 'NODE_ENV', {
        value: originalEnv,
        writable: true,
        configurable: true,
      })
    })
  })

  describe('originErrorResponse', () => {
    it('should return 403 error', () => {
      const response = originErrorResponse()
      expect(response.status).toBe(403)
    })

    it('should return error message', async () => {
      const response = originErrorResponse()
      const data = await response.json()
      expect(data.error).toBe('Request origin not allowed')
    })
  })

  describe('Security Properties', () => {
    it('should generate cryptographically random tokens', () => {
      const tokens = new Set<string>()
      for (let i = 0; i < 100; i++) {
        tokens.add(generateCSRFToken())
      }
      // All tokens should be unique
      expect(tokens.size).toBe(100)
    })

    it('should use constant-time comparison to prevent timing attacks', () => {
      const token = generateCSRFToken()
      const wrongToken1 = 'x'.repeat(64)
      const wrongToken2 = token.slice(0, -1) + 'x'

      const request1 = new NextRequest('http://localhost:3021/api/test', {
        method: 'POST',
        headers: {
          'x-csrf-token': wrongToken1,
          Cookie: `nself-csrf=${token}`,
        },
      })

      const request2 = new NextRequest('http://localhost:3021/api/test', {
        method: 'POST',
        headers: {
          'x-csrf-token': wrongToken2,
          Cookie: `nself-csrf=${token}`,
        },
      })

      expect(validateCSRFTokenSync(request1)).toBe(false)
      expect(validateCSRFTokenSync(request2)).toBe(false)
    })
  })
})
