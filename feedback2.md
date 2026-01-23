# nself CLI ↔ nself-admin Integration Guide

**Date:** 2026-01-23
**CLI Version:** 0.4.4
**Purpose:** Complete technical reference for how nself-admin integrates with nself CLI

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Docker Container Setup](#docker-container-setup)
3. [Environment Variables](#environment-variables)
4. [Path Resolution](#path-resolution)
5. [CLI Command Execution](#cli-command-execution)
6. [SSL/Trust Flow](#ssltrust-flow)
7. [Update Flow](#update-flow)
8. [API Route Patterns](#api-route-patterns)

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Host Machine                             │
│                                                                  │
│  ┌──────────────┐     ┌──────────────────────────────────────┐  │
│  │  nself CLI   │     │         Docker Environment           │  │
│  │              │     │                                      │  │
│  │ /usr/local/  │     │  ┌────────────────────────────────┐  │  │
│  │  bin/nself   │────▶│  │      nself-admin container     │  │  │
│  │              │     │  │                                │  │  │
│  │ (symlink to  │     │  │  /opt/nself/bin/nself ◀────────│──│──│── CLI mounted here
│  │  real path)  │     │  │  /workspace ◀─────────────────│──│──│── Project mounted here
│  │              │     │  │                                │  │  │
│  └──────────────┘     │  │  PORT: 3021                    │  │  │
│                       │  │  NODE_ENV: production          │  │  │
│  ┌──────────────┐     │  │  NSELF_CLI_PATH: /usr/local/   │  │  │
│  │   Project    │     │  │    bin/nself                   │  │  │
│  │   Directory  │────▶│  │  PROJECT_PATH: /workspace      │  │  │
│  │              │     │  └────────────────────────────────┘  │  │
│  │ ~/Sites/     │     │                                      │  │
│  │  myproject/  │     │  ┌─────────┐ ┌─────────┐ ┌────────┐  │  │
│  │              │     │  │postgres │ │ hasura  │ │  ...   │  │  │
│  └──────────────┘     │  └─────────┘ └─────────┘ └────────┘  │  │
│                       └──────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Docker Container Setup

### How nself CLI generates the nself-admin service

**File:** `src/services/docker/compose-modules/utility-services.sh`

```yaml
nself-admin:
  image: acamarata/nself-admin:${NSELF_ADMIN_VERSION:-latest}
  container_name: ${PROJECT_NAME}_nself-admin
  restart: unless-stopped
  ports:
    - "${NSELF_ADMIN_PORT:-3021}:3021"
  depends_on:
    postgres:
      condition: service_healthy
    hasura:
      condition: service_healthy
  environment:
    NODE_ENV: production
    PROJECT_PATH: /workspace
    NSELF_PROJECT_PATH: /workspace
    NSELF_CLI_PATH: /usr/local/bin/nself
    PROJECT_NAME: ${PROJECT_NAME}
    BASE_DOMAIN: ${BASE_DOMAIN}
    POSTGRES_HOST: postgres
    POSTGRES_PORT: 5432
    POSTGRES_DB: ${POSTGRES_DB}
    POSTGRES_USER: ${POSTGRES_USER}
    POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    HASURA_GRAPHQL_ENDPOINT: http://hasura:8080/v1/graphql
    HASURA_GRAPHQL_ADMIN_SECRET: ${HASURA_GRAPHQL_ADMIN_SECRET}
  volumes:
    - .:/workspace:rw                           # Project directory
    - /var/run/docker.sock:/var/run/docker.sock # Docker socket for container management
    - ${NSELF_CLI_LOCAL_PATH:-/opt/nself}:/opt/nself:ro  # CLI source (optional)
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:3021/api/health"]
    interval: 30s
    timeout: 10s
    retries: 5
    start_period: 30s
```

### Key Points

1. **Port:** Always 3021 internally, mapped to `NSELF_ADMIN_PORT` on host (default: 3021)
2. **Health Check:** Uses `/api/health` endpoint
3. **Start Period:** 30 seconds to allow Next.js to build/start
4. **Docker Socket:** Mounted for container management (start/stop/logs)
5. **CLI Mount:** Optional mount of CLI source at `/opt/nself`

---

## 3. Environment Variables

### Variables Passed to Container

| Variable | Value in Container | Purpose |
|----------|-------------------|---------|
| `NODE_ENV` | `production` | Tells Next.js to run in production mode |
| `PROJECT_PATH` | `/workspace` | Absolute path to mounted project |
| `NSELF_PROJECT_PATH` | `/workspace` | Alias for PROJECT_PATH |
| `NSELF_CLI_PATH` | `/usr/local/bin/nself` | Path to CLI executable in container |
| `PROJECT_NAME` | From `.env` | Used for container naming, labels |
| `BASE_DOMAIN` | From `.env` | Domain for URL generation |
| `POSTGRES_*` | From `.env` | Database connection |
| `HASURA_*` | From `.env` | GraphQL endpoint |

### How to Read These in nself-admin

```typescript
// In your API routes or lib files:

// Get project path - ALWAYS use this, never hardcode
const projectPath = process.env.PROJECT_PATH || process.env.NSELF_PROJECT_PATH || '/workspace'

// Get CLI path - for executing nself commands
const cliPath = process.env.NSELF_CLI_PATH || '/usr/local/bin/nself'

// Check environment
const isProduction = process.env.NODE_ENV === 'production'
```

---

## 4. Path Resolution

### The Problem

nself-admin needs to find the nself CLI executable to run commands. The CLI can be in different locations:

1. **In container (production):** `/usr/local/bin/nself` (symlink to `/opt/nself/bin/nself`)
2. **Local development:** `~/Sites/nself/bin/nself`
3. **Installed via curl:** `~/.nself/bin/nself` or `/usr/local/bin/nself`

### The Solution: `nself-path.ts`

**File:** `src/lib/nself-path.ts`

```typescript
// Priority order for finding nself CLI:
// 1. NSELF_CLI_PATH environment variable (explicit override)
// 2. nself in PATH (most common for installed users)
// 3. Development location ($HOME/Sites/nself/bin/nself)
// 4. Common installation paths

export async function findNselfPath(): Promise<string> {
  // 1. Check explicit environment variable first
  if (process.env.NSELF_CLI_PATH && fs.existsSync(process.env.NSELF_CLI_PATH)) {
    return process.env.NSELF_CLI_PATH
  }

  // 2. Check if nself is in PATH
  try {
    const enhancedPath = getEnhancedPath()
    const { stdout } = await execAsync('which nself', {
      env: { ...process.env, PATH: enhancedPath },
    })
    const nselfPath = stdout.trim()
    if (nselfPath && fs.existsSync(nselfPath)) {
      return nselfPath
    }
    return 'nself'
  } catch {
    // Not in PATH, continue checking
  }

  // 3. Check development location
  const devPath = getDevPath()
  if (fs.existsSync(devPath)) {
    return devPath
  }

  // 4. Check common installation paths
  const commonPaths = getCommonPaths()
  for (const p of commonPaths) {
    if (fs.existsSync(p)) {
      return p
    }
  }

  return 'nself'
}

// Common paths to check (in order)
function getCommonPaths(): string[] {
  const home = process.env.HOME || '/root'
  return [
    // Container paths (priority for production)
    '/usr/local/bin/nself',
    '/opt/nself/bin/nself',
    '/opt/nself/src/cli/nself.sh',
    // macOS/Linux paths
    '/opt/homebrew/bin/nself',
    path.join(home, 'bin', 'nself'),
    path.join(home, '.local', 'bin', 'nself'),
    path.join(home, '.nself', 'bin', 'nself'),
    '/usr/bin/nself',
  ]
}

// Enhanced PATH for command execution
export function getEnhancedPath(): string {
  const home = process.env.HOME || '/root'
  const additionalPaths = [
    '/usr/local/bin',
    '/opt/nself/bin',
    '/opt/homebrew/bin',
    path.join(home, 'bin'),
    path.join(home, '.local', 'bin'),
    path.join(home, '.nself', 'bin'),
  ]
  const currentPath = process.env.PATH || '/usr/bin:/bin'
  return [...additionalPaths, currentPath].join(':')
}
```

### Usage in API Routes

```typescript
import { findNselfPath, getEnhancedPath } from '@/lib/nself-path'

// Async version (preferred)
const nselfPath = await findNselfPath()

// Sync version for API routes
import { findNselfPathSync } from '@/lib/nself-path'
const nselfPath = findNselfPathSync()

// When executing commands, always use enhanced PATH
const { stdout } = await execFileAsync(
  nselfPath,
  ['status'],
  {
    cwd: projectPath,
    env: { ...process.env, PATH: getEnhancedPath() },
    timeout: 60000,
  }
)
```

---

## 5. CLI Command Execution

### Allowed Commands

**File:** `src/app/api/cli/execute/route.ts`

```typescript
const ALLOWED_NSELF_COMMANDS: Record<string, { args?: string[]; options?: string[] }> = {
  // Core commands
  init: { options: ['--template', '--force', '--full'] },
  build: { options: ['--clean', '--verbose', '--force', '--debug'] },
  start: { args: ['all', 'service'], options: ['--detach', '--force-recreate'] },
  stop: { args: ['all', 'service'], options: ['--timeout'] },
  restart: { args: ['service'], options: ['--timeout'] },
  status: { options: ['--json', '--verbose', '--watch'] },
  logs: { args: ['service'], options: ['--follow', '--tail', '--since'] },

  // Management commands
  doctor: { options: ['--fix', '--verbose'] },
  backup: { options: ['--output', '--compress', '--database', '--files'] },
  restore: { args: ['file'], options: ['--force'] },
  urls: { options: ['--format', '--json'] },

  // SSL and trust
  ssl: { args: ['action'], options: ['--generate', '--trust', '--domain', '--email'] },
  trust: { options: ['--install', '--uninstall'] },

  // Environment management
  env: { args: ['action', 'name'], options: ['--file', '--force'] },

  // Cleanup commands
  clean: { options: ['--volumes', '--images', '--all', '--force'] },
  reset: { options: ['--force', '--keep-data', '--keep-volumes'] },

  // Execution
  exec: { args: ['service', 'command'], options: ['--user', '--workdir'] },

  // Update command
  update: { options: ['--check', '--cli', '--admin', '--restart', '--force'] },

  // Database commands
  db: { args: ['action'], options: ['--force', '--verbose'] },

  // Info commands
  help: { args: ['command'] },
  version: { options: ['--short', '--json'] },
}
```

### Executing CLI Commands

```typescript
// POST /api/cli/execute
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { command, args, options } = body

  const nselfPath = findNselfPathSync()
  const projectPath = getProjectPath()

  // Build command array
  const cmdArgs = [command, ...args]
  for (const [opt, value] of Object.entries(options)) {
    cmdArgs.push(opt)
    if (value !== 'true') cmdArgs.push(value)
  }

  const { stdout, stderr } = await execFileAsync(
    nselfPath,
    cmdArgs,
    {
      cwd: projectPath,
      env: { ...process.env, PATH: getEnhancedPath() },
      timeout: 300000, // 5 minutes
    }
  )

  return NextResponse.json({ success: true, output: stdout })
}
```

---

## 6. SSL/Trust Flow

### How SSL Works

1. **During `nself build`:**
   - CLI generates mkcert certificates in `ssl/certificates/localhost/`
   - Copies to `nginx/ssl/localhost/`
   - Auto-installs trust if needed (`mkcert -install`)

2. **nself-admin SSL generation:**
   - Uses `/api/config/ssl/generate-local` endpoint
   - Should delegate to CLI: `nself ssl bootstrap`
   - Falls back to direct mkcert if CLI not available

### SSL Generate Route

**File:** `src/app/api/config/ssl/generate-local/route.ts`

```typescript
export async function POST() {
  const projectPath = getProjectPath()

  // Try nself ssl bootstrap first (CORRECT command)
  try {
    const nselfPath = await findNselfPath()  // Use dynamic path!
    await fs.access(nselfPath)

    const { stdout, stderr } = await execFileAsync(
      nselfPath,
      ['ssl', 'bootstrap'],  // NOT 'ssl generate'!
      {
        cwd: projectPath,
        timeout: 60000,
      }
    )

    return NextResponse.json({ success: true, method: 'nself' })
  } catch {
    // Fall back to direct mkcert
  }

  // Direct mkcert fallback...
}
```

### Important SSL Commands

| Command | Purpose |
|---------|---------|
| `nself ssl bootstrap` | Generate certificates using mkcert |
| `nself ssl status` | Show certificate status |
| `nself ssl renew` | Renew Let's Encrypt certificates |
| `nself trust` | Install root CA to system trust store |
| `nself trust status` | Check trust status |

---

## 7. Update Flow

### How `nself update` Works

When user runs `nself update` from a project directory:

```
1. Check for CLI updates (GitHub releases)
2. Check for nself-admin updates (Docker Hub)
3. Download and install CLI if newer
4. Pull nself-admin:latest if newer
5. If CLI updated AND in project:
   - Run `nself build --force` to regenerate docker-compose.yml
   - Save CLI version to `.nself/build-version`
6. If services were running:
   - Run `docker compose up -d --force-recreate` to restart with new config
7. Show summary
```

### Version Tracking

The CLI saves its version after each build:

```bash
# File: .nself/build-version
0.4.4
```

On next build, if this doesn't match current CLI version, `NEEDS_COMPOSE=true` is set and docker-compose.yml is regenerated.

### nself-admin Should NOT:

- Try to update itself (that's the CLI's job)
- Modify docker-compose.yml directly
- Change the project's .env files without user action

### nself-admin SHOULD:

- Provide UI for triggering `nself update --check`
- Show current versions (CLI and admin)
- Provide button to trigger full update

---

## 8. API Route Patterns

### Standard Response Format

```typescript
// Success
{
  success: true,
  data: { ... }
}

// Error
{
  success: false,
  error: "Error message",
  details?: "Additional info"
}
```

### Common Patterns

```typescript
// Get project path
import { getProjectPath } from '@/lib/paths'
const projectPath = getProjectPath()

// Get nself CLI path
import { findNselfPath, findNselfPathSync, getEnhancedPath } from '@/lib/nself-path'
const nselfPath = await findNselfPath()  // or findNselfPathSync()

// Execute nself command
const result = await execFileAsync(
  nselfPath,
  ['command', 'arg1', '--option'],
  {
    cwd: projectPath,
    env: { ...process.env, PATH: getEnhancedPath() },
    timeout: 60000,
  }
)

// Handle Docker operations
const containerName = `${process.env.PROJECT_NAME}_service`
await execAsync(`docker restart ${containerName}`)
```

### Health Check Endpoint

**File:** `src/app/api/health/route.ts`

```typescript
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || 'unknown',
  })
}
```

This endpoint is used by Docker healthcheck - must be fast and reliable.

---

## Quick Reference

### Environment Variables (in container)

```
NODE_ENV=production
PROJECT_PATH=/workspace
NSELF_PROJECT_PATH=/workspace
NSELF_CLI_PATH=/usr/local/bin/nself
```

### Key Files

| File | Purpose |
|------|---------|
| `src/lib/nself-path.ts` | CLI path resolution |
| `src/lib/paths.ts` | Project path utilities |
| `src/lib/nselfCLI.ts` | CLI execution wrapper |
| `src/app/api/cli/execute/route.ts` | CLI command execution API |
| `src/app/api/health/route.ts` | Health check endpoint |
| `src/app/api/config/ssl/generate-local/route.ts` | SSL generation |

### CLI Commands Available

```bash
nself init          # Initialize project
nself build         # Generate docker-compose.yml
nself start         # Start services
nself stop          # Stop services
nself restart       # Restart services
nself status        # Show status
nself logs          # View logs
nself ssl bootstrap # Generate SSL certs
nself ssl status    # SSL status
nself trust         # Install trust
nself update        # Update CLI + admin
nself db shell      # Database shell
nself doctor        # Diagnose issues
```

---

## Checklist for nself-admin Development

- [ ] Always use `findNselfPath()` or `findNselfPathSync()` - never hardcode paths
- [ ] Always use `getProjectPath()` - never assume `/workspace`
- [ ] Always use `getEnhancedPath()` when executing commands
- [ ] Use correct CLI commands (`ssl bootstrap` not `ssl generate`)
- [ ] Set proper timeouts for long operations (60s default, 300s for builds)
- [ ] Health endpoint must respond quickly at `/api/health`
- [ ] Don't modify docker-compose.yml - let CLI handle it
- [ ] Don't try to update nself-admin from within nself-admin

---

**Questions?** Check the nself CLI source at `~/Sites/nself/` or ask the CLI team.
