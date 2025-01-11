#!/bin/bash

set -x
set -e

echo "🔍 Running verification suite..."

echo "📦 1. Installing dependencies..."
npm install

echo "🔎 2. Running linting checks (warnings only)..."
npm run lint

echo "🧪 3. Running tests..."
npm run test

echo "🏗️  4. Building project..."
npm run build

echo "✅ Verification completed successfully!" 