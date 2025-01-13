#!/bin/bash
set -x
set -e

# Load repository from config or use default
DOCKER_REPO=$(jq -r '.docker.repository' config.default.json)
if [ -f docker-repo.config ]; then
    DOCKER_REPO=$(cat docker-repo.config)
fi

IMAGE_TAG="${DOCKER_REPO}/minidsp-ui"

# Push for multiple platforms
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --tag ${IMAGE_TAG}:latest \
  --push \
  .

echo "Multi-architecture images pushed to Docker Hub successfully" 