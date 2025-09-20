# Clutch Auto Parts System - Simple Launcher
Write-Host "Starting Clutch Auto Parts System..." -ForegroundColor Green

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Blue
} catch {
    Write-Host "ERROR: Node.js not found. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Build the application
Write-Host "Building application..." -ForegroundColor Yellow
npm run build

# Start the application
Write-Host "Starting Clutch Auto Parts System..." -ForegroundColor Green
npm start
