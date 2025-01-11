# Development Guide

This document contains information for developers who want to contribute to or build the MiniDSP Controller UI.

## Local Development Setup

### Prerequisites
- Node.js (v18 or later recommended)
- npm, yarn, or pnpm installed
- minidsp-rs installed and running in server mode:
  ```bash
  minidsp server --http 0.0.0.0:5380
  ```

### Setup Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/lucapinello/minidsp-ui.git
   cd minidsp-ui
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Docker Development

### Local Docker Build

Build for your current architecture:
```bash
docker build -t lucapinello/minidsp-ui:latest .
```

For a specific architecture:
```bash
# For AMD64
docker build --platform linux/amd64 -t lucapinello/minidsp-ui:latest .

# For ARM64
docker build --platform linux/arm64 -t lucapinello/minidsp-ui:latest .
```

### Multi-Architecture Build

1. Create builder instance:
```bash
docker buildx create --name minidsp-builder --use
```

2. Build for multiple architectures:
```bash
./docker-build.sh
```

This will build images for both AMD64 and ARM64 architectures.

### Publishing to Docker Hub

To push the built images to Docker Hub:
```bash
./docker-push.sh
```

### Using Docker Compose for Development

1. Copy the example compose file:
```bash
cp docker-compose.example.yml docker-compose.yml
```

2. Build and run from source:
```bash
docker-compose up --build
```

## Project Structure

(Add information about the project structure, key files, etc.) 