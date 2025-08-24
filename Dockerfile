# Multi-stage production Dockerfile for nself-admin
# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --omit=dev

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

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy package.json for version info
COPY --from=builder /app/package.json ./package.json

# Create necessary directories
RUN mkdir -p /project /data \
    && chown -R nextjs:nodejs /app /project /data

# Set runtime environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME="0.0.0.0"
ENV PORT=3001
ENV ADMIN_VERSION=0.0.1

# Add labels for container metadata
LABEL org.opencontainers.image.title="nself-admin"
LABEL org.opencontainers.image.description="Web-based administration interface for nself CLI"
LABEL org.opencontainers.image.version="0.0.1"
LABEL org.opencontainers.image.vendor="nself"
LABEL org.opencontainers.image.source="https://github.com/acamarata/nself-admin"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3001

# Start the application
CMD ["node", "server.js"]