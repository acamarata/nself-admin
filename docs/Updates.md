# Updates & Upgrades

Keep your nself Admin installation up to date with the latest features, security patches, and improvements.

## Update Methods

### Docker Updates

#### Latest Release

Pull the latest stable release:

```bash
# Stop current container
docker stop nself-admin

# Pull latest image
docker pull acamarata/nself-admin:latest

# Remove old container
docker rm nself-admin

# Start with latest image
docker run -d --name nself-admin \
  -p 3021:3021 \
  -v $(pwd):/workspace \
  -v /var/run/docker.sock:/var/run/docker.sock \
  acamarata/nself-admin:latest
```

#### Specific Version

Update to a specific version:

```bash
# Pull specific version
docker pull acamarata/nself-admin:0.0.4

# Update container with specific version
docker run -d --name nself-admin \
  -p 3021:3021 \
  -v $(pwd):/workspace \
  -v /var/run/docker.sock:/var/run/docker.sock \
  acamarata/nself-admin:0.0.4
```

### Development Updates

#### Git Repository

Update from source:

```bash
# Pull latest changes
git pull origin main

# Install new dependencies
npm install

# Build latest version
npm run build

# Restart development server
npm run dev
```

#### Using nself CLI

If using nself CLI integration:

```bash
# Update nself CLI first
curl -sSL https://get.nself.org | bash

# Update admin component
nself admin --update

# Verify versions
nself version
nself admin --version
```

## Version Management

### Version Checking

Check current and available versions:

```bash
# Check current version
curl http://localhost:3021/api/version

# Response
{
  "version": "0.0.4",
  "buildDate": "2024-01-15T10:30:00Z",
  "gitCommit": "abc123",
  "nodeVersion": "20.10.0"
}
```

### Release Channels

Available release channels:

| Channel         | Description         | Docker Tag           | Stability |
| --------------- | ------------------- | -------------------- | --------- |
| **Stable**      | Production releases | `latest`, `0.0.4`    | High      |
| **Beta**        | Pre-release testing | `beta`, `0.0.5-beta` | Medium    |
| **Development** | Latest changes      | `dev`, `main`        | Low       |

### Version Pinning

Pin to specific versions in production:

```bash
# Production deployment
docker run -d --name nself-admin \
  acamarata/nself-admin:0.0.4  # Specific version

# Kubernetes deployment
image: acamarata/nself-admin:0.0.4
```

## Migration Guide

### Breaking Changes

#### v0.0.3 to v0.0.4

**Database Changes:**

- LokiJS database format updated
- Automatic migration on first start
- Sessions now use TTL (24-hour expiry)

**Configuration Changes:**

- Environment variable standardization
- `ADMIN_PASSWORD` moved to database
- New centralized path resolution

**Migration Steps:**

1. Backup existing data: `cp data/nadmin.db data/nadmin.db.backup`
2. Update to v0.0.4
3. First login will migrate database automatically
4. Verify all settings in admin interface

#### Future Versions

**v0.0.5 (Planned):**

- Multi-user support
- Enhanced monitoring
- Kubernetes native deployment

### Data Migration

#### Backup Before Update

Always backup data before major updates:

```bash
# Backup database
docker exec nself-admin cp /app/data/nadmin.db /app/data/nadmin.db.backup

# Copy backup locally
docker cp nself-admin:/app/data/nadmin.db.backup ./nadmin-backup-$(date +%Y%m%d).db

# Backup project configuration
cp -r .env* .env-backup/
```

#### Migration Testing

Test migrations in development:

```bash
# Create test environment
mkdir nself-admin-test
cd nself-admin-test

# Copy production data
cp ../production/data/nadmin.db ./data/

# Test update
docker run --rm \
  -v $(pwd)/data:/app/data \
  acamarata/nself-admin:latest \
  npm run migrate
```

## Update Automation

### Automated Updates

#### Watchtower (Docker)

Automatic container updates:

```bash
# Run Watchtower alongside nself-admin
docker run -d \
  --name watchtower \
  -v /var/run/docker.sock:/var/run/docker.sock \
  containrrr/watchtower \
  --schedule "0 0 4 * * *" \  # Update at 4 AM daily
  --cleanup \
  nself-admin
```

#### Custom Update Script

Create automated update script:

```bash
#!/bin/bash
# update-nself-admin.sh

set -e

echo "Starting nself Admin update..."

# Backup current data
docker exec nself-admin cp /app/data/nadmin.db /app/data/nadmin.db.backup

# Pull latest image
docker pull acamarata/nself-admin:latest

# Stop current container
docker stop nself-admin

# Remove old container
docker rm nself-admin

# Start new container with same configuration
docker run -d --name nself-admin \
  -p 3021:3021 \
  -v $(pwd):/workspace \
  -v /var/run/docker.sock:/var/run/docker.sock \
  acamarata/nself-admin:latest

# Wait for startup
sleep 10

# Verify health
if curl -f http://localhost:3021/api/health > /dev/null 2>&1; then
  echo "Update successful!"
else
  echo "Update failed, rolling back..."
  docker stop nself-admin
  docker rm nself-admin
  # Start with previous image
  docker run -d --name nself-admin \
    -p 3021:3021 \
    -v $(pwd):/workspace \
    -v /var/run/docker.sock:/var/run/docker.sock \
    acamarata/nself-admin:0.0.3  # Previous version
  exit 1
fi
```

#### Kubernetes Updates

Automated Kubernetes updates:

```yaml
# Use Argo CD or similar GitOps tool
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: nself-admin
spec:
  source:
    repoURL: https://github.com/acamarata/nself-admin
    path: k8s/
    targetRevision: HEAD
  destination:
    server: https://kubernetes.default.svc
    namespace: nself-admin
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

## Rollback Procedures

### Docker Rollback

Rollback to previous version:

```bash
# Stop current container
docker stop nself-admin

# Remove current container
docker rm nself-admin

# Start with previous version
docker run -d --name nself-admin \
  -p 3021:3021 \
  -v $(pwd):/workspace \
  -v /var/run/docker.sock:/var/run/docker.sock \
  acamarata/nself-admin:0.0.3  # Previous version

# Restore database if needed
docker exec nself-admin cp /app/data/nadmin.db.backup /app/data/nadmin.db
```

### Kubernetes Rollback

Rollback Kubernetes deployment:

```bash
# View rollout history
kubectl rollout history deployment/nself-admin -n nself-admin

# Rollback to previous version
kubectl rollout undo deployment/nself-admin -n nself-admin

# Rollback to specific revision
kubectl rollout undo deployment/nself-admin --to-revision=2 -n nself-admin

# Check rollback status
kubectl rollout status deployment/nself-admin -n nself-admin
```

### Data Restoration

Restore data from backup:

```bash
# Stop application
docker stop nself-admin

# Restore database
docker cp ./nadmin-backup-20240115.db nself-admin:/app/data/nadmin.db

# Restore environment files
cp -r .env-backup/* ./

# Start application
docker start nself-admin
```

## Update Notifications

### Version Checking

Check for updates programmatically:

```javascript
// Check for updates
const response = await fetch(
  'https://api.github.com/repos/acamarata/nself-admin/releases/latest',
)
const latest = await response.json()
const currentVersion = '0.0.4'

if (latest.tag_name !== `v${currentVersion}`) {
  console.log(`Update available: ${latest.tag_name}`)
}
```

### Notification Channels

Set up update notifications:

#### Slack Notifications

```bash
# Environment variables
UPDATE_NOTIFICATIONS_ENABLED=true
UPDATE_SLACK_WEBHOOK=https://hooks.slack.com/services/xxx
UPDATE_CHECK_INTERVAL=86400  # 24 hours
```

#### Email Notifications

```bash
# Email notification settings
UPDATE_EMAIL_ENABLED=true
UPDATE_EMAIL_TO=admin@yourcompany.com
UPDATE_EMAIL_FROM=nself-admin@yourcompany.com
```

### GitHub Watch

Monitor releases on GitHub:

1. Go to https://github.com/acamarata/nself-admin
2. Click **Watch** → **Custom** → **Releases**
3. Choose notification preferences

## Security Updates

### Priority Updates

Security updates are released with priority:

- **Critical** - Immediate update recommended
- **High** - Update within 24 hours
- **Medium** - Update within 1 week
- **Low** - Update at next maintenance window

### Security Advisories

Subscribe to security advisories:

- **GitHub Security Advisories** - Automatic notifications
- **CVE Database** - Monitor for vulnerabilities
- **Docker Security Scanning** - Automated image scanning

### Emergency Updates

For critical security issues:

```bash
# Emergency update procedure
# 1. Stop services immediately
docker stop nself-admin

# 2. Pull security update
docker pull acamarata/nself-admin:security-patch

# 3. Start with security update
docker run -d --name nself-admin \
  acamarata/nself-admin:security-patch

# 4. Verify security fix
curl http://localhost:3021/api/security/status
```

## Best Practices

### Update Strategy

1. **Test First** - Always test updates in development
2. **Backup Always** - Backup data before updates
3. **Read Changelog** - Review changes before updating
4. **Staged Rollout** - Update non-production first
5. **Monitor Post-Update** - Watch for issues after updates

### Maintenance Windows

Plan regular maintenance windows:

```bash
# Maintenance schedule
# - Weekly: Patch updates (low risk)
# - Monthly: Minor version updates
# - Quarterly: Major version updates
```

### Update Documentation

Document your update process:

1. **Pre-update checklist**
2. **Backup procedures**
3. **Update commands**
4. **Verification steps**
5. **Rollback procedures**

## Troubleshooting Updates

### Common Update Issues

| Issue                 | Cause                          | Solution                                  |
| --------------------- | ------------------------------ | ----------------------------------------- |
| Container won't start | Breaking configuration changes | Check configuration migration guide       |
| Database errors       | Database migration failed      | Restore from backup, check migration logs |
| Permission errors     | File ownership changed         | Fix file permissions with `chown`         |
| Port conflicts        | New port requirements          | Update port mappings                      |
| Missing features      | Incomplete update              | Verify image version and restart          |

### Update Verification

Verify successful updates:

```bash
# Check version
curl http://localhost:3021/api/version

# Check health
curl http://localhost:3021/api/health

# Check logs
docker logs nself-admin --tail=50

# Test key functionality
curl http://localhost:3021/api/project/status
```

### Recovery Procedures

If update fails:

1. **Stop failed container**
2. **Restore from backup**
3. **Check error logs**
4. **Report issue on GitHub**
5. **Wait for fix or use previous version**

---

For more information, see:

- [Changelog](CHANGELOG.md)
- [GitHub Releases](https://github.com/acamarata/nself-admin/releases)
- [Docker Hub](https://hub.docker.com/r/acamarata/nself-admin)
- [Security Policy](SECURITY.md)
