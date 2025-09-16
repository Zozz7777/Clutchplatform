@echo off
echo.
echo ========================================
echo    CLUTCH PLATFORM - UNIFIED BACKEND
echo ========================================
echo.
echo Starting the consolidated shared backend...
echo This backend now serves ALL Clutch applications
echo.

cd shared-backend

echo Checking dependencies...
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if errorlevel 1 (
        echo Error: Failed to install dependencies
        pause
        exit /b 1
    )
)

echo.
echo Starting unified backend on port 5000...
echo.
echo The backend will serve:
echo - Client Dashboard
echo - Web Dashboard  
echo - Client Mobile App
echo - Mechanics Mobile App
echo - Admin Panel
echo.
echo Press Ctrl+C to stop the server
echo.

npm start

pause
