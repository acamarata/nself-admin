# nself-admin v0.0.8 Planning Document

> **Created**: 2026-01-23
> **Target Release**: February 2026
> **Current Version**: v0.0.7

---

## Summary of v0.0.7 Accomplishments

### Security Hardening (Completed)
- **Shell Injection Prevention**: Converted all `exec()` calls to `execFile()` with array arguments
  - `src/app/api/deploy/staging/route.ts`
  - `src/app/api/deploy/production/route.ts`
  - `src/app/api/docker/logs/route.ts`
  - `src/app/api/docker/network/bytes/route.ts`
- **SQL Injection Prevention**: Added identifier validation in `src/app/api/database/route.ts`
  - `VALID_IDENTIFIER` regex pattern for table/schema names
  - `DANGEROUS_PATTERNS` array for query blocking
  - `isDangerousQuery()` function
- **Path Traversal Prevention**: Added resolved path validation in `src/app/api/config/env/route.ts`
  - `VALID_ENVIRONMENTS` constant
  - Path resolution check against allowed directories
- **Race Condition Fix**: Promise-based locking in `src/lib/database.ts`
  - `initializationPromise` variable prevents concurrent initialization
- **CSRF Protection Enhancement**: Origin validation in `src/lib/csrf.ts`
  - `ALLOWED_ORIGIN_PATTERNS` array
  - `validateOrigin()` function

### Multi-Environment Deployment UI (Completed)
- Staging deployment page (`/deployment/staging`)
- Production deployment page (`/deployment/prod`)
- Environment management page (`/deployment/environments`)
- Deploy API routes (`/api/deploy/staging`, `/api/deploy/production`)

### CLI Integration Improvements (Completed)
- `findNselfPath()` and `findNselfPathSync()` for dynamic CLI path resolution
- `getEnhancedPath()` for proper PATH environment in containers
- CLI version detection in health endpoint

---

## Remaining Work Before v0.0.8

### Documentation Gaps
- [ ] Port references: Some docs still reference 3001 for frontend apps (this is correct for user apps, not nAdmin)
- [ ] API Reference completeness: Document new deploy endpoints
- [ ] Update ROADMAP.md with v0.0.8 details

### UI-CLI Parity Gaps Identified
Based on nself CLI v0.4.4 capabilities:

1. **Database Management** (Not in UI)
   - `nself db backup` - No UI
   - `nself db restore` - No UI
   - `nself db migrate` - No UI
   - `nself db shell` - No UI

2. **Service Operations** (Partial UI)
   - `nself restart <service>` - No individual service restart
   - `nself exec <service> <cmd>` - No UI
   - `nself scale <service> <count>` - No UI

3. **Environment Operations** (Partial UI)
   - `nself env sync <source> <target>` - Limited UI support
   - `nself env diff <env1> <env2>` - No UI
   - `nself env export` - No UI

4. **Monitoring Bundle** (Partial UI)
   - `nself monitoring enable` - Limited UI
   - `nself monitoring disable` - Limited UI
   - Grafana dashboard embedding - Not implemented

---

## v0.0.8 Complete Plan

### Phase 1: Database Management UI (Week 1)

#### New Pages
- `/database/backups` - Backup management
- `/database/restore` - Restore from backup
- `/database/migrations` - Migration history and execution

#### New API Routes
```typescript
// Backup operations
POST /api/database/backup
GET  /api/database/backups
DELETE /api/database/backups/:id

// Restore operations
POST /api/database/restore
GET  /api/database/restore/status

// Migration operations
GET  /api/database/migrations
POST /api/database/migrations/run
POST /api/database/migrations/rollback
```

#### TypeScript Interfaces
```typescript
interface DatabaseBackup {
  id: string
  filename: string
  size: number
  createdAt: Date
  database: string
  type: 'full' | 'schema' | 'data'
  compressed: boolean
}

interface MigrationRecord {
  id: string
  name: string
  appliedAt: Date | null
  status: 'pending' | 'applied' | 'failed'
  batch: number
}

interface RestoreOperation {
  id: string
  backupId: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  startedAt: Date
  completedAt?: Date
  error?: string
}
```

### Phase 2: Service Operations (Week 2)

#### New Pages
- `/services/[id]/restart` - Service restart with options
- `/services/[id]/exec` - Execute commands in container
- `/services/[id]/scale` - Scale service replicas

#### New API Routes
```typescript
// Service operations
POST /api/services/:id/restart
POST /api/services/:id/exec
POST /api/services/:id/scale

// Logs enhancement
GET  /api/services/:id/logs/stream  // SSE endpoint
```

#### UI Components
```typescript
// Service action buttons
interface ServiceActions {
  restart: boolean
  exec: boolean
  scale: boolean
  logs: boolean
}

// Exec terminal component
interface ExecTerminalProps {
  containerId: string
  command?: string
  interactive?: boolean
}
```

### Phase 3: Environment Operations (Week 3)

#### New Pages
- `/config/env/sync` - Environment sync UI
- `/config/env/diff` - Environment diff viewer
- `/config/env/export` - Export environments

#### New API Routes
```typescript
// Environment operations
POST /api/config/env/sync
GET  /api/config/env/diff
GET  /api/config/env/export
POST /api/config/env/import
```

#### Features
- Side-by-side diff viewer for .env files
- One-click sync between environments
- Export to clipboard or download
- Import with validation and preview

### Phase 4: Monitoring Integration (Week 4)

#### New Pages
- `/monitoring/setup` - Enable/disable monitoring bundle
- `/monitoring/grafana` - Embedded Grafana dashboards
- `/monitoring/alerts` - Alert configuration

#### New API Routes
```typescript
// Monitoring operations
POST /api/monitoring/enable
POST /api/monitoring/disable
GET  /api/monitoring/status
GET  /api/monitoring/grafana/dashboards
POST /api/monitoring/alerts
```

#### Grafana Integration
- Embed Grafana dashboards via iframe
- Pre-configured nself dashboards
- Custom dashboard support
- Alert rule management

---

## Technical Architecture

### Input Validation Patterns (Established in v0.0.7)
```typescript
// Use these patterns consistently
const VALID_DOMAIN = /^[a-z0-9][a-z0-9.-]*[a-z0-9]$/i
const VALID_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const VALID_PORT = /^\d{1,5}$/
const VALID_CONTAINER_ID = /^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/
const VALID_IDENTIFIER = /^[a-zA-Z_][a-zA-Z0-9_]*$/
const VALID_ENVIRONMENTS = ['local', 'dev', 'stage', 'prod', 'secrets'] as const
```

### Command Execution Pattern (Established in v0.0.7)
```typescript
import { execFile } from 'child_process'
import { promisify } from 'util'
import { findNselfPath, getEnhancedPath } from '@/lib/nself-path'

const execFileAsync = promisify(execFile)

// Always use execFile with array arguments
const args: string[] = ['command', '--flag', value]
const { stdout, stderr } = await execFileAsync(nselfPath, args, {
  cwd: projectPath,
  env: { ...process.env, PATH: getEnhancedPath() },
  timeout: TIMEOUTS.CLI_COMMAND,
})
```

### Error Handling Pattern (Established in v0.0.7)
```typescript
} catch (error) {
  return NextResponse.json(
    {
      success: false,
      error: 'Operation failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    },
    { status: 500 },
  )
}
```

---

## Security Considerations for v0.0.8

### Database Backup Security
- [ ] Encrypt backups at rest
- [ ] Validate backup file integrity before restore
- [ ] Sanitize backup filenames
- [ ] Rate limit backup creation

### Service Exec Security
- [ ] Whitelist allowed commands
- [ ] Audit log all exec operations
- [ ] Timeout for long-running commands
- [ ] Prevent shell escapes

### Environment Export Security
- [ ] Mask sensitive values by default
- [ ] Require explicit confirmation for secrets
- [ ] Log all export operations

---

## Testing Plan

### Unit Tests
- [ ] Database backup/restore functions
- [ ] Environment diff algorithm
- [ ] Input validation functions
- [ ] CLI command builders

### Integration Tests
- [ ] Full backup/restore cycle
- [ ] Environment sync between dev/stage
- [ ] Service restart with health check
- [ ] Monitoring enable/disable

### E2E Tests
- [ ] Database management workflow
- [ ] Service operations workflow
- [ ] Environment management workflow

---

## Documentation Plan

### New Documentation
- [ ] `docs/Database-Management.md`
- [ ] `docs/Service-Operations.md`
- [ ] `docs/Environment-Sync.md`
- [ ] `docs/Monitoring-Setup.md`

### Updates Required
- [ ] `docs/API.md` - Add new endpoints
- [ ] `docs/CHANGELOG.md` - v0.0.8 entry
- [ ] `docs/Home.md` - Update feature list
- [ ] `docs/ROADMAP.md` - Mark v0.0.8 complete

---

## Release Checklist

### Pre-Release
- [ ] All security patterns applied
- [ ] All tests passing
- [ ] Documentation complete
- [ ] CHANGELOG updated
- [ ] Version bumped in package.json
- [ ] Version bumped in constants.ts
- [ ] Version bumped in docs/VERSION

### Release
- [ ] Git tag v0.0.8
- [ ] Docker build and push
- [ ] GitHub release notes
- [ ] Wiki sync

### Post-Release
- [ ] Verify Docker image works
- [ ] Test upgrade from v0.0.7
- [ ] Monitor for issues
- [ ] Update ROADMAP for v0.0.9

---

## Timeline

| Week | Focus | Deliverables |
|------|-------|--------------|
| 1 | Database Management | Backup, restore, migrations UI |
| 2 | Service Operations | Restart, exec, scale UI |
| 3 | Environment Operations | Sync, diff, export UI |
| 4 | Monitoring & Polish | Grafana integration, testing, docs |

---

## CLI Command Reference (for UI parity)

### Database Commands
```bash
nself db backup              # Create backup
nself db backup --file=name  # Named backup
nself db restore <file>      # Restore from backup
nself db migrate             # Run pending migrations
nself db migrate:status      # Show migration status
nself db shell               # Open psql shell
```

### Service Commands
```bash
nself restart                # Restart all services
nself restart <service>      # Restart specific service
nself exec <service> <cmd>   # Execute command in container
nself scale <service> <n>    # Scale service to n replicas
nself logs <service>         # View service logs
nself logs <service> -f      # Follow logs
```

### Environment Commands
```bash
nself env                    # Show current environment
nself env list               # List all environments
nself env sync dev stage     # Sync dev to stage
nself env diff dev stage     # Show differences
nself env export             # Export to stdout
nself env export --file=x    # Export to file
```

### Monitoring Commands
```bash
nself monitoring enable      # Enable monitoring stack
nself monitoring disable     # Disable monitoring stack
nself monitoring status      # Show monitoring status
nself grafana open           # Open Grafana dashboard
```

---

## Notes from v0.0.7 Development

1. **Docker socket access**: Required for container operations but has security implications. Document in setup guide.

2. **CLI path resolution**: Use `findNselfPath()` consistently - don't hardcode paths.

3. **Input validation**: Always validate user input before passing to CLI or database.

4. **Error messages**: Don't expose internal errors to users - log details, return generic messages.

5. **Timeouts**: Use appropriate timeouts from constants.ts - different operations need different limits.

6. **Environment detection**: Check `NODE_ENV` and hostname for dev vs prod behavior.

---

## Open Questions

1. Should we support multiple database types or PostgreSQL only?
2. How to handle large backup files (streaming vs. buffering)?
3. Should exec have a web terminal or just command input?
4. How to authenticate Grafana iframe embedding?

---

*This document should be updated as development progresses.*
