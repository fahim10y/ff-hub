@echo off
title FF Hub - Local Server (Persistent Data)
cd /d "%~dp0"

echo ============================================
echo   FF HUB - Persistent Local Server
echo ============================================
echo.
echo Data is saved to db.json on your D drive.
echo It will survive server restarts, browser
echo closes, and PC shutdowns!
echo.
echo Both URLs will open automatically:
echo   - Main App:  http://localhost:8000
echo   - Admin:     http://localhost:8000/admin/
echo.
echo Press Ctrl+C to stop the server
echo ============================================
echo.

REM Try the persistent server first (Python 3)
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Starting persistent server on port 8000
    start http://localhost:8000
    start http://localhost:8000/admin/
    python server.py 8000
    goto :end
)

echo [ERROR] Python was not found.
echo.
echo Please install Python from https://python.org
echo or manually run the server with:
echo   python -m http.server 8000
echo.
echo (Note: without server.py, data won't persist!)

:end
echo.
pause
