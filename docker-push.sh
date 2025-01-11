#!/bin/bash

set -e

# Push for multiple platforms
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --tag lucapinello/minidsp-ui:latest \
  --push \
  .

echo "Multi-architecture images pushed to Docker Hub successfully" 