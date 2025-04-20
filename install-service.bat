REM filepath: /Users/lukasbisdorf/Dev/ShellySmoke2FE2/install-service.bat
@echo off
echo Installing ShellySmoke2FE2 Service...

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

node install-service.js
if %ERRORLEVEL% NEQ 0 (
  echo Service installation failed. See error message above.
) else (
  echo Service installation completed.
)
pause