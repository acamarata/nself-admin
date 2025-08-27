import * as bcrypt from 'bcryptjs'

// Configuration
const SALT_ROUNDS = 10
const TOKEN_EXPIRY_HOURS = 24

// Password hashing utilities
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// Token generation using Web Crypto API for edge runtime compatibility
export function generateToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

// Session token with expiry
export function generateSessionToken(): { token: string; expiresAt: Date } {
  return {
    token: generateToken(),
    expiresAt: new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000)
  }
}

// Verify token expiry
export function isTokenExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt
}

// Hash the admin password on first setup
export async function getAdminPasswordHash(): Promise<string> {
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
  const isHashed = process.env.ADMIN_PASSWORD_IS_HASHED === 'true'
  
  // If explicitly marked as hashed, return as-is
  if (isHashed) {
    return adminPassword
  }
  
  // Check if it's already hashed (bcrypt hashes start with $2)
  if (adminPassword.startsWith('$2')) {
    return adminPassword
  }
  
  // Hash the plain password for first-time setup
  return hashPassword(adminPassword)
}

// Constant time comparison to prevent timing attacks
export function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false
  }
  
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}