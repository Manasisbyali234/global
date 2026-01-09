@echo off
echo Starting Tale Global Backend Server...
echo.

cd /d "%~dp0backend"

echo Checking if Node.js is installed...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js version:
node --version

echo.
echo Installing dependencies...
npm install

echo.
echo Starting server on port 5000...
echo Backend will be available at: http://localhost:5000
echo Health check: http://localhost:5000/health
echo API Health check: http://localhost:5000/api/health
echo.

npm start

pause