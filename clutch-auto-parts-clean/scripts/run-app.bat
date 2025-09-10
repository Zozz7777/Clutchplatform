@echo off
echo ========================================
echo Clutch Auto Parts System - Launcher
echo ========================================
echo.

echo Starting Clutch Auto Parts System...
echo.

REM Navigate to the latest version
cd /d "%~dp0..\dist\Clutch Auto Parts System v16-win32-x64"

REM Check if the executable exists
if not exist "Clutch Auto Parts System v16.exe" (
    echo ERROR: Executable not found!
    echo Please make sure the application has been built.
    pause
    exit /b 1
)

echo Running: Clutch Auto Parts System v16.exe
echo.

REM Run the application
start "" "Clutch Auto Parts System v16.exe"

echo Application started successfully!
echo.
echo The Clutch Auto Parts System should now be running with the new icon.
echo.
pause
