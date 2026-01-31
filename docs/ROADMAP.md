# nself-admin Roadmap

**Purpose**: Web UI wrapper for nself CLI - provides visual interface for all nself operations
**Alignment**: nself-admin versions align with nself CLI
**Last Updated**: January 2026

---

## Vision

nself-admin is a **visual companion** to the nself CLI. It does NOT reimplement CLI logic - it provides a web interface that executes `nself` commands and displays results beautifully.

**Core Principle**: Every button click should execute an `nself` command.

---

## Version Alignment

| nself CLI  | nself-admin | Focus                                      | Status |
| ---------- | ----------- | ------------------------------------------ | ------ |
| v0.4.2     | v0.0.6      | Foundation, SSL UI, TypeScript fixes       | ✅ Released |
| v0.4.4     | v0.0.7      | Admin integration, deployment features     | ✅ Released |
| v0.4.8     | v0.0.8      | Plugin system UI + Database operations     | ✅ Released |
| **v0.4.8** | **v0.2.0**  | **Foundation & CLI alignment**             | ✅ Released |
| **v0.4.8** | **v0.3.0**  | **Auth & Security expansion**              | ✅ Released |
| **v0.4.8** | **v0.4.0**  | **Services expansion**                     | ✅ Released |
| v0.5.0     | v0.5.0      | Production-ready stable release            | 🎯 Next |

**Note**: Starting from v0.2.0, nself-admin adopted semantic versioning matching the nself CLI major.minor scheme.

---

## Released Versions

### v0.4.0 - Services Expansion ✅ RELEASED
**Release Date**: January 31, 2026
**GitHub**: https://github.com/acamarata/nself-admin/releases/tag/v0.4.0
**Docker**: `docker pull acamarata/nself-admin:0.4.0`
**Stats**: 45 files, +6,387 lines

9 new service management pages with 36 API routes:
- Service Scaffold Wizard (40+ templates across 10 languages)
- Storage Management (file browser, upload, bucket config)
- Email Service (template editor, test send, delivery status)
- Search Engine (MeiliSearch, Typesense, ElasticSearch)
- Cache Management (Redis stats, flush, CLI console)
- Functions Service (deploy, invoke, log viewer)
- MLflow Integration (experiment tracking, model registry)
- Real-Time WebSocket (channel management, live events)
- Service Discovery (search and admin endpoints)

### v0.3.0 - Auth & Security ✅ RELEASED
**Release Date**: January 31, 2026
**GitHub**: https://github.com/acamarata/nself-admin/releases/tag/v0.3.0
**Docker**: `docker pull acamarata/nself-admin:0.3.0`
**Stats**: 39 files, +6,470 lines

8 new auth/security features with 29 API routes:
- OAuth Provider Management (8 providers)
- MFA Setup (TOTP/SMS, backup codes)
- Role-Based Access Control
- Device Management (register, trust, revoke)
- Security Scanning (quick/full scans)
- Rate Limiting Configuration
- Webhook Management (CRUD, test, logs)
- Audit Trail Viewer

### v0.2.0 - Foundation & CLI Alignment ✅ RELEASED
**Release Date**: January 31, 2026
**GitHub**: https://github.com/acamarata/nself-admin/releases/tag/v0.2.0
**Docker**: `docker pull acamarata/nself-admin:0.2.0`
**Stats**: 25 files

Complete config management system:
- Environment variable editor (multi-env tabs)
- Secrets CRUD with validation
- Vault integration
- Config sync/export/import
- Navigation restructure (12 sections)
- CLI command reference (2340 lines)

### v0.0.8 - Baseline ✅ COMPLETE

### What's Done

- Init wizard (6 steps)
- Service status dashboard
- Real-time container monitoring
- Log viewing
- Database console with SQL editor
- Build/Start/Reset operations
- Authentication (password-based with bcrypt)
- Docker stats via Dockerode
- SSL configuration UI (mkcert + Let's Encrypt)
- TypeScript error handling standardized
- Health check endpoint (`/api/health`)
- Version consistency (constants.ts)
- Port 3021 documented (not 3100)
- **NEW in v0.0.8:**
  - Plugin management UI (Stripe, GitHub, Shopify)
  - Database backup/restore/migrations UI
  - Cloud provider integration (AWS, GCP, DigitalOcean)
  - Kubernetes management UI
  - Performance monitoring and profiling
  - Comprehensive 3-pass security audit
  - 80+ new pages and 60+ new API routes
  - Command injection fixes (execFile instead of exec)
  - Store cleanup on logout (security)

---

## v0.5.0 - Production-Ready Stable Release 🎯 NEXT

**Goal**: Polish, stability, and production-ready features
**Target**: Q1 2026
**Aligns with**: nself CLI v0.5.0

### Focus Areas

1. **Multi-Environment Support**
   - Environment selector (Local / Staging / Production)
   - Side-by-side .env comparison with visual diffs
   - SSH key auto-detection and management
   - Secure credential storage
   - Deploy/rollback flows with confirmations

2. **Enhanced Monitoring**
   - Real-time metrics dashboards
   - Alert configuration UI
   - Log aggregation and search
   - Performance profiling tools
   - Resource usage graphs

3. **Testing & Quality**
   - Unit test coverage > 80%
   - E2E tests for critical flows
   - Accessibility audit (WCAG 2.1)
   - Performance optimization
   - Bundle size reduction

4. **User Experience Polish**
   - Mobile responsiveness
   - Dark mode improvements
   - Loading state consistency
   - Error message clarity
   - Contextual help panels

5. **Enterprise Features**
   - Multi-user support (role-based access)
   - Audit logging
   - Session management
   - API key authentication
   - Compliance helpers

6. **Documentation**
   - Complete API documentation
   - Deployment guides
   - Migration guides
   - Troubleshooting guides
   - Video tutorials

### Deprecated Roadmap Sections

The following sections from the original roadmap (v0.0.7, v0.0.8, v0.0.9) have been archived. Many features were completed in v0.2.0-v0.4.0.

Refer to git history or the full archived roadmap for details on the old v0.0.x versioning scheme.

---

## Success Metrics for v0.5.0

- [ ] Zero critical bugs
- [ ] Test coverage > 80%
- [ ] Mobile responsive on all pages
- [ ] Documentation complete (deployment, API, migration)
- [ ] Security audit passed
- [ ] Multi-user support functional
- [ ] Environment switching works (local/staging/prod)
- [ ] Performance: sub-1s page loads

---

## Release Timeline

| Version | Release Date | Status |
|---------|-------------|--------|
| v0.0.8  | Jan 2026 | ✅ Released (baseline) |
| v0.2.0  | Jan 31, 2026 | ✅ Released |
| v0.3.0  | Jan 31, 2026 | ✅ Released |
| v0.4.0  | Jan 31, 2026 | ✅ Released |
| v0.5.0  | Q1 2026 | 🎯 Next Target |

---

_This roadmap aligns with the nself CLI roadmap. The nself-admin UI is a wrapper that executes nself CLI commands - every feature depends on corresponding CLI support._

