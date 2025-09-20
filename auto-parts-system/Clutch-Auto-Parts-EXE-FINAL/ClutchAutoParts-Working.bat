@echo off
title Clutch Auto Parts System
color 0A

echo.
echo ========================================
echo   CLUTCH AUTO PARTS SYSTEM
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo Node.js found. Starting application...
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Check if dist exists and has main.js
if not exist "dist\main.js" (
    echo Building application...
    npm run build
    if %errorlevel% neq 0 (
        echo ERROR: Failed to build application
        pause
        exit /b 1
    )
)

REM Start the application directly with electron
echo Starting Clutch Auto Parts System...
echo The application will open in a new window.
echo.

REM Use the local electron from node_modules
set ELECTRON_PATH=node_modules\.bin\electron.cmd
if exist "%ELECTRON_PATH%" (
    "%ELECTRON_PATH%" dist\main.js
) else (
    echo ERROR: Electron not found in node_modules
    echo Please run "npm install" to install dependencies
    pause
    exit /b 1
)

echo.
echo Application closed.
pause
