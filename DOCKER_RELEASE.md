# Docker Release Instructions for nself-admin

## Prerequisites

1. **Docker Hub Account**: Ensure you're logged in to Docker Hub
   ```bash
   docker login
   ```

2. **Docker Buildx**: For multi-platform builds
   ```bash
   docker buildx create --name nself-builder --use
   ```

## Quick Release

### Option 1: Using npm script (Recommended)
```bash
npm run docker:release
```

### Option 2: Manual build and push
```bash
# Build for multiple platforms
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t acamarata/nself-admin:latest \
  -t acamarata/nself-admin:0.0.1 \
  --push .
```

## Testing the Docker Image

### 1. Pull the image
```bash
docker pull acamarata/nself-admin:latest
```

### 2. Run standalone
```bash
docker run -d \
  -p 3021:3021 \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  -v $(pwd):/project \
  -e ADMIN_PASSWORD=changeme123 \
  --name nself-admin \
  acamarata/nself-admin:latest
```

### 3. Run with docker-compose
```bash
# Using the provided docker-compose.yml
docker-compose up -d

# Or with custom env
ADMIN_PASSWORD=mysecurepass docker-compose up -d
```

### 4. Access the admin UI
Open http://localhost:3021 in your browser

Default credentials:
- Username: `admin`
- Password: `changeme123` (or whatever you set)

## Integration with nself Stack

To run the admin UI as part of your nself stack:

1. In your nself project directory, add to your docker-compose:

```yaml
services:
  # ... your other services ...
  
  admin:
    image: acamarata/nself-admin:latest
    container_name: nself-admin
    ports:
      - "3021:3021"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./:/project
    environment:
      - ADMIN_PASSWORD=${ADMIN_PASSWORD}
    networks:
      - nself-network
```

2. Run with the stack:
```bash
nself start
```

## Version Management

### Bump version
```bash
# Patch version (0.0.1 -> 0.0.2)
npm run version:bump:patch

# Minor version (0.0.1 -> 0.1.0)
npm run version:bump:minor

# Major version (0.0.1 -> 1.0.0)
npm run version:bump:major
```

### Release new version
```bash
# After bumping version
npm run docker:release
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `ADMIN_PASSWORD` | changeme123 | Admin panel password |
| `PORT` | 3021 | Port to run on |
| `NODE_ENV` | production | Environment mode |
| `PROJECT_PATH` | /project | Path to nself project |
| `TZ` | UTC | Timezone |

## Troubleshooting

### Port already in use
```bash
# Check what's using port 3021
lsof -i :3021

# Kill the process
kill -9 <PID>
```

### Docker socket permission denied
Ensure Docker socket is mounted with read permissions:
```bash
-v /var/run/docker.sock:/var/run/docker.sock:ro
```

### Can't find nself CLI
The admin UI expects nself CLI to be installed. Install it:
```bash
curl -fsSL https://raw.githubusercontent.com/acamarata/nself/main/install.sh | bash
```

## Security Notes

1. **Change default password**: Always change the default password in production
2. **Use HTTPS**: Put the admin UI behind a reverse proxy with SSL in production
3. **Restrict access**: Consider IP whitelisting or VPN access for production
4. **Read-only Docker socket**: The Docker socket is mounted read-only for security

## Support

- Issues: https://github.com/acamarata/nself-admin/issues
- nself CLI: https://github.com/acamarata/nself