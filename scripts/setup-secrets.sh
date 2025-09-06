#!/bin/bash

# Script to help set up GitHub secrets locally for testing
# This does NOT expose secrets publicly - only stores them locally for reference

set -e

echo "GitHub Secrets Setup Helper"
echo "============================"
echo ""
echo "This script helps you configure GitHub secrets for CI/CD."
echo "Your credentials will ONLY be stored locally in .env.secrets (gitignored)"
echo ""

# Check if .env.secrets already exists
if [ -f .env.secrets ]; then
    echo "Found existing .env.secrets file."
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Keeping existing configuration."
        exit 0
    fi
fi

# Docker Hub setup
echo "Docker Hub Configuration"
echo "------------------------"
echo "To publish images to Docker Hub, you need:"
echo "1. A Docker Hub account"
echo "2. An access token (not your password)"
echo ""
read -p "Do you want to configure Docker Hub? (y/N): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter your Docker Hub username: " DOCKER_USERNAME
    echo "Create an access token at: https://hub.docker.com/settings/security"
    read -s -p "Enter your Docker Hub access token: " DOCKER_TOKEN
    echo
    
    # Validate by attempting to login locally
    echo "Validating Docker Hub credentials..."
    if echo "$DOCKER_TOKEN" | docker login --username "$DOCKER_USERNAME" --password-stdin >/dev/null 2>&1; then
        echo "✅ Docker Hub credentials validated successfully"
        DOCKERHUB_CONFIGURED=true
    else
        echo "❌ Failed to validate Docker Hub credentials"
        DOCKERHUB_CONFIGURED=false
    fi
    docker logout >/dev/null 2>&1
else
    echo "Skipping Docker Hub configuration"
    DOCKERHUB_CONFIGURED=false
fi

# Save to local .env.secrets file
cat > .env.secrets << EOF
# GitHub Secrets Configuration
# Generated: $(date)
# DO NOT COMMIT THIS FILE

# Docker Hub
DOCKERHUB_CONFIGURED=$DOCKERHUB_CONFIGURED
EOF

if [ "$DOCKERHUB_CONFIGURED" = "true" ]; then
    cat >> .env.secrets << EOF
DOCKERHUB_USERNAME=$DOCKER_USERNAME
DOCKERHUB_TOKEN=$DOCKER_TOKEN
EOF
fi

echo ""
echo "Configuration saved to .env.secrets (gitignored)"
echo ""
echo "Next Steps:"
echo "-----------"

if [ "$DOCKERHUB_CONFIGURED" = "true" ]; then
    echo "✅ Docker Hub: Configured"
    echo ""
    echo "To add these secrets to GitHub:"
    echo "1. Go to: https://github.com/$(git remote get-url origin | sed 's/.*github.com[:/]\(.*\)\.git/\1/')/settings/secrets/actions"
    echo "2. Add these repository secrets:"
    echo "   - Name: DOCKERHUB_USERNAME"
    echo "     Value: $DOCKER_USERNAME"
    echo "   - Name: DOCKERHUB_TOKEN"
    echo "     Value: [your token]"
else
    echo "⚠️  Docker Hub: Not configured"
    echo "   Images will only be published to GitHub Container Registry"
fi

echo ""
echo "The GitHub workflows will now:"
echo "- Always build images successfully"
echo "- Publish to Docker Hub only if secrets are configured"
echo "- Publish to GitHub Registry (ghcr.io) by default"
echo ""
echo "You can re-run this script anytime to update your configuration."