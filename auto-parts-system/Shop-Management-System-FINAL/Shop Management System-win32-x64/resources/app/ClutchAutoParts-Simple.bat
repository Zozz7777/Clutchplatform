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

REM Check if dist exists
if not exist "dist" (
    echo Building application...
    npm run build
    if %errorlevel% neq 0 (
        echo ERROR: Failed to build application
        pause
        exit /b 1
    )
)

REM Start the application
echo Starting Clutch Auto Parts System...
echo The application will open in a new window.
echo.
npm start

echo.
echo Application closed.
pause
