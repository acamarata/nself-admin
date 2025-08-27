// Centralized session storage
// In production, this should be Redis or a database

interface Session {
  expiresAt: Date
  userId: string
}

// Global session store
export const sessions = new Map<string, Session>()

// Clean up expired sessions periodically
setInterval(() => {
  const now = new Date()
  for (const [token, session] of sessions.entries()) {
    if (session.expiresAt < now) {
      sessions.delete(token)
    }
  }
}, 60 * 60 * 1000) // Clean every hour