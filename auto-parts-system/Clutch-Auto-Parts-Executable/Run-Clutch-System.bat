@echo off
title Clutch Auto Parts System
echo ========================================
echo   Clutch Auto Parts System
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

REM Start the application directly
npm start

echo.
echo Application closed.
pause
