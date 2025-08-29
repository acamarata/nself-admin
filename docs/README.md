# nAdmin Documentation

Welcome to the nAdmin documentation. nAdmin is a Docker-based administration dashboard for managing nself backend projects.

## 📚 Documentation Structure

### Getting Started
- [Installation Guide](setup/installation.md) - How to install and run nAdmin
- [Quick Start](setup/quick-start.md) - Get up and running in 5 minutes
- [Configuration](setup/configuration.md) - Environment variables and settings

### Architecture
- [System Overview](architecture/overview.md) - High-level architecture
- [Database Design](architecture/database.md) - LokiJS schema and collections
- [Security Model](architecture/security.md) - Authentication and authorization
- [Docker Architecture](architecture/docker.md) - Container design and volumes

### Development
- [Development Setup](development/setup.md) - Local development environment
- [Project Structure](development/structure.md) - Code organization
- [Contributing](development/contributing.md) - How to contribute
- [Testing](development/testing.md) - Testing strategies

### API Reference
- [Authentication API](api/authentication.md) - Login, logout, sessions
- [Project API](api/project.md) - Project management endpoints
- [Services API](api/services.md) - Service control endpoints
- [Database API](api/database.md) - Database operations

### Deployment
- [Docker Deployment](deployment/docker.md) - Production Docker setup
- [Security Hardening](deployment/security.md) - Production security
- [Monitoring](deployment/monitoring.md) - Logs and metrics
- [Backup & Recovery](deployment/backup.md) - Data persistence

### User Guides
- [First Time Setup](guides/first-time-setup.md) - Initial configuration
- [Managing Services](guides/managing-services.md) - Start, stop, restart
- [Database Operations](guides/database-operations.md) - Migrations, backups
- [Troubleshooting](guides/troubleshooting.md) - Common issues

## 🚀 Quick Links

- **Repository**: [github.com/your-org/nself-admin](https://github.com/your-org/nself-admin)
- **Docker Hub**: [hub.docker.com/r/acamarata/nself-admin](https://hub.docker.com/r/acamarata/nself-admin)
- **Issues**: [Report bugs or request features](https://github.com/your-org/nself-admin/issues)

## 🎯 Key Features

- **Zero Configuration**: Works out of the box with sensible defaults
- **Docker Native**: Designed to run in containers
- **Self-Contained**: All state stored in internal database
- **Project Agnostic**: Manages any nself project structure
- **Secure by Default**: Built-in authentication and session management

## 📋 Prerequisites

- Docker 20.10 or higher
- nself CLI installed
- A directory for your nself project

## 🏗️ Architecture Overview

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

## 📖 Version History

- **v1.0.0** - Initial release with core functionality
- **v1.1.0** - Added LokiJS database support
- **v1.2.0** - Enhanced security and session management

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](development/contributing.md) for details.

## 📄 License

nAdmin is licensed under the MIT License. See [LICENSE](../LICENSE) for details.