import { render, screen, waitFor } from '@testing-library/react'
import { useRouter, useSearchParams } from 'next/navigation'
import BuildPage from '../page'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}))

describe('BuildPage', () => {
  const mockPush = jest.fn()
  const mockSearchParams = new URLSearchParams()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })
    ;(useSearchParams as jest.Mock).mockReturnValue(mockSearchParams)

    // Mock fetch
    global.fetch = jest.fn()
  })

  it('should render build steps', () => {
    render(<BuildPage />)

    expect(screen.getByText('Building Your Project')).toBeInTheDocument()
    expect(screen.getByText('Initializing build process')).toBeInTheDocument()
    expect(screen.getByText('Building Docker images')).toBeInTheDocument()
    expect(screen.getByText('Creating configuration files')).toBeInTheDocument()
    expect(screen.getByText('Setting up services')).toBeInTheDocument()
  })

  it('should start build when coming from wizard', async () => {
    mockSearchParams.set('from', 'wizard')
    ;(useSearchParams as jest.Mock).mockReturnValue(mockSearchParams)

    // Mock successful build API call
    ;(global.fetch as jest.Mock).mockImplementation((url) => {
      if (url === '/api/project/build') {
        return Promise.resolve({
          ok: true,
          body: {
            getReader: () => ({
              read: jest
                .fn()
                .mockResolvedValueOnce({
                  done: false,
                  value: new TextEncoder().encode('Building...\n'),
                })
                .mockResolvedValueOnce({ done: true }),
            }),
          },
        })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    })

    render(<BuildPage />)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/project/build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ debug: true }),
      })
    })
  })

  it('should check project status when not from wizard', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          hasEnvFile: true,
          hasDockerCompose: false,
        }),
    })

    render(<BuildPage />)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/project/status')
    })
  })

  it('should redirect to /init if no env file', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          hasEnvFile: false,
          hasDockerCompose: false,
        }),
    })

    render(<BuildPage />)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/init')
    })
  })

  it('should redirect to /start if already built', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          hasEnvFile: true,
          hasDockerCompose: true,
        }),
    })

    render(<BuildPage />)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/start')
    })
  })

  it('should handle build errors gracefully', async () => {
    mockSearchParams.set('from', 'wizard')
    ;(useSearchParams as jest.Mock).mockReturnValue(mockSearchParams)
    ;(global.fetch as jest.Mock).mockImplementation((url) => {
      if (url === '/api/project/build') {
        return Promise.resolve({
          ok: false,
          statusText: 'Build failed',
        })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    })

    render(<BuildPage />)

    await waitFor(() => {
      expect(screen.getByText(/Build failed/)).toBeInTheDocument()
    })

    // Should redirect after error
    await waitFor(
      () => {
        expect(mockPush).toHaveBeenCalledWith('/init/1')
      },
      { timeout: 4000 },
    )
  })

  it('should process streaming response correctly', async () => {
    mockSearchParams.set('from', 'wizard')
    ;(useSearchParams as jest.Mock).mockReturnValue(mockSearchParams)

    const encoder = new TextEncoder()
    let readCount = 0

    ;(global.fetch as jest.Mock).mockImplementation((url) => {
      if (url === '/api/project/build') {
        return Promise.resolve({
          ok: true,
          body: {
            getReader: () => ({
              read: jest.fn().mockImplementation(() => {
                readCount++
                if (readCount === 1) {
                  return Promise.resolve({
                    done: false,
                    value: encoder.encode('[NSELF] Initializing...\n'),
                  })
                }
                if (readCount === 2) {
                  return Promise.resolve({
                    done: false,
                    value: encoder.encode('[STEP:2] Building images...\n'),
                  })
                }
                if (readCount === 3) {
                  return Promise.resolve({
                    done: false,
                    value: encoder.encode('[COMPLETE] Build successful\n'),
                  })
                }
                return Promise.resolve({ done: true })
              }),
            }),
          },
        })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    })

    render(<BuildPage />)

    await waitFor(() => {
      expect(
        screen.getByText((content, element) => {
          return content.includes('[NSELF] Initializing...')
        }),
      ).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/start')
    })
  })
})
