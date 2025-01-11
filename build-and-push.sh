#!/bin/bash
set -e
set -x

# Create and use a new builder instance
docker buildx create --name minidsp-builder --use || true

# Build for multiple platforms and push to registry
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --tag lucapinello/minidsp-ui:latest \
  --push \
  .

echo "Multi-architecture build completed and pushed successfully" 