# nself-admin Roadmap

**Purpose**: Web UI wrapper for nself CLI - provides visual interface for all nself operations
**Alignment**: nself-admin versions align with nself CLI (0.1.0 ↔ 0.5.0)
**Last Updated**: January 2026

---

## Vision

nself-admin is a **visual companion** to the nself CLI. It does NOT reimplement CLI logic - it provides a web interface that executes `nself` commands and displays results beautifully.

**Core Principle**: Every button click should execute an `nself` command.

---

## Version Alignment

| nself CLI | nself-admin | Focus |
|-----------|-------------|-------|
| v0.4.x | v0.0.x | Foundation, local dev UI |
| v0.5.0 | v0.1.0 | Production-ready, deployment UI |
| v0.6.0 | v0.2.0 | Enterprise features |

---

## Current State (v0.0.5)

### What Works
- Init wizard (6 steps)
- Service status dashboard
- Real-time container monitoring
- Log viewing
- Database console
- Build/Start/Reset operations
- Authentication (password-based)
- Docker stats via Dockerode

### What's Missing
- Proper CLI integration (many actions are direct Docker calls)
- Deployment management UI
- Environment switching
- Backup/restore UI
- Monitoring dashboards (when enabled)
- Better error handling
- Mobile responsiveness

---

## v0.0.6 - CLI Integration & Polish

**Goal**: Ensure all operations properly execute `nself` CLI commands

### CLI Integration
- [ ] Audit all API routes - replace direct Docker calls with `nself` commands
- [ ] `/api/nself/*` routes should be the primary interface
- [ ] Add command output streaming for all operations
- [ ] Show executed command in UI (transparency)

### UI Polish
- [ ] Consistent loading states across all pages
- [ ] Better error messages with actionable hints
- [ ] Toast notifications for all operations
- [ ] Responsive design improvements
- [ ] Dark mode support (using system preference)

### Developer Experience
- [ ] Add `nself admin --dev` for development mode
- [ ] Hot reload detection for env changes
- [ ] Console command palette (Cmd+K)

---

## v0.0.7 - Environment & Config Management

**Goal**: Visual environment management

### Environment Switching
- [ ] Environment selector in header (dev/staging/prod)
- [ ] Visual diff between environments
- [ ] Environment-specific dashboards
- [ ] Quick switch without restart

### Configuration UI
- [ ] Visual .env editor with validation
- [ ] Secret management (masked values)
- [ ] Template browser for services
- [ ] Configuration export/import

### Service Templates
- [ ] Browse 40+ templates visually
- [ ] One-click add service
- [ ] Template customization UI
- [ ] Service dependency visualization

---

## v0.0.8 - Monitoring & Observability

**Goal**: Rich monitoring when enabled in nself

### Conditional Dashboards
- [ ] Detect MONITORING_ENABLED from env
- [ ] Show/hide monitoring UI accordingly
- [ ] Grafana iframe integration
- [ ] Prometheus metrics display

### Built-in Monitoring
- [ ] Container resource graphs (CPU, memory, network)
- [ ] Service health timeline
- [ ] Request latency charts
- [ ] Error rate tracking

### Logs Enhancement
- [ ] Multi-service log aggregation
- [ ] Log search and filtering
- [ ] Log export functionality
- [ ] Real-time log streaming improvements

---

## v0.0.9 - Backup & Database Tools

**Goal**: Database management UI

### Backup UI
- [ ] Backup list with timestamps
- [ ] One-click backup creation
- [ ] Backup download
- [ ] Scheduled backup configuration
- [ ] Restore with confirmation

### Database Tools
- [ ] Visual schema browser
- [ ] SQL console with history
- [ ] Migration status display
- [ ] Seed data management
- [ ] Connection testing

### Hasura Integration
- [ ] Embedded Hasura console
- [ ] Quick actions (track table, add relationship)
- [ ] GraphQL playground
- [ ] Permission matrix view

---

## v0.1.0 - Deployment Management (Aligns with nself 0.5.0)

**Goal**: Full deployment UI for staging/production

### Deployment Dashboard
- [ ] Deployment status for all environments
- [ ] One-click deploy to staging/prod
- [ ] Deployment history with rollback
- [ ] Health check visualization
- [ ] SSL certificate status

### Server Management
- [ ] Connected servers list
- [ ] Server health monitoring
- [ ] SSH terminal (web-based)
- [ ] Resource usage per server

### Promotion Flow
- [ ] Visual staging → prod promotion
- [ ] Diff preview before promotion
- [ ] Approval workflow (optional)
- [ ] Rollback confirmation

### Let's Encrypt UI
- [ ] SSL status per domain
- [ ] Certificate renewal tracking
- [ ] Manual renewal trigger
- [ ] Domain validation status

---

## v0.2.0+ - Future Vision

### Team Features
- [ ] Multi-user support
- [ ] Role-based access control
- [ ] Audit logging
- [ ] Team activity feed

### Advanced Monitoring
- [ ] Custom dashboard builder
- [ ] Alert configuration UI
- [ ] Incident management
- [ ] SLA tracking

### Enterprise
- [ ] SSO/SAML integration
- [ ] Compliance reports
- [ ] Cost tracking
- [ ] Multi-tenant support

---

## Technical Debt to Address

### Code Quality
- [ ] Reduce ESLint warnings (currently ~300)
- [ ] Add comprehensive TypeScript types
- [ ] Unit test coverage (target: 80%)
- [ ] E2E tests for critical flows

### Architecture
- [ ] Standardize API response format
- [ ] Implement proper error boundaries
- [ ] Add request caching layer
- [ ] Optimize SSE connections

### Performance
- [ ] Reduce bundle size
- [ ] Implement code splitting
- [ ] Add service worker for offline
- [ ] Optimize Docker API calls

---

## Release Cadence

- **Patch releases** (0.0.x): Bug fixes, as needed
- **Minor releases**: Every 2-4 weeks
- **Major alignment**: When nself CLI releases major version

---

## Success Metrics

### v0.0.6
- [ ] All operations use `nself` CLI
- [ ] Zero direct Docker manipulation (except stats)
- [ ] Consistent UI across all pages

### v0.1.0
- [ ] Deploy to staging in < 3 clicks
- [ ] Full deployment visibility
- [ ] Mobile-friendly dashboard

---

*This roadmap aligns with the nself CLI roadmap*
