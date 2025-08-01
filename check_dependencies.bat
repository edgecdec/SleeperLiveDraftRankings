@echo off
setlocal enabledelayedexpansion

echo ========================================
echo 🔍 Fantasy Football Draft Assistant
echo     Dependency Checker
echo ========================================
echo.

set PASSED=0
set FAILED=0

echo Checking system dependencies...
echo.

REM Check Python
echo ℹ️ Checking Python installation...

python --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=2" %%i in ('python --version 2^>^&1') do set PYTHON_VERSION=%%i
    echo ✅ Python: !PYTHON_VERSION!
    set /a PASSED+=1
    
    REM Check if it's Python 3.7+
    for /f "tokens=1,2 delims=." %%a in ("!PYTHON_VERSION!") do (
        set MAJOR=%%a
        set MINOR=%%b
    )
    if !MAJOR! geq 3 (
        if !MINOR! geq 7 (
            echo ✅ Python version is 3.7+ ✓
            set /a PASSED+=1
        ) else (
            echo ⚠️ Python !PYTHON_VERSION! found, but 3.7+ is recommended
        )
    )
) else (
    python3 --version >nul 2>&1
    if %errorlevel% equ 0 (
        for /f "tokens=2" %%i in ('python3 --version 2^>^&1') do set PYTHON_VERSION=%%i
        echo ✅ Python 3: !PYTHON_VERSION!
        set /a PASSED+=1
    ) else (
        echo ❌ Python 3: Not found
        echo ℹ️ Install from: https://python.org
        echo ℹ️ Make sure to check "Add Python to PATH" during installation
        set /a FAILED+=1
    )
)

REM Check pip
pip --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=2" %%i in ('pip --version') do set PIP_VERSION=%%i
    echo ✅ pip: !PIP_VERSION!
    set /a PASSED+=1
) else (
    pip3 --version >nul 2>&1
    if %errorlevel% equ 0 (
        for /f "tokens=2" %%i in ('pip3 --version') do set PIP_VERSION=%%i
        echo ✅ pip3: !PIP_VERSION!
        set /a PASSED+=1
    ) else (
        echo ❌ pip: Not found
        echo ℹ️ Usually comes with Python - try reinstalling Python
        set /a FAILED+=1
    )
)

echo.

REM Check Node.js
echo ℹ️ Checking Node.js installation...

node --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f %%i in ('node --version') do set NODE_VERSION=%%i
    echo ✅ Node.js: !NODE_VERSION!
    set /a PASSED+=1
    
    REM Check Node version (need 16+)
    set NODE_MAJOR=!NODE_VERSION:~1,2!
    if !NODE_MAJOR! geq 16 (
        echo ✅ Node.js version is 16+ ✓
        set /a PASSED+=1
    ) else (
        echo ⚠️ Node.js !NODE_VERSION! found, but 16+ is recommended
    )
) else (
    echo ❌ Node.js: Not found
    echo ℹ️ Install from: https://nodejs.org
    set /a FAILED+=1
)

REM Check npm
npm --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f %%i in ('npm --version') do set NPM_VERSION=%%i
    echo ✅ npm: !NPM_VERSION!
    set /a PASSED+=1
) else (
    echo ❌ npm: Not found
    echo ℹ️ Should come with Node.js - try reinstalling Node.js
    set /a FAILED+=1
)

echo.

REM Check project structure
echo ℹ️ Checking project structure...

if exist "src\\backend\\requirements.txt" (
    echo ✅ Backend requirements.txt found
    set /a PASSED+=1
) else (
    echo ❌ Backend requirements.txt not found
    echo ℹ️ Make sure you're running this from the project root directory
    set /a FAILED+=1
)

if exist "src\\frontend\\package.json" (
    echo ✅ Frontend package.json found
    set /a PASSED+=1
) else (
    echo ❌ Frontend package.json not found
    echo ℹ️ Make sure you're running this from the project root directory
    set /a FAILED+=1
)

echo.
echo ========================================
echo 📊 DEPENDENCY CHECK SUMMARY
echo ========================================

if !FAILED! equ 0 (
    echo 🎉 All dependencies are ready!
    echo.
    echo You can now run the application with:
    echo   • Windows: start.bat
    echo   • Mac/Linux: ./start.sh
) else (
    echo ⚠️ !FAILED! dependencies need attention
    echo ✅ !PASSED! dependencies are ready
    echo.
    echo Please install the missing dependencies above, then run this check again.
)

echo ========================================
pause