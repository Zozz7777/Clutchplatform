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

REM Start the server
echo Starting Clutch Auto Parts System Server...
echo The application will open in your web browser.
echo.
echo Server will be available at: http://localhost:3000
echo.

REM Start the server
npm run start:server

echo.
echo Server stopped.
pause
