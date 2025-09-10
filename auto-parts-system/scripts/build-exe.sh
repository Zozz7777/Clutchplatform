#!/bin/bash

echo "========================================"
echo "Clutch Auto Parts System - EXE Builder"
echo "========================================"
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed or not in PATH"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "ERROR: npm is not available"
    exit 1
fi

echo "Node.js version:"
node --version
echo "npm version:"
npm --version
echo

# Navigate to project directory
cd "$(dirname "$0")/.."

echo "Current directory: $(pwd)"
echo

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "ERROR: package.json not found in current directory"
    echo "Please run this script from the project root directory"
    exit 1
fi

echo "Installing dependencies..."
echo "==========================="
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install dependencies"
    exit 1
fi

echo
echo "Building executable..."
echo "======================"

# Clean previous builds
if [ -d "dist" ]; then
    echo "Cleaning previous builds..."
    rm -rf "dist"
fi

# Build the executable
npm run build:win
if [ $? -ne 0 ]; then
    echo "ERROR: Build failed"
    exit 1
fi

echo
echo "Build completed successfully!"
echo "============================="

# Check if the executable was created
if [ -f "dist/Clutch Auto Parts System Setup.exe" ]; then
    echo
    echo "✅ SUCCESS: Executable created successfully!"
    echo
    echo "Location: $(pwd)/dist/Clutch Auto Parts System Setup.exe"
    echo "Size: $(stat -c%s "dist/Clutch Auto Parts System Setup.exe" 2>/dev/null || stat -f%z "dist/Clutch Auto Parts System Setup.exe" 2>/dev/null || echo "Unknown") bytes"
    echo
    echo "You can now distribute this installer to auto parts shops."
    echo
    
    # Ask if user wants to open the dist folder
    read -p "Do you want to open the dist folder? (y/n): " choice
    if [[ "$choice" == "y" || "$choice" == "Y" ]]; then
        if command -v xdg-open &> /dev/null; then
            xdg-open "dist"
        elif command -v open &> /dev/null; then
            open "dist"
        else
            echo "Please manually open the dist folder to access your executable."
        fi
    fi
else
    echo
    echo "❌ ERROR: Executable not found in dist folder"
    echo "Please check the build logs above for errors"
fi

echo
echo "Build process completed."
