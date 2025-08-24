# nself-admin Wiki

Welcome to the nself-admin developer documentation! This wiki contains everything you need to know about contributing to and extending the nself-admin project.

## What is nself-admin?

nself-admin is a web-based administration interface for the [nself CLI](https://github.com/acamarata/nself) backend stack. It provides a modern, intuitive UI for managing Docker containers, databases, configurations, and monitoring services in real-time.

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

## Version Information

Current Version: **0.0.1** (Initial Release)

This is the first public release of nself-admin. We're actively developing new features and welcome contributions from the community.

## Support & Community

- **GitHub Issues**: [Report bugs or request features](https://github.com/acamarata/nself-admin/issues)
- **Discussions**: [Join the conversation](https://github.com/acamarata/nself-admin/discussions)
- **Discord**: [Chat with the community](https://discord.gg/nself)

## License

nself-admin is open source software licensed under the MIT License. See the [LICENSE](https://github.com/acamarata/nself-admin/blob/main/LICENSE) file for details.