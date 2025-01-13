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

## Configuration System

The project uses a custom configuration system with a Swift-like Optional pattern. Configuration values are looked up in the following order:

1. Local storage (if in browser and key provided)
2. Environment variables (NEXT_PUBLIC_*)
3. config.json override file
4. config.default.json
5. Returns undefined (equivalent to Optional.none in Swift)

Note: The system uses `undefined` to represent missing values (similar to `Optional.none` in Swift), allowing for safe optional chaining in TypeScript/JavaScript. This provides a clean way to handle potentially missing configuration values without additional wrapper types.

Example usage:
```javascript
// Safe access to potentially missing config
const apiUrl = getConfig('minidsp.api_url')?.toString();

// With localStorage fallback
const savedUrl = getConfig('minidsp.api_url', 'minidsp-ip');
```

# Coding Guidelines

(For LLM's as well as humans)

- Refactor magic numbers to constants
- Add comments to explain why behind the code when it's not obvious
- Add type annotations
- Use reasonable ESLint rules to enforce code style
- Always use `git mv` to rename files, or `git rm` to delete files
- Follow established patterns in the codebase, e.g. the test setup, including e2e tests

## Useful LLM prompts

- Get familiar with the codebase by and read the README.md and DEVELOPMENT.md files and the directory tree
- Run our of verification script ./verify.sh, and only fix things related to what we changed
- Write the commit message for me, based on the current changes made. Check the git diff cat if you need to.
