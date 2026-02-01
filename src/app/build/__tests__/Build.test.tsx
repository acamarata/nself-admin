import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter, useSearchParams } from 'next/navigation'
import BuildPage from '../page'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}))

// Mock fetch
global.fetch = jest.fn()

describe('BuildPage', () => {
  const mockPush = jest.fn()
  const mockSearchParams = new URLSearchParams()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })
    ;(useSearchParams as jest.Mock).mockReturnValue(mockSearchParams)
    ;(global.fetch as jest.Mock).mockImplementation((url) => {
      if (url === '/api/project/status') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ hasEnvFile: true }),
        })
      }
      if (url === '/api/docker/status') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ running: true }),
        })
      }
      if (url === '/api/nself/version') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ version: '0.4.4' }),
        })
      }
      if (url === '/api/nself/build') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, serviceCount: 8 }),
        })
      }
      return Promise.reject(new Error('Not found'))
    })
  })

  it('should show loading skeleton initially', () => {
    render(<BuildPage />)
    // The skeleton should be visible during checks
    expect(screen.getByLabelText(/loading/i)).toBeDefined()
  })

  it('should run pre-build checks on mount', async () => {
    render(<BuildPage />)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/project/status')
      expect(global.fetch).toHaveBeenCalledWith('/api/docker/status')
      expect(global.fetch).toHaveBeenCalledWith('/api/nself/version')
    })
  })

  it('should display pre-build check results', async () => {
    render(<BuildPage />)

    await waitFor(() => {
      expect(screen.getByText(/Pre-Build Checks/i)).toBeDefined()
      expect(screen.getByText(/Environment files/i)).toBeDefined()
      expect(screen.getByText(/Docker daemon/i)).toBeDefined()
      expect(screen.getByText(/nself CLI/i)).toBeDefined()
    })
  })

  it('should show "Start Build" button when checks pass', async () => {
    render(<BuildPage />)

    await waitFor(() => {
      const startButton = screen.getByRole('button', { name: /Start Build/i })
      expect(startButton).toBeDefined()
    })
  })

  it('should start build when button is clicked', async () => {
    const user = userEvent.setup()
    render(<BuildPage />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Start Build/i })).toBeDefined()
    })

    const startButton = screen.getByRole('button', { name: /Start Build/i })
    await user.click(startButton)

    await waitFor(() => {
      expect(screen.getByText(/Building Project/i)).toBeDefined()
    })
  })

  it('should show build progress during build', async () => {
    const user = userEvent.setup()
    render(<BuildPage />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Start Build/i })).toBeDefined()
    })

    const startButton = screen.getByRole('button', { name: /Start Build/i })
    await user.click(startButton)

    await waitFor(() => {
      expect(screen.getByText(/Build Progress/i)).toBeDefined()
    })
  })

  it('should display build logs', async () => {
    const user = userEvent.setup()
    render(<BuildPage />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Start Build/i })).toBeDefined()
    })

    const startButton = screen.getByRole('button', { name: /Start Build/i })
    await user.click(startButton)

    await waitFor(() => {
      expect(screen.getByText(/Build Logs/i)).toBeDefined()
    })
  })

  it('should show success state after build completes', async () => {
    const user = userEvent.setup()
    render(<BuildPage />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Start Build/i })).toBeDefined()
    })

    const startButton = screen.getByRole('button', { name: /Start Build/i })
    await user.click(startButton)

    await waitFor(
      () => {
        expect(screen.getByText(/Build Successful/i)).toBeDefined()
      },
      { timeout: 5000 },
    )
  })

  it('should handle build errors', async () => {
    ;(global.fetch as jest.Mock).mockImplementation((url) => {
      if (url === '/api/nself/build') {
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: 'Build failed' }),
        })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    })

    const user = userEvent.setup()
    render(<BuildPage />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Start Build/i })).toBeDefined()
    })

    const startButton = screen.getByRole('button', { name: /Start Build/i })
    await user.click(startButton)

    await waitFor(() => {
      expect(screen.getByText(/Build Failed/i)).toBeDefined()
    })
  })

  it('should filter logs when filter checkboxes are clicked', async () => {
    const user = userEvent.setup()
    render(<BuildPage />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Start Build/i })).toBeDefined()
    })

    const startButton = screen.getByRole('button', { name: /Start Build/i })
    await user.click(startButton)

    await waitFor(() => {
      expect(screen.getByText(/Build Logs/i)).toBeDefined()
    })

    const errorsCheckbox = screen.getByLabelText(/Errors Only/i)
    await user.click(errorsCheckbox)

    // Verify checkbox is checked
    expect(errorsCheckbox).toBeChecked()
  })

  it('should show retry button on error', async () => {
    ;(global.fetch as jest.Mock).mockImplementation((url) => {
      if (url === '/api/nself/build') {
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: 'Build failed' }),
        })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    })

    const user = userEvent.setup()
    render(<BuildPage />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Start Build/i })).toBeDefined()
    })

    const startButton = screen.getByRole('button', { name: /Start Build/i })
    await user.click(startButton)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Retry Build/i })).toBeDefined()
    })
  })

  it('should skip checks when coming from wizard', async () => {
    const mockParams = new URLSearchParams('from=wizard')
    ;(useSearchParams as jest.Mock).mockReturnValue(mockParams)

    render(<BuildPage />)

    await waitFor(() => {
      // Should not show pre-build checks UI
      expect(screen.queryByText(/Pre-Build Checks/i)).toBeNull()
    })
  })
})
