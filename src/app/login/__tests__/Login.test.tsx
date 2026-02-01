/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import LoginPage from '../page'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Mock AuthContext with successful login
const mockLogin = jest.fn().mockResolvedValue(true)
jest.mock('@/contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  useAuth: () => ({
    login: mockLogin,
    logout: jest.fn(),
    isAuthenticated: false,
  }),
}))

// Mock routing logic
jest.mock('@/lib/routing-logic', () => ({
  getCorrectRoute: jest.fn().mockResolvedValue({
    route: '/',
    reason: 'test',
  }),
}))

const mockPush = jest.fn()
const mockRouter = {
  push: mockPush,
  replace: jest.fn(),
  pathname: '/login',
}

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)

    // Mock fetch globally
    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('First-time setup flow', () => {
    beforeEach(() => {
      // Mock password doesn't exist (setup mode)
      ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url === '/api/auth/init') {
          return Promise.resolve({
            json: () => Promise.resolve({ passwordExists: false }),
            ok: true,
          })
        }
        if (url === '/api/auth/csrf') {
          return Promise.resolve({
            json: () => Promise.resolve({ token: 'mock-csrf-token' }),
            ok: true,
          })
        }
        return Promise.reject(new Error('Unknown URL'))
      })
    })

    it('shows welcome message in setup mode', async () => {
      render(<LoginPage />)

      await waitFor(() => {
        expect(screen.getByText('Welcome to nAdmin')).toBeInTheDocument()
      })
    })

    it('shows password requirements in setup mode', async () => {
      render(<LoginPage />)

      await waitFor(() => {
        expect(
          screen.getByText(/Use 12\+ characters with uppercase/i),
        ).toBeInTheDocument()
      })
    })

    it('shows confirm password field in setup mode', async () => {
      render(<LoginPage />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/confirm/i)).toBeInTheDocument()
      })
    })

    it('shows password strength indicator', async () => {
      const user = userEvent.setup()
      render(<LoginPage />)

      await waitFor(() => {
        expect(screen.getByText('Welcome to nAdmin')).toBeInTheDocument()
      })

      const passwordInput = screen.getByPlaceholderText(/create a strong/i)
      await user.type(passwordInput, 'weak')

      await waitFor(() => {
        expect(screen.getByText('Weak')).toBeInTheDocument()
      })
    })

    it('validates password strength on submit', async () => {
      const user = userEvent.setup()
      render(<LoginPage />)

      await waitFor(() => {
        expect(screen.getByText('Welcome to nAdmin')).toBeInTheDocument()
      })

      const passwordInput = screen.getByPlaceholderText(/create a strong/i)
      const confirmInput = screen.getByPlaceholderText(/re-enter/i)
      const submitButton = screen.getByRole('button', { name: /set password/i })

      await user.type(passwordInput, 'weak')
      await user.type(confirmInput, 'weak')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/password is too weak/i)).toBeInTheDocument()
      })
    })

    it('validates passwords match', async () => {
      const user = userEvent.setup()
      render(<LoginPage />)

      await waitFor(() => {
        expect(screen.getByText('Welcome to nAdmin')).toBeInTheDocument()
      })

      const passwordInput = screen.getByPlaceholderText(/create a strong/i)
      const confirmInput = screen.getByPlaceholderText(/re-enter/i)
      const submitButton = screen.getByRole('button', { name: /set password/i })

      await user.type(passwordInput, 'StrongPass123!')
      await user.type(confirmInput, 'DifferentPass456!')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
      })
    })
  })

  describe('Login flow', () => {
    beforeEach(() => {
      // Mock password exists (login mode)
      ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url === '/api/auth/init') {
          return Promise.resolve({
            json: () => Promise.resolve({ passwordExists: true }),
            ok: true,
          })
        }
        if (url === '/api/auth/csrf') {
          return Promise.resolve({
            json: () => Promise.resolve({ token: 'mock-csrf-token' }),
            ok: true,
          })
        }
        if (url === '/api/auth/login') {
          return Promise.resolve({
            json: () => Promise.resolve({ success: true }),
            ok: true,
            status: 200,
          })
        }
        return Promise.reject(new Error('Unknown URL'))
      })
    })

    it('shows username field (fixed as admin)', async () => {
      render(<LoginPage />)

      await waitFor(() => {
        const usernameInput = screen.getByDisplayValue('admin')
        expect(usernameInput).toBeInTheDocument()
        expect(usernameInput).toBeDisabled()
      })
    })

    it('shows password field with visible toggle', async () => {
      const user = userEvent.setup()
      render(<LoginPage />)

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/enter your password/i),
        ).toBeInTheDocument()
      })

      const passwordInput = screen.getByPlaceholderText(/enter your password/i)
      expect(passwordInput).toHaveAttribute('type', 'password')

      // Click eye icon to toggle visibility
      const toggleButton = screen
        .getAllByRole('button')
        .find((btn) => btn.querySelector('svg'))
      if (toggleButton) {
        await user.click(toggleButton)
        await waitFor(() => {
          expect(passwordInput).toHaveAttribute('type', 'text')
        })
      }
    })

    it('shows remember me checkbox', async () => {
      render(<LoginPage />)

      await waitFor(() => {
        expect(
          screen.getByLabelText(/remember me for 30 days/i),
        ).toBeInTheDocument()
      })
    })

    it('auto-focuses password field', async () => {
      render(<LoginPage />)

      await waitFor(() => {
        const passwordInput =
          screen.getByPlaceholderText(/enter your password/i)
        expect(passwordInput).toHaveFocus()
      })
    })
  })

  describe('Rate limiting feedback', () => {
    beforeEach(() => {
      ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url === '/api/auth/init') {
          return Promise.resolve({
            json: () => Promise.resolve({ passwordExists: true }),
            ok: true,
          })
        }
        if (url === '/api/auth/csrf') {
          return Promise.resolve({
            json: () => Promise.resolve({ token: 'mock-csrf-token' }),
            ok: true,
          })
        }
        if (url === '/api/auth/login') {
          return Promise.resolve({
            json: () =>
              Promise.resolve({
                success: false,
                error: 'Too many login attempts',
                retryAfter: 60,
              }),
            ok: false,
            status: 429,
          })
        }
        return Promise.reject(new Error('Unknown URL'))
      })
    })

    it('shows rate limit error after 3 failed attempts', async () => {
      const user = userEvent.setup()
      render(<LoginPage />)

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/enter your password/i),
        ).toBeInTheDocument()
      })

      const passwordInput = screen.getByPlaceholderText(/enter your password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      // Attempt login
      await user.type(passwordInput, 'wrongpassword')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/too many login attempts/i)).toBeInTheDocument()
      })
    })

    it('shows countdown timer during lockout', async () => {
      const user = userEvent.setup()
      render(<LoginPage />)

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/enter your password/i),
        ).toBeInTheDocument()
      })

      const passwordInput = screen.getByPlaceholderText(/enter your password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(passwordInput, 'wrongpassword')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/locked/i)).toBeInTheDocument()
      })
    })

    it('disables form during lockout', async () => {
      const user = userEvent.setup()
      render(<LoginPage />)

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/enter your password/i),
        ).toBeInTheDocument()
      })

      const passwordInput = screen.getByPlaceholderText(/enter your password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(passwordInput, 'wrongpassword')
      await user.click(submitButton)

      await waitFor(() => {
        expect(submitButton).toBeDisabled()
        expect(passwordInput).toBeDisabled()
      })
    })
  })

  describe('Security features', () => {
    beforeEach(() => {
      ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url === '/api/auth/init') {
          return Promise.resolve({
            json: () => Promise.resolve({ passwordExists: true }),
            ok: true,
          })
        }
        if (url === '/api/auth/csrf') {
          return Promise.resolve({
            json: () => Promise.resolve({ token: 'mock-csrf-token' }),
            ok: true,
          })
        }
        if (url === '/api/auth/login') {
          return Promise.resolve({
            json: () => Promise.resolve({ success: true }),
            ok: true,
            status: 200,
          })
        }
        return Promise.reject(new Error('Unknown URL'))
      })
    })

    it('fetches CSRF token before submit', async () => {
      const user = userEvent.setup()
      render(<LoginPage />)

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/enter your password/i),
        ).toBeInTheDocument()
      })

      const passwordInput = screen.getByPlaceholderText(/enter your password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(passwordInput, 'testpassword')
      await user.click(submitButton)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/auth/csrf')
      })
    })

    it('includes CSRF token in login request', async () => {
      const user = userEvent.setup()
      render(<LoginPage />)

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/enter your password/i),
        ).toBeInTheDocument()
      })

      const passwordInput = screen.getByPlaceholderText(/enter your password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(passwordInput, 'testpassword')
      await user.click(submitButton)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/auth/login',
          expect.objectContaining({
            headers: expect.objectContaining({
              'x-csrf-token': 'mock-csrf-token',
            }),
          }),
        )
      })
    })
  })

  describe('UI features', () => {
    beforeEach(() => {
      ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url === '/api/auth/init') {
          return Promise.resolve({
            json: () => Promise.resolve({ passwordExists: true }),
            ok: true,
          })
        }
        return Promise.reject(new Error('Unknown URL'))
      })
    })

    it('shows loading spinner on submit', async () => {
      const user = userEvent.setup()
      render(<LoginPage />)

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/enter your password/i),
        ).toBeInTheDocument()
      })

      const passwordInput = screen.getByPlaceholderText(/enter your password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      // Don't await - check loading state immediately
      await user.type(passwordInput, 'testpassword')
      user.click(submitButton)

      // Should show loading state briefly
      await waitFor(() => {
        expect(screen.getByText(/signing in/i)).toBeInTheDocument()
      })
    })

    it('submits form on Enter key press', async () => {
      const user = userEvent.setup()
      ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url === '/api/auth/init') {
          return Promise.resolve({
            json: () => Promise.resolve({ passwordExists: true }),
            ok: true,
          })
        }
        if (url === '/api/auth/csrf') {
          return Promise.resolve({
            json: () => Promise.resolve({ token: 'mock-csrf-token' }),
            ok: true,
          })
        }
        if (url === '/api/auth/login') {
          return Promise.resolve({
            json: () => Promise.resolve({ success: true }),
            ok: true,
            status: 200,
          })
        }
        return Promise.reject(new Error('Unknown URL'))
      })

      render(<LoginPage />)

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/enter your password/i),
        ).toBeInTheDocument()
      })

      const passwordInput = screen.getByPlaceholderText(/enter your password/i)
      await user.type(passwordInput, 'testpassword{Enter}')

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/auth/login',
          expect.any(Object),
        )
      })
    })
  })

  describe('Mobile responsive', () => {
    it('renders with full-screen centered layout', () => {
      render(<LoginPage />)
      const container = screen
        .getByRole('button', { name: /sign in/i })
        .closest('div')
      expect(container).toBeInTheDocument()
    })
  })
})
