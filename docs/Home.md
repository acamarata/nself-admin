# nself Admin Documentation

<div align="center">

![nself Admin](https://img.shields.io/badge/nself-Admin-blue?style=for-the-badge&logo=docker&logoColor=white)
![Version](https://img.shields.io/badge/version-0.0.7-green?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-orange?style=for-the-badge)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)

**The Modern Web UI for nself CLI - Transform Your Development Stack in Minutes**

</div>

---

## Welcome to nself Admin

**nself Admin (nAdmin)** is a web-based UI wrapper for the [nself CLI](https://github.com/acamarata/nself) that makes setting up and managing modern development stacks effortless. With an intuitive wizard interface, real-time monitoring, and comprehensive service management, nAdmin transforms complex Docker orchestration into a simple point-and-click experience.

### Why nself Admin?

| Feature                  | Description                                             |
| ------------------------ | ------------------------------------------------------- |
| **Zero-Config Start**    | Launch a complete development stack in under 5 minutes  |
| **Intelligent Wizard**   | 6-step configuration with smart defaults and validation |
| **Real-Time Monitoring** | Live metrics, logs, and health checks for all services  |
| **Docker-First Design**  | Runs in a container with zero footprint on your host    |
| **40+ Templates**        | Pre-configured for Node.js, Python, Go, Rust, and more  |
| **Multi-Environment**    | Manage dev, staging, and production configs             |

---

## Quick Navigation

### Getting Started

- **[Quick Start](Quick-Start)** - Get running in 5 minutes
- **[Init Wizard Guide](Init-Wizard-Guide)** - Complete wizard walkthrough
- **[Dashboard Overview](Dashboard-Overview)** - Master the dashboard

### Core Documentation

- **[Architecture](Architecture)** - System design and components
- **[Service Configuration](Service-Configuration)** - Configure all services
- **[Database Management](Database-Management)** - PostgreSQL operations
- **[Monitoring](Monitoring)** - Metrics and alerting

### Reference

- **[API Reference](API)** - Complete REST API documentation
- **[Environment Variables](ENVIRONMENT_VARIABLES)** - All configuration options
- **[CLI Integration](CLI_INTEGRATION)** - Working with nself CLI

### Deployment

- **[Production Deployment](Production-Deployment)** - Deploy to production
- **[Updates](Updates)** - Keeping nAdmin up to date
- **[CI Setup](CI_SETUP)** - Continuous integration configuration

### Help

- **[FAQ](FAQ)** - Frequently asked questions
- **[Troubleshooting](TROUBLESHOOTING)** - Common issues and solutions
- **[Security](SECURITY)** - Security best practices

---

## Technology Stack

| Layer     | Technology                       |
| --------- | -------------------------------- |
| Frontend  | Next.js 16, React 19, TypeScript |
| Styling   | Tailwind CSS v4                  |
| State     | Zustand                          |
| Database  | LokiJS (embedded)                |
| Container | Docker API via Dockerode         |
| Real-time | WebSockets, Server-Sent Events   |

---

## Project Links

- **GitHub**: [acamarata/nself-admin](https://github.com/acamarata/nself-admin)
- **Docker Hub**: [acamarata/nself-admin](https://hub.docker.com/r/acamarata/nself-admin)
- **Issues**: [Report bugs or request features](https://github.com/acamarata/nself-admin/issues)
- **Discussions**: [Join the community](https://github.com/acamarata/nself-admin/discussions)

---

## Current Version

**v0.0.7** - See [CHANGELOG](CHANGELOG) for details.

## License

MIT License - See [LICENSE](LICENSE) for details.
