import { sessions } from '../sessions'

describe('sessions', () => {
  beforeEach(() => {
    sessions.clear()
    jest.clearAllTimers()
  })

  afterEach(() => {
    sessions.clear()
  })

  it('creates an empty session map', () => {
    expect(sessions.size).toBe(0)
  })

  it('allows adding sessions', () => {
    const token = 'test-token'
    const expiresAt = new Date(Date.now() + 60000)
    sessions.set(token, { expiresAt, userId: 'admin' })
    expect(sessions.size).toBe(1)
  })

  it('allows retrieving sessions', () => {
    const token = 'test-token'
    const expiresAt = new Date(Date.now() + 60000)
    sessions.set(token, { expiresAt, userId: 'admin' })
    const session = sessions.get(token)
    expect(session).toBeDefined()
    expect(session?.userId).toBe('admin')
  })

  it('allows deleting sessions', () => {
    const token = 'test-token'
    const expiresAt = new Date(Date.now() + 60000)
    sessions.set(token, { expiresAt, userId: 'admin' })
    sessions.delete(token)
    expect(sessions.size).toBe(0)
  })

  it('handles multiple sessions', () => {
    const future = new Date(Date.now() + 60000)
    sessions.set('token1', { expiresAt: future, userId: 'user1' })
    sessions.set('token2', { expiresAt: future, userId: 'user2' })
    sessions.set('token3', { expiresAt: future, userId: 'user3' })
    expect(sessions.size).toBe(3)
  })

  it('can iterate over sessions', () => {
    const future = new Date(Date.now() + 60000)
    sessions.set('token1', { expiresAt: future, userId: 'user1' })
    sessions.set('token2', { expiresAt: future, userId: 'user2' })

    const userIds: string[] = []
    for (const [, session] of sessions.entries()) {
      userIds.push(session.userId)
    }

    expect(userIds).toContain('user1')
    expect(userIds).toContain('user2')
  })
})
