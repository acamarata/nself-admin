# Multi-stage production Dockerfile for nself-admin
# Supports multi-arch: linux/amd64, linux/arm64
# Stage 1: Dependencies
FROM --platform=$BUILDPLATFORM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Stage 2: Builder
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy node_modules from deps
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set build-time environment variables
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV STANDALONE=true

# Build the application
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache \
    docker-cli \
    curl \
    bash \
    git \
    && addgroup -g 1001 -S nodejs \
    && adduser -S nextjs -u 1001

# Copy everything including node_modules
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.mjs ./next.config.mjs

# Create necessary directories for project mount and database
RUN mkdir -p /workspace /app/data \
    && chown -R nextjs:nodejs /app /workspace /app/data

# Set runtime environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME="0.0.0.0"
ENV PORT=3021
ENV ADMIN_VERSION=0.0.3

# Add labels for container metadata
LABEL org.opencontainers.image.title="nself-admin"
LABEL org.opencontainers.image.description="Web-based administration interface for nself CLI"
LABEL org.opencontainers.image.version="0.0.3"
LABEL org.opencontainers.image.vendor="nself.org"
LABEL org.opencontainers.image.source="https://github.com/acamarata/nself-admin"
LABEL org.opencontainers.image.licenses="Proprietary - Free for personal use, Commercial license required"
LABEL org.opencontainers.image.documentation="https://github.com/acamarata/nself-admin/wiki"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3021/api/health || exit 1

# Add user to docker group for socket access (read-only)
# Note: The socket is mounted read-only, so write operations will fail
RUN addgroup nextjs docker || true

# Switch to non-root user
USER nextjs

# Expose port (3021 reserved for nself admin)
EXPOSE 3021

# Start the application
CMD ["npm", "start"]