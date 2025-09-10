@echo off
echo ========================================
echo Clutch Auto Parts System - EXE Builder
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is available
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not available
    pause
    exit /b 1
)

echo Node.js version:
node --version
echo npm version:
npm --version
echo.

REM Navigate to project directory
cd /d "%~dp0.."

echo Current directory: %CD%
echo.

REM Check if package.json exists
if not exist "package.json" (
    echo ERROR: package.json not found in current directory
    echo Please run this script from the project root directory
    pause
    exit /b 1
)

echo Installing dependencies...
echo ===========================
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Building executable...
echo ======================

REM Clean previous builds
if exist "dist" (
    echo Cleaning previous builds...
    rmdir /s /q "dist"
)

REM Build the executable
npm run build:win
if %errorlevel% neq 0 (
    echo ERROR: Build failed
    pause
    exit /b 1
)

echo.
echo Build completed successfully!
echo =============================

REM Check if the executable was created
if exist "dist\Clutch Auto Parts System Setup.exe" (
    echo.
    echo ✅ SUCCESS: Executable created successfully!
    echo.
    echo Location: %CD%\dist\Clutch Auto Parts System Setup.exe
    echo Size: 
    for %%A in ("dist\Clutch Auto Parts System Setup.exe") do echo %%~zA bytes
    echo.
    echo You can now distribute this installer to auto parts shops.
    echo.
    
    REM Ask if user wants to open the dist folder
    set /p choice="Do you want to open the dist folder? (y/n): "
    if /i "%choice%"=="y" (
        explorer "dist"
    )
) else (
    echo.
    echo ❌ ERROR: Executable not found in dist folder
    echo Please check the build logs above for errors
)

echo.
echo Build process completed.
pause
