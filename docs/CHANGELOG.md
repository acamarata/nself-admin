# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.1] - 2024-08-23

### Initial Release 🎉

This is the first public release of nself-admin, a web-based administration interface for the nself CLI backend stack.

### Added

#### Core Features
- **Dashboard**: Real-time overview with system metrics, Docker stats, and service status
- **Service Management**: Start, stop, restart, and monitor Docker containers
- **Configuration Editor**: Manage environment variables across different environments
- **Database Console**: PostgreSQL management interface with query execution
- **Log Viewer**: Real-time log streaming from all services
- **Authentication**: Password-protected admin interface with secure sessions

#### Technical Implementation
- **Frontend**: Next.js 15 with App Router, React 19, TypeScript
- **Styling**: Tailwind CSS v4 with custom design system
- **State Management**: Zustand for global state management
- **Real-time Updates**: WebSocket and Server-Sent Events support
- **Polling Service**: Centralized data fetching with 2-second intervals
- **Docker Integration**: Full container management via Dockerode

#### Developer Experience
- **Documentation**: Comprehensive docs in `/docs` folder
- **Wiki Sync**: Automated GitHub Wiki updates from docs
- **Multi-arch Support**: Docker builds for amd64, arm64, and armv7
- **Auto-updates**: Built-in version checking and container updates
- **Health Checks**: Comprehensive health and readiness endpoints
- **Release Automation**: GitHub Actions for CI/CD

#### API Endpoints
- `GET /api/health` - Health check with detailed system status
- `GET /api/version` - Version information and update checks
- `GET /api/project/status` - Project and service status
- `GET /api/docker/containers` - Container listing and stats
- `POST /api/docker/containers/:id/:action` - Container management
- `GET /api/system/metrics` - System and Docker metrics
- `GET /api/config/env` - Environment configuration
- `POST /api/auth/login` - Authentication

### Project Structure
- Modern monorepo structure with clear separation of concerns
- Component-based architecture with reusable UI components
- Service layer for API communication
- Comprehensive error handling and logging

### Docker Distribution
- Docker Hub: `nself/admin:0.0.1`
- Multi-stage Dockerfile for optimized images
- Health checks and auto-restart capabilities
- Volume mounts for project files and Docker socket

### Documentation
- Architecture overview and system design
- Developer setup guide
- Contributing guidelines
- API reference documentation
- Deployment and configuration guides

### Notes
- This is an initial release focused on core functionality
- Requires Docker and nself CLI for full functionality
- Tested on Linux and macOS environments
- Web UI optimized for desktop browsers

## [Unreleased]

### Planned Features
- [ ] Mobile-responsive design
- [ ] User management and RBAC
- [ ] Backup and restore functionality
- [ ] Metrics history and graphs
- [ ] Custom service templates
- [ ] Webhook integrations
- [ ] CLI command palette
- [ ] Dark mode improvements

---

For more information, see the [README](README.md) or visit the [Wiki](https://github.com/acamarata/nself-admin/wiki).