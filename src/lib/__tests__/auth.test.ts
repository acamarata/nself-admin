import {
  generateSecurePassword,
  generateSessionToken,
  generateToken,
  hashPassword,
  isTokenExpired,
  secureCompare,
  validatePassword,
  verifyPassword,
} from '../auth'

describe('auth utilities', () => {
  describe('validatePassword', () => {
    it('rejects passwords shorter than minimum length', () => {
      const result = validatePassword('short')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain(
        'Password must be at least 12 characters long',
      )
    })

    it('rejects passwords without complexity requirements', () => {
      const result = validatePassword('alllowercase')
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('rejects common weak passwords', () => {
      const result = validatePassword('password123')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain(
        'Password is too common. Please choose a stronger password',
      )
    })

    it('rejects passwords with sequential characters', () => {
      const result = validatePassword('Abcdefg123!@')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Password contains sequential characters')
    })

    it('rejects passwords with repeated characters', () => {
      const result = validatePassword('Aaaa1234567!@')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain(
        'Password contains too many repeated characters',
      )
    })

    it('accepts strong passwords', () => {
      const result = validatePassword('MyP@ssw0rd!Str0ng')
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })

  describe('hashPassword', () => {
    it('hashes a valid password', async () => {
      const password = 'MySecure#Pass123'
      const hash = await hashPassword(password)
      expect(hash).toBeTruthy()
      expect(hash).not.toBe(password)
      expect(hash.startsWith('$2b$')).toBe(true)
    })

    it('throws error for weak password in production', async () => {
      await expect(hashPassword('weak')).rejects.toThrow('Weak password')
    })

    it('allows weak password in development', async () => {
      const hash = await hashPassword('dev')
      expect(hash).toBeTruthy()
    })
  })

  describe('verifyPassword', () => {
    it('returns true for matching password and hash', async () => {
      const password = 'MySecure#Pass123'
      const hash = await hashPassword(password)
      const result = await verifyPassword(password, hash)
      expect(result).toBe(true)
    })

    it('returns false for non-matching password and hash', async () => {
      const password = 'MySecure#Pass123'
      const hash = await hashPassword(password)
      const result = await verifyPassword('WrongPassword!1', hash)
      expect(result).toBe(false)
    })
  })

  describe('generateToken', () => {
    it('generates a random token', () => {
      const token = generateToken()
      expect(token).toBeTruthy()
      expect(typeof token).toBe('string')
      expect(token.length).toBe(64) // 32 bytes * 2 hex chars
    })

    it('generates unique tokens', () => {
      const token1 = generateToken()
      const token2 = generateToken()
      expect(token1).not.toBe(token2)
    })
  })

  describe('generateSessionToken', () => {
    it('generates session token with expiry', () => {
      const session = generateSessionToken()
      expect(session.token).toBeTruthy()
      expect(session.expiresAt).toBeInstanceOf(Date)
      expect(session.expiresAt.getTime()).toBeGreaterThan(Date.now())
    })

    it('sets expiry to 24 hours in future', () => {
      const session = generateSessionToken()
      const expectedExpiry = Date.now() + 24 * 60 * 60 * 1000
      const actualExpiry = session.expiresAt.getTime()
      expect(Math.abs(actualExpiry - expectedExpiry)).toBeLessThan(1000)
    })
  })

  describe('isTokenExpired', () => {
    it('returns false for future date', () => {
      const futureDate = new Date(Date.now() + 60000)
      expect(isTokenExpired(futureDate)).toBe(false)
    })

    it('returns true for past date', () => {
      const pastDate = new Date(Date.now() - 60000)
      expect(isTokenExpired(pastDate)).toBe(true)
    })

    it('returns true for current date', () => {
      const now = new Date()
      expect(isTokenExpired(now)).toBe(true)
    })
  })

  describe('generateSecurePassword', () => {
    it('generates password of specified length', () => {
      const password = generateSecurePassword(16)
      expect(password.length).toBeGreaterThanOrEqual(16)
    })

    it('generates password with complexity requirements', () => {
      const password = generateSecurePassword()
      expect(/[A-Z]/.test(password)).toBe(true)
      expect(/[a-z]/.test(password)).toBe(true)
      expect(/\d/.test(password)).toBe(true)
      expect(/[@$!%*?&]/.test(password)).toBe(true)
    })

    it('generates unique passwords', () => {
      const pass1 = generateSecurePassword()
      const pass2 = generateSecurePassword()
      expect(pass1).not.toBe(pass2)
    })
  })

  describe('secureCompare', () => {
    it('returns true for matching strings', () => {
      expect(secureCompare('test', 'test')).toBe(true)
    })

    it('returns false for non-matching strings', () => {
      expect(secureCompare('test', 'TEST')).toBe(false)
    })

    it('returns false for different lengths', () => {
      expect(secureCompare('test', 'testing')).toBe(false)
    })

    it('returns false for empty vs non-empty', () => {
      expect(secureCompare('', 'test')).toBe(false)
    })
  })
})
