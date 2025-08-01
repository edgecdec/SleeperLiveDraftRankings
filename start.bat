@echo off
setlocal enabledelayedexpansion

echo ========================================
echo 🏈 Fantasy Football Draft Assistant
echo ========================================
echo.

REM Function to print status messages
set "GREEN=[92m"
set "RED=[91m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "NC=[0m"

REM Check Python installation
echo 🔍 Checking system dependencies...
echo.
echo ℹ️ Checking Python installation...

python --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=2" %%i in ('python --version 2^>^&1') do set PYTHON_VERSION=%%i
    echo ✅ Python found: !PYTHON_VERSION!
    set PYTHON_CMD=python
    set PIP_CMD=pip
) else (
    python3 --version >nul 2>&1
    if %errorlevel% equ 0 (
        for /f "tokens=2" %%i in ('python3 --version 2^>^&1') do set PYTHON_VERSION=%%i
        echo ✅ Python 3 found: !PYTHON_VERSION!
        set PYTHON_CMD=python3
        set PIP_CMD=pip3
    ) else (
        echo ❌ Python is not installed
        echo ℹ️ Please install Python 3.7+ from https://python.org
        echo ℹ️ Make sure to check "Add Python to PATH" during installation
        pause
        exit /b 1
    )
)

REM Check pip
!PIP_CMD! --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ pip found
) else (
    echo ⚠️ pip not found, will try using python -m pip
    set PIP_CMD=!PYTHON_CMD! -m pip
)

REM Check Node.js installation
echo ℹ️ Checking Node.js installation...

node --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f %%i in ('node --version') do set NODE_VERSION=%%i
    echo ✅ Node.js found: !NODE_VERSION!
    
    REM Extract major version number
    set NODE_MAJOR=!NODE_VERSION:~1,2!
    if !NODE_MAJOR! lss 16 (
        echo ⚠️ Node.js !NODE_VERSION! found, but version 16+ is recommended
    )
) else (
    echo ❌ Node.js is not installed
    echo ℹ️ Please install Node.js 16+ from https://nodejs.org
    pause
    exit /b 1
)

npm --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f %%i in ('npm --version') do set NPM_VERSION=%%i
    echo ✅ npm found: !NPM_VERSION!
) else (
    echo ❌ npm is not installed (should come with Node.js)
    echo ℹ️ Please reinstall Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo.
echo 🚀 Starting backend server...
cd src\backend

REM Check if requirements.txt exists
if not exist "requirements.txt" (
    echo ❌ requirements.txt not found in src\backend\
    pause
    exit /b 1
)

echo ℹ️ Installing Python dependencies...
!PIP_CMD! install -r requirements.txt
if %errorlevel% neq 0 (
    echo ⚠️ Failed with regular pip, trying user installation...
    !PIP_CMD! install --user -r requirements.txt
    if %errorlevel% neq 0 (
        echo ❌ Failed to install Python dependencies
        echo ℹ️ You may need to run: !PIP_CMD! install --upgrade pip
        pause
        exit /b 1
    )
)
echo ✅ Python dependencies installed successfully

echo ℹ️ Starting Flask server on port 5001...
start "Backend Server" !PYTHON_CMD! app.py

REM Give backend a moment to start
timeout /t 3 /nobreak >nul

echo.
echo 🌐 Starting frontend...
cd ..\frontend

REM Check if package.json exists
if not exist "package.json" (
    echo ❌ package.json not found in src\frontend\
    pause
    exit /b 1
)

echo ℹ️ Installing Node.js dependencies...

REM Clear npm cache if node_modules exists but is corrupted
if exist "node_modules" (
    if not exist "node_modules\.package-lock.json" (
        echo ⚠️ Clearing potentially corrupted node_modules...
        rmdir /s /q node_modules 2>nul
        del package-lock.json 2>nul
    )
)

call npm install
if %errorlevel% neq 0 (
    echo ⚠️ Failed to install Node.js dependencies, trying cache clear...
    call npm cache clean --force
    rmdir /s /q node_modules 2>nul
    del package-lock.json 2>nul
    
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ Still failed to install Node.js dependencies
        echo ℹ️ You may need to update npm: npm install -g npm@latest
        pause
        exit /b 1
    )
)
echo ✅ Node.js dependencies installed successfully

echo.
echo ========================================
echo 🎉 SETUP COMPLETE!
echo ========================================
echo Backend:  http://localhost:5001
echo Frontend: http://localhost:3000
echo.
echo The app will open in your browser shortly...
echo Press Ctrl+C in both windows to stop the servers
echo ========================================

call npm start