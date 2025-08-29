# Changelog

All notable changes to nAdmin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.3] - 2025-01-29

### Added
- **LokiJS Database Integration**: Replaced .env file storage with embedded LokiJS database
  - Session management with 24-hour TTL
  - Secure password storage with bcrypt hashing
  - Project cache with 5-minute TTL
  - Audit logging with 30-day retention
- **Project Setup Wizard**: 4-step configuration wizard for new projects
  - Project configuration (name, environment, region)
  - Database setup (PostgreSQL configuration)
  - Service selection (choose which services to include)
  - Review and build with real-time progress
- **Improved Authentication Flow**:
  - Database-backed sessions instead of environment variables
  - CSRF protection for all state-changing requests
  - Automatic session expiration and cleanup
  - Development vs production password requirements
- **Full-Screen Pages**: Login, Build, and Start pages now display without navigation
- **Comprehensive Documentation**:
  - Complete architecture documentation
  - API reference for authentication
  - Setup and installation guides
  - Development workflow documentation
  - Docker deployment guide
  - First-time setup walkthrough
- **Password Reset Capability**:
  - Via nself CLI: `nself admin reset-password`
  - Manual reset by deleting `nadmin.db`

### Changed
- **Navigation Flow**: Improved user journey from setup → build → start → dashboard
- **Session Storage**: Moved from environment variables to database
- **Password Storage**: Now stored as bcrypt hash in database instead of .env file
- **Service Count Display**: Shows "X / Y" format for running vs total services
- **Empty State Handling**: Moved to dedicated /start page instead of dashboard

### Fixed
- Docker image download progress not showing during service startup
- Edge Runtime compatibility issues with middleware
- WebSocket connection errors on initial load
- 401 authentication errors before checking if user is logged in
- Metadata viewport warnings in console
- Password persistence issues after container restart

### Security
- Implemented bcrypt password hashing with 12 salt rounds
- Added CSRF token validation for all API endpoints
- Session tokens are now cryptographically secure random values
- HttpOnly cookies for session tokens
- Automatic session expiration after 24 hours

### Technical Debt
- Removed dependency on .env files for authentication
- Eliminated Node.js module usage in Edge Runtime
- Cleaned up console warnings and errors
- Improved error handling throughout the application

## [0.0.2] - 2025-01-20

### Added
- **Dashboard**: Main dashboard with service status overview
- **Service Monitoring**: Real-time monitoring of Docker containers
- **Service Management**: Start, stop, restart services from UI
- **Database Tools**: Database console, migrations, and backup features
- **Configuration Pages**: Environment variables, CORS, and secrets management
- **System Diagnostics**: Doctor page for system health checks
- **Docker Integration**: Direct Docker API integration for container management
- **Responsive Design**: Mobile-friendly interface

### Changed
- Improved UI/UX with Tailwind CSS
- Better error handling and user feedback
- Enhanced navigation structure

### Fixed
- Various UI bugs and inconsistencies
- Docker connection issues
- Session management problems

## [0.0.1] - 2025-01-15

### Added
- **Initial Release**: Basic proof of concept
- **Authentication**: Simple password-based login
- **Basic UI**: Minimal interface for project management
- **nself CLI Integration**: Basic commands (init, build, start, stop)
- **Next.js Setup**: Initial Next.js 15 application structure
- **Docker Support**: Basic containerization

### Known Issues
- Limited functionality
- No persistent storage
- Basic authentication only
- Minimal error handling

---

## Versioning Policy

This project follows Semantic Versioning:
- **0.0.x**: Alpha releases with breaking changes expected
- **0.x.0**: Beta releases with stabilizing API
- **1.0.0**: First stable release with production readiness

## Upgrade Guide

### From 0.0.2 to 0.0.3

1. **Backup your .env file** (passwords will need to be reset)
2. **Stop the current container**:
   ```bash
   docker stop nself-admin
   docker rm nself-admin
   ```
3. **Pull the new version**:
   ```bash
   docker pull acamarata/nself-admin:0.0.3
   ```
4. **Start with data volume**:
   ```bash
   docker run -d \
     --name nself-admin \
     -p 3021:3021 \
     -v /path/to/project:/workspace:rw \
     -v nself-admin-data:/app/data \
     acamarata/nself-admin:0.0.3
   ```
5. **Set new password** through the UI (first-time setup flow)

### From 0.0.1 to 0.0.2

Simple container replacement - no data migration required:
```bash
docker pull acamarata/nself-admin:0.0.2
docker stop nself-admin
docker rm nself-admin
# Re-run with new image
```

## Support

For issues and feature requests, please visit:
- GitHub Issues: https://github.com/acamarata/nself-admin/issues
- GitHub Discussions: https://github.com/acamarata/nself-admin/discussions
- Telegram Announcements: https://t.me/nselforg
- Commercial Inquiries: https://nself.org/commercial