# Create Executable Package for Clutch Auto Parts System
# This script creates a portable executable package

param(
    [string]$OutputDir = "Clutch-Auto-Parts-Executable"
)

$ErrorActionPreference = "Stop"

Write-Host "🔧 Creating Clutch Auto Parts System Executable Package" -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host ""

# Create output directory
if (Test-Path $OutputDir) {
    Write-Host "🗑️ Removing existing output directory..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force $OutputDir
}

Write-Host "📁 Creating output directory: $OutputDir" -ForegroundColor Blue
New-Item -ItemType Directory -Path $OutputDir | Out-Null

# Copy application files
Write-Host "📋 Copying application files..." -ForegroundColor Yellow

# Copy source files
$sourceFiles = @(
    "src",
    "package.json",
    "package-lock.json",
    "tsconfig.json",
    "tsconfig.server.json",
    "tsconfig.client.json",
    ".eslintrc.js"
)

foreach ($file in $sourceFiles) {
    if (Test-Path $file) {
        if ((Get-Item $file) -is [System.IO.DirectoryInfo]) {
            Copy-Item -Recurse -Path $file -Destination "$OutputDir\$file"
        } else {
            Copy-Item -Path $file -Destination "$OutputDir\$file"
        }
        Write-Host "  ✅ Copied: $file" -ForegroundColor Green
    }
}

# Copy launcher scripts
Copy-Item -Path "Clutch Auto Parts System.bat" -Destination "$OutputDir\"
Copy-Item -Path "Clutch Auto Parts System.ps1" -Destination "$OutputDir\"

# Create README
$readmeContent = @"
# Clutch Auto Parts System - Portable Executable

## Quick Start

### Option 1: Double-click to run
- Double-click `Clutch Auto Parts System.bat` (Windows Batch)
- Or double-click `Clutch Auto Parts System.ps1` (PowerShell - Recommended)

### Option 2: Command line
```bash
# Install dependencies (first time only)
npm install

# Build the application
npm run build

# Start the application
npm start
```

## System Requirements
- Windows 10/11
- Node.js 18+ (Download from https://nodejs.org/)
- 4GB RAM minimum
- 2GB free disk space

## Features
- ✅ Complete Auto Parts Management System
- ✅ Point of Sale (POS) with Tax Shortcut
- ✅ Inventory Management
- ✅ Customer & Supplier Management
- ✅ AI-Powered Business Insights
- ✅ Multi-branch Support
- ✅ Offline/Online Sync
- ✅ Arabic/English Support
- ✅ Role-Based Access Control
- ✅ Backup & Restore
- ✅ Training Mode
- ✅ Marketplace Integration

## Default Login
- Username: admin
- Password: admin123

## Support
For support and updates, visit the Clutch platform.

---
Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
"@

$readmeContent | Out-File -FilePath "$OutputDir\README.txt" -Encoding UTF8

# Create a simple installer
$installerContent = @"
@echo off
title Clutch Auto Parts System - Installer
echo.
echo ========================================
echo   Clutch Auto Parts System Installer
echo ========================================
echo.
echo This will install the Clutch Auto Parts System
echo and create desktop shortcuts.
echo.
pause

REM Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo Building application...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Failed to build application
    pause
    exit /b 1
)

echo Creating desktop shortcut...
powershell -Command "`$WshShell = New-Object -comObject WScript.Shell; `$Shortcut = `$WshShell.CreateShortcut('%USERPROFILE%\Desktop\Clutch Auto Parts System.lnk'); `$Shortcut.TargetPath = '%CD%\Clutch Auto Parts System.bat'; `$Shortcut.WorkingDirectory = '%CD%'; `$Shortcut.Description = 'Clutch Auto Parts Management System'; `$Shortcut.Save()"

echo.
echo ========================================
echo   Installation Complete!
echo ========================================
echo.
echo The Clutch Auto Parts System has been installed.
echo A desktop shortcut has been created.
echo.
echo You can now run the system by:
echo 1. Double-clicking the desktop shortcut
echo 2. Or running "Clutch Auto Parts System.bat"
echo.
echo Default login: admin / admin123
echo.
pause
"@

$installerContent | Out-File -FilePath "$OutputDir\Install.bat" -Encoding ASCII

Write-Host ""
Write-Host "✅ Executable package created successfully!" -ForegroundColor Green
Write-Host "📁 Location: $OutputDir" -ForegroundColor Blue
Write-Host ""
Write-Host "📋 Package contents:" -ForegroundColor Cyan
Get-ChildItem $OutputDir | ForEach-Object {
    Write-Host "  📄 $($_.Name)" -ForegroundColor White
}

Write-Host ""
Write-Host "🚀 To use the executable package:" -ForegroundColor Yellow
Write-Host "1. Copy the '$OutputDir' folder to any location" -ForegroundColor White
Write-Host "2. Run 'Install.bat' for first-time setup" -ForegroundColor White
Write-Host "3. Use Clutch Auto Parts System.bat to start the application" -ForegroundColor White
Write-Host ""
Write-Host "📦 Package size: $([math]::Round((Get-ChildItem -Recurse $OutputDir | Measure-Object -Property Length -Sum).Sum / 1MB, 2)) MB" -ForegroundColor Blue
