# nself-admin Documentation

## Overview

Welcome to the comprehensive documentation for nself-admin (nAdmin) - the web-based administration interface for nself backend projects.

nself-admin provides a powerful, user-friendly interface for configuring, building, and managing your nself backend stack through a guided wizard and real-time monitoring tools.

## Quick Start

1. **Install and Start**

   ```bash
   # Clone the repository
   git clone https://github.com/nself/admin.git
   cd nself-admin

   # Install dependencies
   npm install

   # Start development server
   PORT=3100 npm run dev
   ```

2. **Access the Interface**
   - Open http://localhost:3100
   - Set your admin password on first run
   - Follow the 6-step setup wizard

3. **Build Your Stack**
   - Complete the wizard configuration
   - Click "Build Project" on Step 6
   - Start your services

## Documentation Structure

### Core Documentation

| Document                                                   | Description                                      |
| ---------------------------------------------------------- | ------------------------------------------------ |
| **[ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md)** | Complete reference for all environment variables |
| **[WIZARD_GUIDE.md](./WIZARD_GUIDE.md)**                   | Detailed guide for the 6-step setup wizard       |
| **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)**             | Solutions for common issues and debugging        |
| **[CLI_INTEGRATION.md](./CLI_INTEGRATION.md)**             | Integration with nself CLI commands              |
| **[PROJECT_PATH.md](./PROJECT_PATH.md)**                   | Project path configuration and management        |

### Architecture & Development

| Directory                            | Contents                                 |
| ------------------------------------ | ---------------------------------------- |
| **[architecture/](./architecture/)** | System architecture and design decisions |
| **[developer/](./developer/)**       | Developer guides and API documentation   |
| **[deployment/](./deployment/)**     | Production deployment guides             |
| **[api/](./api/)**                   | API endpoint documentation               |
| **[contributing/](./contributing/)** | Contribution guidelines                  |

### Additional Resources

| Document                           | Description                       |
| ---------------------------------- | --------------------------------- |
| **[CHANGELOG.md](./CHANGELOG.md)** | Version history and release notes |
| **[SECURITY.md](./SECURITY.md)**   | Security policies and reporting   |
| **[LICENSE.md](./LICENSE.md)**     | License information               |

## Key Features

### 🎯 Setup Wizard

- **6-step guided configuration** with progress tracking
- **Auto-save** functionality preserves changes instantly
- **Smart defaults** based on environment (dev/staging/prod)
- **Validation** ensures correct configuration
- **Visual builders** for cron schedules and service configuration

### 🔧 Service Management

- **Core Services**: PostgreSQL, Hasura, Auth, Nginx (always enabled)
- **Optional Services**: Redis, Storage, Search, Monitoring, Email
- **Custom Services**: Add your own backend services
- **Frontend Apps**: Configure multiple frontend applications

### 📊 Monitoring & Management

- **Real-time logs** from all services
- **Service health** monitoring
- **Database management** tools
- **Backup configuration** with visual scheduling
- **Resource usage** tracking

### 🔒 Security

- **Admin authentication** with secure sessions
- **Secret management** with proper validation
- **Environment isolation** (dev/staging/prod)
- **CORS configuration** for production
- **JWT authentication** setup

## Environment Variables

nself-admin follows the official **nself Environment Variable Specification v1.0**.

### Key Principles

1. **Service Enable Flags**: All services have `*_ENABLED` flags
2. **Core Services**: Default to `true` for backward compatibility
3. **File Hierarchy**: `.env.dev` → `.env.staging` → `.env.prod` → `.env`
4. **Naming Convention**: Consistent, predictable variable names
5. **Backward Compatibility**: Supports deprecated variables

### Quick Reference

```bash
# Core Configuration
ENV=dev                    # Environment mode
PROJECT_NAME=my-app       # Project identifier
BASE_DOMAIN=localhost     # Base domain

# Service Flags (examples)
POSTGRES_ENABLED=true     # Core service
STORAGE_ENABLED=true      # Core service (MinIO)
REDIS_ENABLED=false       # Optional service
NSELF_ADMIN_ENABLED=true  # This admin UI

# Hasura Configuration
HASURA_GRAPHQL_ADMIN_SECRET=<32+ chars>
HASURA_JWT_KEY=<32+ chars>
HASURA_JWT_TYPE=HS256

# Custom Services
CS_1=api:express:4000:api
CS_2=worker:python:4001

# Frontend Apps
FRONTEND_APP_1_PORT=3001  # Required!
FRONTEND_APP_1_ROUTE=app
```

See [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md) for complete reference.

## Wizard Steps

The setup wizard guides you through 6 configuration steps:

### Step 1: Basic Settings

- Project name and description
- Environment selection (dev/staging/prod)
- Domain configuration
- Database setup
- Automated backup configuration

### Step 2: Core Services

- View required services
- Configure advanced settings
- PostgreSQL, Hasura, Auth, Nginx

### Step 3: Optional Services

- Storage (MinIO)
- Redis Cache
- Search Services (6 engines)
- Email Service (Mailpit)
- Monitoring Bundle
- nself Admin UI

### Step 4: Custom Services

- Add backend services
- Select framework/language
- Configure ports and routes
- Set resource limits

### Step 5: Frontend Applications

- Configure external apps
- Set unique ports (required!)
- Define table prefixes
- Setup Hasura remote schemas

### Step 6: Review & Build

- Review complete configuration
- View service summary
- Initiate build process
- Monitor progress

See [WIZARD_GUIDE.md](./WIZARD_GUIDE.md) for detailed information.

## Troubleshooting

### Common Issues

| Issue                 | Solution                                         |
| --------------------- | ------------------------------------------------ |
| Port conflicts        | Use different ports or stop conflicting services |
| Build failures        | Check Docker daemon and required variables       |
| Service won't start   | Verify credentials and check logs                |
| Auto-save stuck       | Check file permissions and API endpoints         |
| Variables not loading | Verify file location and syntax                  |

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for comprehensive solutions.

## Architecture

### Technology Stack

- **Frontend**: Next.js 15.5, React 19, TypeScript
- **Styling**: Tailwind CSS with dark mode
- **Backend**: Node.js API routes
- **Database**: LokiJS (embedded) for admin data
- **Integration**: Docker Compose, nself CLI

### Design Principles

1. **Zero Footprint**: Never pollutes user's project
2. **Self-Contained**: All state in embedded database
3. **Docker-First**: Designed for containerization
4. **Progressive Disclosure**: Guides users step-by-step
5. **Stateless Operations**: Can be destroyed and recreated

### File Structure

```
nself-admin/
├── src/
│   ├── app/           # Next.js app router pages
│   ├── components/    # React components
│   ├── lib/          # Utilities and helpers
│   └── hooks/        # Custom React hooks
├── docs/             # Documentation
├── public/           # Static assets
└── data/            # LokiJS database (gitignored)
```

## Development

### Prerequisites

- Node.js 18+
- Docker Desktop
- nself CLI (optional)

### Local Development

```bash
# Install dependencies
npm install

# Set project path (optional)
export NSELF_PROJECT_PATH=../my-project

# Start development server
PORT=3100 npm run dev

# Access at http://localhost:3100
```

### Build for Production

```bash
# Build application
npm run build

# Build Docker image
docker build -t nself-admin .

# Run container
docker run -p 3100:3100 \
  -v /path/to/project:/workspace \
  nself-admin
```

### Testing

```bash
# Run tests
npm test

# Type checking
npm run type-check

# Linting
npm run lint
```

## API Endpoints

Key API routes for wizard and management:

### Wizard APIs

- `GET /api/wizard/init` - Load configuration
- `POST /api/wizard/update-env` - Save configuration
- `GET /api/wizard/load-env` - Read environment files
- `POST /api/wizard/reset` - Reset configuration

### Project APIs

- `GET /api/project/status` - Project status
- `POST /api/nself/build` - Build project
- `POST /api/nself/start` - Start services
- `GET /api/docker/status` - Service status

### Auth APIs

- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout
- `GET /api/auth/session` - Check session

## Contributing

We welcome contributions! Please see [contributing/](./contributing/) for:

- Code of Conduct
- Development setup
- Coding standards
- Pull request process
- Issue reporting

## Security

### Reporting Issues

Please report security vulnerabilities to security@nself.com. Do not create public issues for security problems.

See [SECURITY.md](./SECURITY.md) for our security policy.

### Best Practices

1. **Never commit secrets** to version control
2. **Use strong passwords** (32+ characters for production)
3. **Enable HTTPS** in production
4. **Restrict CORS** domains in production
5. **Disable dev tools** (Hasura console, dev mode) in production

## Support

### Getting Help

1. **Documentation**: Start with this comprehensive documentation
2. **GitHub Issues**: https://github.com/nself/admin/issues
3. **Community**: Join our Discord/Slack
4. **Commercial Support**: Available at support@nself.com

### Useful Links

- [nself CLI Repository](https://github.com/nself/cli)
- [nself Documentation](https://docs.nself.com)
- [Docker Documentation](https://docs.docker.com)
- [Hasura Documentation](https://hasura.io/docs)

## License

nself-admin is licensed under the MIT License. See [LICENSE.md](./LICENSE.md) for details.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history and release notes.

---

## Quick Command Reference

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run lint            # Run linter
npm run type-check      # Type checking

# Docker
docker build -t nself-admin .
docker run -p 3100:3100 nself-admin

# nself CLI Integration
nself init              # Initialize project
nself build             # Build services
nself start             # Start services
nself status            # Check status
nself logs              # View logs
nself reset --force     # Reset everything

# Debugging
docker-compose ps       # Service status
docker-compose logs     # View logs
docker stats           # Resource usage
lsof -i :3100         # Check port usage
```

---

_Documentation Version: 1.0.0_
_Last Updated: 2025-01-05_
_Specification: nself Environment Variable Specification v1.0_
