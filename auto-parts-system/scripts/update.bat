@echo off
REM Clutch Auto Parts System - Update Script
REM This script handles the update process for Windows

echo ========================================
echo Clutch Auto Parts System Update
echo ========================================
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% == 0 (
    echo Running with administrator privileges...
) else (
    echo This script requires administrator privileges.
    echo Please run as administrator.
    pause
    exit /b 1
)

echo.
echo Updating Clutch Auto Parts System...
echo.

REM Get installation directory from registry
for /f "tokens=3" %%a in ('reg query "HKEY_LOCAL_MACHINE\SOFTWARE\Clutch\AutoPartsSystem" /v "InstallPath" 2^>nul') do set INSTALL_DIR=%%a

if "%INSTALL_DIR%"=="" (
    echo Installation directory not found in registry.
    echo Please specify the installation directory:
    set /p INSTALL_DIR="Enter installation path: "
)

if not exist "%INSTALL_DIR%" (
    echo Installation directory does not exist: %INSTALL_DIR%
    echo Update cannot continue.
    pause
    exit /b 1
)

echo Found installation directory: %INSTALL_DIR%
echo.

REM Check if application is running
tasklist /FI "IMAGENAME eq ClutchAutoPartsSystem.exe" 2>NUL | find /I /N "ClutchAutoPartsSystem.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo Application is currently running.
    echo Please close the application before updating.
    echo.
    set /p CLOSE_APP="Close application now? (Y/N): "
    if /i "%CLOSE_APP%"=="Y" (
        echo Closing application...
        taskkill /F /IM ClutchAutoPartsSystem.exe
        timeout /t 3 /nobreak >nul
    ) else (
        echo Update cancelled.
        pause
        exit /b 1
    )
)

echo.
echo Creating backup...
REM Create backup directory
set BACKUP_DIR=%INSTALL_DIR%\backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set BACKUP_DIR=%BACKUP_DIR: =0%
mkdir "%BACKUP_DIR%"

REM Backup current installation
xcopy /E /I /Y "%INSTALL_DIR%\*" "%BACKUP_DIR%\"
echo Backup created: %BACKUP_DIR%

echo.
echo Updating application files...
REM Copy new files
xcopy /E /I /Y "%~dp0*" "%INSTALL_DIR%\"

REM Update registry version
echo Updating registry...
reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Clutch\AutoPartsSystem" /v "Version" /t REG_SZ /d "1.0.0" /f
reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Clutch\AutoPartsSystem" /v "LastUpdate" /t REG_SZ /d "%date% %time%" /f

echo.
echo ========================================
echo Update completed successfully!
echo ========================================
echo.
echo The Clutch Auto Parts System has been updated.
echo.
echo Backup location: %BACKUP_DIR%
echo.
echo You can now launch the updated application.
echo.
set /p LAUNCH_APP="Launch application now? (Y/N): "
if /i "%LAUNCH_APP%"=="Y" (
    echo Launching application...
    start "" "%INSTALL_DIR%\ClutchAutoPartsSystem.exe"
)

pause
