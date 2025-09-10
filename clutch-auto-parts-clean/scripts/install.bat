@echo off
REM Clutch Auto Parts System - Installation Script
REM This script handles the installation process for Windows

echo ========================================
echo Clutch Auto Parts System Installation
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
echo Installing Clutch Auto Parts System...
echo.

REM Create installation directory
set INSTALL_DIR=C:\Program Files\ClutchAutoParts
if not exist "%INSTALL_DIR%" (
    mkdir "%INSTALL_DIR%"
    echo Created installation directory: %INSTALL_DIR%
)

REM Copy application files
echo Copying application files...
xcopy /E /I /Y "%~dp0*" "%INSTALL_DIR%\"

REM Create desktop shortcut
echo Creating desktop shortcut...
set DESKTOP=%USERPROFILE%\Desktop
echo [InternetShortcut] > "%DESKTOP%\Clutch Auto Parts System.url"
echo URL=file:///%INSTALL_DIR%\ClutchAutoPartsSystem.exe >> "%DESKTOP%\Clutch Auto Parts System.url"
echo IconFile=%INSTALL_DIR%\assets\icon.ico >> "%DESKTOP%\Clutch Auto Parts System.url"
echo IconIndex=0 >> "%DESKTOP%\Clutch Auto Parts System.url"

REM Create start menu shortcut
echo Creating start menu shortcut...
set START_MENU=%APPDATA%\Microsoft\Windows\Start Menu\Programs
if not exist "%START_MENU%\Clutch" (
    mkdir "%START_MENU%\Clutch"
)
echo [InternetShortcut] > "%START_MENU%\Clutch\Clutch Auto Parts System.url"
echo URL=file:///%INSTALL_DIR%\ClutchAutoPartsSystem.exe >> "%START_MENU%\Clutch\Clutch Auto Parts System.url"
echo IconFile=%INSTALL_DIR%\assets\icon.ico >> "%START_MENU%\Clutch\Clutch Auto Parts System.url"
echo IconIndex=0 >> "%START_MENU%\Clutch\Clutch Auto Parts System.url"

REM Register application
echo Registering application...
reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Clutch\AutoPartsSystem" /v "InstallPath" /t REG_SZ /d "%INSTALL_DIR%" /f
reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Clutch\AutoPartsSystem" /v "Version" /t REG_SZ /d "1.0.0" /f

REM Configure Windows Firewall
echo Configuring Windows Firewall...
netsh advfirewall firewall add rule name="Clutch Auto Parts System" dir=in action=allow program="%INSTALL_DIR%\ClutchAutoPartsSystem.exe" enable=yes

echo.
echo ========================================
echo Installation completed successfully!
echo ========================================
echo.
echo The Clutch Auto Parts System has been installed to:
echo %INSTALL_DIR%
echo.
echo Desktop shortcut created.
echo Start menu shortcut created.
echo Windows Firewall configured.
echo.
echo You can now launch the application from:
echo - Desktop shortcut
echo - Start menu
echo - %INSTALL_DIR%\ClutchAutoPartsSystem.exe
echo.
pause
