# Clutch Auto Parts System Test Script
Write-Host "Starting Clutch Auto Parts System Test..." -ForegroundColor Green

# Check if we're in the correct directory
if (-not (Test-Path "package.json")) {
    Write-Host "Error: package.json not found. Please run this script from the auto-parts-system directory." -ForegroundColor Red
    exit 1
}

# Build the application
Write-Host "Building application..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}

# Start the application
Write-Host "Starting application..." -ForegroundColor Yellow
Start-Process -FilePath "npm" -ArgumentList "start" -WindowStyle Hidden

# Wait for application to start
Start-Sleep -Seconds 5

# Check if application is running
$processes = Get-Process | Where-Object {$_.ProcessName -like "*electron*" -or $_.ProcessName -like "*Clutch*"}
if ($processes) {
    Write-Host "Application is running successfully!" -ForegroundColor Green
    Write-Host "Processes found:" -ForegroundColor Cyan
    $processes | ForEach-Object { Write-Host "  - $($_.ProcessName) (PID: $($_.Id))" -ForegroundColor White }
} else {
    Write-Host "Application may not be running. Check the logs for errors." -ForegroundColor Yellow
}

# Test the executable
Write-Host "Testing executable..." -ForegroundColor Yellow
if (Test-Path "dist\win-unpacked\Clutch Auto Parts System.exe") {
    Write-Host "Executable found: dist\win-unpacked\Clutch Auto Parts System.exe" -ForegroundColor Green
    Write-Host "You can run it manually by double-clicking the executable." -ForegroundColor Cyan
} else {
    Write-Host "Executable not found. Run 'npm run pack' to create it." -ForegroundColor Yellow
}

Write-Host "Test completed!" -ForegroundColor Green
