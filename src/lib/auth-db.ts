import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import {
  addAuditLog,
  createSession,
  deleteSession,
  getAdminPasswordHash,
  getSession,
  hasAdminPassword,
  setAdminPassword,
} from './database'

// Configuration
const SALT_ROUNDS = 12
const MIN_PASSWORD_LENGTH_PROD = 12
const MIN_PASSWORD_LENGTH_DEV = 3

// Password validation for production
export function validatePassword(
  password: string,
  isDev: boolean = false,
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (isDev) {
    // Relaxed validation for development
    if (password.length < MIN_PASSWORD_LENGTH_DEV) {
      errors.push(
        `Password must be at least ${MIN_PASSWORD_LENGTH_DEV} characters`,
      )
    }
  } else {
    // Strict validation for production
    if (password.length < MIN_PASSWORD_LENGTH_PROD) {
      errors.push(
        `Password must be at least ${MIN_PASSWORD_LENGTH_PROD} characters`,
      )
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain an uppercase letter')
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain a lowercase letter')
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain a number')
    }

    if (!/[@$!%*?&]/.test(password)) {
      errors.push('Password must contain a special character')
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

// Verify password
export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// Check if admin password exists
export async function checkPasswordExists(): Promise<boolean> {
  return hasAdminPassword()
}

// Set up admin password (first time setup)
export async function setupAdminPassword(
  password: string,
  isDev: boolean = false,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if password already exists
    if (await hasAdminPassword()) {
      return { success: false, error: 'Password already set' }
    }

    // Validate password
    const validation = validatePassword(password, isDev)
    if (!validation.valid) {
      return { success: false, error: validation.errors.join(', ') }
    }

    // Hash and store password
    const hash = await hashPassword(password)
    await setAdminPassword(hash)

    return { success: true }
  } catch (error) {
    console.error('Error setting up password:', error)
    return { success: false, error: 'Failed to set password' }
  }
}

// Verify admin login
export async function verifyAdminLogin(password: string): Promise<boolean> {
  try {
    const hash = await getAdminPasswordHash()
    if (!hash) return false

    const isValid = await verifyPassword(password, hash)

    // Log the attempt
    await addAuditLog('login_attempt', { success: isValid }, isValid)

    return isValid
  } catch (error) {
    console.error('Error verifying login:', error)
    return false
  }
}

// Create login session
export async function createLoginSession(
  ip?: string,
  userAgent?: string,
): Promise<string> {
  const token = await createSession('admin', ip, userAgent)
  await addAuditLog('login_success', { ip, userAgent }, true, 'admin')
  return token
}

// Validate session token
export async function validateSessionToken(token: string): Promise<boolean> {
  const session = await getSession(token)
  return !!session
}

// Logout (delete session)
export async function logout(token: string): Promise<void> {
  await deleteSession(token)
}

// Generate secure token
export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

// Check if development mode
export async function isDevMode(): Promise<boolean> {
  // Check hostname patterns
  const hostname = process.env.HOSTNAME || 'localhost'
  const devPatterns = [
    /^localhost/,
    /^127\.0\.0\.1/,
    /^0\.0\.0\.0/,
    /\.localhost$/,
    /\.local$/,
    /^admin\.localhost$/,
  ]

  const isDevHostname = devPatterns.some((pattern) => pattern.test(hostname))
  const isDevEnv = process.env.NODE_ENV === 'development'

  return isDevHostname || isDevEnv
}

// Legacy auth object for backwards compatibility with tests
export const auth = {
  hasPassword: checkPasswordExists,
  setPassword: async (password: string) => {
    const result = await setupAdminPassword(password, await isDevMode())
    if (!result.success) throw new Error(result.error)
    return true
  },
  validatePassword: verifyAdminLogin,
  createSession: createLoginSession,
  validateSession: async (token: string) => {
    const isValid = await validateSessionToken(token)
    return isValid ? { userId: 'admin', token } : null
  },
  deleteSession: logout,
}
