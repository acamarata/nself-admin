# nself-admin

**nAdmin** - Administration Dashboard for nself Projects

[![Version](https://img.shields.io/badge/version-0.0.3-blue.svg)](https://github.com/acamarata/nself-admin/releases)
[![Docker](https://img.shields.io/docker/v/acamarata/nself-admin?label=docker&color=blue)](https://hub.docker.com/r/acamarata/nself-admin)
[![Docker Pulls](https://img.shields.io/docker/pulls/acamarata/nself-admin)](https://hub.docker.com/r/acamarata/nself-admin)
[![License](https://img.shields.io/badge/license-Free%20Personal%20%7C%20Commercial-green.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-linux%20%7C%20macos%20%7C%20windows-lightgrey)](https://github.com/acamarata/nself-admin)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![CI Status](https://img.shields.io/github/actions/workflow/status/acamarata/nself-admin/ci.yml?branch=main&label=CI)](https://github.com/acamarata/nself-admin/actions)

A modern, Docker-based administration dashboard for managing [nself](https://github.com/acamarata/nself) backend projects. Zero footprint on your project with complete control through a clean web interface.

## 🚀 Quick Start

```bash
# Using nself CLI (recommended)
cd /path/to/your/project
nself admin

# Or run directly with Docker
docker run -d \
  -p 3021:3021 \
  -v $(pwd):/workspace:rw \
  -v nself-admin-data:/app/data \
  --name nself-admin \
  acamarata/nself-admin:latest
```

Access the dashboard at http://localhost:3021

## ✨ Features

### Core Functionality
- **🔐 Secure Authentication** - Database-backed sessions with bcrypt password hashing
- **🚀 Project Setup Wizard** - 4-step guided setup for new projects
- **📊 Real-time Dashboard** - Monitor all services and system metrics
- **🐳 Container Management** - Start, stop, restart Docker containers
- **🗄️ Database Tools** - PostgreSQL console, migrations, backups
- **📝 Configuration Editor** - Manage environment variables
- **📈 Service Monitoring** - CPU, memory, network statistics
- **🔍 Log Viewer** - Real-time log streaming from all services

### Architecture Highlights
- **Zero Footprint** - Never writes to your project directory
- **Self-Contained** - All state stored in embedded LokiJS database
- **Docker-First** - Designed to run in containers
- **Progressive Disclosure** - Guides users through setup → build → start → manage

## 📋 Requirements

- Docker 20.10 or higher
- nself CLI installed
- Port 3021 available (or configure custom port)

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│          User Browser               │
└────────────┬────────────────────────┘
             │ HTTPS (Port 3021)
┌────────────▼────────────────────────┐
│       nAdmin Container              │
│  ┌──────────────────────────────┐  │
│  │     Next.js Application      │  │
│  ├──────────────────────────────┤  │
│  │     LokiJS Database          │  │
│  └──────────────────────────────┘  │
│            │                        │
│            │ Volume Mount           │
│            ▼                        │
│  ┌──────────────────────────────┐  │
│  │    /workspace (User Project) │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
```

## 🔒 Security

- **Password Protection** - Configurable password requirements (dev/prod modes)
- **Session Management** - 24-hour TTL with automatic cleanup
- **CSRF Protection** - Token validation for all state-changing requests
- **Audit Logging** - 30-day retention of security events
- **Non-Root Container** - Runs as unprivileged user

## 🔧 Password Reset

If you need to reset the admin password:

### Option 1: Using nself CLI (coming soon)
```bash
nself admin reset-password
```

### Option 2: Manual Reset
```bash
# Stop the container
docker stop nself-admin

# Remove the database file
docker exec nself-admin rm /app/data/nadmin.db

# Restart the container
docker start nself-admin
```

You'll be prompted to set a new password on next login.

## 📖 Documentation

Complete documentation is available in the [docs](./docs) directory:

- [Quick Start Guide](docs/setup/quick-start.md)
- [Installation Guide](docs/setup/installation.md)
- [Architecture Overview](docs/architecture/overview.md)
- [Database Design](docs/architecture/database.md)
- [API Reference](docs/api/authentication.md)
- [Development Setup](docs/development/setup.md)
- [Docker Deployment](docs/deployment/docker.md)
- [First Time Setup](docs/guides/first-time-setup.md)

## 🚀 Development

```bash
# Clone the repository
git clone https://github.com/acamarata/nself-admin.git
cd nself-admin

# Install dependencies
npm install

# Run development server
PORT=3021 npm run dev

# Build for production
npm run build

# Build Docker image
docker build -t nself-admin:local .
```

## 📦 Docker Hub

Official images are available on Docker Hub:

```bash
# Latest version
docker pull acamarata/nself-admin:latest

# Specific version
docker pull acamarata/nself-admin:0.0.3
```

Multi-architecture support:
- `linux/amd64`
- `linux/arm64`
- `linux/arm/v7`

## 🗺️ Roadmap

### Version 0.0.x (Alpha)
- ✅ Basic authentication and session management
- ✅ LokiJS database integration
- ✅ Project setup wizard
- ✅ Service management
- ⬜ Mobile responsive design
- ⬜ WebSocket real-time updates

### Version 0.1.x (Beta)
- ⬜ Multi-user support
- ⬜ Role-based access control
- ⬜ Backup/restore functionality
- ⬜ Metrics history and graphs
- ⬜ Custom service templates

### Version 1.0.0 (Stable)
- ⬜ Production-ready features
- ⬜ Comprehensive test coverage
- ⬜ Performance optimizations
- ⬜ Enterprise features

## 📝 Changelog

See [CHANGELOG.md](docs/CHANGELOG.md) for detailed version history.

### Latest: v0.0.3 (2025-01-29)
- 🎯 LokiJS database for all application state
- 🔐 Improved authentication with database-backed sessions
- 🚀 4-step project setup wizard
- 📚 Comprehensive documentation
- 🔧 Password reset capability

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](docs/development/contributing.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## 📄 License

This project uses a dual licensing model:
- **Free for personal, educational, and non-commercial use**
- **Commercial license required for business use**

See the [LICENSE](LICENSE) file for details. For commercial licensing, visit [nself.org/commercial](https://nself.org/commercial).

## 🙏 Acknowledgments

- Built with [Next.js 15](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Database powered by [LokiJS](https://github.com/techfort/LokiJS)
- Container management via [Docker](https://www.docker.com/)

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/acamarata/nself-admin/issues)
- **Discussions**: [GitHub Discussions](https://github.com/acamarata/nself-admin/discussions)
- **Wiki**: [Documentation Wiki](https://github.com/acamarata/nself-admin/wiki)
- **Telegram**: [@nselforg](https://t.me/nselforg) (Announcements)
- **Commercial**: [nself.org/commercial](https://nself.org/commercial)

---

Made with ❤️ by the nself team