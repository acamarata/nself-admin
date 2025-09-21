import bcrypt from 'bcryptjs'
import { auth } from '../auth-db'

// Mock the database module
jest.mock('../database', () => ({
  db: {
    getCollection: jest.fn(),
  },
}))

describe('Authentication Module', () => {
  let mockConfigCollection: any
  let mockSessionsCollection: any

  beforeEach(() => {
    jest.clearAllMocks()

    // Setup mock collections
    mockConfigCollection = {
      findOne: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
    }

    mockSessionsCollection = {
      findOne: jest.fn(),
      insert: jest.fn(),
      remove: jest.fn(),
      find: jest.fn(() => ({
        count: jest.fn(() => 0),
      })),
    }

    // Mock db.getCollection
    const { db } = require('../database')
    db.getCollection.mockImplementation((name: string) => {
      if (name === 'config') return mockConfigCollection
      if (name === 'sessions') return mockSessionsCollection
      return null
    })
  })

  describe('setPassword', () => {
    it('should hash and store a new password', async () => {
      mockConfigCollection.findOne.mockReturnValue(null)

      const password = 'testPassword123!'
      const result = await auth.setPassword(password)

      expect(result).toBe(true)
      expect(mockConfigCollection.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          key: 'admin_password_hash',
          value: expect.any(String),
        }),
      )

      // Verify the password was hashed
      const insertedDoc = mockConfigCollection.insert.mock.calls[0][0]
      const isValidHash = await bcrypt.compare(password, insertedDoc.value)
      expect(isValidHash).toBe(true)
    })

    it('should update existing password', async () => {
      const existingDoc = {
        key: 'admin_password_hash',
        value: 'old_hash',
      }
      mockConfigCollection.findOne.mockReturnValue(existingDoc)

      const password = 'newPassword456!'
      const result = await auth.setPassword(password)

      expect(result).toBe(true)
      expect(mockConfigCollection.update).toHaveBeenCalledWith(existingDoc)

      // Verify the password was hashed
      const isValidHash = await bcrypt.compare(password, existingDoc.value)
      expect(isValidHash).toBe(true)
    })

    it('should reject invalid passwords', async () => {
      await expect(auth.setPassword('')).rejects.toThrow(
        'Password cannot be empty',
      )
    })
  })

  describe('validatePassword', () => {
    it('should validate correct password', async () => {
      const password = 'correctPassword'
      const hash = await bcrypt.hash(password, 10)

      mockConfigCollection.findOne.mockReturnValue({
        value: hash,
      })

      const result = await auth.validatePassword(password)
      expect(result).toBe(true)
    })

    it('should reject incorrect password', async () => {
      const hash = await bcrypt.hash('correctPassword', 10)

      mockConfigCollection.findOne.mockReturnValue({
        value: hash,
      })

      const result = await auth.validatePassword('wrongPassword')
      expect(result).toBe(false)
    })

    it('should return false if no password is set', async () => {
      mockConfigCollection.findOne.mockReturnValue(null)

      const result = await auth.validatePassword('anyPassword')
      expect(result).toBe(false)
    })
  })

  describe('createSession', () => {
    it('should create a new session', async () => {
      mockSessionsCollection.find.mockReturnValue({
        count: jest.fn(() => 0),
      })

      const sessionToken = await auth.createSession('admin', '192.168.1.1')

      expect(sessionToken).toEqual(expect.any(String))
      expect(sessionToken.length).toBeGreaterThan(0)

      expect(mockSessionsCollection.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          token: sessionToken,
          userId: 'admin',
          ip: '192.168.1.1',
        }),
      )
    })

    it('should limit active sessions per IP', async () => {
      mockSessionsCollection.find.mockReturnValue({
        count: jest.fn(() => 5),
      })

      await expect(auth.createSession('admin', '192.168.1.1')).rejects.toThrow(
        'Too many active sessions',
      )
    })
  })

  describe('validateSession', () => {
    it('should validate active session', async () => {
      const futureDate = new Date(Date.now() + 3600000).toISOString()
      const session = {
        token: 'valid-token',
        userId: 'admin',
        expiresAt: futureDate,
      }

      mockSessionsCollection.findOne.mockReturnValue(session)

      const result = await auth.validateSession('valid-token')
      expect(result).toEqual(session)
    })

    it('should reject expired session', async () => {
      const pastDate = new Date(Date.now() - 3600000).toISOString()
      const session = {
        token: 'expired-token',
        userId: 'admin',
        expiresAt: pastDate,
      }

      mockSessionsCollection.findOne.mockReturnValue(session)

      const result = await auth.validateSession('expired-token')
      expect(result).toBeNull()
      expect(mockSessionsCollection.remove).toHaveBeenCalledWith(session)
    })

    it('should return null for invalid token', async () => {
      mockSessionsCollection.findOne.mockReturnValue(null)

      const result = await auth.validateSession('invalid-token')
      expect(result).toBeNull()
    })
  })

  describe('deleteSession', () => {
    it('should delete existing session', async () => {
      const session = { token: 'to-delete', userId: 'admin' }
      mockSessionsCollection.findOne.mockReturnValue(session)

      const result = await auth.deleteSession('to-delete')
      expect(result).toBe(true)
      expect(mockSessionsCollection.remove).toHaveBeenCalledWith(session)
    })

    it('should handle non-existent session', async () => {
      mockSessionsCollection.findOne.mockReturnValue(null)

      const result = await auth.deleteSession('non-existent')
      expect(result).toBe(false)
      expect(mockSessionsCollection.remove).not.toHaveBeenCalled()
    })
  })
})
