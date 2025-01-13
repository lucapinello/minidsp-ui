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

### Verification

To verify your changes before submitting:
```bash
./verify.sh
```

This will:
1. Install dependencies
2. Run linting (warnings only)
3. Run tests
4. Build the project

You can also run individual checks:
```bash
npm run lint    # Check code style (warnings only)
npm run test    # Run tests
npm run build   # Build the project
npm run verify  # Run all checks
```

## Docker Development

### Configuration

By default, images are pushed to `lucapinello/minidsp-ui`. To use your own repository, create a `docker-repo.config` file:

```bash
echo "yourdockerhub" > docker-repo.config
```

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

## Continuous Integration & Deployment

### GitHub Actions Setup

To enable automatic Docker image builds and pushes via GitHub Actions, you need to configure the following secrets in your GitHub repository:

1. Go to your repository's Settings > Secrets and Variables > Actions
2. Add the following secrets:
   - `DOCKERHUB_USERNAME`: Your Docker Hub username
   - `DOCKERHUB_TOKEN`: Your Docker Hub access token (not your password)
      - To get a token, go to [Docker Hub Account Settings](https://hub.docker.com/settings/security) and create a new access token

### Automated Builds

The project uses GitHub Actions for CI/CD:

1. **CI Pipeline** (on every push/PR):
   - Runs linting checks
   - Builds the project
   - On main branch:
     - Builds multi-arch Docker image
     - Pushes development tags (`dev` and `dev-{commit-sha}`)

2. **Release Pipeline** (manual trigger):
   - Builds multi-arch Docker image
   - Pushes release tags (`latest` and version number)
   - Creates GitHub Release

### Creating a Release

1. Go to the "Actions" tab in GitHub
2. Select the "Release" workflow
3. Click "Run workflow"
4. Enter the version number (e.g., v1.0.0)
5. Click "Run workflow"

This will:
- Build and push Docker images with appropriate tags
- Create a GitHub release with auto-generated notes

## Project Structure

(Add information about the project structure, key files, etc.) 