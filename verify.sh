#!/bin/bash
set -e

echo "🔍 Running verification suite..."
echo "📦 Installing dependencies..."
npm install

echo "🚀 Running verification..."
npm run verify 