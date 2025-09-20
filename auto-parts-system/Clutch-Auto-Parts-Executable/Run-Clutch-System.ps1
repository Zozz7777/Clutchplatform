# Clutch Auto Parts System - Direct Launcher
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Clutch Auto Parts System" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js not found. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Starting Clutch Auto Parts System..." -ForegroundColor Green
Write-Host ""

# Start the application
try {
    npm start
} catch {
    Write-Host "ERROR: Failed to start application" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Application closed. Thank you!" -ForegroundColor Green
Read-Host "Press Enter to exit"
