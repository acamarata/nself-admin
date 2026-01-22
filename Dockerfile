# Multi-stage production Dockerfile for nself-admin
# Optimized for minimal size with standalone Next.js build
# Multi-platform support: linux/amd64, linux/arm64

# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@10.28.0 --activate
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./
# Only install production dependencies for smaller image
RUN pnpm install --prod --frozen-lockfile

# Stage 2: Builder
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@10.28.0 --activate
WORKDIR /app

# Copy package files and install ALL dependencies for build
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Set build-time environment variables for standalone mode
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV STANDALONE=true

# Build the application in standalone mode
RUN pnpm run build

# Stage 3: Runner (minimal image)
FROM node:20-alpine AS runner
WORKDIR /app

# Install only essential runtime dependencies
RUN apk add --no-cache \
    curl \
    && addgroup -g 1001 -S nodejs \
    && adduser -S nextjs -u 1001

# Copy only the standalone build output (much smaller!)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Create necessary directories for project mount and database
RUN mkdir -p /workspace /app/data \
    && chown -R nextjs:nodejs /workspace /app/data

# Set runtime environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME="0.0.0.0"
ENV PORT=3021
ENV ADMIN_VERSION=0.0.5

# Add labels for container metadata
LABEL org.opencontainers.image.title="nself-admin"
LABEL org.opencontainers.image.description="Web-based administration interface for nself CLI"
LABEL org.opencontainers.image.version="0.0.5"
LABEL org.opencontainers.image.vendor="nself.org"
LABEL org.opencontainers.image.source="https://github.com/acamarata/nself-admin"
LABEL org.opencontainers.image.licenses="Proprietary - Free for personal use, Commercial license required"
LABEL org.opencontainers.image.documentation="https://github.com/acamarata/nself-admin/wiki"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3021/api/health || exit 1

# Switch to non-root user
USER nextjs

# Expose port (3021 reserved for nself admin)
EXPOSE 3021

# Start the application using the standalone server
CMD ["node", "server.js"]
