@echo off
REM Clutch Auto Parts System - Uninstallation Script
REM This script handles the uninstallation process for Windows

echo ========================================
echo Clutch Auto Parts System Uninstallation
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
echo Uninstalling Clutch Auto Parts System...
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
    echo Uninstallation cannot continue.
    pause
    exit /b 1
)

echo Found installation directory: %INSTALL_DIR%
echo.

REM Confirm uninstallation
set /p CONFIRM="Are you sure you want to uninstall Clutch Auto Parts System? (Y/N): "
if /i not "%CONFIRM%"=="Y" (
    echo Uninstallation cancelled.
    pause
    exit /b 0
)

echo.
echo Removing application files...
REM Remove installation directory
rmdir /S /Q "%INSTALL_DIR%"
echo Removed: %INSTALL_DIR%

REM Remove desktop shortcut
echo Removing desktop shortcut...
set DESKTOP=%USERPROFILE%\Desktop
if exist "%DESKTOP%\Clutch Auto Parts System.url" (
    del "%DESKTOP%\Clutch Auto Parts System.url"
    echo Removed desktop shortcut.
)

REM Remove start menu shortcut
echo Removing start menu shortcut...
set START_MENU=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Clutch
if exist "%START_MENU%\Clutch Auto Parts System.url" (
    del "%START_MENU%\Clutch Auto Parts System.url"
    echo Removed start menu shortcut.
)

REM Remove Clutch folder from start menu if empty
if exist "%START_MENU%" (
    rmdir "%START_MENU%" 2>nul
)

REM Remove registry entries
echo Removing registry entries...
reg delete "HKEY_LOCAL_MACHINE\SOFTWARE\Clutch\AutoPartsSystem" /f 2>nul
reg delete "HKEY_LOCAL_MACHINE\SOFTWARE\Clutch" /f 2>nul

REM Remove Windows Firewall rule
echo Removing Windows Firewall rule...
netsh advfirewall firewall delete rule name="Clutch Auto Parts System" 2>nul

REM Remove user data (optional)
set /p REMOVE_DATA="Do you want to remove user data and settings? (Y/N): "
if /i "%REMOVE_DATA%"=="Y" (
    echo Removing user data...
    set USER_DATA=%APPDATA%\ClutchAutoParts
    if exist "%USER_DATA%" (
        rmdir /S /Q "%USER_DATA%"
        echo Removed user data: %USER_DATA%
    )
    
    set LOCAL_DATA=%LOCALAPPDATA%\ClutchAutoParts
    if exist "%LOCAL_DATA%" (
        rmdir /S /Q "%LOCAL_DATA%"
        echo Removed local data: %LOCAL_DATA%
    )
)

echo.
echo ========================================
echo Uninstallation completed successfully!
echo ========================================
echo.
echo The Clutch Auto Parts System has been completely removed from your system.
echo.
echo Removed:
echo - Application files
echo - Desktop shortcut
echo - Start menu shortcut
echo - Registry entries
echo - Windows Firewall rule
if /i "%REMOVE_DATA%"=="Y" (
    echo - User data and settings
)
echo.
pause
