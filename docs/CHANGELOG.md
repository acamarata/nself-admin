# Changelog

All notable changes to nself-admin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - v0.0.8

### Planned

- **Plugin Management UI** (Aligns with nself CLI v0.4.8)
  - Plugin dashboard (`/plugins`) with installed/available plugins grid
  - Plugin installation wizard with environment variable configuration
  - Plugin configuration management
  - Plugin-specific detail pages (`/plugins/[name]`)
  - Webhook event monitoring and retry
  - Plugin sync controls and history
  - Plugin health indicators

- **Stripe Plugin UI** (`/plugins/stripe`)
  - Revenue dashboard (MRR, ARR, key metrics)
  - Customer management interface with search
  - Subscription viewer with status filters
  - Invoice management and PDF download
  - Payment methods viewer
  - Webhook event log with filtering

- **GitHub Plugin UI** (`/plugins/github`)
  - Repository overview and sync status
  - Issues and Pull Requests dashboard
  - CI/CD status (GitHub Actions runs)
  - Commit history and releases
  - Activity feed

- **Shopify Plugin UI** (`/plugins/shopify`)
  - Store overview and metrics
  - Product catalog viewer with variants
  - Order management with status filters
  - Customer list
  - Inventory status

- **Enhanced Database UI**
  - Backup creation wizard with type selection
  - Backup list with download/delete actions
  - Backup restore workflow with confirmation
  - Scheduled backups with visual cron editor
  - Migration management (run, rollback, create)
  - Schema browser with table visualization
  - Monaco-based SQL console with syntax highlighting
  - Query history (persisted) and saved queries
  - Query results export (CSV, JSON)
  - Query explain/analyze support

### API Routes

- `GET/POST /api/plugins/*` - Plugin management endpoints
- `GET/POST /api/plugins/[name]/*` - Plugin-specific endpoints
- `GET/POST /api/database/backups/*` - Backup management
- `GET/POST /api/database/migrations/*` - Migration management
- `GET/POST /api/database/schema/*` - Schema browser

### Dependencies

- `@monaco-editor/react` - SQL editor
- `recharts` - Revenue charts
- `cronstrue` - Cron to human readable

### Technical

- Aligns with nself CLI v0.4.8 (Plugin System Release)
- New plugin command wrapping infrastructure
- Enhanced database command support
- Plugin registry integration

---

## [0.0.7] - 2026-01-23

### Added

- **Multi-Environment Deployment UI**
  - New `/deployment/staging` page for staging deployments
  - New `/deployment/prod` page for production deployments
  - New `/deployment/environments` page for environment management
  - Deploy API routes (`/api/deploy/staging`, `/api/deploy/production`)
- **CLI Integration Improvements**
  - Added `findNselfPath()` and `findNselfPathSync()` for dynamic CLI path resolution
  - Added `getEnhancedPath()` for proper PATH environment in container
  - CLI version detection in health endpoint (`cliVersion` field)
  - Support for `PROJECT_PATH` and `NSELF_PROJECT_PATH` environment variables
- **Container Enhancements**
  - Added mkcert binary for local SSL certificate generation
  - Added docker-cli-compose for Docker Compose support
  - Documented Docker socket security considerations
- **Unit Testing Infrastructure**
  - Added Jest configuration (`jest.config.js`, `jest.setup.js`)
  - Created initial test suite for nself-path utilities

### Changed

- Navigation updated with new deployment routes
- CLI command whitelist expanded with new commands: `restart`, `ssl`, `trust`, `env`, `clean`, `reset`, `exec`, `staging`, `prod`
- Default CLI command timeout increased from 30s to 60s
- Health check now includes nself CLI availability and version

### Fixed

- **CLI Path Resolution** - Fixed hardcoded paths in `letsencrypt/route.ts` and `config/route.ts`
- **Enhanced PATH** - Added `getEnhancedPath()` to all exec calls for container compatibility
- **Project Name Detection** - Fixed extraction from multiple env files (.env, .env.local, .env.dev)
- **ANSI Escape Codes** - Added `stripAnsi()` function for parsing CLI output
- **Filesystem Health Check** - Changed from `/project` to `/workspace` (NSELF_PROJECT_PATH)

### Technical

- 20+ files changed
- New API routes: `/api/deploy/*` (3 endpoints), `/api/env` (1 endpoint)
- New pages: `/deployment/*` (3 pages)
- Docker image: `acamarata/nself-admin:0.0.7`
- Aligned with nself CLI v0.4.4

## [0.0.6] - 2026-01-22

### Added

- **SSL Configuration Page** (`/config/ssl`)
  - Certificate status display (mode, validity, expiry)
  - Local certificate generation via mkcert integration
  - Let's Encrypt configuration support
  - Trust store installation guide with OS-specific instructions
- **Centralized Constants** (`src/lib/constants.ts`)
  - All port definitions (ADMIN: 3021, LOKI: 3100, etc.)
  - Version information for dynamic display
- **Comprehensive Roadmap** (`docs/ROADMAP.md`)
  - Detailed plans for v0.0.7 through v0.1.0
  - Aligned with nself CLI v0.4.3-v0.5.0 release schedule
  - Technical architecture notes with TypeScript interfaces
  - Multi-environment deployment considerations

### Changed

- Login page now displays dynamic version from constants (was hardcoded v0.3.9)
- Standardized error response format across all 30+ API routes

### Fixed

- **TypeScript Error Handling** - Fixed 30+ API routes with proper error handling
  - Changed `error?.message` and `error.message` patterns to proper type checking
  - Pattern: `error instanceof Error ? error.message : 'Unknown error'`
- **Promise Typing** - Fixed `Promise<Response>` return type in SSL generate-local route
- **File System Errors** - Added `NodeJS.ErrnoException` typing for file operations

### Technical

- 45 files changed, 2,362 insertions(+), 264 deletions(-)
- New API routes: `/api/config/ssl/*` (4 endpoints)
- Docker image: `acamarata/nself-admin:0.0.6`

## [0.0.5] - 2026-01-21

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
