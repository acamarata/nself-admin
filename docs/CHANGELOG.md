# Changelog

All notable changes to nself-admin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.5] - 2026-01-22

### Added

- Comprehensive documentation reorganization for GitHub Wiki sync
- Improved sidebar navigation with complete page linking
- VERSION file moved to `/docs` for cleaner root directory

### Changed

- Cleaned up root directory (removed VERSION, docker-compose files, test files)
- Updated all version references to 0.0.5 across package.json, Dockerfile
- Reorganized documentation structure for better wiki generation
- Simplified README.md to focus on quick start

### Fixed

- Version mismatch between package.json (0.0.4) and Dockerfile (0.0.3)
- ESLint warnings for unused variables across API routes
- Documentation link consistency across wiki pages

### Technical

- Updated Dockerfile labels and environment variables
- Improved GitHub Actions wiki-sync workflow with better navigation
- Standardized documentation file naming conventions

## [0.0.4] - 2025-09-17

### Added

- Security enhancements with bcrypt password hashing
- Secure random generation for session tokens
- Dependabot configuration for automated updates
- Centralized project path handling

### Changed

- Improved CI/CD pipeline reliability
- Enhanced TypeScript declarations
- Better path resolution across modules

### Fixed

- 43 security alerts resolved
- Build and reset command issues
- Functions service categorization
- UI consistency between wizard pages

## [0.0.4-beta] - 2025-09-06

### Added

- Unified state management for wizard configuration
- Real-time synchronization between UI state and environment files
- Automatic environment file detection (.env.dev, .env.local, .env)
- Improved wizard navigation with proper state persistence

### Changed

- Environment handler now writes directly to .env.dev for development
- Removed .env.local as primary configuration target
- Simplified ProjectStateWrapper to prevent navigation conflicts
- Updated optional services to save all states together

### Fixed

- Wizard navigation redirect loops between /init pages
- Project status API not detecting .env.dev files
- Optional service selections not persisting across page navigation
- Environment changes not saving immediately on field changes
- Redirect issues when moving between wizard steps
- Project name and configuration values reverting on navigation

### Technical Improvements

- Removed aggressive redirect logic from ProjectStateWrapper
- Enhanced environment file cascade priority handling
- Improved auto-save functionality with proper debouncing
- Better error handling in wizard update endpoints
- Streamlined state management across all wizard pages

## [0.0.3] - 2025-08-31

### Added

- LokiJS database integration for session management
- Project setup wizard with 6 steps
- Docker image optimization (reduced from 3.69GB to 421MB)

### Changed

- Migrated from environment variables to database for auth
- Improved project initialization flow

## [0.0.2] - 2025-08-29

### Added

- Initial project setup capabilities
- Service configuration interface
- Docker integration

## [0.0.1] - 2025-08-28

### Added

- Initial release
- Basic admin interface
- Authentication system
- Project management features
