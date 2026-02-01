import {
  determineRoute,
  ensureCorrectRoute,
  getCorrectRoute,
  ProjectStatus,
} from '../routing-logic'

global.fetch = jest.fn()

describe('routing-logic', () => {
  describe('determineRoute', () => {
    it('routes to /init when no env file', () => {
      const status: ProjectStatus = {
        hasEnvFile: false,
        hasDockerCompose: false,
        servicesRunning: false,
        containerCount: 0,
      }

      const result = determineRoute(status)

      expect(result.route).toBe('/init')
      expect(result.reason).toContain('not initialized')
    })

    it('routes to /init when env exists but no docker-compose', () => {
      const status: ProjectStatus = {
        hasEnvFile: true,
        hasDockerCompose: false,
        servicesRunning: false,
        containerCount: 0,
      }

      const result = determineRoute(status)

      expect(result.route).toBe('/init')
      expect(result.reason).toContain('not built')
    })

    it('routes to /start when built but services not running', () => {
      const status: ProjectStatus = {
        hasEnvFile: true,
        hasDockerCompose: true,
        servicesRunning: false,
        containerCount: 0,
      }

      const result = determineRoute(status)

      expect(result.route).toBe('/start')
      expect(result.reason).toContain('not running')
    })

    it('routes to /start when too few containers running', () => {
      const status: ProjectStatus = {
        hasEnvFile: true,
        hasDockerCompose: true,
        servicesRunning: true,
        containerCount: 2,
      }

      const result = determineRoute(status)

      expect(result.route).toBe('/start')
      expect(result.reason).toContain('2 containers')
    })

    it('routes to / when services running', () => {
      const status: ProjectStatus = {
        hasEnvFile: true,
        hasDockerCompose: true,
        servicesRunning: true,
        containerCount: 5,
      }

      const result = determineRoute(status)

      expect(result.route).toBe('/')
      expect(result.reason).toContain('running')
    })
  })

  describe('getCorrectRoute', () => {
    it('fetches status and determines route', async () => {
      const mockStatus: ProjectStatus = {
        hasEnvFile: true,
        hasDockerCompose: true,
        servicesRunning: true,
        containerCount: 5,
      }

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockStatus),
      })

      const result = await getCorrectRoute()

      expect(result.route).toBe('/')
    })

    it('defaults to /init on fetch error', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      const result = await getCorrectRoute()

      expect(result.route).toBe('/init')
      expect(result.reason).toContain('Error')
    })

    it('defaults to /init on bad response', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
      })

      const result = await getCorrectRoute()

      expect(result.route).toBe('/init')
      expect(result.reason).toContain('Failed to fetch')
    })
  })

  describe('ensureCorrectRoute', () => {
    const navigate = jest.fn()

    beforeEach(() => {
      navigate.mockClear()
      ;(global.fetch as jest.Mock).mockClear()
    })

    it('does not redirect when on correct route', async () => {
      const mockStatus: ProjectStatus = {
        hasEnvFile: true,
        hasDockerCompose: true,
        servicesRunning: true,
        containerCount: 5,
      }

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockStatus),
      })

      const redirected = await ensureCorrectRoute('/', navigate)

      expect(redirected).toBe(false)
      expect(navigate).not.toHaveBeenCalled()
    })

    it('redirects when on wrong route', async () => {
      const mockStatus: ProjectStatus = {
        hasEnvFile: false,
        hasDockerCompose: false,
        servicesRunning: false,
        containerCount: 0,
      }

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockStatus),
      })

      const redirected = await ensureCorrectRoute('/dashboard', navigate)

      expect(redirected).toBe(true)
      expect(navigate).toHaveBeenCalledWith('/init')
    })

    it('allows sub-pages when services running', async () => {
      const mockStatus: ProjectStatus = {
        hasEnvFile: true,
        hasDockerCompose: true,
        servicesRunning: true,
        containerCount: 5,
      }

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockStatus),
      })

      const redirected = await ensureCorrectRoute('/services', navigate)

      expect(redirected).toBe(false)
      expect(navigate).not.toHaveBeenCalled()
    })

    it('normalizes empty path to /', async () => {
      const mockStatus: ProjectStatus = {
        hasEnvFile: true,
        hasDockerCompose: true,
        servicesRunning: true,
        containerCount: 5,
      }

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockStatus),
      })

      const redirected = await ensureCorrectRoute('', navigate)

      expect(redirected).toBe(false)
      expect(navigate).not.toHaveBeenCalled()
    })
  })
})
