REM filepath: /Users/lukasbisdorf/Dev/ShellySmoke2FE2/uninstall-service.bat
@echo off
echo Uninstalling ShellySmoke2FE2 Service...

REM Check if node-windows is installed
if not exist ".\node_modules\node-windows" (
  echo node-windows module not found. Installing required dependencies...
  npm install node-windows
  if %ERRORLEVEL% NEQ 0 (
    echo Failed to install dependencies. Please make sure npm is installed and try again.
    pause
    exit /b 1
  )
)

node uninstall-service.js
if %ERRORLEVEL% NEQ 0 (
  echo Service uninstallation failed. See error message above.
) else (
  echo Service uninstallation completed.
)
pause