# nself Admin (nAdmin) Documentation

<div align="center">

![nself Admin](https://img.shields.io/badge/nself-Admin-blue?style=for-the-badge&logo=docker&logoColor=white)
![Version](https://img.shields.io/badge/version-0.0.4--alpha-green?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-orange?style=for-the-badge)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)

**The Modern Web UI for nself CLI - Transform Your Development Stack in Minutes**

[Quick Start](Quick-Start) | [Init Wizard Guide](Init-Wizard-Guide) | [API Reference](api/Reference) | [Troubleshooting](Troubleshooting)

</div>

---

## 🚀 Welcome to nself Admin

**nself Admin (nAdmin)** is a powerful web-based UI wrapper for the nself CLI that makes setting up and managing modern development stacks effortless. With an intuitive wizard interface, real-time monitoring, and comprehensive service management, nAdmin transforms complex Docker orchestration into a simple point-and-click experience.

### Why nself Admin?

- **🎯 Zero-Config Start**: Launch a complete development stack with PostgreSQL, Hasura, Auth, and more in under 5 minutes
- **🔮 Intelligent Wizard**: Step-by-step configuration with smart defaults and validation
- **📊 Real-Time Monitoring**: Live metrics, logs, and health checks for all services
- **🐳 Docker-First Design**: Runs in a container with zero footprint on your host system
- **🔧 40+ Framework Templates**: Pre-configured templates for Node.js, Python, Go, Rust, and more
- **🌐 Multi-Environment Support**: Seamlessly manage development, staging, and production configs

## Quick Links

### Getting Started

- [Installation Guide](./deployment/Installation.md)
- [Development Setup](./developer/Setup.md)
- [Architecture Overview](./developer/Architecture.md)

### For Contributors

- [Contributing Guide](./contributing/CONTRIBUTING.md)
- [Code of Conduct](./contributing/CODE_OF_CONDUCT.md)
- [Development Workflow](./contributing/Workflow.md)
- [Testing Guide](./developer/Testing.md)

### API & Integration

- [API Reference](./api/Reference.md)
- [Authentication](./api/Authentication.md)
- [WebSocket Events](./api/WebSocket.md)
- [CLI Integration](./deployment/CLI_Integration.md)

### Deployment

- [Docker Deployment](./deployment/Docker.md)
- [Configuration Options](./deployment/Configuration.md)
- [Multi-Architecture Builds](./deployment/Multi-Arch.md)
- [Auto-Updates](./deployment/Auto-Updates.md)

## Project Structure

```
nself-admin/
├── src/
│   ├── app/           # Next.js 15 app directory
│   ├── components/    # React components
│   ├── lib/          # Utilities and helpers
│   ├── services/     # Service layer
│   └── stores/       # State management (Zustand)
├── docs/             # Documentation (this wiki)
├── public/           # Static assets
└── scripts/          # Build and release scripts
```

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand
- **Real-time**: WebSockets, Server-Sent Events
- **Container Management**: Docker API via Dockerode
- **Database**: PostgreSQL client (pg)

## 💡 Key Features

### Intelligent Project Wizard

The 6-step wizard guides you through:

1. **Project Setup** - Name, environment, and database configuration
2. **Required Services** - Configure core infrastructure
3. **Optional Services** - Add caching, storage, monitoring
4. **Custom Services** - Add your microservices and APIs
5. **Frontend Apps** - Configure SPAs and routing
6. **Review & Build** - Validate and build your stack

### Real-Time Monitoring

- **Service Health** - Live status for all containers
- **Resource Metrics** - CPU, memory, disk, and network usage
- **Log Streaming** - Real-time logs from all services
- **Alert Management** - Configurable alerts and notifications

### Database Management

- **Automatic Migrations** - Version-controlled schema changes
- **Visual Query Builder** - Execute SQL with syntax highlighting
- **Backup & Restore** - Scheduled and on-demand backups
- **Seed Data** - Populate development databases

## 🚦 Current Status

- **Version**: 0.0.4-beta
- **Docker Hub**: [acamarata/nself-admin](https://hub.docker.com/r/acamarata/nself-admin)
- **GitHub**: [acamarata/nself-admin](https://github.com/acamarata/nself-admin)
- **License**: MIT

## Support & Community

- **GitHub Issues**: [Report bugs or request features](https://github.com/acamarata/nself-admin/issues)
- **Discussions**: [Join the conversation](https://github.com/acamarata/nself-admin/discussions)
- **Discord**: [Chat with the community](https://discord.gg/nself)

## License

nself-admin is open source software licensed under the MIT License. See the [LICENSE](https://github.com/acamarata/nself-admin/blob/main/LICENSE) file for details.
