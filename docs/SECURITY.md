# Security Documentation

## Authentication

### Password Storage
- Passwords are hashed using bcrypt with a cost factor of 10
- Plain text passwords are automatically hashed on first use
- Supports both plain and pre-hashed passwords in environment variables

### Session Management
- Sessions use secure httpOnly cookies (not localStorage)
- Cookies are marked as SameSite=strict to prevent CSRF
- Sessions expire after 24 hours
- Secure flag is set in production environments

### Configuration

#### Using Plain Password (Development)
```env
ADMIN_PASSWORD=your-password-here
ADMIN_PASSWORD_IS_HASHED=false
```

#### Using Hashed Password (Production)
```bash
# Generate hash using the provided script
node scripts/hash-password.js

# Or manually with bcryptjs
npm install -g bcryptjs-cli
bcryptjs-cli hash "your-password" 10
```

Then add to `.env.local`:
```env
ADMIN_PASSWORD='$2b$10$...' # Your bcrypt hash
ADMIN_PASSWORD_IS_HASHED=true
```

### Security Headers
The middleware automatically adds the following security headers to protected routes:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

### Protected Routes
All API routes under the following paths require authentication:
- `/api/docker/*`
- `/api/services/*`
- `/api/database/*`
- `/api/config/*`
- `/api/system/*`
- `/api/project/*`
- `/api/nself/*`
- `/api/storage/*`
- `/api/monitoring/*`
- `/api/graphql/*`
- `/api/redis/*`
- `/api/cli/*`

### Best Practices
1. Always use a strong, unique password in production
2. Rotate passwords regularly
3. Use environment variables, never commit passwords to git
4. Enable HTTPS in production deployments
5. Monitor authentication logs for suspicious activity

### Known Limitations
- Sessions are currently stored in memory (will be lost on restart)
- No built-in rate limiting yet (planned for next release)
- Single admin user only (multi-user support planned)

### Future Improvements
- [ ] Redis-based session storage
- [ ] Rate limiting on auth endpoints
- [ ] CSRF token validation
- [ ] Multi-factor authentication
- [ ] Role-based access control
- [ ] Audit logging