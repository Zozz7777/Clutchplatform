#!/bin/bash

echo "🚀 Starting Clutch Admin build process..."

# Set environment variables
export NODE_ENV=production
export PORT=3000

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Install dev dependencies for build
echo "🔧 Installing dev dependencies..."
npm install --save-dev typescript @types/node @types/react @types/react-dom

# Build the application
echo "🏗️ Building Next.js application..."
npm run build

# Verify build output
if [ -d ".next" ]; then
    echo "✅ Build completed successfully! .next directory found."
    ls -la .next/
else
    echo "❌ Build failed! .next directory not found."
    exit 1
fi

echo "✅ Build process completed!"
