@echo off
echo Starting Tale Global Frontend...
echo.

cd /d "%~dp0frontend"

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
echo Starting frontend development server...
echo Frontend will be available at: http://localhost:3000
echo Make sure backend is running at: http://localhost:5000
echo.

npm start

pause