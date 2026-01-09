@echo off
echo ========================================
echo Restarting Backend Server
echo ========================================
echo.

echo Step 1: Stopping existing server on port 5000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000 ^| findstr LISTENING') do (
    echo Killing process %%a
    taskkill /F /PID %%a
)
timeout /t 2 /nobreak >nul

echo.
echo Step 2: Starting backend server...
cd backend
start "Backend Server" cmd /k "npm start"

echo.
echo ========================================
echo Backend server is restarting!
echo Check the new window for server logs
echo ========================================
pause
