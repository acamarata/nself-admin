# Docker Buildx configuration for multi-architecture builds
# This file configures the build process for multiple platforms

# Build configuration
variable "DOCKER_REGISTRY" {
  default = "nself/admin"
}

variable "VERSION" {
  default = "latest"
}

variable "PLATFORMS" {
  default = ["linux/amd64", "linux/arm64", "linux/arm/v7"]
}

# Multi-stage build targets
target "default" {
  dockerfile = "Dockerfile"
  platforms = PLATFORMS
  tags = [
    "${DOCKER_REGISTRY}:${VERSION}",
    "${DOCKER_REGISTRY}:latest"
  ]
  cache-from = [
    "type=registry,ref=${DOCKER_REGISTRY}:buildcache"
  ]
  cache-to = [
    "type=registry,ref=${DOCKER_REGISTRY}:buildcache,mode=max"
  ]
}

# Development build (amd64 only for speed)
target "dev" {
  dockerfile = "Dockerfile"
  platforms = ["linux/amd64"]
  tags = [
    "${DOCKER_REGISTRY}:dev"
  ]
  target = "builder"
}

# Production build with all optimizations
target "production" {
  inherits = ["default"]
  args = {
    NODE_ENV = "production"
    NEXT_TELEMETRY_DISABLED = "1"
  }
  output = ["type=registry"]
}

# Local build for testing
target "local" {
  dockerfile = "Dockerfile"
  platforms = ["linux/amd64"]
  tags = [
    "${DOCKER_REGISTRY}:local"
  ]
  output = ["type=docker"]
}