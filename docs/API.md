# nself Admin API Documentation

## Overview

nself Admin provides a RESTful API for managing your development stack. All API endpoints are prefixed with `/api/` and return JSON responses.

## Authentication

The API uses JWT-based authentication with sessions stored in the database.

### Login

```http
POST /api/auth/login
```

**Request Body:**

```json
{
  "password": "your-admin-password"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful"
}
```

**Cookies Set:**

- `admin-token`: JWT session token (httpOnly, secure in production)

### Logout

```http
POST /api/auth/logout
```

**Response:**

```json
{
  "success": true,
  "message": "Logout successful"
}
```

### Session Check

```http
GET /api/auth/session
```

**Response:**

```json
{
  "authenticated": true,
  "userId": "admin"
}
```

## Setup & Configuration

### Check Setup Status

```http
GET /api/setup/check
```

**Response:**

```json
{
  "passwordSet": true,
  "setupCompleted": true,
  "projectInitialized": true,
  "servicesBuilt": true,
  "servicesRunning": true,
  "projectPath": "/workspace"
}
```

### Generate Environment Configuration

```http
POST /api/setup/generate-env
```

**Request Body:**

```json
{
  "projectName": "my-project",
  "baseDomain": "local.nself.org",
  "databaseConfig": {
    "version": "16-alpine",
    "extensions": ["uuid-ossp"],
    "customPassword": false
  },
  "authConfig": {
    "providers": ["email", "github"],
    "jwtSecret": "optional-custom-secret"
  },
  "storageConfig": {
    "bucket": "nself"
  },
  "optionalServices": {
    "redis": true,
    "functions": false,
    "dashboard": true
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "Configuration file generated successfully",
  "path": "/workspace/.env.local"
}
```

## Wizard API

### Load Environment Configuration

```http
GET /api/wizard/load-env
```

**Response:**

```json
{
  "success": true,
  "config": {
    "projectName": "my-project",
    "environment": "development",
    "domain": "local.nself.org",
    "databaseName": "nself",
    "backupSchedule": "0 2 * * *",
    "optionalServices": {
      "redis": true,
      "mail": false,
      "monitoring": false,
      "mlflow": false,
      "search": { "enabled": false, "provider": "auto" },
      "admin": true
    },
    "customServices": [],
    "frontendApps": []
  },
  "hasEnvFile": true
}
```

### Update Environment Variable

```http
POST /api/wizard/update-env-var
```

**Request Body:**

```json
{
  "key": "REDIS_ENABLED",
  "value": "true",
  "environment": "dev",
  "remove": false
}
```

**Response:**

```json
{
  "success": true,
  "message": "Updated REDIS_ENABLED",
  "key": "REDIS_ENABLED",
  "value": "true"
}
```

### Batch Update Environment Variables

```http
PUT /api/wizard/update-env-var
```

**Request Body:**

```json
{
  "variables": [
    { "key": "REDIS_ENABLED", "value": "true" },
    { "key": "MONITORING_ENABLED", "value": "false", "remove": true }
  ],
  "environment": "dev"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Updated 2 variables",
  "count": 2
}
```

### Reset Project

```http
POST /api/wizard/reset
```

**Response:**

```json
{
  "success": true,
  "message": "Project reset successfully",
  "details": {
    "removedFiles": ["docker-compose.yml", ".env.dev"],
    "message": "Project has been reset to initial state"
  }
}
```

## nself CLI Operations

### Execute nself Command

```http
POST /api/nself
```

**Request Body:**

```json
{
  "command": "build",
  "args": ["--verbose"],
  "stream": true
}
```

**Response (Streaming):**

```
data: {"type":"stdout","data":"Building project...\n"}
data: {"type":"stdout","data":"✓ Docker compose generated\n"}
data: {"type":"exit","code":0}
```

**Supported Commands:**

- `init`: Initialize project
- `build`: Build Docker compose configuration
- `start`: Start all services
- `stop`: Stop all services
- `reset`: Reset project
- `doctor`: Run diagnostics
- `status`: Get service status
- `logs`: View service logs

## Docker Operations

### Get Docker Statistics

```http
GET /api/docker/stats
```

**Response:**

```json
{
  "containers": [
    {
      "id": "abc123",
      "name": "postgres",
      "status": "running",
      "cpu": "2.5%",
      "memory": "128 MB / 512 MB",
      "network": "1.2 KB / 0.8 KB"
    }
  ],
  "images": 5,
  "volumes": 3,
  "networks": 2
}
```

### Get Container Logs

```http
GET /api/docker/logs/:containerId
```

**Query Parameters:**

- `tail`: Number of lines to return (default: 100)
- `since`: Show logs since timestamp
- `follow`: Stream logs (boolean)

**Response:**

```json
{
  "logs": [
    "2024-01-15 10:30:00 INFO: Server started",
    "2024-01-15 10:30:01 INFO: Listening on port 5432"
  ]
}
```

### Execute Command in Container

```http
POST /api/docker/exec
```

**Request Body:**

```json
{
  "containerId": "abc123",
  "command": ["psql", "-U", "postgres", "-c", "SELECT version();"]
}
```

**Response:**

```json
{
  "output": "PostgreSQL 16.0 on x86_64-pc-linux-gnu",
  "exitCode": 0
}
```

## Monitoring

### Get Service Health

```http
GET /api/monitoring
```

**Response:**

```json
{
  "healthy": true,
  "services": [
    {
      "name": "postgres",
      "status": "running",
      "health": "healthy",
      "uptime": "2h 15m",
      "restarts": 0
    }
  ],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Get Metrics

```http
GET /api/monitoring/metrics
```

**Response:**

```json
{
  "cpu": {
    "usage": 15.5,
    "cores": 4
  },
  "memory": {
    "used": 2048,
    "total": 8192,
    "percentage": 25
  },
  "disk": {
    "used": 10240,
    "total": 51200,
    "percentage": 20
  },
  "network": {
    "rx": 1024000,
    "tx": 512000
  }
}
```

## Database Operations

### Run SQL Query

```http
POST /api/database/query
```

**Request Body:**

```json
{
  "query": "SELECT * FROM users LIMIT 10",
  "database": "nself"
}
```

**Response:**

```json
{
  "success": true,
  "rows": [{ "id": 1, "name": "John Doe", "email": "john@example.com" }],
  "rowCount": 1,
  "fields": ["id", "name", "email"]
}
```

### Get Database Schema

```http
GET /api/database/schema
```

**Response:**

```json
{
  "tables": [
    {
      "name": "users",
      "columns": [
        { "name": "id", "type": "integer", "nullable": false },
        { "name": "name", "type": "varchar(255)", "nullable": true },
        { "name": "email", "type": "varchar(255)", "nullable": false }
      ]
    }
  ]
}
```

### Backup Database

```http
POST /api/database/backup
```

**Request Body:**

```json
{
  "database": "nself",
  "format": "sql"
}
```

**Response:**

```json
{
  "success": true,
  "path": "/backups/nself_20240115_103000.sql",
  "size": 1024000
}
```

## Service Management

### Get Service Templates

```http
GET /api/services/templates
```

**Response:**

```json
{
  "templates": [
    {
      "name": "express",
      "category": "nodejs",
      "description": "Express.js REST API",
      "port": 4000
    },
    {
      "name": "fastapi",
      "category": "python",
      "description": "FastAPI Python service",
      "port": 4001
    }
  ]
}
```

### Create Custom Service

```http
POST /api/services/create
```

**Request Body:**

```json
{
  "name": "my-api",
  "template": "express",
  "port": 4000,
  "environment": {
    "NODE_ENV": "development",
    "API_KEY": "secret"
  }
}
```

**Response:**

```json
{
  "success": true,
  "service": {
    "name": "my-api",
    "port": 4000,
    "status": "created"
  }
}
```

## Error Responses

All API endpoints follow a consistent error response format:

```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details",
  "code": "ERROR_CODE"
}
```

**Common Error Codes:**

- `AUTH_REQUIRED`: Authentication required
- `INVALID_PASSWORD`: Invalid password
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Request validation failed
- `DOCKER_ERROR`: Docker operation failed
- `CLI_ERROR`: nself CLI command failed
- `INTERNAL_ERROR`: Internal server error

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- Authentication endpoints: 5 requests per minute
- Query endpoints: 100 requests per minute
- Command execution: 10 requests per minute

## WebSocket Events

For real-time updates, connect to the WebSocket endpoint:

```javascript
const ws = new WebSocket('ws://localhost:3021/api/ws')

ws.on('message', (data) => {
  const event = JSON.parse(data)
  console.log('Event:', event.type, event.data)
})
```

**Event Types:**

- `service.started`: Service started
- `service.stopped`: Service stopped
- `service.health`: Health status changed
- `build.progress`: Build progress update
- `logs.new`: New log entry

## SDK Examples

### JavaScript/TypeScript

```typescript
import { NselfAdmin } from '@nself/admin-sdk'

const admin = new NselfAdmin({
  url: 'http://localhost:3021',
  password: 'your-password',
})

// Build project
await admin.build()

// Start services
await admin.start()

// Query database
const users = await admin.database.query('SELECT * FROM users')
```

### Python

```python
from nself_admin import NselfAdmin

admin = NselfAdmin(url="http://localhost:3021", password="your-password")

# Build project
admin.build()

# Start services
admin.start()

# Query database
users = admin.database.query("SELECT * FROM users")
```

### cURL Examples

```bash
# Login
curl -X POST http://localhost:3021/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"password":"your-password"}' \
  --cookie-jar cookies.txt

# Build project
curl -X POST http://localhost:3021/api/nself \
  -H "Content-Type: application/json" \
  -d '{"command":"build"}' \
  --cookie cookies.txt

# Get status
curl http://localhost:3021/api/monitoring \
  --cookie cookies.txt
```

## API Versioning

The API currently uses v1 (implicit). Future versions will be explicitly versioned:

- Current: `/api/endpoint`
- Future: `/api/v2/endpoint`

## Support

For API support and questions:

- GitHub Issues: https://github.com/acamarata/nself-admin/issues
- Documentation: https://github.com/acamarata/nself-admin/wiki
- Discord: https://discord.gg/nself
