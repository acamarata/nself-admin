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

| nself CLI    | nself-admin | Focus                                       |
| ------------ | ----------- | ------------------------------------------- |
| v0.4.2       | v0.0.6      | Foundation, SSL UI, TypeScript fixes        |
| v0.4.3       | v0.0.7      | Multi-environment deployment UI             |
| v0.4.4       | v0.0.8      | Database, backup, restore UI                |
| v0.4.5-0.4.9 | v0.0.9      | Mock data, scale, cloud providers, k8s prep |
| v0.5.0       | v0.1.0      | Production-ready stable release             |

---

## Current State (v0.0.6) ✅ COMPLETE

### What's Done

- Init wizard (6 steps)
- Service status dashboard
- Real-time container monitoring
- Log viewing
- Database console
- Build/Start/Reset operations
- Authentication (password-based)
- Docker stats via Dockerode
- SSL configuration UI (mkcert + Let's Encrypt)
- TypeScript error handling standardized
- Health check endpoint (`/api/health`)
- Version consistency (constants.ts)
- Port 3021 documented (not 3100)

---

## v0.0.7 - Multi-Environment Deployment UI

**Goal**: Visual deployment management for local → staging → production flow
**Aligns with**: nself CLI v0.4.3

### Environment Management

#### Environment Selector

- [ ] Environment dropdown in header (Local / Staging / Production)
- [ ] Visual indicator of current environment (color-coded)
- [ ] Environment status badges (running, stopped, unreachable)
- [ ] Quick environment info tooltip (domain, server, last deploy)

#### Environment Configuration

- [ ] Side-by-side .env comparison (local vs staging vs prod)
- [ ] Visual diff highlighting for env differences
- [ ] "Sync" button to copy values between environments
- [ ] Secret masking with reveal toggle
- [ ] Environment-specific variable validation

### Access Control & Authentication

#### Server Access Detection

- [ ] Auto-detect SSH keys on local machine (`~/.ssh/`)
- [ ] Show which environments user has access to
- [ ] Visual lock icon for inaccessible environments
- [ ] "Request Access" flow for team members

#### Credential Management

- [ ] Secure credential storage in LokiJS (encrypted)
- [ ] SSH key selection for each environment
- [ ] Username/password fallback option
- [ ] SSH key passphrase handling
- [ ] Credential testing ("Test Connection" button)

```typescript
// Credential types supported
interface ServerCredentials {
  type: 'ssh-key' | 'password' | 'ssh-agent'
  host: string
  port: number
  username: string
  // For ssh-key
  privateKeyPath?: string
  passphrase?: string
  // For password
  password?: string
}
```

#### Access Levels

- [ ] Owner: Full access to all environments
- [ ] Developer: Local + Staging access
- [ ] Viewer: Read-only dashboard access
- [ ] Store access level per user in database

### Deployment Flow UI

#### Deployment Dashboard (`/deploy`)

- [ ] Three-column layout: Local | Staging | Production
- [ ] Each column shows:
  - Current version/commit
  - Last deploy timestamp
  - Health status
  - Quick actions (deploy, rollback, logs)
- [ ] Deployment history timeline

#### Deploy Actions

- [ ] "Deploy to Staging" button (from local)
- [ ] "Promote to Production" button (from staging)
- [ ] Pre-deploy checklist (build passes, tests pass, etc.)
- [ ] Deploy confirmation modal with diff preview
- [ ] Real-time deploy progress streaming

#### Rollback Support

- [ ] List of previous deployments per environment
- [ ] One-click rollback to any previous version
- [ ] Rollback confirmation with impact warning
- [ ] Post-rollback health check

### Server Management

#### Server List (`/servers`)

- [ ] List all connected servers
- [ ] Server health indicators (CPU, memory, disk)
- [ ] SSH connection status
- [ ] Quick actions (connect, restart services, view logs)

#### Server Details

- [ ] Resource usage graphs
- [ ] Running containers list
- [ ] Network configuration
- [ ] SSL certificate status

### API Routes

```
POST /api/deploy/staging     - Deploy to staging
POST /api/deploy/production  - Deploy to production
POST /api/deploy/rollback    - Rollback deployment
GET  /api/servers            - List connected servers
POST /api/servers/test       - Test server connection
GET  /api/credentials        - Get stored credentials (masked)
POST /api/credentials        - Store credentials
GET  /api/environments/diff  - Compare environments
```

### CLI Commands Executed

```bash
nself deploy staging         # Deploy to staging
nself deploy production      # Deploy to production
nself deploy rollback        # Rollback last deploy
nself status --env=staging   # Check staging status
nself logs --env=production  # View prod logs
```

---

## v0.0.8 - Database, Backup & Restore UI

**Goal**: Complete database management and backup/restore interface
**Aligns with**: nself CLI v0.4.4

### Backup Management

#### Backup Dashboard (`/backups`)

- [ ] List all backups with timestamps
- [ ] Backup size and type (full, incremental)
- [ ] Environment indicator (local, staging, prod)
- [ ] Download backup button
- [ ] Delete backup (with confirmation)

#### Create Backup

- [ ] "Create Backup" button with options:
  - Full backup (database + files)
  - Database only
  - Files only (uploads, etc.)
- [ ] Backup naming/tagging
- [ ] Backup progress indicator
- [ ] Post-backup verification

#### Scheduled Backups

- [ ] Visual cron schedule editor
- [ ] Backup retention policy configuration
- [ ] Email notifications on backup failure
- [ ] Backup schedule per environment

#### Restore Operations

- [ ] Select backup to restore
- [ ] Target environment selector
- [ ] Pre-restore warnings:
  - "This will overwrite current data"
  - "Restore to staging first recommended"
- [ ] Restore progress with detailed steps
- [ ] Post-restore health check

### Database Tools

#### Schema Browser (`/database/schema`)

- [ ] Visual table list with row counts
- [ ] Table details (columns, types, constraints)
- [ ] Relationship visualization (foreign keys)
- [ ] Index information
- [ ] Quick actions (view data, export)

#### SQL Console (`/database/console`)

- [ ] Monaco editor for SQL
- [ ] Query history (persisted)
- [ ] Saved queries library
- [ ] Query execution with results table
- [ ] Export results (CSV, JSON)
- [ ] Query explain/analyze

#### Migration Management

- [ ] List applied migrations
- [ ] Pending migrations indicator
- [ ] Run migration button
- [ ] Migration rollback (with confirmation)
- [ ] Migration diff preview

### Hasura Integration

#### Hasura Console Embed

- [ ] Embedded Hasura console iframe
- [ ] Quick link to external console
- [ ] Metadata sync status

#### Quick Actions

- [ ] Track/untrack table
- [ ] Add relationship
- [ ] Create permission
- [ ] Export metadata
- [ ] Apply metadata from file

### Data Management

#### Seed Data

- [ ] List available seed files
- [ ] Run seed with environment selection
- [ ] Seed preview (what will be inserted)
- [ ] Custom seed file upload

#### Data Export/Import

- [ ] Export table to CSV/JSON
- [ ] Import data from file
- [ ] Bulk operations with preview

### API Routes

```
GET  /api/backups                - List backups
POST /api/backups/create         - Create backup
POST /api/backups/restore        - Restore backup
GET  /api/backups/download/:id   - Download backup
DELETE /api/backups/:id          - Delete backup

GET  /api/database/schema        - Get schema info
POST /api/database/query         - Execute SQL
GET  /api/database/migrations    - List migrations
POST /api/database/migrate       - Run migrations

GET  /api/hasura/metadata        - Get Hasura metadata
POST /api/hasura/metadata/apply  - Apply metadata
```

### CLI Commands Executed

```bash
nself backup create              # Create backup
nself backup list                # List backups
nself backup restore <id>        # Restore backup
nself db migrate                 # Run migrations
nself db seed                    # Seed database
nself db console                 # Open psql
```

---

## v0.0.9 - Scale, Cloud Providers & Kubernetes Prep

**Goal**: Support for multiple deployment targets, scaling, and k8s preparation
**Aligns with**: nself CLI v0.4.5 - v0.4.9

### Mock Data & Seeding (v0.4.5 alignment)

#### Auto-Generated Mock Data

- [ ] Schema-aware mock data generation
- [ ] Environment-specific data rules:
  - Local: Full mock data
  - Staging: Mock data + test users
  - Production: Real data only
- [ ] Seed user management UI
- [ ] Custom seed templates

#### Initial User Seeding

- [ ] Visual user seed editor
- [ ] Role assignment for seed users
- [ ] Password generation options
- [ ] Seed preview before apply

### Scaling & Performance (v0.4.6 alignment)

#### Resource Monitoring

- [ ] Per-service resource graphs
- [ ] Historical performance data
- [ ] Bottleneck identification
- [ ] Scaling recommendations

#### Scaling Controls

- [ ] Service replica slider
- [ ] Resource limit configuration
- [ ] Auto-scaling rules (future)
- [ ] Load balancing visualization

#### Migration Tools

- [ ] Data migration wizard
- [ ] Cross-environment migration
- [ ] Migration validation
- [ ] Rollback on failure

### Cloud Provider Support (v0.4.7 alignment)

#### Provider Configuration

- [ ] Provider selector:
  - Direct VPS (IP address)
  - AWS
  - Google Cloud (GCP)
  - Microsoft Azure
  - DigitalOcean
  - Linode
  - Hetzner
- [ ] Provider credential storage
- [ ] Provider-specific options

#### VPS Direct Deploy

- [ ] IP address configuration
- [ ] SSH key management
- [ ] Firewall configuration hints
- [ ] SSL certificate automation

#### Cloud Provider Deploy

- [ ] AWS: EC2 instance selection, VPC config
- [ ] GCP: Compute Engine options
- [ ] Azure: VM configuration
- [ ] DO: Droplet selection
- [ ] Credential validation per provider

### Kubernetes Preparation (v0.4.8 alignment)

#### K8s Dashboard

- [ ] Cluster connection configuration
- [ ] Namespace management
- [ ] Pod status visualization
- [ ] Service health monitoring

#### K8s Deployment

- [ ] Helm chart configuration UI
- [ ] Values.yaml editor
- [ ] Deployment preview
- [ ] Rollout status

#### K8s Resources

- [ ] ConfigMap management
- [ ] Secret management
- [ ] Ingress configuration
- [ ] Persistent volume status

### Monitoring Polish (v0.4.9 alignment)

#### Enhanced Dashboards

- [ ] Custom dashboard builder
- [ ] Metric selection UI
- [ ] Alert threshold configuration
- [ ] Dashboard sharing/export

#### Log Aggregation

- [ ] Multi-service log view
- [ ] Log search with regex
- [ ] Log level filtering
- [ ] Log export (last N hours)

#### Alerting

- [ ] Alert rule creation UI
- [ ] Notification channel config (email, Slack, webhook)
- [ ] Alert history
- [ ] Alert acknowledgment

### API Routes

```
# Mock Data
POST /api/seed/generate          - Generate mock data
POST /api/seed/users             - Seed initial users
GET  /api/seed/templates         - List seed templates

# Scaling
GET  /api/scale/metrics          - Get scaling metrics
POST /api/scale/replicas         - Set replica count
GET  /api/scale/recommendations  - Get scaling advice

# Cloud Providers
GET  /api/providers              - List configured providers
POST /api/providers/configure    - Configure provider
POST /api/providers/validate     - Validate credentials
POST /api/providers/deploy       - Deploy to provider

# Kubernetes
GET  /api/k8s/clusters           - List clusters
GET  /api/k8s/namespaces         - List namespaces
GET  /api/k8s/pods               - List pods
POST /api/k8s/deploy             - Deploy to k8s
```

### CLI Commands Executed

```bash
# Mock data
nself seed generate              # Generate mock data
nself seed users                 # Seed users

# Scaling
nself scale api --replicas=3     # Scale service
nself metrics                    # View metrics

# Cloud providers
nself deploy aws                 # Deploy to AWS
nself deploy gcp                 # Deploy to GCP
nself deploy do                  # Deploy to DigitalOcean

# Kubernetes
nself k8s deploy                 # Deploy to k8s
nself k8s status                 # K8s cluster status
```

---

## v0.1.0 - Production-Ready Stable Release

**Goal**: Polished, stable release ready for public use
**Aligns with**: nself CLI v0.5.0

### Stability & Polish

#### Bug Fixes

- [ ] Address all known issues from v0.0.7-0.0.9
- [ ] Edge case handling
- [ ] Error message improvements
- [ ] Loading state consistency

#### Performance

- [ ] Bundle size optimization
- [ ] Code splitting for large pages
- [ ] API response caching
- [ ] Lazy loading for dashboards

#### Testing

- [ ] Unit test coverage > 80%
- [ ] E2E tests for critical flows
- [ ] Integration tests for API routes
- [ ] Accessibility audit (WCAG 2.1)

### User Experience

#### Onboarding

- [ ] First-time setup wizard
- [ ] Feature tour/tooltips
- [ ] Contextual help
- [ ] Documentation links

#### Mobile Responsiveness

- [ ] Tablet-optimized layouts
- [ ] Mobile dashboard view
- [ ] Touch-friendly controls
- [ ] Responsive navigation

#### Dark Mode

- [ ] System preference detection
- [ ] Manual toggle
- [ ] Consistent theming
- [ ] High contrast option

### Documentation

#### In-App Help

- [ ] Contextual help panels
- [ ] Command reference
- [ ] Troubleshooting guides
- [ ] Video tutorials (links)

#### Release Documentation

- [ ] Complete changelog
- [ ] Migration guide from v0.0.x
- [ ] API documentation
- [ ] Deployment guide

### Security Hardening

#### Authentication

- [ ] Session management improvements
- [ ] Brute-force protection
- [ ] 2FA support (TOTP)
- [ ] API key authentication option

#### Authorization

- [ ] Role-based access control (RBAC)
- [ ] Environment-specific permissions
- [ ] Audit logging
- [ ] Session revocation

### Enterprise Readiness

#### Multi-User Support

- [ ] User management UI
- [ ] Invite system
- [ ] Role assignment
- [ ] Activity feed

#### Compliance

- [ ] Audit log export
- [ ] Data retention policies
- [ ] GDPR compliance helpers
- [ ] SOC2 preparation notes

---

## Technical Architecture Notes

### Access Control Model

```typescript
// User access levels
enum AccessLevel {
  OWNER = 'owner', // Full access everywhere
  DEVELOPER = 'developer', // Local + Staging
  VIEWER = 'viewer', // Read-only
}

// Environment access
interface EnvironmentAccess {
  environment: 'local' | 'staging' | 'production'
  hasSSHKey: boolean
  hasCredentials: boolean
  canDeploy: boolean
  canViewLogs: boolean
  canModifyConfig: boolean
}

// Determine access at runtime
async function checkAccess(
  userId: string,
  env: string,
): Promise<EnvironmentAccess> {
  const user = await getUser(userId)
  const sshKeys = await detectSSHKeys() // Check ~/.ssh/
  const credentials = await getStoredCredentials(userId, env)

  return {
    environment: env,
    hasSSHKey: sshKeys.some((k) => k.matchesServer(env)),
    hasCredentials: !!credentials,
    canDeploy: user.level !== 'viewer' && (hasSSHKey || hasCredentials),
    canViewLogs: true,
    canModifyConfig: user.level === 'owner',
  }
}
```

### SSH Key Detection

```typescript
// Auto-detect SSH keys
async function detectSSHKeys(): Promise<SSHKey[]> {
  const sshDir = path.join(os.homedir(), '.ssh')
  const files = await fs.readdir(sshDir)

  const keys: SSHKey[] = []
  for (const file of files) {
    if (file.endsWith('.pub')) continue // Skip public keys
    if (['config', 'known_hosts', 'authorized_keys'].includes(file)) continue

    const keyPath = path.join(sshDir, file)
    const pubKeyPath = `${keyPath}.pub`

    if (
      await fs
        .access(pubKeyPath)
        .then(() => true)
        .catch(() => false)
    ) {
      keys.push({
        name: file,
        privatePath: keyPath,
        publicPath: pubKeyPath,
        fingerprint: await getFingerprint(pubKeyPath),
      })
    }
  }

  return keys
}
```

### Credential Storage

```typescript
// Encrypted credential storage in LokiJS
interface StoredCredential {
  id: string
  userId: string
  environment: string
  type: 'ssh-key' | 'password'
  encryptedData: string // AES-256 encrypted
  createdAt: Date
  lastUsed: Date
}

// Encryption using app-level secret
const ENCRYPTION_KEY =
  process.env.CREDENTIAL_ENCRYPTION_KEY || deriveFromAdminPassword()
```

### Environment Diff

```typescript
// Compare environment configurations
interface EnvDiff {
  key: string
  local?: string
  staging?: string
  production?: string
  status: 'same' | 'different' | 'missing'
}

async function compareEnvironments(): Promise<EnvDiff[]> {
  const local = await parseEnvFile('.env.dev')
  const staging = await parseEnvFile('.env.staging')
  const production = await parseEnvFile('.env.prod')

  const allKeys = new Set([
    ...Object.keys(local),
    ...Object.keys(staging),
    ...Object.keys(production),
  ])

  return Array.from(allKeys).map((key) => ({
    key,
    local: maskIfSecret(key, local[key]),
    staging: maskIfSecret(key, staging[key]),
    production: maskIfSecret(key, production[key]),
    status: determineStatus(local[key], staging[key], production[key]),
  }))
}
```

---

## Release Cadence

- **Patch releases** (0.0.x.y): Bug fixes, as needed
- **Minor releases** (0.0.x): Feature releases, every 2-4 weeks
- **Major alignment** (0.1.0): When nself CLI releases v0.5.0

---

## Success Metrics

### v0.0.7

- [ ] Deploy to staging in < 3 clicks
- [ ] Credential storage working securely
- [ ] SSH key auto-detection functional
- [ ] Environment diff visualization complete

### v0.0.8

- [ ] Backup/restore fully functional
- [ ] SQL console with history
- [ ] Hasura integration embedded
- [ ] Migration management complete

### v0.0.9

- [ ] All cloud providers supported
- [ ] Kubernetes deployment working
- [ ] Mock data generation automatic
- [ ] Monitoring dashboards polished

### v0.1.0

- [ ] Zero critical bugs
- [ ] Test coverage > 80%
- [ ] Mobile responsive
- [ ] Documentation complete
- [ ] Security audit passed

---

## Dependencies

### v0.0.7 requires

- nself CLI v0.4.3 with `nself deploy` commands
- SSH2 library for connection testing
- Crypto for credential encryption

### v0.0.8 requires

- nself CLI v0.4.4 with backup/restore commands
- Monaco editor for SQL console
- Hasura metadata API access

### v0.0.9 requires

- nself CLI v0.4.5-0.4.9 features
- Cloud provider SDKs (optional, for validation)
- Kubernetes client library

### v0.1.0 requires

- All previous versions stable
- Complete CLI v0.5.0 feature set

---

_This roadmap aligns with the nself CLI roadmap. Updates will be made as CLI features are finalized._
