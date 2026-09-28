@echo off
setlocal
title Marine AI Platform - ISRO SIH 2026
color 0b

echo ======================================================================
echo                  MARINE AI PLATFORM - ISRO SIH 2026
echo             16 Multi-Agent Autonomous Maritime OS
echo ======================================================================
echo.

cd /d "%~dp0"
echo [1/5] Root Folder: %CD%

echo [2/5] Checking Python environment...
where python >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [WARNING] Python was not found in PATH! Backend will not start.
    echo Please install Python 3.10+ and add it to PATH.
) else (
    echo [OK] Python is available.
)

echo [3/5] Checking Node.js environment...
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    color 0c
    echo [ERROR] Node.js is not found on your system PATH!
    echo Please install Node.js from https://nodejs.org/ to run this project.
    echo.
    pause
    exit /b 1
)
echo [OK] Node.js is available.

echo [4/5] Clearing stale ports (8000 and 5188)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000" ^| findstr "LISTENING"') do (
    taskkill /f /pid %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5188" ^| findstr "LISTENING"') do (
    taskkill /f /pid %%a >nul 2>&1
)

echo [5/5] Starting FastAPI Python Backend (Port 8000)...
start "Marine AI Backend (Port 8000)" cmd /k "cd /d "%~dp0backend" && python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"

timeout /t 2 >nul

echo Starting Vite Frontend Dashboard (Port 5188)...
cd /d "%~dp0frontend"
if not exist node_modules (
    echo [First Time Setup] Installing frontend node dependencies...
    call npm install
)

start "" "http://localhost:5188/"

echo.
echo ======================================================================
echo  Backend:  http://127.0.0.1:8000  (Docs: http://127.0.0.1:8000/docs)
echo  Frontend: http://localhost:5188  (Marine AI Executive Dashboard)
echo.
echo  Keep this console window open while running.
echo  To STOP the platform, close this window and the backend window.
echo ======================================================================
echo.

call npm run start

echo.
echo Server stopped.
pause
