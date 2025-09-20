# Clutch Auto Parts System Launcher
# PowerShell version for better compatibility

param(
    [switch]$SkipBuild,
    [switch]$SkipInstall
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Clutch Auto Parts System" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version 2>$null
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR: Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if npm is available
try {
    $npmVersion = npm --version 2>$null
    Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR: npm is not available" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Navigate to the application directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host "📁 Working directory: $scriptPath" -ForegroundColor Blue
Write-Host ""

# Check if node_modules exists and install if needed
if (-not $SkipInstall) {
    if (-not (Test-Path "node_modules")) {
        Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
        try {
            npm install
            Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
        } catch {
            Write-Host "❌ ERROR: Failed to install dependencies" -ForegroundColor Red
            Read-Host "Press Enter to exit"
            exit 1
        }
    } else {
        Write-Host "✅ Dependencies already installed" -ForegroundColor Green
    }
}

# Build the application
if (-not $SkipBuild) {
    Write-Host "🔨 Building application..." -ForegroundColor Yellow
    try {
        npm run build
        Write-Host "✅ Application built successfully" -ForegroundColor Green
    } catch {
        Write-Host "❌ ERROR: Failed to build application" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
} else {
    Write-Host "⏭️ Skipping build (--SkipBuild flag used)" -ForegroundColor Yellow
}

# Start the application
Write-Host ""
Write-Host "🚀 Starting Clutch Auto Parts System..." -ForegroundColor Cyan
Write-Host "The application will open in a new window." -ForegroundColor White
Write-Host "Close this window to stop the application." -ForegroundColor White
Write-Host ""

try {
    npm start
} catch {
    Write-Host "❌ ERROR: Failed to start application" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "👋 Application closed. Thank you for using Clutch Auto Parts System!" -ForegroundColor Green
Read-Host "Press Enter to exit"
