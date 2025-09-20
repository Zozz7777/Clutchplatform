# Create Simple Executable Package for Clutch Auto Parts System

$ErrorActionPreference = "Stop"

Write-Host "Creating Clutch Auto Parts System Executable Package" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

$OutputDir = "Clutch-Auto-Parts-Executable"

# Create output directory
if (Test-Path $OutputDir) {
    Write-Host "Removing existing output directory..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force $OutputDir
}

Write-Host "Creating output directory: $OutputDir" -ForegroundColor Blue
New-Item -ItemType Directory -Path $OutputDir | Out-Null

# Copy essential files
Write-Host "Copying application files..." -ForegroundColor Yellow

$filesToCopy = @(
    "src",
    "package.json",
    "package-lock.json",
    "tsconfig.json",
    "tsconfig.server.json",
    "tsconfig.client.json",
    ".eslintrc.js"
)

foreach ($file in $filesToCopy) {
    if (Test-Path $file) {
        if ((Get-Item $file) -is [System.IO.DirectoryInfo]) {
            Copy-Item -Recurse -Path $file -Destination "$OutputDir\$file"
        } else {
            Copy-Item -Path $file -Destination "$OutputDir\$file"
        }
        Write-Host "  Copied: $file" -ForegroundColor Green
    }
}

# Copy launcher scripts
Copy-Item -Path "Clutch Auto Parts System.bat" -Destination "$OutputDir\"
Copy-Item -Path "Clutch Auto Parts System.ps1" -Destination "$OutputDir\"

# Create simple README
$readmeContent = @"
Clutch Auto Parts System - Portable Executable

QUICK START:
1. Double-click "Clutch Auto Parts System.bat" to run
2. Or run "Clutch Auto Parts System.ps1" (PowerShell)

REQUIREMENTS:
- Windows 10/11
- Node.js 18+ (Download from https://nodejs.org/)

FEATURES:
- Complete Auto Parts Management System
- Point of Sale (POS) with Tax Shortcut
- Inventory Management
- Customer & Supplier Management
- AI-Powered Business Insights
- Multi-branch Support
- Offline/Online Sync
- Arabic/English Support
- Role-Based Access Control
- Backup & Restore
- Training Mode
- Marketplace Integration

DEFAULT LOGIN:
Username: admin
Password: admin123

Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
"@

$readmeContent | Out-File -FilePath "$OutputDir\README.txt" -Encoding UTF8

Write-Host ""
Write-Host "Executable package created successfully!" -ForegroundColor Green
Write-Host "Location: $OutputDir" -ForegroundColor Blue
Write-Host ""
Write-Host "To use:" -ForegroundColor Yellow
Write-Host "1. Copy the $OutputDir folder to any location" -ForegroundColor White
Write-Host "2. Run Clutch Auto Parts System.bat to start" -ForegroundColor White
Write-Host ""
Write-Host "Package size: $([math]::Round((Get-ChildItem -Recurse $OutputDir | Measure-Object -Property Length -Sum).Sum / 1MB, 2)) MB" -ForegroundColor Blue
