#!/bin/bash
set -x
set -e

# Load repository from config or use default
DEFAULT_REPO="lucapinello"
DOCKER_REPO=${DEFAULT_REPO}
if [ -f docker-repo.config ]; then
    DOCKER_REPO=$(cat docker-repo.config)
fi

IMAGE_TAG="${DOCKER_REPO}/minidsp-ui"

# Create and use a new builder instance if it doesn't exist
docker buildx create --name minidsp-builder --use || true

# Build for multiple platforms
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --tag ${IMAGE_TAG}:latest \
  . 