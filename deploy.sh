#!/bin/bash
set -e

echo "Starting deployment..."
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"

# Clean install dependencies
echo "Installing dependencies..."
npm ci --legacy-peer-deps

# Build the application
echo "Building application..."
npm run build

# Check if build was successful
if [ -d "dist" ] && [ -f "dist/index.html" ]; then
    echo "✅ Build successful! dist folder created with index.html"
    ls -la dist/
else
    echo "❌ Build failed! dist folder or index.html not found"
    exit 1
fi

echo "Deployment completed successfully!" 