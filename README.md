# nself-admin

[![License](https://img.shields.io/badge/license-Personal%20Free%20%7C%20Commercial-green.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-0.0.1-blue.svg)](https://github.com/acamarata/nself-admin/releases)
[![Docker](https://img.shields.io/badge/docker-nself%2Fadmin-blue.svg)](https://hub.docker.com/r/nself/admin)

A modern, web-based administration interface for the [nself CLI](https://github.com/acamarata/nself) backend stack.

## 🚀 Quick Start

```bash
# Using nself CLI (recommended)
nself init --admin
```

Or run directly with Docker:

```bash
docker run -d \
  -p 3001:3001 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v $(pwd):/project \
  --name nself-admin \
  nself/admin:latest
```

## 📋 Features

- **Real-time Dashboard** - Monitor system metrics and service status
- **Container Management** - Start, stop, and restart Docker containers
- **Configuration Editor** - Manage environment variables
- **Database Console** - PostgreSQL management interface
- **Log Streaming** - Real-time log viewing from all services
- **Auto-Updates** - Built-in version checking and updates

## 📖 Documentation

Complete documentation is available in the [Wiki](https://github.com/acamarata/nself-admin/wiki):

- [Setup Guide](https://github.com/acamarata/nself-admin/wiki/developer/Setup)
- [Architecture Overview](https://github.com/acamarata/nself-admin/wiki/developer/Architecture)
- [Contributing Guidelines](https://github.com/acamarata/nself-admin/wiki/contributing/CONTRIBUTING)

## 🔧 Requirements

- Docker
- nself CLI project (for full functionality)

## 🤝 Contributing

See [docs/contributing/CONTRIBUTING.md](docs/contributing/CONTRIBUTING.md) for development setup and guidelines.

## 📄 License

**Personal Free | Commercial License**

- ✅ **Free for personal use** - Use, modify, and distribute for personal, educational, and non-commercial purposes
- 💼 **Commercial license required** - For business use, revenue-generating activities, or commercial products
- 🔗 **Get commercial license** - Visit [nself.org/commercial](https://nself.org/commercial) or contact license@nself.org

See [LICENSE](LICENSE) for complete terms.