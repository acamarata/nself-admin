# nself Admin (nAdmin)

**The Complete Development Stack Management Platform**

[![Version](https://img.shields.io/badge/version-0.0.4--alpha-blue.svg)](https://github.com/acamarata/nself-admin/releases)
[![Docker](https://img.shields.io/docker/v/acamarata/nself-admin?label=docker&color=blue)](https://hub.docker.com/r/acamarata/nself-admin)
[![Docker Pulls](https://img.shields.io/docker/pulls/acamarata/nself-admin)](https://hub.docker.com/r/acamarata/nself-admin)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-linux%20%7C%20macos%20%7C%20windows-lightgrey)](https://github.com/acamarata/nself-admin)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![CI Status](https://img.shields.io/github/actions/workflow/status/acamarata/nself-admin/ci.yml?branch=main&label=CI)](https://github.com/acamarata/nself-admin/actions)
[![Wiki](https://img.shields.io/badge/docs-wiki-informational)](https://github.com/acamarata/nself-admin/wiki)

<div align="center">
  <img src="https://raw.githubusercontent.com/acamarata/nself-admin/main/docs/images/dashboard-preview.png" alt="nself Admin Dashboard" width="800">
</div>

> Transform your development workflow with a powerful, visual interface for managing modern application stacks. Built on Docker, powered by innovation.

**nself Admin** (nAdmin) is a comprehensive web-based platform that simplifies the setup and management of development stacks. Whether you're building a simple API or a complex microservices architecture, nAdmin provides the tools you need to configure, deploy, and monitor your entire stack from a single interface.

## 🚀 Quick Start

**Get your complete stack running in under 5 minutes!**

```bash
# Create a new project directory
mkdir my-awesome-app && cd my-awesome-app

# Launch nself Admin
docker run -d \
  --name nself-admin \
  -p 3021:3021 \
  -v $(pwd):/workspace \
  -v /var/run/docker.sock:/var/run/docker.sock \
  acamarata/nself-admin:latest
```

🎉 **That's it!** Access the dashboard at http://localhost:3021

### What You Get

✅ PostgreSQL Database  
✅ Hasura GraphQL Engine  
✅ Authentication Service  
✅ Nginx Reverse Proxy  
✅ Redis Cache (optional)  
✅ S3-Compatible Storage (optional)  
✅ 40+ Framework Templates  
✅ Real-time Monitoring  
✅ One-Click Deployment  

[📚 View Complete Documentation](https://github.com/acamarata/nself-admin/wiki) | [🎥 Watch Demo](https://youtube.com/watch?v=demo)

## ✨ Key Features

### 🎯 Visual Stack Configuration
- **6-Step Initialization Wizard** - Guided setup with intelligent defaults
- **40+ Framework Templates** - Pre-configured for Node.js, Python, Go, Ruby, PHP, Java, Rust, and more
- **Service Orchestration** - Automatic Docker Compose generation
- **Smart Routing** - Nginx configuration with subdomain support

### 📊 Real-Time Monitoring
- **Service Health Dashboard** - Live status for all containers
- **Resource Metrics** - CPU, memory, disk, and network usage
- **Log Aggregation** - Unified log viewer with filtering
- **Alert System** - Configurable thresholds and notifications

### 🛠️ Developer Tools
- **Database Management** - SQL console, migrations, backups
- **GraphQL Playground** - Integrated Hasura console
- **API Testing** - Built-in REST client
- **Terminal Access** - Web-based shell for containers

### 🔒 Enterprise Ready
- **Secure Authentication** - JWT-based with session management
- **SSL/TLS Support** - Let's Encrypt integration
- **Backup & Restore** - Automated and manual options
- **Multi-Environment** - Dev, staging, and production configs

## 📋 System Requirements

### Minimum
- **Docker**: 20.10 or higher
- **RAM**: 4GB available for Docker
- **Disk**: 10GB free space
- **Port**: 3021 (configurable)

### Recommended
- **Docker Desktop**: Latest version
- **RAM**: 8GB+ for smooth operation
- **CPU**: 4+ cores
- **Network**: Stable internet for pulling images

## 🏗️ What Can You Build?

### 🛒 E-Commerce Platform
```yaml
Stack: PostgreSQL + Hasura + Redis + MinIO + Node.js API
Features: Product catalog, cart sessions, image storage, payment processing
```

### 🚀 SaaS Application
```yaml
Stack: Multi-tenant PostgreSQL + Auth + Redis + Multiple microservices
Features: User management, billing, analytics, real-time updates
```

### 🤖 AI/ML Platform
```yaml
Stack: PostgreSQL + MLflow + MinIO + Python FastAPI
Features: Model training, experiment tracking, inference API, data storage
```

### 📱 Mobile Backend
```yaml
Stack: PostgreSQL + Hasura + Auth + WebSocket + Push notifications
Features: Real-time sync, offline support, user auth, file uploads
```

[🎨 View All Templates](https://github.com/acamarata/nself-admin/wiki/Templates)

## 🎬 See It In Action

<div align="center">
  <table>
    <tr>
      <td align="center">
        <img src="https://raw.githubusercontent.com/acamarata/nself-admin/main/docs/images/wizard.gif" width="400">
        <br><b>Setup Wizard</b>
      </td>
      <td align="center">
        <img src="https://raw.githubusercontent.com/acamarata/nself-admin/main/docs/images/dashboard.gif" width="400">
        <br><b>Live Dashboard</b>
      </td>
    </tr>
    <tr>
      <td align="center">
        <img src="https://raw.githubusercontent.com/acamarata/nself-admin/main/docs/images/services.gif" width="400">
        <br><b>Service Management</b>
      </td>
      <td align="center">
        <img src="https://raw.githubusercontent.com/acamarata/nself-admin/main/docs/images/monitoring.gif" width="400">
        <br><b>Real-time Monitoring</b>
      </td>
    </tr>
  </table>
</div>

## 🚦 Getting Started

### Step 1: Launch nAdmin
```bash
docker run -d --name nself-admin \
  -p 3021:3021 \
  -v $(pwd):/workspace \
  -v /var/run/docker.sock:/var/run/docker.sock \
  acamarata/nself-admin:latest
```

### Step 2: Open Browser
Navigate to http://localhost:3021

### Step 3: Set Password
Create your admin password (minimum 3 characters for development)

### Step 4: Run Wizard
Follow the 6-step wizard to configure your stack:
1. **Project Setup** - Name, environment, domain
2. **Core Services** - PostgreSQL, Hasura, Auth, Nginx
3. **Optional Services** - Redis, MinIO, Mailpit, etc.
4. **Custom Services** - Your application services
5. **Frontend Apps** - Web applications
6. **Review & Build** - Generate configuration

### Step 5: Start Services
Click "Start All Services" and watch your stack come to life!

[📖 Detailed Setup Guide](https://github.com/acamarata/nself-admin/wiki/Quick-Start)

## 📚 Documentation

### 🎯 Getting Started
- [**Quick Start Guide**](https://github.com/acamarata/nself-admin/wiki/Quick-Start) - Get running in 5 minutes
- [**Init Wizard Guide**](https://github.com/acamarata/nself-admin/wiki/Init-Wizard-Guide) - Detailed wizard walkthrough
- [**First Project**](https://github.com/acamarata/nself-admin/wiki/First-Project) - Build your first application

### 🛠️ Core Guides
- [**Service Configuration**](https://github.com/acamarata/nself-admin/wiki/Service-Configuration) - Configure all service types
- [**Dashboard Overview**](https://github.com/acamarata/nself-admin/wiki/Dashboard-Overview) - Master the dashboard
- [**Database Management**](https://github.com/acamarata/nself-admin/wiki/Database-Management) - PostgreSQL operations

### 📖 Reference
- [**API Documentation**](https://github.com/acamarata/nself-admin/wiki/API-Reference) - Complete API reference
- [**Framework Templates**](https://github.com/acamarata/nself-admin/wiki/Framework-Templates) - All 40+ templates
- [**Environment Variables**](https://github.com/acamarata/nself-admin/wiki/Environment-Variables) - Configuration options

### 🚀 Advanced
- [**Production Deployment**](https://github.com/acamarata/nself-admin/wiki/Production-Deployment) - Deploy to production
- [**Monitoring & Metrics**](https://github.com/acamarata/nself-admin/wiki/Monitoring-Metrics) - Set up monitoring
- [**Security Best Practices**](https://github.com/acamarata/nself-admin/wiki/Security) - Secure your stack

### ❓ Help
- [**FAQ**](https://github.com/acamarata/nself-admin/wiki/FAQ) - Frequently asked questions
- [**Troubleshooting**](https://github.com/acamarata/nself-admin/wiki/Troubleshooting) - Common issues and solutions
- [**Community**](https://github.com/acamarata/nself-admin/discussions) - Get help from the community

## 🧑‍💻 Development

### Local Development
```bash
# Clone the repository
git clone https://github.com/acamarata/nself-admin.git
cd nself-admin

# Install dependencies
npm install

# Run development server
PORT=3021 npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Docker Development
```bash
# Build local image
docker build -t nself-admin:local .

# Run with local image
docker run -d \
  --name nself-admin-dev \
  -p 3021:3021 \
  -v $(pwd):/workspace \
  -v /var/run/docker.sock:/var/run/docker.sock \
  nself-admin:local
```

[📖 Development Guide](https://github.com/acamarata/nself-admin/wiki/Development)

## 🐳 Docker Images

### Official Images
```bash
# Latest stable
docker pull acamarata/nself-admin:latest

# Specific version
docker pull acamarata/nself-admin:0.0.4-alpha

# Development builds
docker pull acamarata/nself-admin:dev
```

### Multi-Architecture Support
✅ `linux/amd64` - Intel/AMD processors  
✅ `linux/arm64` - Apple Silicon, AWS Graviton  
✅ `linux/arm/v7` - Raspberry Pi and ARM devices

### Image Sizes
- **Compressed**: ~150MB
- **Extracted**: ~400MB
- **Runtime Memory**: ~256MB

## 🗺️ Roadmap

### ✅ Completed (v0.0.4-alpha)
- 6-step initialization wizard
- 40+ framework templates
- Real-time monitoring dashboard
- Service management (start/stop/restart)
- Database tools and migrations
- Log aggregation and viewing
- Docker Compose generation
- Environment management

### 🚧 In Progress (v0.0.5)
- [ ] WebSocket real-time updates
- [ ] Mobile responsive design
- [ ] Backup/restore automation
- [ ] Grafana integration
- [ ] Custom service templates

### 📋 Planned (v0.1.0-beta)
- [ ] Multi-user support
- [ ] Role-based access control
- [ ] Kubernetes support
- [ ] CI/CD integration
- [ ] Template marketplace

### 🎯 Future (v1.0.0)
- [ ] Enterprise SSO
- [ ] Multi-cluster management
- [ ] Advanced monitoring
- [ ] Cost optimization
- [ ] Compliance tools

[View Full Roadmap](https://github.com/acamarata/nself-admin/wiki/Roadmap)

## 🆕 What's New

### v0.0.4-alpha (Latest)
- 🎯 **6-Step Wizard**: Complete project configuration
- 🚀 **40+ Templates**: Pre-configured frameworks
- 📊 **Live Monitoring**: Real-time metrics
- 🔧 **Service Management**: Full container control
- 📚 **Complete Docs**: Wiki with guides

### v0.0.3
- 🗄️ LokiJS database integration
- 🔐 Secure authentication
- 🎨 UI improvements

[📋 Full Changelog](https://github.com/acamarata/nself-admin/wiki/Changelog)

## 🤝 Contributing

We love contributions! Here's how to get involved:

### Quick Contribution Guide
```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/nself-admin.git

# Create feature branch
git checkout -b feature/amazing-feature

# Make changes and test
npm test

# Commit with conventional commits
git commit -m "feat: add amazing feature"

# Push and create PR
git push origin feature/amazing-feature
```

### Ways to Contribute
- 🐛 **Report Bugs**: [Create an issue](https://github.com/acamarata/nself-admin/issues)
- 💡 **Suggest Features**: [Start a discussion](https://github.com/acamarata/nself-admin/discussions)
- 📚 **Improve Docs**: Edit wiki pages
- 🌐 **Translations**: Help localize
- ⭐ **Star the Repo**: Show your support!

[📖 Contributing Guide](https://github.com/acamarata/nself-admin/wiki/Contributing)

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

nself Admin is free and open-source software. You can use it for personal, educational, and commercial projects.

## 🙏 Acknowledgments

### Built With
- [Next.js 15](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [LokiJS](https://github.com/techfort/LokiJS) - Embedded database
- [Docker](https://www.docker.com/) - Containerization
- [TypeScript](https://www.typescriptlang.org/) - Type safety

### Special Thanks
- All our [contributors](https://github.com/acamarata/nself-admin/graphs/contributors)
- The open-source community
- Early adopters and testers

## 💬 Community & Support

### Get Help
- 📚 **[Documentation Wiki](https://github.com/acamarata/nself-admin/wiki)** - Comprehensive guides
- 💭 **[GitHub Discussions](https://github.com/acamarata/nself-admin/discussions)** - Community forum
- 🐛 **[Issue Tracker](https://github.com/acamarata/nself-admin/issues)** - Bug reports
- 💬 **[Discord Server](https://discord.gg/nself)** - Real-time chat
- 📧 **[Email Support](mailto:support@nself.org)** - Direct assistance

### Stay Updated
- ⭐ **[Star on GitHub](https://github.com/acamarata/nself-admin)** - Get notifications
- 🐦 **[Follow on Twitter](https://twitter.com/nselforg)** - Latest news
- 📺 **[YouTube Channel](https://youtube.com/@nselforg)** - Video tutorials
- 📨 **[Newsletter](https://nself.org/newsletter)** - Monthly updates

### Project Stats
![GitHub stars](https://img.shields.io/github/stars/acamarata/nself-admin?style=social)
![GitHub forks](https://img.shields.io/github/forks/acamarata/nself-admin?style=social)
![GitHub watchers](https://img.shields.io/github/watchers/acamarata/nself-admin?style=social)

---

<div align="center">
  <b>Built with ❤️ by developers, for developers</b>
  <br>
  <sub>If nself Admin helps your workflow, please consider ⭐ starring the repo!</sub>
</div>
