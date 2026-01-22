# nself Admin (nAdmin)

[![Version](https://img.shields.io/badge/version-0.0.6-blue.svg)](https://github.com/acamarata/nself-admin/releases)
[![Docker](https://img.shields.io/docker/v/acamarata/nself-admin?label=docker)](https://hub.docker.com/r/acamarata/nself-admin)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![CI](https://img.shields.io/github/actions/workflow/status/acamarata/nself-admin/ci.yml?branch=main)](https://github.com/acamarata/nself-admin/actions)

**Web UI for [nself CLI](https://github.com/acamarata/nself)** - Manage your self-hosted backend stack visually.

## Quick Start

```bash
# Option 1: Via nself CLI (recommended)
nself admin

# Option 2: Direct Docker
docker run -d \
  --name nself-admin \
  -p 3021:3021 \
  -v $(pwd):/workspace \
  -v /var/run/docker.sock:/var/run/docker.sock \
  acamarata/nself-admin:latest
```

Open http://localhost:3021

## What You Get

- **6-Step Wizard** - Configure your stack visually
- **Real-Time Dashboard** - Monitor all services
- **40+ Templates** - Node.js, Python, Go, Rust, and more
- **Database Tools** - SQL console, migrations, backups
- **Service Management** - Start, stop, logs, health checks
- **SSL Configuration** - Local (mkcert) and Let's Encrypt support

## Stack

| Core           | Optional   |
| -------------- | ---------- |
| PostgreSQL     | Redis      |
| Hasura GraphQL | MinIO (S3) |
| Auth Service   | Mailpit    |
| Nginx          | Monitoring |

## Port Configuration

nself-admin runs on **port 3021** by default. This is distinct from other services:

| Service     | Port |
| ----------- | ---- |
| nself-admin | 3021 |
| Loki        | 3100 |
| Grafana     | 3000 |
| PostgreSQL  | 5432 |
| Hasura      | 8080 |

## Environment Variables

### Required (for Docker deployment)

| Variable             | Description                | Default      |
| -------------------- | -------------------------- | ------------ |
| `NSELF_PROJECT_PATH` | Path to your nself project | `/workspace` |

### Optional

| Variable        | Description                          | Default |
| --------------- | ------------------------------------ | ------- |
| `PORT`          | Server port                          | `3021`  |
| `NODE_ENV`      | Environment (development/production) | -       |
| `ADMIN_VERSION` | Version displayed in UI              | `0.0.6` |

### Notes

- **Admin password** is stored securely in the internal LokiJS database (`nadmin.db`), not in environment variables
- **Sessions** are managed via secure httpOnly cookies with 7-day expiry
- No external database required - nAdmin uses an embedded LokiJS database

## Docker Socket Permissions

When mounting `/var/run/docker.sock`, ensure the container user has appropriate permissions:

```bash
# Option 1: Add your user to the docker group (recommended)
sudo usermod -aG docker $USER

# Option 2: Adjust socket permissions (less secure)
sudo chmod 666 /var/run/docker.sock
```

## Health Check

The `/api/health` endpoint is available without authentication for container orchestration:

```bash
curl http://localhost:3021/api/health
```

Returns:

```json
{
  "status": "healthy",
  "timestamp": "2025-01-22T...",
  "version": "0.0.6",
  "checks": { "docker": true, "filesystem": true, ... }
}
```

## Documentation

Full documentation is in the [Wiki](https://github.com/acamarata/nself-admin/wiki):

- [Quick Start](https://github.com/acamarata/nself-admin/wiki/Quick-Start)
- [Init Wizard Guide](https://github.com/acamarata/nself-admin/wiki/Init-Wizard-Guide)
- [API Reference](https://github.com/acamarata/nself-admin/wiki/API)
- [Troubleshooting](https://github.com/acamarata/nself-admin/wiki/TROUBLESHOOTING)

## Development

```bash
git clone https://github.com/acamarata/nself-admin.git
cd nself-admin
pnpm install
PORT=3021 pnpm dev
```

## Architecture

nAdmin is a **UI wrapper** for the nself CLI. It doesn't reimplement any logic - it provides a web interface that executes nself commands.

```
Browser → nself-admin (Next.js) → nself CLI → Docker
```

See [Architecture](https://github.com/acamarata/nself-admin/wiki/Architecture) for details.

## License

MIT - See [LICENSE](LICENSE)
